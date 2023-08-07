import { fabric } from "fabric";
import { debounce } from "lodash-es";
import { useResizeObserver } from "@vueuse/core";
import { CanvasElement, FabricObject } from "@/types/Canvas";
import {
    createShapeCanvasElement,
    createTextCanvasElement,
} from "@/methods/canvas";
import { computed } from "vue";

export function useCanvasModule({
    width: canvasWidth = 920,
    heightRatio = 9 / 16,
}: { width?: number; heightRatio?: number } = {}) {
    let canvas: fabric.Canvas | null = null;
    let canvasElements: FabricObject[] = [];

    const setCanvas = (canvasNode: HTMLCanvasElement) => {
        canvas = new fabric.Canvas(canvasNode, {
            width: canvasWidth,
            height: canvasWidth * heightRatio,
        });
    };

    const resizeCanvas = (width: number) => {
        const scale = width / (canvas?.getWidth() || width);
        const zoom = (canvas?.getZoom() || 1) * scale;

        canvas?.setDimensions({ width, height: width * heightRatio });
        canvas?.setViewportTransform([zoom, 0, 0, zoom, 0, 0]);
    };

    const resizeCanvasDebounced = debounce(resizeCanvas, 100);

    const watchContainerResize = (canvasContainer: HTMLDivElement) => {
        useResizeObserver(canvasContainer, (entries) => {
            const entry = entries[0];
            const { width: containerWidth } = entry.contentRect;

            resizeCanvasDebounced(containerWidth);
        });
    };

    const setCanvasListeners = () => {
        const updateControls = (e: fabric.IEvent<MouseEvent>) => {
            // console.log("canvas event", e);
        };

        const updateSelection = (e: fabric.IEvent<MouseEvent>) => {
            // console.log("got event", e);
        };

        canvas?.on("object:moving", updateControls);
        canvas?.on("object:scaling", updateControls);
        canvas?.on("object:resizing", updateControls);
        canvas?.on("object:rotating", updateControls);
        canvas?.on("object:skewing", updateControls);

        canvas?.on("selection:cleared", updateSelection);
        canvas?.on("selection:updated", updateSelection);
        canvas?.on("selection:created", updateSelection);
    };

    const initialize = (
        canvasNode: HTMLCanvasElement,
        canvasContainer: HTMLDivElement
    ) => {
        setCanvas(canvasNode);

        watchContainerResize(canvasContainer);

        setCanvasListeners();

        const canvasContainerWidth = canvasContainer?.clientWidth;
        if (canvasContainerWidth) {
            resizeCanvas(canvasContainerWidth);
        }
    };

    const addElementsToCanvas = (elements: CanvasElement[]) => {
        elements.forEach((element) => {
            addElementToCanvas(element);
        });
    };

    const addElementToCanvas = (element: CanvasElement) => {
        let canvasElement: FabricObject;

        if (element.type === "text") {
            canvasElement = createTextCanvasElement(element);
        } else if (element.type === "shape") {
            canvasElement = createShapeCanvasElement(element);
        } else {
            throw new Error("Unknown element type: " + element.type);
        }

        applyListenersToCanvasElement(canvasElement);

        canvas?.add(canvasElement);
        canvasElements.push(canvasElement);
    };

    const applyListenersToCanvasElement = (canvasElement: FabricObject) => {
        console.log("setting listeners for", canvasElement);

        canvasElement.on("moving", (e) =>
            handleMarkerEvent("moving", e.transform?.target as FabricObject)
        );
        canvasElement.on("modifying", (e) =>
            handleMarkerEvent("modifying", e.transform?.target as FabricObject)
        );
        canvasElement.on("scaling", (e) => {
            handleMarkerEvent("scaling", e.transform?.target as FabricObject);
        });
        canvasElement.on("resizing", (e) =>
            handleMarkerEvent("resizing", e.transform?.target as FabricObject)
        );
        canvasElement.on("rotating", (e) =>
            handleMarkerEvent("rotating", e.transform?.target as FabricObject)
        );
        // canvasElement.on("event:skewed", (e) =>
        //     handleMarkerEvent("skewed", e.transform?.target as FabricObject)
        // );
    };

    const convertScaleToResize = (canvasElement: FabricObject) => {
        canvasElement.set({
            height: canvasElement.getScaledHeight(),
            width: canvasElement.getScaledWidth(),
            scaleX: 1,
            scaleY: 1,
        });
    };

    const canvasElementIsShape = (canvasElement: FabricObject) => {
        return (
            canvasElement instanceof fabric.Rect ||
            canvasElement instanceof fabric.Circle ||
            canvasElement instanceof fabric.Triangle
        );
    };
    const handleMarkerEvent = (
        eventType: string,
        canvasElement: FabricObject
    ) => {
        if (!canvasElement) {
            console.warn("handleMarkerEvent() -> recevied no canvas element");
            return;
        }
        console.log("marker event", eventType);

        if (eventType === "scaling") {
            if (canvasElementIsShape(canvasElement)) {
                convertScaleToResize(canvasElement);
            }
        }
        // const elementIndex = canvasElements.findIndex((m) => {
        //     return m.uuid === canvasElement.uuid;
        // });

        // console.log("handle event", eventType, elementIndex, canvasObj);

        // if (elementIndex === -1) {
        //     return false;
        // }

        // const element = canvasElements[elementIndex];

        // const elements = [...canvasElements];
        // elements.splice(elementIndex, 1, element);

        // canvasElements = elements;
    };

    const getCanvas = () => canvas;
    const getCanvasElements = () => canvasElements;

    return {
        getCanvas,
        getCanvasElements,
        setCanvas,
        resizeCanvas,
        watchContainerResize,
        setCanvasListeners,
        initialize,
        addElementsToCanvas,
        addElementToCanvas,
        applyListenersToCanvasElement,
    };
}
