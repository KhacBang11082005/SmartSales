import { useEffect } from "react";


// =========================================================
// CÁC PHẦN TỬ SẼ HIỆN DẦN KHI CUỘN TỚI
// =========================================================

const REVEAL_SELECTOR = [
    ".section-header",
    ".product-card",
    ".category-card",
    ".product-specs-section",
    ".product-reviews-section",
    ".review-product-card",
    ".order-card"
].join(",");


// =========================================================
// useScrollReveal
//
// Phần tử nằm dưới màn hình sẽ được ẩn và hiện dần khi cuộn tới.
// Phần tử đã nằm trong màn hình thì giữ nguyên
// (đã có animation chuyển trang / xuất hiện lần lượt).
//
// Dùng MutationObserver vì dữ liệu được tải bất đồng bộ.
// =========================================================

export default function useScrollReveal(containerRef, resetKey) {

    useEffect(() => {

        const container = containerRef.current;

        if (
            !container ||
            typeof IntersectionObserver === "undefined" ||
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches
        ) {
            return;
        }


        const handleTransitionEnd = (event) => {

            if (event.propertyName !== "opacity") {
                return;
            }

            // Gỡ class để trả lại transition gốc của phần tử
            event.currentTarget.classList.remove(
                "ss-reveal-in"
            );

            event.currentTarget.removeEventListener(
                "transitionend",
                handleTransitionEnd
            );
        };


        const intersectionObserver =
            new IntersectionObserver(
                (entries) => {

                    entries.forEach(entry => {

                        if (!entry.isIntersecting) {
                            return;
                        }

                        const element = entry.target;

                        intersectionObserver.unobserve(element);

                        element.addEventListener(
                            "transitionend",
                            handleTransitionEnd
                        );

                        element.classList.add("ss-reveal-in");
                        element.classList.remove("ss-reveal-pending");
                    });
                },
                {
                    rootMargin: "0px 0px -8% 0px"
                }
            );


        const prepare = (element) => {

            if (element.dataset.ssReveal) {
                return;
            }

            element.dataset.ssReveal = "1";

            const rect = element.getBoundingClientRect();

            // Đã nằm trong màn hình → không ẩn
            if (rect.top < window.innerHeight) {
                return;
            }

            element.classList.add("ss-reveal-pending");

            intersectionObserver.observe(element);
        };


        const scan = (root) => {

            if (root.matches?.(REVEAL_SELECTOR)) {
                prepare(root);
            }

            root
                .querySelectorAll?.(REVEAL_SELECTOR)
                .forEach(prepare);
        };


        scan(container);


        const mutationObserver =
            new MutationObserver(mutations => {

                mutations.forEach(mutation => {

                    mutation.addedNodes.forEach(node => {

                        if (node.nodeType === Node.ELEMENT_NODE) {
                            scan(node);
                        }
                    });
                });
            });

        mutationObserver.observe(container, {
            childList: true,
            subtree: true
        });


        return () => {

            mutationObserver.disconnect();

            intersectionObserver.disconnect();
        };

    }, [containerRef, resetKey]);
}
