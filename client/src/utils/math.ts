export const clamp = (x: number, min: number = 0, max: number = 1) =>
    x < min ? min : x > max ? max : x;
