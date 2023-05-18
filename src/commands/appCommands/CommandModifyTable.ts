import { Draw } from "../../model/Draw";
import { ICommand } from "../ICommand";
import { Table } from "../../model/Table";
import { TableDTO } from "../../model/dto/TableDTO";

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
        let newTable = this.args.newTable.mapToTable();
        let index = this.context.schema.tables.findIndex(x => x.id == this.args.oldTable.id);
        this.context.schema.tables[index] = newTable;
    }

    undo() {
        let oldTable = this.args.oldTable.mapToTable();
        let index = this.context.schema.tables.findIndex(x => x.id == this.args.newTable.id);
        this.context.schema.tables[index] = oldTable;
    }
}

export class CommandModifyTableArgs {
    oldTable: TableDTO;
    newTable: TableDTO;

    constructor(oldTable: TableDTO, newTable: TableDTO) {
        this.oldTable = oldTable;
        this.newTable = newTable;
    }


    hydrate() {
        this.oldTable = TableDTO.hydrate(this.oldTable)
        this.newTable = TableDTO.hydrate(this.newTable)
        return this;
    }
}