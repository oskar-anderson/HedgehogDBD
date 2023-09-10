import VmDraw from "../model/viewModel/VmDraw";
import VmTable from "../model/viewModel/VmTable";

export interface ICommand<T extends IHydratable<T>> {
    context: {
        tables: VmTable[]
    };
    args: T;
    redo: (setTables: (tables: VmTable[]) => void) => void;
    undo: (setTables: (tables: VmTable[]) => void) => void;
}

export interface IHydratable<T> {
    hydrate(): T;
}