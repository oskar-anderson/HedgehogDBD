import { Draw } from "../../model/Draw";
import { ICommand } from "../ICommand";
import { Table } from "../../model/Table";
import { TableDTO } from "../../model/dto/TableDTO";

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
        let newTable = this.args.table.mapToTable();
        this.context.schema.pushAndUpdate(newTable);
        this.context.schema.tables.forEach(x => x.updateRelations(this.context.schema.tables));
    }

    undo() {
        this.context.schema.popAndUpdate();
        this.context.schema.tables.forEach(x => x.updateRelations(this.context.schema.tables));
    }
}

export class CommandCreateTableArgs {
    table: TableDTO;

    constructor(table: TableDTO) {
        this.table = table;
    }


    hydrate() {
        this.table = TableDTO.hydrate(this.table)
        return this;
    }
}