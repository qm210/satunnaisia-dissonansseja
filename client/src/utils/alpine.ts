import Alpine from "alpinejs";


export const logRaw = (...args: any[]) => {
    console.log(...args.map(Alpine.raw));
};
