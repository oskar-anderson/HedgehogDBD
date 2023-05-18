import { Draw } from "./Draw";
import { DrawChar } from "./DrawChar";
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
}