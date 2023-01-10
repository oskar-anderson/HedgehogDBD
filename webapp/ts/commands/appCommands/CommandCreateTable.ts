import { Draw } from "../../model/Draw";
import { ICommand } from "../ICommand";
import { Table } from "../../model/Table";

export class CommandCreateTable implements ICommand<CommandCreateTableArgs> {
    context: Draw;
    args: CommandCreateTableArgs;

    constructor(context: Draw, args: CommandCreateTableArgs) {
        this.context = context;
        this.args = args;
    }

    getArgs() {
        return this.args;
    }

    redo() {
        let newTable = Table.initClone(JSON.parse(this.args.tableJson));
        this.context.schema.tables.push(newTable);
    }

    undo() {
        this.context.schema.tables.pop();
    }
}

export interface CommandCreateTableArgs {
    tableJson: string;
}