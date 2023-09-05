import DomainDraw from "../../model/domain/DomainDraw"
import VmDraw from "../../model/viewModel/VmDraw"
import { ICommand } from "../ICommand";

export class CommandSetSchema implements ICommand<CommandSetSchemaArgs> {
    context: VmDraw;
    args: CommandSetSchemaArgs;

    constructor(context: VmDraw, args: CommandSetSchemaArgs) {
        this.context = context;
        this.args = args;
    }

    getArgs() {
        return this.args;
    }

    redo() {
        let newDraw = this.args.newDraw;
        this.context.schemaTables = newDraw.tables.map(x => x.mapToVm());
        this.context.schemaRelations = this.context.schemaTables.flatMap(table => table.getRelations(this.context.schemaTables));
        this.context.schemaRelations.forEach(x => x.isDirty = true);
        this.context.schemaTables.forEach(x => x.isDirty = true);
        this.context.isDirty = true;
    }

    undo() {
        let oldDraw = this.args.oldDraw;
        this.context.schemaTables = oldDraw.tables.map(x => x.mapToVm());
        this.context.schemaRelations = this.context.schemaTables.flatMap(table => table.getRelations(this.context.schemaTables));
        this.context.schemaRelations.forEach(x => x.isDirty = true);
        this.context.schemaTables.forEach(x => x.isDirty = true);
        this.context.isDirty = true;
    }
}

export class CommandSetSchemaArgs {
    oldDraw: DomainDraw;
    newDraw: DomainDraw;


    constructor(oldDraw: DomainDraw, newDraw: DomainDraw) {
        this.oldDraw = oldDraw;
        this.newDraw = newDraw;
    }


    hydrate() {
        this.oldDraw = DomainDraw.hydrate(this.oldDraw)
        this.newDraw = DomainDraw.hydrate(this.newDraw)
        return this;
    }
}