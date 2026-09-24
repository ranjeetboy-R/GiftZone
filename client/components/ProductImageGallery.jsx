"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

function ArrowIcon({ direction }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            {direction === "left" ? (
                <path d="M15 18l-6-6 6-6" />
            ) : (
                <path d="M9 18l6-6-6-6" />
            )}
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="M18 6 6 18M6 6l12 12" />
        </svg>
    );
}

function FullscreenIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M21 16v5h-5" />
        </svg>
    );
}

export default function ProductImageGallery({
    images = [],
    productName = "Product"
}) {
    const sliderRef = useRef(null);
    const fullscreenSliderRef = useRef(null);

    const productImages = images.filter(Boolean);

    const [activeIndex, setActiveIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const totalImages = productImages.length;

    /*
     * Main gallery image scroll
     */
    const scrollToImage = index => {
        if (!sliderRef.current) {
            return;
        }

        const safeIndex = Math.max(
            0,
            Math.min(index, totalImages - 1)
        );

        const slide =
            sliderRef.current.children[safeIndex];

        slide?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center"
        });

        setActiveIndex(safeIndex);
    };

    /*
     * Fullscreen image scroll
     */
    const scrollToFullscreenImage = index => {
        if (!fullscreenSliderRef.current) {
            return;
        }

        const safeIndex = Math.max(
            0,
            Math.min(index, totalImages - 1)
        );

        const slide =
            fullscreenSliderRef.current.children[safeIndex];

        slide?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center"
        });

        setActiveIndex(safeIndex);
    };

    /*
     * Previous image
     */
    const previousImage = () => {
        if (!totalImages) {
            return;
        }

        const nextIndex =
            activeIndex === 0
                ? totalImages - 1
                : activeIndex - 1;

        if (isFullscreen) {
            scrollToFullscreenImage(nextIndex);
        } else {
            scrollToImage(nextIndex);
        }
    };

    /*
     * Next image
     */
    const nextImage = () => {
        if (!totalImages) {
            return;
        }

        const nextIndex =
            activeIndex === totalImages - 1
                ? 0
                : activeIndex + 1;

        if (isFullscreen) {
            scrollToFullscreenImage(nextIndex);
        } else {
            scrollToImage(nextIndex);
        }
    };

    /*
     * Main gallery scroll detection
     */
    const handleSliderScroll = () => {
        if (!sliderRef.current) {
            return;
        }

        const slider = sliderRef.current;
        const slides = Array.from(slider.children);

        if (!slides.length) {
            return;
        }

        const sliderCenter =
            slider.scrollLeft +
            slider.clientWidth / 2;

        let closestIndex = 0;
        let closestDistance = Infinity;

        slides.forEach((slide, index) => {
            const slideCenter =
                slide.offsetLeft +
                slide.clientWidth / 2;

            const distance = Math.abs(
                sliderCenter - slideCenter
            );

            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = index;
            }
        });

        if (closestIndex !== activeIndex) {
            setActiveIndex(closestIndex);
        }
    };

    /*
     * Fullscreen mobile swipe detection
     */
    const handleFullscreenScroll = () => {
        if (!fullscreenSliderRef.current) {
            return;
        }

        const slider =
            fullscreenSliderRef.current;

        const slides =
            Array.from(slider.children);

        if (!slides.length) {
            return;
        }

        const sliderCenter =
            slider.scrollLeft +
            slider.clientWidth / 2;

        let closestIndex = 0;
        let closestDistance = Infinity;

        slides.forEach((slide, index) => {
            const slideCenter =
                slide.offsetLeft +
                slide.clientWidth / 2;

            const distance = Math.abs(
                sliderCenter - slideCenter
            );

            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = index;
            }
        });

        if (closestIndex !== activeIndex) {
            setActiveIndex(closestIndex);
        }
    };

    /*
     * Keyboard controls
     */
    useEffect(() => {
        const handleKeyDown = event => {
            if (event.key === "ArrowLeft") {
                previousImage();
            }

            if (event.key === "ArrowRight") {
                nextImage();
            }

            if (event.key === "Escape") {
                setIsFullscreen(false);
            }
        };

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [
        activeIndex,
        totalImages,
        isFullscreen
    ]);

    /*
     * Prevent background page scrolling
     * while fullscreen is open
     */
    useEffect(() => {
        document.body.style.overflow =
            isFullscreen
                ? "hidden"
                : "";

        return () => {
            document.body.style.overflow = "";
        };
    }, [isFullscreen]);

    /*
     * Reset gallery when product images change
     */
    useEffect(() => {
        setActiveIndex(0);
        setIsFullscreen(false);
    }, [images]);

    /*
     * No images
     */
    if (!productImages.length) {
        return (
            <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-500">
                No image available
            </div>
        );
    }

    return (
        <>
            <div className="w-full">
                <div className="flex gap-4">

                    {/* Main gallery */}
                    <div className="relative min-w-0 flex-1">

                        {/* Previous button */}
                        {totalImages > 1 && (
                            <button
                                type="button"
                                onClick={previousImage}
                                className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white/95 p-2.5 shadow-md transition hover:bg-white md:flex"
                                aria-label="Previous image"
                            >
                                <ArrowIcon
                                    direction="left"
                                />
                            </button>
                        )}

                        {/* Next button */}
                        {totalImages > 1 && (
                            <button
                                type="button"
                                onClick={nextImage}
                                className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white/95 p-2.5 shadow-md transition hover:bg-white md:flex"
                                aria-label="Next image"
                            >
                                <ArrowIcon
                                    direction="right"
                                />
                            </button>
                        )}

                        {/* Image slider */}
                        <div
                            ref={sliderRef}
                            onScroll={
                                handleSliderScroll
                            }
                            className="flex aspect-square w-full max-h-[80vh] snap-x snap-mandatory overflow-x-auto scrollbar-hide"
                            style={{
                                scrollbarWidth: "none",
                                msOverflowStyle:
                                    "none"
                            }}
                        >
                            {productImages.map(
                                (image, index) => (
                                    <div
                                        key={`${image}-${index}`}
                                        className="relative flex w-full shrink-0 snap-center items-center justify-center overflow-hidden rounded-2xl"
                                    >
                                        <Image
                                            src={image}
                                            fill
                                            priority={
                                                index === 0
                                            }
                                            alt={`${productName} ${index + 1}`}
                                            sizes="(max-width: 768px) 100vw, 700px"
                                            className="h-full w-auto max-w-full cursor-pointer object-contain"
                                            onClick={() => {
                                                setActiveIndex(
                                                    index
                                                );
                                                setIsFullscreen(
                                                    true
                                                );
                                            }}
                                        />
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile dots */}
                {totalImages > 1 && (
                    <div className="mt-3 flex justify-center gap-1.5">
                        {productImages.map(
                            (image, index) => (
                                <button
                                    key={`${image}-dot-${index}`}
                                    type="button"
                                    onClick={() =>
                                        scrollToImage(
                                            index
                                        )
                                    }
                                    aria-label={`Go to image ${index + 1}`}
                                    className={`h-1.5 rounded-full transition-all ${activeIndex ===
                                            index
                                            ? "w-5 bg-[#c92532]"
                                            : "w-1.5 bg-slate-300"
                                        }`}
                                />
                            )
                        )}
                    </div>
                )}

                {/* Desktop image counter */}
                {totalImages > 1 && (
                    <div className="mt-3 hidden text-center text-xs text-slate-500 md:block">
                        {activeIndex + 1} /{" "}
                        {totalImages}
                    </div>
                )}
            </div>

            {/* Fullscreen lightbox */}
            {isFullscreen && (
                <div className="fixed inset-0 z-[9999] bg-black/95">

                    {/* Close */}
                    <button
                        type="button"
                        onClick={() => {
                            setIsFullscreen(
                                false
                            );
                        }}
                        className="absolute right-4 top-4 z-[100] rounded-full bg-white p-2 shadow-md shadow-black/50 transition hover:bg-slate-100"
                        aria-label="Close fullscreen"
                    >
                        <CloseIcon />
                    </button>

                    {/* Counter */}
                    <div className="absolute left-1/2 top-5 z-[100] -translate-x-1/2 rounded-full bg-white/80 px-4 py-1 text-sm font-bold text-slate-900">
                        {activeIndex + 1} /{" "}
                        {totalImages}
                    </div>

                    {/* Previous */}
                    {totalImages > 1 && (
                        <button
                            type="button"
                            onClick={
                                previousImage
                            }
                            className="absolute left-4 top-1/2 z-[100] hidden -translate-y-1/2 rounded-full bg-white/15 p-4 text-white shadow-lg backdrop-blur-sm transition hover:bg-white/25 md:flex"
                            aria-label="Previous image"
                        >
                            <ArrowIcon
                                direction="left"
                            />
                        </button>
                    )}

                    {/* Next */}
                    {totalImages > 1 && (
                        <button
                            type="button"
                            onClick={
                                nextImage
                            }
                            className="absolute right-4 top-1/2 z-[100] hidden -translate-y-1/2 rounded-full bg-white/15 p-4 text-white shadow-lg backdrop-blur-sm transition hover:bg-white/25 md:flex"
                            aria-label="Next image"
                        >
                            <ArrowIcon
                                direction="right"
                            />
                        </button>
                    )}

                    {/* Fullscreen image slider */}
                    <div
                        ref={
                            fullscreenSliderRef
                        }
                        onScroll={
                            handleFullscreenScroll
                        }
                        className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain scrollbar-hide"
                        style={{
                            scrollbarWidth: "none",
                            msOverflowStyle: "none"
                        }}
                    >
                        {productImages.map(
                            (image, index) => (
                                <div
                                    key={`fullscreen-${image}-${index}`}
                                    className="flex h-full w-full shrink-0 snap-center items-center justify-center"
                                >
                                    <Image
                                        src={image}
                                        width={1800}
                                        height={1800}
                                        priority
                                        alt={`${productName} fullscreen ${index + 1}`}
                                        sizes="100vw"
                                        className="h-auto max-h-full w-auto max-w-full select-none object-contain"
                                        draggable={false}
                                    />
                                </div>
                            )
                        )}
                    </div>

                    {/* Fullscreen mobile dots */}
                    {totalImages > 1 && (
                        <div className="absolute bottom-5 left-1/2 z-[100] flex -translate-x-1/2 gap-1.5 md:hidden">
                            {productImages.map(
                                (
                                    image,
                                    index
                                ) => (
                                    <button
                                        key={`${image}-fullscreen-dot-${index}`}
                                        type="button"
                                        onClick={() =>
                                            scrollToFullscreenImage(
                                                index
                                            )
                                        }
                                        className={`h-1.5 rounded-full transition-all ${activeIndex ===
                                                index
                                                ? "w-5 bg-white"
                                                : "w-1.5 bg-white/40"
                                            }`}
                                        aria-label={`Go to image ${index + 1}`}
                                    />
                                )
                            )}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}