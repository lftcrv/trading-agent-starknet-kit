export class ParadexOrderError extends Error {
    constructor(message: string, public details?: any) {
        super(message);
        this.name = "ParadexOrderError";
    }
}