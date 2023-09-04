import DomainTable from "../../model/domain/DomainTable";
import DomainDraw from "../../model/domain/DomainDraw";
import { ICommand } from "../ICommand";

export class CommandSetSchema implements ICommand<CommandSetSchemaArgs> {
    context: DomainDraw;
    args: CommandSetSchemaArgs;

    constructor(context: DomainDraw, args: CommandSetSchemaArgs) {
        this.context = context;
        this.args = args;
    }

    getArgs() {
        return this.args;
    }

    redo() {
        let newDraw = this.args.newDraw;
        this.context.tables = newDraw.tables;
    }

    undo() {
        let oldDraw = this.args.oldDraw;
        this.context.tables = oldDraw.tables;
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