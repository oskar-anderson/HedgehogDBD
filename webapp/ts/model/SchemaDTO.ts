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
}