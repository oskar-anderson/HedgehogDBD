import { Point, Rectangle } from "pixi.js";
import { Table } from "./Table";
import { History } from "../commands/History";
import { Schema } from "./Schema";
import { ITool } from "../tools/ITool";
import { MyRect } from "./MyRect";
import { SelectTableTool } from "../tools/SelectTableTool";

export class Draw {
    history = new History();
    static fontSizes = [
        { size: 7, width: 4, height: 6 },
        { size: 8, width: 4, height: 8 },
        { size: 9, width: 5, height: 9 },
        { size: 10, width: 5, height: 10 },
        { size: 11, width: 6, height: 11 },
        { size: 12, width: 7, height: 12 },
        { size: 14, width: 8, height: 14 },
        { size: 16, width: 8.8, height: 16 },
        { size: 18, width: 9.9, height: 18 },
        { size: 20, width: 11, height: 20 },
        { size: 22, width: 12.1, height: 22 },
        { size: 24, width: 13.2, height: 24 },
    ];
    selectedFontSize: { size: number, width: number, height: number} = Draw.fontSizes.find((x => x.size === 14))!;
    schema: Schema;
    activeTool: ITool;
    
    private world: MyRect;

    constructor(schema: Schema, world: MyRect) {
        this.schema = schema;
        this.activeTool = new SelectTableTool(this);
        this.world = world
    }

    getVisibleTables() {
        return this.schema.tables;
    }

    setWorld(world: MyRect) {
        this.world = new MyRect(world.x, world.y, world.width, world.height)
    }

    getWorld() {
        return this.world;
    }

    getWorldToCharGridPoint(x: number, y: number): Point {
        return this.getWorldToCharGridPoint2(new Point(x, y))
    }

    getWorldToCharGridPoint2(worldPoint: Point): Point {
        return new Point( 
            Math.floor(worldPoint.x / this.selectedFontSize.width),
            Math.floor(worldPoint.y / this.selectedFontSize.height)
        );
    }

    getWorldCharGrid() {
        let worldSize = this.getWorld();
        return new MyRect(
            0,
            0,
            Math.ceil(worldSize.width / this.selectedFontSize.width),
            Math.ceil(worldSize.height / this.selectedFontSize.height), 
        );
    }
}