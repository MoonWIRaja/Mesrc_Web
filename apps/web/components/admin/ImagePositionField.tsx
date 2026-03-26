"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { buildImagePosition, parseImagePosition, resolveImagePosition } from "@/lib/image-position";

interface ImagePositionFieldProps {
    imageUrl?: string;
    label?: string;
    position?: string;
    description?: string;
    previewContent?: ReactNode;
    previewFrameClassName?: string;
    previewHeightClassName?: string;
    previewOverlayClassName?: string;
    previewViewportWidth?: number;
    controlsLayoutClassName?: string;
    zoomValue?: number;
    zoomLabel?: string;
    zoomMin?: number;
    zoomMax?: number;
    zoomStep?: number;
    onZoomChange?: (zoom: number) => void;
    opacityValue?: number;
    opacityLabel?: string;
    opacityMin?: number;
    opacityMax?: number;
    opacityStep?: number;
    onOpacityChange?: (opacity: number) => void;
    blurValue?: number;
    blurLabel?: string;
    blurMin?: number;
    blurMax?: number;
    blurStep?: number;
    onBlurChange?: (blur: number) => void;
    onChange: (position: string) => void;
}

export function ImagePositionField({
    imageUrl,
    label = "Image Focus",
    position,
    description = "adjust focus point untuk tentukan bahagian gambar yang paling nampak masa render.",
    previewContent,
    previewFrameClassName,
    previewHeightClassName = "h-48",
    previewOverlayClassName,
    previewViewportWidth,
    controlsLayoutClassName = "grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]",
    zoomValue,
    zoomLabel = "Zoom",
    zoomMin = 0.8,
    zoomMax = 1.8,
    zoomStep = 0.01,
    onZoomChange,
    opacityValue,
    opacityLabel = "Transparent",
    opacityMin = 0,
    opacityMax = 1,
    opacityStep = 0.01,
    onOpacityChange,
    blurValue,
    blurLabel = "Blur",
    blurMin = 0,
    blurMax = 20,
    blurStep = 0.5,
    onBlurChange,
    onChange,
}: ImagePositionFieldProps) {
    const [previewFrameWidth, setPreviewFrameWidth] = useState(0);
    const [previewMeasuredHeight, setPreviewMeasuredHeight] = useState(0);
    const previewFrameRef = useRef<HTMLDivElement>(null);
    const previewMeasureRef = useRef<HTMLDivElement>(null);

    const { x, y } = parseImagePosition(position);
    const resolvedPosition = resolveImagePosition(position);
    const previewWidth = previewViewportWidth ?? 0;
    const usesScaledPreview = Boolean(previewContent && previewWidth > 0);
    const fittedPreviewScale = usesScaledPreview && previewFrameWidth > 0
        ? Math.min(1, previewFrameWidth / previewWidth)
        : 1;
    const fittedPreviewHeight = usesScaledPreview && previewMeasuredHeight > 0
        ? previewMeasuredHeight * fittedPreviewScale
        : 0;

    useEffect(() => {
        if (!usesScaledPreview) {
            return;
        }

        const frame = previewFrameRef.current;
        const measure = previewMeasureRef.current;
        if (!frame || !measure) {
            return;
        }

        const updatePreviewSize = () => {
            setPreviewFrameWidth(frame.clientWidth);
            setPreviewMeasuredHeight(measure.offsetHeight);
        };

        updatePreviewSize();

        const resizeObserver = new ResizeObserver(updatePreviewSize);
        resizeObserver.observe(frame);
        resizeObserver.observe(measure);
        window.addEventListener("resize", updatePreviewSize);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", updatePreviewSize);
        };
    }, [usesScaledPreview, previewViewportWidth]);

    if (!imageUrl) {
        return null;
    }

    return (
        <div className="relative space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
                <p className="text-xs text-slate-500">
                    {description}
                </p>
            </div>

            {usesScaledPreview && (
                <div className="pointer-events-none absolute -left-[9999px] top-0 opacity-0" aria-hidden="true">
                    <div ref={previewMeasureRef} style={{ width: previewWidth }}>
                        {previewContent}
                    </div>
                </div>
            )}

            <div className={controlsLayoutClassName}>
                {previewContent ? (
                    usesScaledPreview ? (
                        <div
                            ref={previewFrameRef}
                            className={previewFrameClassName || "overflow-hidden rounded-xl border border-slate-200 bg-white"}
                        >
                            <div style={{ height: fittedPreviewHeight || undefined }}>
                                <div
                                    className="origin-top-left pointer-events-none select-none"
                                    style={{
                                        width: previewWidth,
                                        transform: `scale(${fittedPreviewScale})`,
                                    }}
                                >
                                    {previewContent}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={previewFrameClassName || `relative overflow-hidden rounded-xl border border-slate-200 bg-white ${previewHeightClassName}`}>
                            <div className="pointer-events-none select-none h-full w-full">
                                {previewContent}
                            </div>
                        </div>
                    )
                ) : (
                    <div
                        className={previewFrameClassName || `relative overflow-hidden rounded-xl border border-slate-200 bg-white ${previewHeightClassName}`}
                    >
                        <img
                            src={imageUrl}
                            alt="Image preview focus"
                            className="h-full w-full object-cover"
                            style={{ objectPosition: resolvedPosition }}
                        />
                        {previewOverlayClassName && <div className={previewOverlayClassName} />}
                    </div>
                )}

                <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
                    <div>
                        <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                            <span>Horizontal</span>
                            <span>{Math.round(x)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={x}
                            onChange={(e) => onChange(buildImagePosition(Number(e.target.value), y))}
                            className="w-full accent-blue-600"
                        />
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                            <span>Vertical</span>
                            <span>{Math.round(y)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={y}
                            onChange={(e) => onChange(buildImagePosition(x, Number(e.target.value)))}
                            className="w-full accent-blue-600"
                        />
                    </div>

                    {typeof zoomValue === "number" && onZoomChange && (
                        <div>
                            <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                                <span>{zoomLabel}</span>
                                <span>{zoomValue.toFixed(2)}x</span>
                            </div>
                            <input
                                type="range"
                                min={zoomMin}
                                max={zoomMax}
                                step={zoomStep}
                                value={zoomValue}
                                onChange={(e) => onZoomChange(Number(e.target.value))}
                                className="w-full accent-blue-600"
                            />
                        </div>
                    )}

                    {typeof opacityValue === "number" && onOpacityChange && (
                        <div>
                            <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                                <span>{opacityLabel}</span>
                                <span>{Math.round(opacityValue * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min={opacityMin}
                                max={opacityMax}
                                step={opacityStep}
                                value={opacityValue}
                                onChange={(e) => onOpacityChange(Number(e.target.value))}
                                className="w-full accent-blue-600"
                            />
                        </div>
                    )}

                    {typeof blurValue === "number" && onBlurChange && (
                        <div>
                            <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                                <span>{blurLabel}</span>
                                <span>{blurValue.toFixed(1)}px</span>
                            </div>
                            <input
                                type="range"
                                min={blurMin}
                                max={blurMax}
                                step={blurStep}
                                value={blurValue}
                                onChange={(e) => onBlurChange(Number(e.target.value))}
                                className="w-full accent-blue-600"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
