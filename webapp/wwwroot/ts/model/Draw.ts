import { Rectangle } from "pixi.js";
import { Table } from "./Table";
import { History } from "../commands/History";
import { Schema } from "./Schema";
import { DrawChar } from "./DrawChar";

export class Draw {
    history = new History();
    worldDrawArea: DrawChar[] = [];
    static fontCharSizeWidth = 7;
    static fontCharSizeHeight = 14;
    static zoomOut = 3;
    static zoomIn = 2;
    selectedTable: Table | null = null
    schema: Schema;
    activeTool: string = "pan";
    
    constructor(schema: Schema) {
        this.schema = schema;
    }

    getVisibleTables() {
        return this.schema.tables.filter(x => !x.isHoverSource)
    }
}