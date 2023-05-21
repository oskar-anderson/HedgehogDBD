import { Point, Rectangle } from "pixi.js";
import { Table } from "./Table";
import { History } from "../commands/History";
import { Schema } from "./Schema";
import { ITool } from "../tools/ITool";
import { MyRect } from "./MyRect";
import { SelectTableTool } from "../tools/SelectTableTool";

export class Draw {
    history = new History();
    // 1.555 scale font size increase
    static fontSizes = [
        // { size: 7, width: 4, height: 6 }, // does not work vertically
        // { size: 8, width: 4, height: 8 }, // does not work vertically
        { size: 9, width: 5, height: 9 },
        // { size: 10, width: 5, height: 10 },  // does not work vertically
        // { size: 11, width: 6, height: 11 }, // does not work vertically
        // { size: 12, width: 7, height: 12 }, // does not work vertically
        { size: 14, width: 8, height: 14 },
        // { size: 16, width: 8.8, height: 16 }, // does not work vertically
        // { size: 18, width: 9.9, height: 18 },
        // { size: 20, width: 11, height: 20 }, // does not work vertically
        { size: 22, width: 12.1, height: 22 },
        // { size: 24, width: 13.2, height: 24 }, // 24 has a problem rendering "-" char slightly lower than "+"
        // { size: 26, width: 14.3, height: 26 },
        // { size: 28, width: 15.4, height: 28 }, // does not work vertically
        // { size: 34, width: 18.7, height: 34 }, // WTF! does not work vertically
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