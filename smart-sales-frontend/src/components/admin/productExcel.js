/* =========================================================
   XỬ LÝ FILE EXCEL SẢN PHẨM

   Tách riêng khỏi giao diện (ProductExcelImport.jsx):
   - đọc & kiểm tra file import
========================================================= */

/* =========================================================
   CẤU HÌNH
========================================================= */

// File có ảnh chèn trực tiếp nên cho phép lớn hơn
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Số ảnh tối đa lấy cho 1 sản phẩm (1 dòng)
export const MAX_IMAGES_PER_ROW = 10;

const IMAGE_MIME = {
    png: "image/png",
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    gif: "image/gif"
};

export const MAX_ROWS = 1000;



/* =========================================================
   CỘT TRONG FILE EXCEL

   aliases: các tên cột được chấp nhận
   (so sánh không dấu, không phân biệt hoa thường)
========================================================= */

const COLUMNS = [
    {
        key: "name",
        header: "Tên sản phẩm *",
        aliases: ["ten san pham", "ten", "ten hang", "ten hang hoa", "san pham", "name", "product name", "product"]
    },
    {
        key: "category",
        header: "Danh mục *",
        aliases: ["danh muc", "nhom", "nhom hang", "loai", "loai san pham", "category"]
    },
    {
        key: "price",
        header: "Giá *",
        aliases: ["gia", "gia ban", "don gia", "gia vnd", "price"]
    },
    {
        key: "quantity",
        header: "Số lượng",
        aliases: ["so luong", "ton kho", "quantity", "sl"]
    },
    {
        key: "description",
        header: "Mô tả ngắn",
        aliases: ["mo ta ngan", "mo ta", "description"]
    },
    {
        key: "specifications",
        header: "Thông số kỹ thuật",
        aliases: ["thong so ky thuat", "thong so", "specifications", "specs"]
    },
    {
        key: "imageUrl",
        header: "Ảnh (URL)",
        aliases: ["anh", "hinh anh", "anh url", "image", "image url", "imageurl"]
    },
    {
        key: "status",
        header: "Trạng thái",
        aliases: ["trang thai", "status"]
    }
];

const STATUS_VALUES = {
    "active": "ACTIVE",
    "dang ban": "ACTIVE",
    "hoat dong": "ACTIVE",
    "con hang": "ACTIVE",
    "het hang": "ACTIVE",
    "dang kinh doanh": "ACTIVE",
    "mo ban": "ACTIVE",
    "hien": "ACTIVE",
    "inactive": "INACTIVE",
    "ngung ban": "INACTIVE",
    "ngung kinh doanh": "INACTIVE",
    "tam ngung": "INACTIVE",
    "an": "INACTIVE"
};


/* =========================================================
   GHÉP TIÊU ĐỀ CỘT → TRƯỜNG DỮ LIỆU

   1. Khớp đúng tên:        "Giá"                      → price
   2. Tên có thêm chữ sau:  "Giá bán tham khảo (VNĐ)"  → price
                            "Số lượng mẫu"             → quantity
   Mỗi cột chỉ dùng cho một trường.

   cells: [{ colNumber, header (đã normalizeHeader) }]
========================================================= */

function matchColumns(cells) {

    const found = {};
    const used = new Set();

    const tryMatch = (isMatch) => {

        COLUMNS.forEach(col => {

            if (found[col.key]) {
                return;
            }

            const cell = cells.find(c =>
                !used.has(c.colNumber) &&
                col.aliases.some(alias => isMatch(c.header, alias))
            );

            if (cell) {
                found[col.key] = cell.colNumber;
                used.add(cell.colNumber);
            }
        });
    };

    tryMatch((header, alias) => header === alias);

    tryMatch((header, alias) => header.startsWith(alias + " "));

    return found;
}


/* =========================================================
   HELPER
========================================================= */

// Bỏ dấu tiếng Việt, chữ thường, gọn khoảng trắng
function normalize(text) {

    return String(text ?? "")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}


function normalizeHeader(text) {

    return normalize(
        String(text ?? "")
            .replace(/\*/g, "")
            .replace(/[()]/g, " ")
    );
}


// Lấy text từ ô Excel (rich text, công thức, hyperlink, ngày...)
function cellText(value) {

    if (value === null || value === undefined) {
        return "";
    }

    if (value instanceof Date) {
        return value.toISOString();
    }

    if (typeof value === "object") {

        if (Array.isArray(value.richText)) {
            return value.richText
                .map(part => part.text)
                .join("");
        }

        if ("result" in value) {
            return cellText(value.result);
        }

        if ("text" in value) {
            return cellText(value.text);
        }

        if ("hyperlink" in value) {
            return String(value.hyperlink);
        }

        return "";
    }

    return String(value);
}


