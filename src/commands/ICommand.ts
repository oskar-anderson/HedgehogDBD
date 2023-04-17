import { Draw } from "../model/Draw";

export interface ICommand<T> {
    context: Draw;
    args: T;
    redo(): void; 
    undo(): void
}