import { Draw } from "../../model/Draw";
import { ICommand } from "../ICommand";

export class CommandMoveTableRelative implements ICommand<CommandMoveTableRelativeArgs> {
    context: Draw;
    args: CommandMoveTableRelativeArgs;

    constructor(context: Draw, args: CommandMoveTableRelativeArgs) {
        this.context = context;
        this.args = args;
    }

    redo() {
        let table = this.context.schema.tables.find(x => x.id === this.args.id)!;
        table.position.x += this.args.x;
        table.position.y += this.args.y;
    }

    undo() {
        let table = this.context.schema.tables.find(x => x.id === this.args.id)!;
        table.position.x -= this.args.x;
        table.position.y -= this.args.y;
    }
}

export class CommandMoveTableRelativeArgs {
    id: string;
    x: number;
    y: number;

    constructor(id: string, x: number, y: number) {
        this.id = id;
        this.x = x;
        this.y = y;
    }


    hydrate() {
        return this;
    } 
}