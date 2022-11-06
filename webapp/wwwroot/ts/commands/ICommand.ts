export interface ICommand<T> {
    getArgs(): any
    redo(): void
    undo(): void
}