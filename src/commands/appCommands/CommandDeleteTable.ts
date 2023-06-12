import { Draw } from "../../model/Draw";
import { ICommand } from "../ICommand";
import { Table } from "../../model/Table";
import { TableDTO } from "../../model/dto/TableDTO";

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
        this.context.schemaRemoveAtAndUpdate(this.args.listIndex);
    }

    undo() {
        let newTable = this.args.table.mapToTable();
        this.context.schemaInsertAtAndUpdate(this.args.listIndex, newTable);
    }
}

export class CommandDeleteTableArgs {
    table: TableDTO;
    listIndex: number;

    constructor(table: TableDTO, listIndex: number) {
        this.table = table;
        this.listIndex = listIndex;
    }


    hydrate() {
        this.table = TableDTO.hydrate(this.table)
        return this;
    }
}