import { fabric } from "fabric";
import { debounce } from "lodash-es";
import { useResizeObserver } from "@vueuse/core";
import { CanvasElement, FabricObject } from "@/types/Canvas";
import {
    createShapeCanvasElement,
    createTextCanvasElement,
    createImageCanvasElement,
} from "@/methods/canvas";
import { useMagicKeys } from "@vueuse/core";
import { ref, watch } from "vue";

export function useCanvasModule({
    width: canvasWidth = 920,
    heightRatio = 9 / 16,
    onChangeCanvasElement,
    onRemoveCanvasElement,
}: {
    width?: number;
    heightRatio?: number;
    onChangeCanvasElement?: (canvasElement: FabricObject) => void;
    onRemoveCanvasElement?: (canvasElement: FabricObject) => void;
} = {}) {
    let canvas: fabric.Canvas | null = null;
    let canvasElements: FabricObject[] = [];

    const selectedUUIDs = ref<string[]>([]);
    const editUUID = ref<string | null>(null);

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

    const setHotkeyListeners = () => {
        const keys = useMagicKeys();

        watch(keys.delete, (v) => {
            if (v) {
                if (selectedUUIDs.value.length === 1) {
                    const uuid = selectedUUIDs.value[0];
                    const canvasElement = findElementById(uuid);
                    if (canvasElement) {
                        if (
                            canvasElement instanceof fabric.IText &&
                            canvasElement.isEditing
                        ) {
                            return;
                        }
                        removeCanvasElementById(uuid);
                    }
                }
            }
        });
    };

    const setSelectedUUIDs = (ids: string[]) => {
        selectedUUIDs.value = ids;
    };
    const setEditUUID = (id: string | null) => {
        editUUID.value = id;
    };

    const initialize = (
        canvasNode: HTMLCanvasElement,
        canvasContainer: HTMLDivElement
    ) => {
        setCanvas(canvasNode);

        watchContainerResize(canvasContainer);

        setCanvasListeners();

        setHotkeyListeners();

        const canvasContainerWidth = canvasContainer?.clientWidth;
        if (canvasContainerWidth) {
            resizeCanvas(canvasContainerWidth);
        }
    };

    const addElementsToCanvas = async (elements: CanvasElement[]) => {
        for (let i in elements) {
            await addElementToCanvas(elements[i]);
        }

        canvas?.requestRenderAll();
    };

    const addElementToCanvas = async (element: CanvasElement) => {
        let canvasElement: FabricObject;

        if (element.type === "text") {
            canvasElement = await createTextCanvasElement(element);
        } else if (element.type === "shape") {
            canvasElement = await createShapeCanvasElement(element);
        } else if (element.type === "image") {
            canvasElement = await createImageCanvasElement(element);
        } else {
            throw new Error("Unknown element type: " + element.type);
        }

        applyListenersToCanvasElement(canvasElement);

        canvas?.add(canvasElement);
        canvasElements.push(canvasElement);
    };

    const applyListenersToCanvasElement = (canvasElement: FabricObject) => {
        canvasElement.on("moving", (e) =>
            handleCanvasElementEvent("moving", canvasElement, e)
        );
        canvasElement.on("modifying", (e) =>
            handleCanvasElementEvent("modifying", canvasElement, e)
        );
        canvasElement.on("scaling", (e) => {
            handleCanvasElementEvent("scaling", canvasElement, e);
        });
        canvasElement.on("rotating", (e) =>
            handleCanvasElementEvent("rotating", canvasElement, e)
        );
        canvasElement.on("changed", (e) => {
            handleCanvasElementEvent("changed", canvasElement, e);
        });
    };

    const convertScaleToResize = (canvasElement: FabricObject) => {
        if (canvasElement instanceof fabric.Circle) {
            const scaleX = canvasElement.scaleX || 1;
            const scaleY = canvasElement.scaleY || 1;
            const radiusX = canvasElement.getRadiusX() || 1;
            const radiusY = canvasElement.getRadiusY() || 1;

            const currentRadius = canvasElement.radius as number;
            const biggestRadius = Math.min(radiusX, radiusY);
            const radiusRatio = biggestRadius / currentRadius;

            canvasElement.set({
                radius: biggestRadius,
                scaleX: scaleX / radiusRatio,
                scaleY: scaleY / radiusRatio,
            });
        } else {
            canvasElement.set({
                height: canvasElement.getScaledHeight(),
                width: canvasElement.getScaledWidth(),
                scaleX: 1,
                scaleY: 1,
            });
        }
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
    const getCanvasChangeDebouncer = (eventType: string) => {
        if (!keyedCanvasChangeDebouncers[eventType]) {
            keyedCanvasChangeDebouncers[eventType] = debounce(
                (canvasElement: FabricObject) => {
                    if (eventType === "scaling") {
                        if (canvasElementIsShape(canvasElement)) {
                            convertScaleToResize(canvasElement);
                        }
                    }

                    if (typeof onChangeCanvasElement === "function") {
                        onChangeCanvasElement(canvasElement);
                    }
                },
                100
            );
        }

        return keyedCanvasChangeDebouncers[eventType];
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
        canvasElement: FabricObject,
        event: fabric.IEvent<MouseEvent>
    ) => {
        if (!canvasElement) {
            console.warn(
                "handleCanvasElementEvent(" +
                    eventType +
                    ") -> recevied no canvas element"
            );
            return;
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

    const clearSelection = () => {
        canvas?.discardActiveObject().renderAll();
    };

    const selectElementsByUUIDs = (uuids: string[]) => {
        setSelectedUUIDs(uuids);
        selectCanvasElementsByUUIDs(uuids);
    };

    const selectCanvasElementsByUUIDs = (uuids: string[]) => {
        const toSelect = (canvas?.getObjects() as FabricObject[]).filter(
            (obj) => {
                return uuids.includes(obj.uuid);
            }
        );

        canvas?.discardActiveObject();

        if (toSelect.length === 1) {
            canvas?.setActiveObject(toSelect[0]);
        } else if (toSelect.length > 0) {
            canvas?.setActiveObject(
                new fabric.ActiveSelection(toSelect, {
                    canvas: canvas as fabric.Canvas,
                })
            );
        }

        canvas?.requestRenderAll();
    };

    const getCanvas = () => canvas;
    const getCanvasElements = () => canvasElements;

    const findElementById = (id: string) => {
        return canvasElements.find(
            (element) => element.uuid === id
        ) as FabricObject;
    };

    const removeCanvasElementById = (id: string) => {
        canvas?.discardActiveObject();
        setSelectedUUIDs([]);

        const canvasElement = findElementById(id);
        canvas?.remove(canvasElement);
        canvasElements = canvasElements.filter((el) => el.uuid !== id);
        canvas?.requestRenderAll();

        if (typeof onRemoveCanvasElement === "function") {
            onRemoveCanvasElement(canvasElement);
        }
    };
    return {
        selectedUUIDs,
        editUUID,
        findElementById,
        setSelectedUUIDs,
        setEditUUID,
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
        clearSelection,
        selectElementsByUUIDs,
    };
}
