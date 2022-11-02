import { Rectangle } from "pixi.js";
import { Table } from "./Table";

export class Draw {

    worldDrawArea: string[] = [];
    fontCharSizeWidth = 14;
    fontCharSizeHeight = 14;
    zoomOut = 3;
    zoomIn = 2;
    tables: Table[] = [];
    screenContainerSize: Rectangle = new Rectangle()
    activeTool: string = "pan";
    
    constructor(draw: Draw) {
        this.tables = draw.tables;
    }


}