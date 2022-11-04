import { Rectangle } from "pixi.js";
import { Draw } from "../../model/Draw";
import { ICommandRegister } from "../ICommandRegister";

@ICommandRegister.register
export class MoveTableTest {
    context: Draw;

    constructor(context: Draw) {
        this.context = context;
    }

    execute(transaction: any): Rectangle {
        if (! transaction.args.id || !transaction.args.x || !transaction.args.y) throw Error("Mandatory args not specified!")
        let table = this.context.tables.find(x => x.id === transaction.args.id)!;
        table.rect.x += transaction.args.x;
        table.rect.y += transaction.args.y;
        return table.rect;
    }

    undo(transaction: any): Rectangle  {
        transaction.args.x = -transaction.args.x;
        transaction.args.y = -transaction.args.y;
        return this.execute(transaction);
    }
}