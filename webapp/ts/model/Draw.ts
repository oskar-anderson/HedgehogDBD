import { Point, Rectangle } from "pixi.js";
import { Table } from "./Table";
import { History } from "../commands/History";
import { Schema } from "./Schema";
import { DrawChar } from "./DrawChar";
import { ITool } from "../tools/ITool";
import { PanTool } from "../tools/PanTool";
import { Manager } from "../Manager";
import { Viewport } from "pixi-viewport";

export class Draw {
    history = new History();
    worldDrawArea: DrawChar[] = [];
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

    getMouseWorldPosition() {
        return new Point(
            Math.floor(this.screen.x + this.mouseScreenPosition.x / this.screenScale),
            Math.floor(this.screen.y + this.mouseScreenPosition.y / this.screenScale)
        )
    }

    getMouseCharGridPosition() {
        let worldPos = this.getMouseWorldPosition();
        return new Point(
            Math.floor(worldPos.x / Draw.fontCharSizeWidth),
            Math.floor(worldPos.y / Draw.fontCharSizeHeight)
        )
    }

    
    setViewport(viewport: Viewport) {
        this.world = new Rectangle(0, 0, viewport.worldWidth, viewport.worldHeight)
        this.screen = new Rectangle(
            Math.floor(viewport.left), // positive number
            Math.floor(viewport.top), // positive number
            viewport.screenWidth / viewport.scale.x,
            viewport.screenHeight / viewport.scale.y
        );
        this.screenScale = viewport.scale.x;

    }

    setScale(viewport: Viewport, scale: number) {
        viewport.scale.set(scale);
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
        return new Rectangle(
            0,
            0,
            Math.ceil(worldSize.width / Draw.fontCharSizeWidth),
            Math.ceil(worldSize.height / Draw.fontCharSizeHeight), 
        );
    }

    clampRect(outer: Rectangle, inner: Rectangle) {
        let newX = Math.max(outer.x, Math.min(outer.width - inner.width, inner.x));
        let newY = Math.max(outer.y, Math.min(outer.height - inner.height, inner.y));
        return new Point(newX, newY);
    }
}