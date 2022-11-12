import { Rectangle } from "pixi.js";
import { Table } from "./Table";
import { History } from "../commands/History";

export class Draw {
    history = new History();
    worldDrawArea: string[] = [];
    static fontCharSizeWidth = 7;
    static fontCharSizeHeight = 14;
    static zoomOut = 3;
    static zoomIn = 2;
    tables: Table[] = [];
    activeTool: string = "pan";
    
    constructor() {

    }

    init(tables: Table[]) {
        this.tables = tables;
    }

    getVisibleTables() {
        return this.tables.filter(x => !x.isHoverSource)
    }
}