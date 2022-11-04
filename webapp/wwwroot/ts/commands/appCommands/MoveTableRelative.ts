import { Rectangle } from "pixi.js";
import { Draw } from "../../model/Draw";
import { ICommand } from "../ICommand";

export class MoveTableRelative implements ICommand {
    context: Draw;

    constructor(context: Draw) {
        this.context = context;
    }

    execute(args: any): Rectangle {
        if (! args.id || !args.x || !args.y) throw Error("Mandatory args not specified!")
        let table = this.context.tables.find(x => x.id === args.id)!;
        table.rect.x += args.x;
        table.rect.y += args.y;
        return table.rect;
    }

    undo(args: any): Rectangle  {
        args.x = -args.x;
        args.y = -args.y;
        return this.execute(args);
    }
}