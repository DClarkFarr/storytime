import fs from "fs";

export const beforeSaveToDirectory = (path: string) => {
    const segs = path.split("/");

    if (path.match(/\.\w{2,5}$/)) {
        segs.pop();
    }

    let base = segs.shift();
    for (let i = 0; i < segs.length; i++) {
        base += "/" + segs[i];

        if (!fs.existsSync(base)) {
            fs.mkdirSync(base, { recursive: true });
        }
    }
};
