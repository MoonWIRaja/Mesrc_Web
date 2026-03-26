export const DEFAULT_IMAGE_POSITION = "50% 50%";
export const DEFAULT_IMAGE_SCALE = 1;
export const DEFAULT_IMAGE_OPACITY = 1;
export const DEFAULT_IMAGE_BLUR = 0;
const FOCUS_OVERSCAN_SCALE = 1.08;

export function parseImagePosition(position?: string) {
    const [rawX = "50%", rawY = "50%"] = (position || DEFAULT_IMAGE_POSITION).split(" ");
    const x = Number.parseFloat(rawX);
    const y = Number.parseFloat(rawY);

    return {
        x: Number.isFinite(x) ? x : 50,
        y: Number.isFinite(y) ? y : 50,
    };
}

export function buildImagePosition(x: number, y: number) {
    return `${Math.max(0, Math.min(100, x))}% ${Math.max(0, Math.min(100, y))}%`;
}

export function resolveImagePosition(position?: string) {
    return position || DEFAULT_IMAGE_POSITION;
}

export function resolveImageScale(scale?: number) {
    if (typeof scale !== "number" || Number.isNaN(scale)) {
        return DEFAULT_IMAGE_SCALE;
    }

    return Math.max(0.8, Math.min(1.8, scale));
}

export function resolveImageOpacity(opacity?: number) {
    if (typeof opacity !== "number" || Number.isNaN(opacity)) {
        return DEFAULT_IMAGE_OPACITY;
    }

    return Math.max(0, Math.min(1, opacity));
}

export function resolveImageBlur(blur?: number) {
    if (typeof blur !== "number" || Number.isNaN(blur)) {
        return DEFAULT_IMAGE_BLUR;
    }

    return Math.max(0, Math.min(20, blur));
}

export function resolveImagePresentationStyle(image: {
    imagePosition?: string;
    imageScale?: number;
    imageOpacity?: number;
    imageBlur?: number;
}) {
    const baseScale = resolveImageScale(image.imageScale);
    const effectiveScale = Math.max(baseScale, FOCUS_OVERSCAN_SCALE);

    return {
        objectPosition: "50% 50%",
        scale: `${effectiveScale}`,
        transformOrigin: resolveImagePosition(image.imagePosition),
        opacity: resolveImageOpacity(image.imageOpacity),
        filter: `blur(${resolveImageBlur(image.imageBlur)}px)`,
    };
}
