import DomainTable from "../../model/domain/DomainTable";
import VmDraw from "../../model/viewModel/VmDraw";
import { ICommand } from "../ICommand";

export class CommandModifyTable implements ICommand<CommandModifyTableArgs> {
    context: VmDraw;
    args: CommandModifyTableArgs;

    constructor(context: VmDraw, args: CommandModifyTableArgs) {
        this.context = context;
        this.args = args;
    }

    getArgs() {
        return this.args;
    }

    redo() {
        let newTable = this.args.newTable.mapToVm();
        let index = this.context.schemaTables.findIndex(x => x.id == this.args.newTable.id);
        this.context.schemaTables[index] = newTable;
        this.context.areTablesDirty = true;
    }

    undo() {
        let oldTable = this.args.oldTable.mapToVm();
        let index = this.context.schemaTables.findIndex(x => x.id == this.args.newTable.id);
        this.context.schemaTables[index] = oldTable;
        this.context.areTablesDirty = true;
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