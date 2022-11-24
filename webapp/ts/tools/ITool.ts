export interface ITool {
    init(): void;
    update(): void;
    exit(): void;
    getIsDirty(): boolean
}