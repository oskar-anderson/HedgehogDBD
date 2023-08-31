import { Draw } from "../model/Draw";

export interface ICommand<T extends IHydratable<T>> {
    context: Draw;
    args: T;
    redo(): void; 
    undo(): void;
}

export interface IHydratable<T> {
    hydrate(): T;
}