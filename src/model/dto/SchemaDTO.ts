import { Draw } from "../Draw";
import { Schema } from "../Schema";
import { Table } from "../Table";
import { TableDTO } from "./TableDTO";

export class SchemaDTO {

    tables: TableDTO[];

    constructor(tables: TableDTO[]) {
        this.tables = tables;
    }

    static init(draw: Draw) {
        return new SchemaDTO(
            draw.schema.tables.map(x => TableDTO.initFromTable(x)),
        );
    }

    static initJsonDisplayable(draw: Draw) {
        return new SchemaDTO(
            draw.schema.tables.map(x => TableDTO.initFromTable(x)),
        );
    }

    getJson() {
        return JSON.stringify(this, null, 4);
    }

    static parse(content: string) {
        return SchemaDTO.hydrate(JSON.parse(content) as SchemaDTO);
    }

    static hydrate(jsonObject: SchemaDTO) {
        return new SchemaDTO(
            jsonObject.tables.map(x => TableDTO.hydrate(x))
        );
    }

    mapToSchema() {
        return new Schema(
            this.tables.map(x => x.mapToTable())
        );
    }
}