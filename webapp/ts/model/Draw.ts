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

    getMouseWorldPosition() {
        return new Point(
            Math.floor(this.screen.x + this.mouseScreenPosition.x / this.screenScale),
            Math.floor(this.screen.y + this.mouseScreenPosition.y / this.screenScale)
        )
    }

    getMouseCharGridPosition() {
        let worldPos = this.getMouseWorldPosition();
        return this.getMouseCharGridPositionFromWorldPosition(worldPos.x, worldPos.y);
    }

    getMouseCharGridPositionFromWorldPosition(x: number, y: number) {
        return new Point(
            Math.floor(x / Draw.fontCharSizeWidth),
            Math.floor(y / Draw.fontCharSizeHeight)
        )
    }

    getMouseCharGridPositionFromScreenPosition(x: number, y: number) {
        let worldPointX = Math.floor(this.screen.x + x / this.screenScale);
        let worldPointY = Math.floor(this.screen.y + y / this.screenScale);
        return this.getMouseCharGridPositionFromWorldPosition(worldPointX, worldPointY)
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

    clampRect(outer: Rectangle, inner: Rectangle) {
        let newX = Math.max(outer.x, Math.min(outer.width - inner.width, inner.x));
        let newY = Math.max(outer.y, Math.min(outer.height - inner.height, inner.y));
        return new Point(newX, newY);
    }
}