import { Draw } from "../../model/Draw";
import { ICommand } from "../ICommand";
import { Table } from "../../model/Table";

export class CommandDeleteTable implements ICommand<CommandDeleteTableArgs> {
    context: Draw;
    args: CommandDeleteTableArgs;

    constructor(context: Draw, args: CommandDeleteTableArgs) {
        this.context = context;
        this.args = args;
    }

    getArgs() {
        return this.args;
    }

    redo() {
        this.context.schema.tables.splice(this.args.listIndex, 1);
    }

    undo()  {
        let newTable = Table.initClone(JSON.parse(this.args.tableJson));
        this.context.schema.tables.splice(this.args.listIndex, 0, newTable);
    }
}

export interface CommandDeleteTableArgs {
    tableJson: string;
    listIndex: number;
}