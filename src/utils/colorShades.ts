export type PalettePoint = {
    x: number;
    y: number;
};

type RGB = {
    r: number;
    g: number;
    b: number;
};

export class ChromaCurve {
    constructor(public points: PalettePoint[]) {}

    static soft = new ChromaCurve([
        { x: 0, y: 0 },
        { x: 0.25, y: 0.15 },
        { x: 0.5, y: 0.5 },
        { x: 0.75, y: 0.85 },
        { x: 1, y: 1 },
    ]);

    transform(t: number): number {
        const n = this.points.length;

        let seg = 0;

        for (let i = 0; i < n - 1; i++) {
            if (t >= this.points[i].x && t <= this.points[i + 1].x) {
                seg = i;
                break;
            }
        }

        const p0 = this.points[Math.max(0, seg - 1)];
        const p1 = this.points[seg];
        const p2 = this.points[Math.min(n - 1, seg + 1)];
        const p3 = this.points[Math.min(n - 1, seg + 2)];

        const dt = p2.x - p1.x;

        const u =
            dt < 1e-9
                ? 0
                : Math.min(Math.max((t - p1.x) / dt, 0), 1);

        const u2 = u * u;
        const u3 = u2 * u;

        const v =
            0.5 *
            ((2 * p1.y) +
                (-p0.y + p2.y) * u +
                (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * u2 +
                (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * u3);

        return Math.min(Math.max(v, 0), 1);
    }
}

const lerp = (start: number, end: number, t: number) =>
    start + (end - start) * t;

const hexToRgb = (hex: string): RGB => {
    const cleaned = hex.replace("#", "");

    const fullHex =
        cleaned.length === 3
            ? cleaned
                  .split("")
                  .map((c) => c + c)
                  .join("")
            : cleaned;

    const num = parseInt(fullHex, 16);

    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255,
    };
};

const rgbToHex = ({ r, g, b }: RGB): string =>
    `#${[r, g, b]
        .map((v) =>
            Math.round(v)
                .toString(16)
                .padStart(2, "0")
                .toUpperCase()
        )
        .join("")}`;

const lerpColor = (
    c1: RGB,
    c2: RGB,
    t: number
): RGB => ({
    r: Math.round(lerp(c1.r, c2.r, t)),
    g: Math.round(lerp(c1.g, c2.g, t)),
    b: Math.round(lerp(c1.b, c2.b, t)),
});

const mixHexColors = (
    color1: string,
    color2: string,
    amount = 0.5
): string => {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);

    return rgbToHex({
        r: Math.round(lerp(c1.r, c2.r, amount)),
        g: Math.round(lerp(c1.g, c2.g, amount)),
        b: Math.round(lerp(c1.b, c2.b, amount)),
    });
};

export type TailwindPalette = {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
    1000: string;
};

export const generateColorPalette = (
    baseHex: string,
    curve: ChromaCurve = ChromaCurve.soft
): TailwindPalette => {
    const base = hexToRgb(baseHex);

    const dark = hexToRgb("#000000");
    const light = hexToRgb("#FFFFFF");

    const tones = [
        0,
        10,
        20,
        30,
        40,
        50,
        60,
        70,
        80,
        90,
        100,
    ];

    const generated: Record<number, string> = {};

    for (let i = 0; i < tones.length; i++) {
        const t = i / (tones.length - 1);

        const ct = curve.transform(t);

        let color: RGB;

        if (ct <= 0.5) {
            color = lerpColor(
                dark,
                base,
                ct * 2
            );
        } else {
            color = lerpColor(
                base,
                light,
                (ct - 0.5) * 2
            );
        }

        generated[tones[i]] = rgbToHex(color);
    }

    return {
        50: generated[100],
        100: generated[90],
        200: generated[80],
        300: generated[70],
        400: generated[60],
        500: generated[50],
        600: generated[40],
        700: generated[30],
        800: generated[20],
        900: generated[10],

        // New shade between 900 and 1000
        950: mixHexColors(
            generated[10],
            generated[0],
            0.5
        ),

        1000: generated[0],
    };
};