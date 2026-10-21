import {
    AlertCircle,
    CheckCircle2,
    FileSpreadsheet,
    FolderPlus,
    LoaderCircle,
    Upload,
    X
} from "lucide-react";

import {
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {
    addProductImages,
    createProduct,
    uploadProductImages
} from "../../services/adminProductApi";

import {
    createCategory,
    getCategories
} from "../../services/categoryApi";

import {
    MAX_FILE_SIZE,
    MAX_ROWS,
    readExcelFile
} from "./productExcel";

import "./ProductExcelImport.css";


/* =========================================================
   HELPER
========================================================= */

function formatPrice(price) {

    return new Intl.NumberFormat("vi-VN")
        .format(price) + " ₫";
}


/* =========================================================
   IMPORT 1 DÒNG

   1. Ảnh chèn trong Excel → upload lên server
      (không có thì dùng cột Ảnh (URL))
   2. Tạo sản phẩm với ảnh chính
   3. Gắn ảnh vào thư viện ảnh của sản phẩm
      (giống khi thêm sản phẩm bằng form)
========================================================= */

async function importRow(row) {

    let imageUrls =
        row.product.imageUrl ? [row.product.imageUrl] : [];

    if (row.imageFiles.length > 0) {

        const uploadResult =
            await uploadProductImages(row.imageFiles);

        if (uploadResult?.imageUrls?.length) {
            imageUrls = uploadResult.imageUrls;
        }
    }

    // Ảnh đầu tiên (bên trái nhất trong Excel) là ảnh chính
    const createdProduct = await createProduct({
        ...row.product,
        imageUrl: imageUrls[0] || null
    });

    if (imageUrls.length > 0 && createdProduct?.id) {

        await addProductImages(
            createdProduct.id,
            imageUrls
        );
    }
}


/* =========================================================
   COMPONENT
========================================================= */

function ProductExcelImport({
    categories,
    existingProducts,
    onClose,
    onImported,

    // Chỉ ADMIN được tạo danh mục (POST /api/categories)
    canCreateCategories = false
}) {

    const fileInputRef = useRef(null);

    // File đang xem trước, để đọc lại sau khi tạo danh mục
    const currentFileRef = useRef(null);

    const [categoryList, setCategoryList] = useState(categories);

    const [creatingCategories, setCreatingCategories] = useState(false);

    const [fileName, setFileName] = useState("");

    const [rows, setRows] = useState([]);

    const [reading, setReading] = useState(false);

    const [error, setError] = useState("");

    const [dragOver, setDragOver] = useState(false);


    // Kết quả theo rowNumber: "pending" | "success" | thông báo lỗi
    const [results, setResults] = useState({});

    const [importing, setImporting] = useState(false);

    const [finished, setFinished] = useState(false);


    const validRows = useMemo(
        () => rows.filter(row => row.errors.length === 0),
        [rows]
    );

    const invalidCount = rows.length - validRows.length;


    // Danh mục có trong file nhưng chưa có trong hệ thống (không trùng lặp)
    const missingCategories = useMemo(() => {

        const seen = new Map();

        rows.forEach(row => {

            const name = row.missingCategory?.trim();

            if (name && !seen.has(name.toLowerCase())) {
                seen.set(name.toLowerCase(), name);
            }
        });

        return [...seen.values()];

    }, [rows]);

    const missingCategoryRowCount =
        rows.filter(row => row.missingCategory).length;


    // Ảnh xem trước cho từng dòng
    const previewUrls = useMemo(
        () => Object.fromEntries(
            rows
                .filter(row => row.imageFiles.length > 0)
                .map(row => [
                    row.rowNumber,
                    URL.createObjectURL(row.imageFiles[0])
                ])
        ),
        [rows]
    );

    useEffect(
        () => () => {
            Object.values(previewUrls)
                .forEach(url => URL.revokeObjectURL(url));
        },
        [previewUrls]
    );

    const imageCount = rows.filter(row =>
        row.imageFiles.length > 0 || row.product.imageUrl
    ).length;

    const totalImageCount = rows.reduce(
        (sum, row) =>
            sum + (row.imageFiles.length || (row.product.imageUrl ? 1 : 0)),
        0
    );

    const doneCount = Object.values(results)
        .filter(result => result !== "pending")
        .length;

    const successCount = Object.values(results)
        .filter(result => result === "success")
        .length;

    const failedCount = doneCount - successCount;


    /* =====================================================
       CHỌN FILE
    ===================================================== */

    const handleFile = async (file) => {

        if (!file) {
            return;
        }

        setError("");
        setRows([]);
        setResults({});
        setFinished(false);
        setFileName(file.name);

        if (!/\.xlsx$/i.test(file.name)) {
            setError(
                "Chỉ hỗ trợ file .xlsx. Nếu file là .xls hoặc .csv, " +
                "hãy mở bằng Excel và lưu lại dạng .xlsx."
            );
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setError(
                `File quá lớn (tối đa ${MAX_FILE_SIZE / 1024 / 1024}MB).`
            );
            return;
        }

        currentFileRef.current = file;

        try {

            setReading(true);

            setRows(
                await readExcelFile(
                    file,
                    categoryList,
                    existingProducts
                )
            );

        } catch (err) {

            console.error("Không đọc được file Excel:", err);

            setError(
                err.message ||
                "Không đọc được file Excel."
            );

        } finally {

            setReading(false);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };


    /* =====================================================
       TẠO DANH MỤC CÒN THIẾU → ĐỌC LẠI FILE
    ===================================================== */

    const handleCreateCategories = async () => {

        const file = currentFileRef.current;

        if (!file || missingCategories.length === 0) {
            return;
        }

        try {

            setCreatingCategories(true);

            setError("");

            for (const name of missingCategories) {

                await createCategory({
                    name,
                    description: "Tạo khi import sản phẩm từ Excel",
                    status: "ACTIVE"
                });
            }

            const freshCategories = await getCategories();

            const list =
                Array.isArray(freshCategories)
                    ? freshCategories
                    : categoryList;

            setCategoryList(list);

            setRows(
                await readExcelFile(file, list, existingProducts)
            );

            // Cập nhật danh mục ở trang quản lý sản phẩm
            onImported();

        } catch (err) {

            console.error("Không tạo được danh mục:", err);

            setError(
                err.response?.data?.message ||
                (typeof err.response?.data === "string"
                    ? err.response.data
                    : "") ||
                "Không tạo được danh mục. Vui lòng thử lại."
            );

        } finally {

            setCreatingCategories(false);
        }
    };


    const handleDrop = (event) => {

        event.preventDefault();

        setDragOver(false);

        handleFile(event.dataTransfer.files?.[0]);
    };


    /* =====================================================
       IMPORT

       Gửi lần lượt từng sản phẩm để biết chính xác
       dòng nào thành công / thất bại.
    ===================================================== */

    const handleImport = async () => {

        if (validRows.length === 0) {
            return;
        }

        setImporting(true);

        setResults(
            Object.fromEntries(
                validRows.map(row => [row.rowNumber, "pending"])
            )
        );

        for (const row of validRows) {

            let result = "success";

            try {

                await importRow(row);

            } catch (err) {

                console.error(
                    `Import dòng ${row.rowNumber} thất bại:`,
                    err
                );

                result =
                    err.response?.data?.message ||
                    (typeof err.response?.data === "string"
                        ? err.response.data
                        : "") ||
                    "Lỗi khi lưu sản phẩm";
            }

            setResults(prev => ({
                ...prev,
                [row.rowNumber]: result
            }));
        }

        setImporting(false);

        setFinished(true);

        onImported();
    };


    const handleClose = () => {

        if (importing) {
            return;
        }

        onClose();
    };


    const progress =
        validRows.length > 0
            ? Math.round((doneCount / validRows.length) * 100)
            : 0;


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <div
            className="excel-import-overlay"

            onMouseDown={event => {

                if (event.target === event.currentTarget) {
                    handleClose();
                }
            }}
        >

            <div className="excel-import-modal">


                {/* HEADER */}

                <div className="excel-import-header">

                    <div className="excel-import-title">

                        <div className="excel-import-icon">
                            <FileSpreadsheet size={22} />
                        </div>

                        <div>
                            <span>IMPORT</span>

                            <h2>Thêm sản phẩm từ Excel</h2>
                        </div>

                    </div>

                    <button
                        type="button"
                        className="excel-import-close"
                        onClick={handleClose}
                        disabled={importing}
                    >
                        <X size={20} />
                    </button>

                </div>


                <div className="excel-import-body">


                    {/* ĐỊNH DẠNG FILE */}

                    <div className="excel-import-template">

                        <div>

                            <strong>
                                Dòng đầu tiên là tiêu đề cột
                            </strong>

                            <p>
                                Bắt buộc: <b>Tên sản phẩm</b>, <b>Danh mục</b>, <b>Giá</b>.
                                {" "}Không bắt buộc: Số lượng, Mô tả ngắn,
                                Thông số kỹ thuật, Ảnh (URL), Trạng thái
                                (Đang bán / Ngừng bán).
                            </p>

                            <p>
                                <b>Ảnh sản phẩm:</b> chèn ảnh vào dòng của sản phẩm
                                (Insert → Pictures → Place over Cells; nhiều ảnh thì xếp từ trái sang phải, ảnh đầu là ảnh chính),
                                hoặc dán link ảnh vào cột Ảnh (URL).
                            </p>

                        </div>

                    </div>


                    {/* BƯỚC 2: CHỌN FILE */}

                    {!finished && !importing && (

                        <div
                            className={
                                "excel-import-dropzone" +
                                (dragOver ? " drag-over" : "")
                            }
                            onClick={() =>
                                fileInputRef.current?.click()
                            }
                            onDragOver={event => {
                                event.preventDefault();
                                setDragOver(true);
                            }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                        >

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx"
                                hidden
                                onChange={event =>
                                    handleFile(event.target.files?.[0])
                                }
                            />

                            {reading ? (

                                <LoaderCircle
                                    size={30}
                                    className="excel-import-spin"
                                />

                            ) : (

                                <Upload size={30} />

                            )}

                            <strong>

                                {reading
                                    ? "Đang đọc file..."
                                    : fileName
                                        ? fileName
                                        : "Chọn hoặc kéo thả file Excel vào đây"
                                }

                            </strong>

                            <span>
                                Định dạng .xlsx, tối đa {MAX_FILE_SIZE / 1024 / 1024}MB,
                                {" "}{MAX_ROWS} sản phẩm
                            </span>

                        </div>

                    )}


                    {/* LỖI ĐỌC FILE */}

                    {error && (

                        <div className="excel-import-error">

                            <AlertCircle size={18} />

                            {error}

                        </div>

                    )}


                    {/* DANH MỤC CÒN THIẾU */}

                    {missingCategories.length > 0 && !importing && !finished && (

                        <div className="excel-import-missing">

                            <div>

                                <strong>
                                    {missingCategoryRowCount} dòng có danh mục
                                    chưa tồn tại trong hệ thống:
                                </strong>

                                <p>
                                    {missingCategories
                                        .map(name => `"${name}"`)
                                        .join(", ")}
                                </p>

                                {!canCreateCategories && (
                                    <p>
                                        Nhờ Admin tạo các danh mục này
                                        rồi chọn lại file.
                                    </p>
                                )}

                            </div>

                            {canCreateCategories && (

                                <button
                                    type="button"
                                    className="excel-import-primary"
                                    onClick={handleCreateCategories}
                                    disabled={creatingCategories || reading}
                                >

                                    {creatingCategories
                                        ? <LoaderCircle size={17} className="excel-import-spin" />
                                        : <FolderPlus size={17} />
                                    }

                                    Tạo {missingCategories.length} danh mục còn thiếu

                                </button>

                            )}

                        </div>

                    )}


                    {/* TÓM TẮT */}

                    {rows.length > 0 && (

                        <div className="excel-import-summary">

                            <span>
                                Tổng: <b>{rows.length}</b> dòng
                            </span>

                            <span className="valid">
                                Hợp lệ: <b>{validRows.length}</b>
                            </span>

                            <span>
                                Có ảnh: <b>{imageCount}</b> sản phẩm
                                {" "}(<b>{totalImageCount}</b> ảnh)
                            </span>

                            {invalidCount > 0 && (
                                <span className="invalid">
                                    Lỗi (sẽ bỏ qua): <b>{invalidCount}</b>
                                </span>
                            )}

                            {finished && (
                                <>
                                    <span className="valid">
                                        Đã thêm: <b>{successCount}</b>
                                    </span>

                                    {failedCount > 0 && (
                                        <span className="invalid">
                                            Thất bại: <b>{failedCount}</b>
                                        </span>
                                    )}
                                </>
                            )}

                        </div>

                    )}


                    {/* TIẾN ĐỘ */}

                    {(importing || finished) && (

                        <div className="excel-import-progress">

                            <div
                                className="excel-import-progress-bar"
                                style={{ width: `${progress}%` }}
                            />

                        </div>

                    )}


                    {/* XEM TRƯỚC */}

                    {rows.length > 0 && (

                        <div className="excel-import-table-wrap">

                            <table className="excel-import-table">

                                <thead>

                                    <tr>
                                        <th>Dòng</th>
                                        <th>Ảnh</th>
                                        <th>Tên sản phẩm</th>
                                        <th>Danh mục</th>
                                        <th>Giá</th>
                                        <th>SL</th>
                                        <th>Kết quả</th>
                                    </tr>

                                </thead>

                                <tbody>

                                    {rows.map(row => {

                                        const result = results[row.rowNumber];

                                        const hasError =
                                            row.errors.length > 0 ||
                                            (result && result !== "pending" && result !== "success");

                                        return (

                                            <tr
                                                key={row.rowNumber}
                                                className={hasError ? "row-error" : ""}
                                            >

                                                <td>{row.rowNumber}</td>

                                                <td>

                                                    {previewUrls[row.rowNumber] || row.product.imageUrl ? (

                                                        <div className="excel-import-thumb-wrap">

                                                            <img
                                                                className="excel-import-thumb"
                                                                src={
                                                                    previewUrls[row.rowNumber] ||
                                                                    row.product.imageUrl
                                                                }
                                                                alt=""
                                                                loading="lazy"
                                                            />

                                                            {row.imageFiles.length > 1 && (
                                                                <span className="excel-import-thumb-count">
                                                                    {row.imageFiles.length}
                                                                </span>
                                                            )}

                                                        </div>

                                                    ) : (

                                                        <div className="excel-import-thumb empty">
                                                            —
                                                        </div>

                                                    )}

                                                </td>

                                                <td className="name-cell">
                                                    {row.product.name || "—"}
                                                </td>

                                                <td>{row.categoryName || "—"}</td>

                                                <td>
                                                    {Number.isFinite(row.product.price)
                                                        ? formatPrice(row.product.price)
                                                        : "—"
                                                    }
                                                </td>

                                                <td>
                                                    {Number.isFinite(row.product.quantity)
                                                        ? row.product.quantity
                                                        : "—"
                                                    }
                                                </td>

                                                <td>

                                                    {row.errors.length > 0 ? (

                                                        <span className="status-error">
                                                            {row.errors.join(" · ")}
                                                        </span>

                                                    ) : result === "pending" ? (

                                                        <span className="status-pending">
                                                            <LoaderCircle size={14} className="excel-import-spin" />
                                                            Đang thêm
                                                        </span>

                                                    ) : result === "success" ? (

                                                        <span className="status-success">
                                                            <CheckCircle2 size={14} />
                                                            Đã thêm
                                                        </span>

                                                    ) : result ? (

                                                        <span className="status-error">
                                                            {result}
                                                        </span>

                                                    ) : (

                                                        <span className="status-ready">
                                                            Hợp lệ
                                                        </span>

                                                    )}

                                                </td>

                                            </tr>
                                        );
                                    })}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>


                {/* FOOTER */}

                <div className="excel-import-footer">

                    {finished ? (

                        <button
                            type="button"
                            className="excel-import-primary"
                            onClick={onClose}
                        >
                            Hoàn tất
                        </button>

                    ) : (

                        <>
                            <button
                                type="button"
                                className="excel-import-secondary"
                                onClick={handleClose}
                                disabled={importing}
                            >
                                Hủy
                            </button>

                            <button
                                type="button"
                                className="excel-import-primary"
                                onClick={handleImport}
                                disabled={
                                    importing ||
                                    reading ||
                                    validRows.length === 0
                                }
                            >

                                {importing ? (
                                    <>
                                        <LoaderCircle size={17} className="excel-import-spin" />
                                        Đang import {doneCount}/{validRows.length}
                                    </>
                                ) : (
                                    <>
                                        <Upload size={17} />
                                        Import {validRows.length} sản phẩm
                                    </>
                                )}

                            </button>
                        </>

                    )}

                </div>

            </div>

        </div>
    );
}

export default ProductExcelImport;
