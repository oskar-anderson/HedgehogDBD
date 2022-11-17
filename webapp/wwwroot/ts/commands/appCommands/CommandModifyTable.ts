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
        let index = this.context.schema.tables.findIndex(x => x.id === oldTable.id)!;
        this.context.schema.tables[index] = newTable;
    }

    undo()  {
        let newTable = Table.initClone(JSON.parse(this.args.newTableJson));
        let oldTable = Table.initClone(JSON.parse(this.args.oldTableJson));
        let index = this.context.schema.tables.findIndex(x => x.id === newTable.id)!;
        this.context.schema.tables[index] = oldTable;
    }
}

export class CommandModifyTableArgs {
    oldTableJson: string;
    newTableJson: string;

    constructor(oldTableJson: Table, newTableJson: Table) {
        this.oldTableJson = JSON.stringify(oldTableJson);
        this.newTableJson = JSON.stringify(newTableJson);
    }
}