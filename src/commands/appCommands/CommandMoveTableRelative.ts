import { Point } from "pixi.js";
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
        let table = this.context.schema.getTables().find(x => x.id === this.args.id)!;
        table.setPosition(new Point(table.getPosition().x + this.args.x, table.getPosition().y + this.args.y), this.context.selectedFontSize)
        this.context.schema.getTables().forEach(x => x.updateRelations(this.context.schema.getTables()));
    }

    undo() {
        let table = this.context.schema.getTables().find(x => x.id === this.args.id)!;
        table.setPosition(new Point(table.getPosition().x - this.args.x, table.getPosition().y - this.args.y), this.context.selectedFontSize)
        this.context.schema.getTables().forEach(x => x.updateRelations(this.context.schema.getTables()));
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