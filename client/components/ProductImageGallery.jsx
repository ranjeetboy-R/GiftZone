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

function ZoomIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
            <path d="M11 8v6M8 11h6" />
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
    const mainImageRef = useRef(null);

    const productImages = images.filter(Boolean);

    const [activeIndex, setActiveIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);

    const totalImages = productImages.length;

    const scrollToImage = index => {
        if (!sliderRef.current) return;

        const safeIndex = Math.max(
            0,
            Math.min(index, totalImages - 1)
        );

        const slide = sliderRef.current.children[safeIndex];

        slide?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center"
        });

        setActiveIndex(safeIndex);
        setIsZoomed(false);
    };

    const previousImage = () => {
        if (!totalImages) return;

        const nextIndex =
            activeIndex === 0
                ? totalImages - 1
                : activeIndex - 1;

        scrollToImage(nextIndex);
    };

    const nextImage = () => {
        if (!totalImages) return;

        const nextIndex =
            activeIndex === totalImages - 1
                ? 0
                : activeIndex + 1;

        scrollToImage(nextIndex);
    };

    const handleSliderScroll = () => {
        if (!sliderRef.current) return;

        const slider = sliderRef.current;
        const slides = Array.from(slider.children);

        if (!slides.length) return;

        const sliderCenter =
            slider.scrollLeft + slider.clientWidth / 2;

        let closestIndex = 0;
        let closestDistance = Infinity;

        slides.forEach((slide, index) => {
            const slideCenter =
                slide.offsetLeft + slide.clientWidth / 2;

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
            setIsZoomed(false);
        }
    };

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
                setIsZoomed(false);
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
    }, [activeIndex, totalImages]);

    useEffect(() => {
        document.body.style.overflow = isFullscreen
            ? "hidden"
            : "";

        return () => {
            document.body.style.overflow = "";
        };
    }, [isFullscreen]);

    useEffect(() => {
        setActiveIndex(0);
        setIsZoomed(false);
    }, [images]);

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
                                <ArrowIcon direction="left" />
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
                                <ArrowIcon direction="right" />
                            </button>
                        )}

                        {/* Image slider */}
                        <div
                            ref={sliderRef}
                            onScroll={handleSliderScroll}
                            className="flex aspect-square w-full max-h-[80vh] snap-x snap-mandatory overflow-x-auto scrollbar-hide"
                            style={{
                                scrollbarWidth: "none",
                                msOverflowStyle: "none"
                            }}
                        >
                            {productImages.map((image, index) => (
                                <div
                                    key={`${image}-${index}`}
                                    className="relative flex w-full shrink-0 snap-center items-center justify-center rounded-2xl overflow-hidden"
                                >
                                    <Image
                                        ref={
                                            index === activeIndex
                                                ? mainImageRef
                                                : null
                                        }
                                        src={image}
                                        fill
                                        priority={index === 0}
                                        alt={`${productName} ${index + 1}`}
                                        sizes="(max-width: 768px) 100vw, 700px"
                                        className={`max-h-[600px] w-auto max-w-full object-contain transition-transform duration-300 ${isZoomed
                                                ? "cursor-zoom-out scale-170"
                                                : "cursor-zoom-in"
                                            }`}
                                        onClick={() => {
                                            if (isZoomed) {
                                                setIsZoomed(false);
                                            } else {
                                                setIsZoomed(true);
                                            }
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Zoom + fullscreen buttons */}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsFullscreen(true);
                                    setIsZoomed(false);
                                }}
                                className="absolute bottom-3 right-3 z-20 rounded-full border border-slate-200 shadow-md shadow-black/30 bg-white/95 p-2.5 shadow-md"
                                aria-label="Open fullscreen"
                            >
                                <FullscreenIcon />
                            </button>
                    </div>
                </div>

                {/* Mobile dots */}
                {totalImages > 1 && (
                    <div className="mt-3 flex justify-center gap-1.5">
                        {productImages.map((image, index) => (
                            <button
                                key={`${image}-dot-${index}`}
                                type="button"
                                onClick={() => scrollToImage(index)}
                                aria-label={`Go to image ${index + 1}`}
                                className={`h-1.5 rounded-full transition-all ${activeIndex === index
                                        ? "w-5 bg-[#c92532]"
                                        : "w-1.5 bg-slate-300"
                                    }`}
                            />
                        ))}
                    </div>
                )}

                {/* Desktop image counter */}
                {totalImages > 1 && (
                    <div className="mt-3 hidden text-center text-xs text-slate-500 md:block">
                        {activeIndex + 1} / {totalImages}
                    </div>
                )}
            </div>

            {/* Fullscreen lightbox */}
            {isFullscreen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95">
                    {/* Close */}
                    <button
                        type="button"
                        onClick={() => {
                            setIsFullscreen(false);
                            setIsZoomed(false);
                        }}
                        className="absolute right-4 top-4 z-50 rounded-full p-2 shadow-md shadow-black/50 transition bg-white"
                        aria-label="Close fullscreen"
                    >
                        <CloseIcon />
                    </button>

                    {/* Counter */}
                    <div className="absolute left-1/2 top-5 z-50 -translate-x-1/2 rounded-full bg-white/60 px-4 py-1 font-bold text-sm">
                        {activeIndex + 1} / {totalImages}
                    </div>

                    {/* Fullscreen previous */}
                    {totalImages > 1 && (
                        <button
                            type="button"
                            onClick={previousImage}
                            className="absolute left-3 top-1/2 z-50 hidden -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 md:flex"
                            aria-label="Previous image"
                        >
                            <ArrowIcon direction="left" />
                        </button>
                    )}

                    {/* Fullscreen next */}
                    {totalImages > 1 && (
                        <button
                            type="button"
                            onClick={nextImage}
                            className="absolute right-3 top-1/2 z-50 hidden -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 md:flex"
                            aria-label="Next image"
                        >
                            <ArrowIcon direction="right" />
                        </button>
                    )}

                    {/* Fullscreen image */}
                    <div className="flex h-full w-full items-center justify-center overflow-hidden">
                        <Image
                            src={productImages[activeIndex]}
                            width={1800}
                            height={1800}
                            priority
                            alt={`${productName} fullscreen`}
                            sizes="100vw"
                            className={`max-h-full max-w-full object-contain transition-transform duration-300 ${isZoomed
                                    ? "cursor-zoom-out scale-150"
                                    : "cursor-zoom-in"
                                }`}
                            onClick={() =>
                                setIsZoomed(current => !current)
                            }
                        />
                    </div>

                    {/* Fullscreen mobile swipe dots */}
                    {totalImages > 1 && (
                        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-1.5 md:hidden">
                            {productImages.map(
                                (image, index) => (
                                    <button
                                        key={`${image}-fullscreen-dot-${index}`}
                                        type="button"
                                        onClick={() =>
                                            scrollToImage(index)
                                        }
                                        className={`h-1.5 rounded-full ${activeIndex === index
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