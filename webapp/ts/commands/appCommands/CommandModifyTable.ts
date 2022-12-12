import { Draw } from "../../model/Draw";
import { ICommand } from "../ICommand";
import { Table } from "../../model/Table";

export class CommandModifyTable implements ICommand<CommandModifyTableArgs> {
    context: Draw;
    args: CommandModifyTableArgs;

    constructor(context: Draw, args: CommandModifyTableArgs) {
        this.context = context;
        this.args = args;
    }

    getArgs() {
        return this.args;
    }

    redo() {
        let newTable = Table.initClone(JSON.parse(this.args.newTableJson));
        let oldTable = Table.initClone(JSON.parse(this.args.oldTableJson));
        let index = this.context.schema.tables.findIndex(x => x.equals(oldTable))!;
        this.context.schema.tables[index] = newTable;
    }

    undo()  {
        let newTable = Table.initClone(JSON.parse(this.args.newTableJson));
        let oldTable = Table.initClone(JSON.parse(this.args.oldTableJson));
        let index = this.context.schema.tables.findIndex(x => x.equals(newTable));
        this.context.schema.tables[index] = oldTable;
    }
}

export interface CommandModifyTableArgs {
    oldTableJson: string;
    newTableJson: string;
}