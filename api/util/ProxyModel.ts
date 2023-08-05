const hasKey = <T extends object>(obj: T, k: keyof any): k is keyof T =>
    k in obj;

class ProxyModel<T extends object, M extends object> {
    model: M;
    proxy: M & T;

    constructor(model, getter: (model: M) => T) {
        this.model = model;

        this.proxy = new Proxy(this.model, {
            get: (target, key) => {
                if (hasKey(target, key)) {
                    return target[key];
                }

                if (hasKey(getter(this.model), key)) {
                    return getter(this.model)[key];
                }

                return undefined;
            },
        }) as M & T;
    }

    static create<T extends object, M extends object>(
        model: M,
        getter: (model: M) => T
    ) {
        return new ProxyModel(model, getter).proxy;
    }
}

export default ProxyModel;
