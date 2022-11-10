import { Rectangle } from "pixi.js";
import { Table } from "./Table";
import { History } from "../commands/History";

export class Draw {
    history = new History();
    worldDrawArea: string[] = [];
    fontCharSizeWidth = 7;
    fontCharSizeHeight = 14;
    zoomOut = 3;
    zoomIn = 2;
    tables: Table[] = [];
    screenContainerSize: Rectangle = new Rectangle()
    activeTool: string = "pan";
    
    constructor() {

    }

    init(tables: Table[], screenContainerSize: Rectangle) {
        this.tables = tables;
        this.screenContainerSize = screenContainerSize;
    }

    getVisibleTables() {
        return this.tables.filter(x => !x.isHoverSource)
    }
}