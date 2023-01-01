import { Point, Rectangle } from "pixi.js";
import { Table } from "./Table";
import { History } from "../commands/History";
import { Schema } from "./Schema";
import { ITool } from "../tools/ITool";
import { Viewport } from "pixi-viewport";
import { MyRect } from "../MyRect";

export class Draw {
    history = new History();
    static fontCharSizeWidth = 7;
    static fontCharSizeHeight = 14;
    currentZoomScale = 1;
    selectedTable: Table | null = null
    schema: Schema;

    mouseScreenPosition: Point = new Point(0, 0);
    mouseScreenPositionNext: Point = new Point(0, 0);
    isMouseLeftDown: boolean = false;

    hover: Table | null = null;
    activeTool: ITool | null = null;
    viewportDTO: { viewportLeft: number, viewportTop: number, viewportScale: number, } | null = null
    
    private world = new Rectangle();  // call setViewport before using
    private screen = new Rectangle();  // call setViewport before using
    private screenScale = 1;

    constructor(schema: Schema) {
        this.schema = schema;
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
            Math.floor(this.screen.x + x / this.screenScale),
            Math.floor(this.screen.y + y / this.screenScale)
        )
    }

    getScreenToWorldPoint2(point: Point) {
        return this.getScreenToWorldPoint(point.x, point.y);
    }
    
    getScreenToCharGridPoint(x: number, y: number) {
        let world = this.getScreenToWorldPoint(x, y);
        return new Point( 
            Math.floor(world.x / Draw.fontCharSizeWidth),
            Math.floor(world.y / Draw.fontCharSizeHeight)
        );
    }

    getScreenToCharGridPoint2(point: Point) {
        return this.getScreenToCharGridPoint(point.x, point.y);
    }
    
    setViewport(viewport: Viewport) {
        this.world = new MyRect(0, 0, viewport.worldWidth, viewport.worldHeight)
        this.screen = new MyRect(
            Math.floor(viewport.left), // positive number
            Math.floor(viewport.top), // positive number
            viewport.screenWidth / viewport.scale.x,
            viewport.screenHeight / viewport.scale.y
        );
        this.screenScale = viewport.scale.x;

    }

    setScale(viewport: Viewport, scale: number) {
        viewport.scale.set(scale);
        this.currentZoomScale = scale;
        this.setViewport(viewport);
    }

    getScale() {
        return this.screenScale;
    }
    
    getScreen() {
        return this.screen;
    }

    getWorld() {
        return this.world;
    }

    getWorldCharGrid() {
        let worldSize = this.getWorld();
        return new MyRect(
            0,
            0,
            Math.ceil(worldSize.width / Draw.fontCharSizeWidth),
            Math.ceil(worldSize.height / Draw.fontCharSizeHeight), 
        );
    }
}