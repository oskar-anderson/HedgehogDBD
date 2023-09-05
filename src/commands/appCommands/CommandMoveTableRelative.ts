import DomainDraw from "../../model/domain/DomainDraw";
import VmDraw from "../../model/viewModel/VmDraw"
import { ICommand, IHydratable } from "../ICommand";
import Point from "../../model/Point"

export default class CommandMoveTableRelative implements ICommand<CommandMoveTableRelativeArgs> {
    context: VmDraw;
    args: CommandMoveTableRelativeArgs;

    constructor(context: VmDraw, args: CommandMoveTableRelativeArgs) {
        this.context = context;
        this.args = args;
    }

    redo() {
        let table = this.context.schemaTables.find(x => x.id === this.args.id)!;
        table.position = { 
            x: table.position.x + this.args.x, 
            y: table.position.y + this.args.y
        };
        table.isDirty = true;
    }

    undo() {
        let table = this.context.schemaTables.find(x => x.id === this.args.id)!;
        table.position = {
            x: table.position.x - this.args.x, 
            y: table.position.y - this.args.y
        };
        table.isDirty = true;
    }
}

export class CommandMoveTableRelativeArgs implements IHydratable<CommandMoveTableRelativeArgs> {
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