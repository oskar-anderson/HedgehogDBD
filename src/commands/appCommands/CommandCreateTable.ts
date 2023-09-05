import VmDraw from "../../model/viewModel/VmDraw";
import { ICommand } from "../ICommand";
import DomainTable from "../../model/domain/DomainTable";

export class CommandCreateTable implements ICommand<CommandCreateTableArgs> {
    context: VmDraw;
    args: CommandCreateTableArgs;

    constructor(context: VmDraw, args: CommandCreateTableArgs) {
        this.context = context;
        this.args = args;
    }

    getArgs() {
        return this.args;
    }

    redo() {
        let newTable = this.args.table.mapToVm();
        this.context.schemaTables.push(newTable);
        this.context.areTablesDirty = true;
    }

    undo() {
        this.context.schemaTables = this.context.schemaTables
            .filter(x => x.id !== this.args.table.id);
        this.context.areTablesDirty = true;
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