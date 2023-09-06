import DomainTable from "../../model/domain/DomainTable";
import VmDraw from "../../model/viewModel/VmDraw";
import { ICommand } from "../ICommand";


export class CommandDeleteTable implements ICommand<CommandDeleteTableArgs> {
    context: VmDraw;
    args: CommandDeleteTableArgs;

    constructor(context: VmDraw, args: CommandDeleteTableArgs) {
        this.context = context;
        this.args = args;
    }

    getArgs() {
        return this.args;
    }

    redo() {
        this.context.schemaTables.splice(this.args.listIndex, 1);
        this.context.areTablesDirty = true;
    }

    undo() {
        let newTable = this.args.table.mapToVm();
        this.context.schemaTables.splice(this.args.listIndex, 0, newTable);
        this.context.areTablesDirty = true;
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