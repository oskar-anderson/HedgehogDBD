import { Draw } from "./Draw";
import { DrawChar } from "./DrawChar";
import { TableDTO } from "./TableDTO";

export class SchemaDTO {

    worldDrawArea: DrawChar[] = [];
    tables: TableDTO[];
    worldCharWidth = 0;
    worldCharHeight = 0;

    constructor(tables: TableDTO[], worldDrawArea: DrawChar[], worldCharWidth: number, worldCharHeight: number) {
        this.tables = tables;
        this.worldDrawArea = worldDrawArea;
        this.worldCharWidth = worldCharWidth;
        this.worldCharHeight = worldCharHeight;
    }

    static init(draw: Draw) {
        return new SchemaDTO(
            draw.schema.tables.map(x => TableDTO.initFromTable(x)),
            draw.schema.worldDrawArea,
            draw.getWorldCharGrid().width,
            draw.getWorldCharGrid().height
        );
    }

    static initJsonDisplayable(draw: Draw) {
        return new SchemaDTO(
            draw.schema.tables.map(x => TableDTO.initFromTable(x)),
            [],  // draw.schema.worldDrawArea  // cannot be displayed
            draw.getWorldCharGrid().width,
            draw.getWorldCharGrid().height
        );
    }

}