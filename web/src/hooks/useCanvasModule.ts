import { fabric } from "fabric";
import { debounce } from "lodash-es";
import { useResizeObserver } from "@vueuse/core";
import { CanvasElement, FabricObject } from "@/types/Canvas";
import {
    createShapeCanvasElement,
    createTextCanvasElement,
} from "@/methods/canvas";
import { ref } from "vue";

export function useCanvasModule({
    width: canvasWidth = 920,
    heightRatio = 9 / 16,
    onChangeCanvasElement,
}: {
    width?: number;
    heightRatio?: number;
    onChangeCanvasElement?: (canvasElement: FabricObject) => void;
} = {}) {
    let canvas: fabric.Canvas | null = null;
    let canvasElements: FabricObject[] = [];

    const selectedUUIDs = ref<string[]>([]);

    const setCanvas = (canvasNode: HTMLCanvasElement) => {
        canvas = new fabric.Canvas(canvasNode, {
            width: canvasWidth,
            height: canvasWidth * heightRatio,
            preserveObjectStacking: true,
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
            const ids = selectedUUIDs.value;
            if (e.selected) {
                (e.selected as FabricObject[]).forEach((element) => {
                    if (!ids.includes(element.uuid)) {
                        ids.push(element.uuid);
                    }
                });
            }

            if (e.deselected) {
                (e.deselected as FabricObject[]).forEach((element) => {
                    if (ids.includes(element.uuid)) {
                        ids.splice(ids.indexOf(element.uuid), 1);
                    }
                });
            }

            setSelectedUUIDs(ids);
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

    const setSelectedUUIDs = (ids: string[]) => {
        selectedUUIDs.value = ids;
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
        canvasElement.on("moving", () =>
            handleCanvasElementEvent("moving", canvasElement)
        );
        canvasElement.on("modifying", () =>
            handleCanvasElementEvent("modifying", canvasElement)
        );
        canvasElement.on("scaling", () => {
            handleCanvasElementEvent("scaling", canvasElement);
        });
        canvasElement.on("rotating", () =>
            handleCanvasElementEvent("rotating", canvasElement)
        );
        canvasElement.on("changed", () => {
            handleCanvasElementEvent("changed", canvasElement);
        });
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

    const keyedCanvasChangeDebouncers: {
        [K: string]: (canvasElement: FabricObject) => void;
    } = {};
    const getCanvasChangeDebouncer = (key: string) => {
        if (!keyedCanvasChangeDebouncers[key]) {
            keyedCanvasChangeDebouncers[key] = debounce(
                (canvasElement: FabricObject) => {
                    if (typeof onChangeCanvasElement === "function") {
                        onChangeCanvasElement(canvasElement);
                    }
                },
                100
            );
        }

        return keyedCanvasChangeDebouncers[key];
    };

    const emitCanvasElementChange = (
        eventType: string,
        canvasElement: FabricObject
    ) => {
        const debouncer = getCanvasChangeDebouncer(eventType);
        debouncer(canvasElement);
    };

    const handleCanvasElementEvent = (
        eventType: string,
        canvasElement: FabricObject
    ) => {
        if (!canvasElement) {
            console.warn(
                "handleCanvasElementEvent(" +
                    eventType +
                    ") -> recevied no canvas element"
            );
            return;
        }

        if (eventType === "scaling") {
            if (canvasElementIsShape(canvasElement)) {
                convertScaleToResize(canvasElement);
            }
        }

        emitCanvasElementChange(eventType, canvasElement);
    };

    const reorderCanvasElements = (uuids: string[]) => {
        const newArr: FabricObject[] = [];
        uuids.forEach((uuid, index) => {
            const canvasElement = findElementById(uuid);
            if (!canvasElement) {
                console.warn(
                    "reorderCanvasElements -> could not find element with uuid",
                    uuid
                );
                return;
            }

            newArr.push(canvasElement);
            canvasElement.moveTo(index);
        });

        canvasElements = newArr;

        canvas?.requestRenderAll();
    };

    const getCanvas = () => canvas;
    const getCanvasElements = () => canvasElements;

    const findElementById = (id: string): FabricObject => {
        return canvasElements.find((element) => element.uuid === id);
    };

    return {
        selectedUUIDs,
        findElementById,
        setSelectedUUIDs,
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
        reorderCanvasElements,
    };
}
