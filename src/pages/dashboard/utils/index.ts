// Improved version of the function that accounts for one or two types
import { Canvas, FabricObject } from "fabric";

export function countObjectsByType<
    T1 extends typeof FabricObject,
    T2 extends typeof FabricObject
>(
    canvas: Canvas | null,
    TypeClass1: T1,
    TypeClass2?: T2
): number {
    if (!canvas) return 0;

    return canvas.getObjects().reduce((count, obj: any) => {
        if (obj instanceof TypeClass1 || (TypeClass2 && obj instanceof TypeClass2)) {
            return count + 1;
        }
        return count;
    }, 0);
}

// Example usage:
// Count only IText objects:
// const totalIText = countObjectsByTypes(canvas, fabric.IText);

// Count both IText and Rect objects:
// const totalITextAndRects = countObjectsByTypes(canvas, fabric.IText, fabric.Rect);
