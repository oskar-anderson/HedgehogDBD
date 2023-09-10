import DomainTable from "../../model/domain/DomainTable";
import VmDraw from "../../model/viewModel/VmDraw";
import VmTable from "../../model/viewModel/VmTable";
import { ICommand } from "../ICommand";

export class CommandModifyTable implements ICommand<CommandModifyTableArgs> {
    context: {
        tables: VmTable[]
    };
    args: CommandModifyTableArgs;

    constructor(context: {
        tables: VmTable[]
    }, args: CommandModifyTableArgs) {
        this.context = context;
        this.args = args;
    }

    getArgs() {
        return this.args;
    }

    redo(setTables: (tables: VmTable[]) => void) {
        let newTable = this.args.newTable.mapToVm();
        setTables(this.context.tables
            .map(table => table.id === this.args.oldTable.id ? 
                newTable
                : table
            )
        )
    }

    undo(setTables: (tables: VmTable[]) => void) {
        let oldTable = this.args.oldTable.mapToVm();
        setTables(this.context.tables
            .map(table => table.id === this.args.oldTable.id ? 
                oldTable
                : table
            )
        )
    }
}

export class CommandModifyTableArgs {
    oldTable: DomainTable;
    newTable: DomainTable;

    constructor(oldTable: DomainTable, newTable: DomainTable) {
        this.oldTable = oldTable;
        this.newTable = newTable;
    }


    hydrate() {
        this.oldTable = DomainTable.hydrate(this.oldTable)
        this.newTable = DomainTable.hydrate(this.newTable)
        return this;
    }
}