// "15.990.000 ₫" → 15990000
function parseNumber(value) {

    if (typeof value === "number") {
        return value;
    }

    let text = cellText(value).trim();

    if (!text) {
        return null;
    }

    // Phần thập phân (1–2 chữ số ở cuối) → bỏ đi.
    // Nhóm 3 chữ số là dấu phân cách hàng nghìn → giữ lại.
    text = text.replace(/[.,]\d{1,2}(?=\D*$)/, "");

    const digits = text.replace(/[^\d]/g, "");

    if (!digits) {
        return NaN;
    }

    return Number(digits);
}


// Thông số: mỗi dòng trong ô (Alt + Enter) hoặc cách nhau bởi dấu ";"
function parseSpecifications(value) {

    return cellText(value)
        .split(/\r?\n|;/)
        .map(line => line.trim())
        .filter(Boolean)
        .join("\n");
}


/* =========================================================
   ĐỌC FILE → DANH SÁCH DÒNG ĐÃ KIỂM TRA
========================================================= */

export async function readExcelFile(file, categories, existingProducts) {

    const { default: ExcelJS } = await import("exceljs");

    const workbook = new ExcelJS.Workbook();

    await workbook.xlsx.load(
        await file.arrayBuffer()
    );


    if (workbook.worksheets.length === 0) {
        throw new Error("File Excel không có sheet nào.");
    }


    /* -------------------------------------------------
       TÌM SHEET + DÒNG TIÊU ĐỀ

       - Ưu tiên sheet tên "Sản phẩm", sau đó các sheet khác
       - Dòng tiêu đề: dòng đầu tiên (trong 10 dòng đầu)
         có đủ 3 cột Tên sản phẩm, Danh mục, Giá
    ------------------------------------------------- */

    const sheets = [...workbook.worksheets].sort((a, b) =>
        (normalize(b.name) === "san pham") - (normalize(a.name) === "san pham")
    );

    let worksheet = null;
    let headerRowNumber = 1;
    let columnIndex = {};

    // Lần thử khớp nhiều cột nhất, dùng để báo lỗi rõ ràng
    let best = null;

    for (const sheet of sheets) {

        for (let rowNumber = 1; rowNumber <= 10; rowNumber++) {

            const headers = [];
            const cells = [];

            sheet.getRow(rowNumber).eachCell((cell, colNumber) => {

                const text = cellText(cell.value).trim();

                if (text) {
                    headers.push(text);

                    cells.push({
                        colNumber,
                        header: normalizeHeader(text)
                    });
                }
            });

            const found = matchColumns(cells);

            const required = ["name", "category", "price"];

            const matched = required.filter(key => found[key]).length;

            if (!best || matched > best.matched) {
                best = {
                    matched,
                    sheetName: sheet.name,
                    rowNumber,
                    headers,
                    missing: required.filter(key => !found[key])
                };
            }

            if (matched === required.length) {
                worksheet = sheet;
                headerRowNumber = rowNumber;
                columnIndex = found;
                break;
            }
        }

        if (worksheet) {
            break;
        }
    }

    if (!worksheet) {

        const missingNames = best.missing
            .map(key =>
                COLUMNS.find(col => col.key === key).header.replace(" *", "")
            )
            .join(", ");

        throw new Error(
            `Thiếu cột bắt buộc: ${missingNames}. ` +
            `Sheet "${best.sheetName}" dòng ${best.rowNumber} đang có các cột: ` +
            (best.headers.length
                ? best.headers.map(h => `"${h}"`).join(", ")
                : "(trống)") +
            "."
        );
    }


    /* -------------------------------------------------
       TRA CỨU DANH MỤC & SẢN PHẨM ĐÃ CÓ
    ------------------------------------------------- */

    const categoryByName = new Map();
    const categoryById = new Map();

    categories.forEach(category => {

        categoryByName.set(normalize(category.name), category);

        categoryById.set(String(category.id), category);
    });

    const existingNames = new Set(
        existingProducts.map(product =>
            normalize(product.name)
        )
    );

    const namesInFile = new Map();


    /* -------------------------------------------------
       ẢNH CHÈN TRONG SHEET (Insert → Pictures)

       Ảnh thuộc về dòng chứa tâm của ảnh.
       Một dòng có nhiều ảnh → giữ thứ tự từ trái sang phải,
       ảnh đầu tiên là ảnh chính, tối đa MAX_IMAGES_PER_ROW ảnh.
    ------------------------------------------------- */

    const imagesByRow = new Map();

    worksheet.getImages().forEach(image => {

        const { tl, br } = image.range || {};

        if (!tl) {
            return;
        }

        const centerRow =
            br ? (tl.row + br.row) / 2 : tl.row;

        // range.row bắt đầu từ 0, rowNumber của Excel bắt đầu từ 1
        const rowNumber = Math.floor(centerRow) + 1;

        const media = workbook.getImage(Number(image.imageId));

        const extension = String(media?.extension || "").toLowerCase();

        if (!media?.buffer || !IMAGE_MIME[extension]) {
            return;
        }

        if (!imagesByRow.has(rowNumber)) {
            imagesByRow.set(rowNumber, []);
        }

        imagesByRow.get(rowNumber).push({
            col: tl.col,
            media,
            extension
        });
    });

    const getRowImages = (rowNumber) =>
        (imagesByRow.get(rowNumber) || [])
            .sort((a, b) => a.col - b.col)
            .slice(0, MAX_IMAGES_PER_ROW)
            .map(({ media, extension }, index) =>
                new File(
                    [media.buffer],
                    `excel-row-${rowNumber}-${index + 1}.${extension === "jpeg" ? "jpg" : extension}`,
                    { type: IMAGE_MIME[extension] }
                )
            );


    /* -------------------------------------------------
       ĐỌC TỪNG DÒNG
    ------------------------------------------------- */

    const rows = [];

    worksheet.eachRow((row, rowNumber) => {

        if (rowNumber <= headerRowNumber) {
            return;
        }

        const get = (key) =>
            columnIndex[key]
                ? row.getCell(columnIndex[key]).value
                : null;

        const name = cellText(get("name")).trim();
        const categoryText = cellText(get("category")).trim();
        const priceRaw = get("price");
        const quantityRaw = get("quantity");
        const description = cellText(get("description")).trim();
        const specifications = parseSpecifications(get("specifications"));
        // Chỉ nhận link ảnh http(s); chữ khác trong cột ảnh bị bỏ qua
        const imageText = cellText(get("imageUrl")).trim();

        const imageUrl =
            /^https?:\/\/\S+$/i.test(imageText) ? imageText : "";
        const statusText = cellText(get("status")).trim();


        // Bỏ qua dòng trống hoàn toàn
        if (
            !name &&
            !categoryText &&
            !cellText(priceRaw).trim() &&
            !description
        ) {
            return;
        }


        const errors = [];


        // TÊN
        if (!name) {
            errors.push("Thiếu tên sản phẩm");
        } else if (name.length > 150) {
            errors.push("Tên dài quá 150 ký tự");
        } else if (existingNames.has(normalize(name))) {
            errors.push("Sản phẩm đã tồn tại");
        } else if (namesInFile.has(normalize(name))) {
            errors.push(
                `Trùng tên với dòng ${namesInFile.get(normalize(name))}`
            );
        }

        if (name) {
            namesInFile.set(normalize(name), rowNumber);
        }


        // DANH MỤC (theo tên hoặc ID)
        const category =
            categoryByName.get(normalize(categoryText)) ||
            categoryById.get(categoryText);

        if (!categoryText) {
            errors.push("Thiếu danh mục");
        } else if (!category) {
            errors.push(`Không có danh mục "${categoryText}"`);
        }


        // GIÁ
        const price = parseNumber(priceRaw);

        if (price === null) {
            errors.push("Thiếu giá");
        } else if (Number.isNaN(price) || price < 0) {
            errors.push("Giá không hợp lệ");
        }


        // SỐ LƯỢNG
        let quantity = parseNumber(quantityRaw);

        if (quantity === null) {
            quantity = 0;
        } else if (
            Number.isNaN(quantity) ||
            quantity < 0 ||
            !Number.isInteger(quantity)
        ) {
            errors.push("Số lượng không hợp lệ");
        }


        // TRẠNG THÁI
        let status = "ACTIVE";

        if (statusText) {

            status = STATUS_VALUES[normalize(statusText)];

            if (!status) {
                errors.push(
                    "Trạng thái chỉ nhận Đang bán / Ngừng bán"
                );
            }
        }


        rows.push({
            rowNumber,
            errors,
            categoryName: category?.name || categoryText,

            // Tên danh mục trong file nhưng chưa có trong hệ thống
            missingCategory:
                !category && categoryText ? categoryText : null,

            // Ảnh chèn trong Excel (File) – được ưu tiên hơn cột Ảnh (URL)
            imageFiles: getRowImages(rowNumber),
            product: {
                category: category
                    ? { id: Number(category.id) }
                    : null,
                name,
                description,
                specifications,
                price,
                quantity,
                imageUrl: imageUrl || null,
                status
            }
        });
    });


    if (rows.length === 0) {
        throw new Error("File không có dòng sản phẩm nào.");
    }

    if (rows.length > MAX_ROWS) {
        throw new Error(
            `Mỗi lần chỉ import tối đa ${MAX_ROWS} sản phẩm.`
        );
    }

    return rows;
}
