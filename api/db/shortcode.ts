import { ShortcodeDocument } from "../types/Story/Shortcode";

export function toShortcodeObject(shortcode: ShortcodeDocument) {
    const obj = { ...shortcode };

    const id = obj._id;
    delete obj._id;

    return {
        ...obj,
        id,
    };
}
