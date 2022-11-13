import { Draw } from "../../model/Draw";
import { ICommand } from "../ICommand";
import { History } from "../History";

export class CommandMoveTableRelative implements ICommand<CommandMoveTableRelativeArgs> {
    context: Draw;
    args: CommandMoveTableRelativeArgs;

    constructor(context: Draw, args: CommandMoveTableRelativeArgs) {
        this.context = context;
        this.args = args;
    }

    getArgs() {
        return this.args;
    }

    redo() {
        if (! CommandMoveTableRelativeArgs.isObjectCompatible(this.args)) { throw Error("Unexpected args"); };
        let table = this.context.schema.tables.find(x => x.id === this.args.id)!;
        table.rect.x += this.args.x;
        table.rect.y += this.args.y;
    }

    undo()  {
        if (! CommandMoveTableRelativeArgs.isObjectCompatible(this.args)) { throw Error("Unexpected args"); };
        let table = this.context.schema.tables.find(x => x.id === this.args.id)!;
        table.rect.x -= this.args.x;
        table.rect.y -= this.args.y;
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

    static isObjectCompatible(args: any) {
        return  JSON.stringify(Object.keys(args).sort()) === 
                JSON.stringify(Object.getOwnPropertyNames(new CommandMoveTableRelativeArgs("", 0, 0)).sort())
    }
}