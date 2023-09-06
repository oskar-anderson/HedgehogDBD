import VmDraw from "../model/viewModel/VmDraw";

export interface ICommand<T extends IHydratable<T>> {
    context: VmDraw;
    args: T;
    redo(): void; 
    undo(): void;
}

export interface IHydratable<T> {
    hydrate(): T;
}