import ProxyModel from "../util/ProxyModel";

class Environment<T extends Record<string, string | number | boolean>> {
    data: T;

    constructor(initialData: T) {
        this.data = initialData;

        this.applyEnv();
    }

    applyEnv() {
        for (let key in this) {
            this.data = Object.entries(this.data).reduce(
                (acc, [key, value]) => {
                    if (process.env[key]) {
                        return {
                            ...acc,
                            [key]: process.env[key],
                        };
                    }

                    return acc;
                },
                this.data
            );
        }
    }
}

const singleton = new Environment({
    PORT: 80,
    MONGO_URL: "unknown",
    MONGO_DB: "unknown",
    CORS_ORIGIN: "blocked all",
});

const env = ProxyModel.create(singleton, (s) => s.data);

export { env, Environment };
