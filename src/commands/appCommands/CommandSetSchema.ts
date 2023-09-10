import DomainDraw from "../../model/domain/DomainDraw"
import VmDraw from "../../model/viewModel/VmDraw"
import { ICommand } from "../ICommand";
import VmTable from "../../model/viewModel/VmTable";


export class CommandSetSchema implements ICommand<CommandSetSchemaArgs> {
    context: {
        tables: VmTable[]
    };
    args: CommandSetSchemaArgs;

    constructor(context: {
        tables: VmTable[]
    }, args: CommandSetSchemaArgs) {
        this.context = context;
        this.args = args;
    }

    getArgs() {
        return this.args;
    }

    redo(setTables: (tables: VmTable[]) => void) {
        setTables(this.args.newDraw.tables.map(x => x.mapToVm()));
    }

    undo(setTables: (tables: VmTable[]) => void) {
        setTables(this.args.oldDraw.tables.map(x => x.mapToVm()));
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