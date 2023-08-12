import { PointDocument } from "../types/Story/Point";

export function toPointObject(point: PointDocument) {
    const id = point._id.toString();
    const obj = { ...point, id };
    delete obj._id;

    return obj;
}
