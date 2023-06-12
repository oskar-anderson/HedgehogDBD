import { Draw } from "../../model/Draw";
import { SchemaDTO } from "../../model/dto/SchemaDTO";
import { Schema } from "../../model/Schema";
import { ICommand } from "../ICommand";

export class CommandSetSchema implements ICommand<CommandSetSchemaArgs> {
    context: Draw;
    args: CommandSetSchemaArgs;

    constructor(context: Draw, args: CommandSetSchemaArgs) {
        this.context = context;
        this.args = args;
    }

    getArgs() {
        return this.args;
    }

    redo() {
        let newSchema = this.args.newSchema;
        this.context.schema = new Schema(newSchema.tables.map(x => x.mapToTable()), this.context.onTablesChangeCallback);
    }

    undo() {
        let oldSchema = this.args.oldSchema;
        this.context.schema = new Schema(oldSchema.tables.map(x => x.mapToTable()), this.context.onTablesChangeCallback);
    }
}

export class CommandSetSchemaArgs {
    oldSchema: SchemaDTO;
    newSchema: SchemaDTO;


    constructor(oldSchema: SchemaDTO, newSchema: SchemaDTO) {
        this.oldSchema = oldSchema;
        this.newSchema = newSchema;
    }


    hydrate() {
        this.oldSchema = SchemaDTO.hydrate(this.oldSchema)
        this.newSchema = SchemaDTO.hydrate(this.newSchema)
        return this;
    }
}