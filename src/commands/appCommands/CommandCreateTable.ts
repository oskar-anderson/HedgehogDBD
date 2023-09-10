import VmDraw from "../../model/viewModel/VmDraw";
import { ICommand } from "../ICommand";
import DomainTable from "../../model/domain/DomainTable";
import VmTable from "../../model/viewModel/VmTable";

export class CommandCreateTable implements ICommand<CommandCreateTableArgs> {
    context: {
        tables: VmTable[]
    };
    args: CommandCreateTableArgs;

    constructor(context: {
        tables: VmTable[]
    }, args: CommandCreateTableArgs) {
        this.context = context;
        this.args = args;
    }

    getArgs() {
        return this.args;
    }

    redo(setTables: (tables: VmTable[]) => void) {
        let newTable = this.args.table.mapToVm();
        setTables([...this.context.tables, newTable])
    }

    undo(setTables: (tables: VmTable[]) => void) {
        setTables(this.context.tables
            .filter(x => x.id !== this.args.table.id));
    }
}

export class CommandCreateTableArgs {
    table: DomainTable;

    constructor(table: DomainTable) {
        this.table = table;
    }


    hydrate() {
        this.table = DomainTable.hydrate(this.table)
        return this;
    }
}