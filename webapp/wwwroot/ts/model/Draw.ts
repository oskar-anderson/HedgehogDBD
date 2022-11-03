import { Rectangle } from "pixi.js";
import { Table } from "./Table";
import { Transaction } from "./../Transaction";

export class Draw {
    transactions = new Transaction()
    worldDrawArea: string[] = [];
    fontCharSizeWidth = 14;
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