

export interface ITool {
    init(): void;
    exit(): void;
    isDirty: boolean;
    mouseEventHandler(event: MouseEvent): void
}