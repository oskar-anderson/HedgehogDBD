import { Point, Rectangle } from "pixi.js";
import { Table } from "./Table";
import { History } from "../commands/History";
import { Schema } from "./Schema";
import { DrawChar } from "./DrawChar";
import { TableHoverPreview } from "./tableHoverPreview";

export class Draw {
    history = new History();
    worldDrawArea: DrawChar[] = [];
    static fontCharSizeWidth = 7;
    static fontCharSizeHeight = 14;
    static zoomOut = 3;
    static zoomIn = 2;
    selectedTable: Table | null = null
    tableBeingEdited: Table | null = null
    schema: Schema;
    mouseScreenPosition: Point = new Point(0, 0);
    isMouseLeftDown: boolean = false;
    hover: TableHoverPreview | null = null;
    activeTool: string = "pan";
    transferData: { viewportLeft: number, viewportTop: number, viewportScaleX: number, viewportScaleY: number } | null = null
    
    constructor(schema: Schema) {
        this.schema = schema;
    }

    getVisibleTables() {
        return this.schema.tables.filter(x => x.id !== this.hover?.hoverTableSource?.id)
    }
}