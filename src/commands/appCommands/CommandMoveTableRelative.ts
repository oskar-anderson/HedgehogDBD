import DomainDraw from "../../model/domain/DomainDraw";
import VmDraw from "../../model/viewModel/VmDraw"
import { ICommand, IHydratable } from "../ICommand";
import Point from "../../model/Point"
import VmTable from "../../model/viewModel/VmTable";

export default class CommandMoveTableRelative implements ICommand<CommandMoveTableRelativeArgs> {
    context: {
        tables: VmTable[]
    };
    args: CommandMoveTableRelativeArgs;

    constructor(context: {
        tables: VmTable[]
    }, args: CommandMoveTableRelativeArgs) {
        this.context = context;
        this.args = args;
    }

    redo(setTables: (tables: VmTable[]) => void) {
        let table = this.context.tables.find(x => x.id === this.args.id)!;
        table.position = { 
            x: table.position.x + this.args.x, 
            y: table.position.y + this.args.y
        };
        setTables([...this.context.tables]);
    }

    undo(setTables: (tables: VmTable[]) => void) {
        let table = this.context.tables.find(x => x.id === this.args.id)!;
        table.position = {
            x: table.position.x - this.args.x, 
            y: table.position.y - this.args.y
        };
        setTables([...this.context.tables]);
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