export default class HttpError extends Error {
    status: number;

    constructor(message, status = 400) {
        super(message);
        this.status = status;
    }
}
