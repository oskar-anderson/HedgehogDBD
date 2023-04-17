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
        { size: 7, width: 3, height: 6 },
        { size: 8, width: 4, height: 8 },
        { size: 9, width: 4, height: 9 },
        { size: 10, width: 5, height: 10 },
        { size: 11, width: 5, height: 11 },
        { size: 12, width: 6, height: 12 },
        { size: 14, width: 7, height: 14 },
        { size: 16, width: 8, height: 16 },
        { size: 18, width: 9, height: 18 },
        { size: 20, width: 10, height: 20 },
        { size: 22, width: 11, height: 22 },
        { size: 24, width: 12, height: 24 },
    ];
    selectedFontSize: { size: number, width: number, height: number} = Draw.fontSizes.find((x => x.size === 14))!;
    selectedTable: Table | null = null
    schema: Schema;
    mouseScreenPosition: Point = new Point(0, 0);
    hover: Table | null = null;
    activeTool: ITool;
    
    private world: MyRect;
    private screenPosition: Point;

    constructor(schema: Schema, world: MyRect, screenPosition: Point) {
        this.schema = schema;
        this.activeTool = new SelectTableTool(this);
        this.world = world
        this.screenPosition = screenPosition
    }

    getVisibleTables() {
        let visibleTables = this.schema.tables.filter(x => x.visible);
        if (this.hover !== null) {
            visibleTables.push(this.hover);
        }
        return visibleTables;
    }

    getScreenToWorldPoint(x: number, y: number) {
        return new Point(
            Math.floor(this.screenPosition.x + x),
            Math.floor(this.screenPosition.y + y)
        )
    }

    getScreenToWorldPoint2(point: Point) {
        return this.getScreenToWorldPoint(point.x, point.y);
    }
    
    getScreenToCharGridPoint(x: number, y: number): Point {
        let world = this.getScreenToWorldPoint(x, y);
        return this.getWorldToCharGridPoint2(world);
    }

    getScreenToCharGridPoint2(point: Point) {
        return this.getScreenToCharGridPoint(point.x, point.y);
    }

    setScreen(screen: Point) {
        this.screenPosition = new Point(
            Math.floor(screen.x), // positive number
            Math.floor(screen.y)  // positive number
        );
    }

    setWorld(world: MyRect) {
        this.world = new MyRect(world.x, world.y, world.width, world.height)
    }
    
    getScreenPosition() {
        return this.screenPosition;
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