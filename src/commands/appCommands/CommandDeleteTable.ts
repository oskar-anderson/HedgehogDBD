import DomainTable from "../../model/domain/DomainTable";
import VmDraw from "../../model/viewModel/VmDraw";
import VmTable from "../../model/viewModel/VmTable";
import { ICommand } from "../ICommand";


export class CommandDeleteTable implements ICommand<CommandDeleteTableArgs> {
    context: {
        tables: VmTable[]
    };
    args: CommandDeleteTableArgs;

    constructor(context: {
        tables: VmTable[]
    }, args: CommandDeleteTableArgs) {
        this.context = context;
        this.args = args;
    }

    getArgs() {
        return this.args;
    }

    redo(setTables: (tables: VmTable[]) => void) {
        setTables(this.context.tables.filter((_, i) => i !== this.args.listIndex));
    }

    undo(setTables: (tables: VmTable[]) => void) {
        let newTable = this.args.table.mapToVm();
        setTables(
            [
                ...this.context.tables.slice(0, this.args.listIndex),
                newTable,
                ...this.context.tables.slice(this.args.listIndex)
            ]
        );
    }
}

export class CommandDeleteTableArgs {
    table: DomainTable;
    listIndex: number;

    constructor(table: DomainTable, listIndex: number) {
        this.table = table;
        this.listIndex = listIndex;
    }


    hydrate() {
        this.table = DomainTable.hydrate(this.table)
        return this;
    }
}