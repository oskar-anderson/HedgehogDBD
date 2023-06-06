import { Point, Rectangle } from "pixi.js";
import { Table } from "./Table";
import { History } from "../commands/History";
import { Schema } from "./Schema";
import { ITool } from "../tools/ITool";
import { MyRect } from "./MyRect";
import { SelectTableTool } from "../tools/SelectTableTool";
import DataType from "./DataTypes/DataType";
import Databases from "./DataTypes/Databases";

export class Draw {
    history = new History();
    // 1.555 scale font size increase
    static fontSizes_Consolas = [
        { size: 9, width: 4.95, height: 9 },  // Windows system font is width: 5.0
        { size: 14, width: 7.7, height: 14 },  // Windows system font is width: 8.0
        { size: 22, width: 12.1, height: 22 },
        { size: 34, width: 18.7, height: 34 },
    ];
    static fontSizes_Inconsolata = [
        { size: 9, width: 4.5, height: 9 },
        { size: 14, width: 7, height: 14 },
        { size: 22, width: 11, height: 22 },
        { size: 34, width: 17, height: 34 },
    ];
    canvasScrollPosition = new Point(0, 0);
    selectedFontSize: { size: number, width: number, height: number} = Draw.fontSizes_Inconsolata.find((x => x.size === 14))!;
    schema: Schema;
    activeTool: ITool;
    activeDatabase: Databases = new Databases();
    
    private world: MyRect;

    constructor(schema: Schema, world: MyRect) {
        this.schema = schema;
        this.activeTool = new SelectTableTool(this);
        this.world = world
    }

    getVisibleTables() {
        return this.schema.getTables();
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