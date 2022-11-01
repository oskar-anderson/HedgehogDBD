import * as PIXI from "pixi.js";
import { Rectangle } from "pixi.js";
import { Table } from "./model/Table";
import { Viewport } from "pixi-viewport";

export class Minimap {

    container: PIXI.Container = new PIXI.Container();
    // @ts-ignore: Object is possibly 'null'.
    background: PIXI.Graphics;
    worldHeight: number = 0;
    worldWidth: number = 0;
    minimapRect = new Rectangle();
    fontWidth: number = 0;
    fontHeight: number = 0;
    // @ts-ignore: Object is possibly 'null'.
    viewPort: Viewport = null
    areEventListenersActive: boolean = true;

    constructor() {

    }

    init(worldHeight: number, worldWidth: number, fontWidth: number, fontHeight: number, minimapRect: Rectangle, minimapNavigationCallback: (x: number, y: number) => void) {
        this.worldHeight = worldHeight;
        this.worldWidth = worldWidth;
        this.fontWidth = fontWidth;
        this.fontHeight = fontHeight;
        this.minimapRect = minimapRect;
        this.container = new PIXI.Container();
        this.background = this.initBackground();
        this.container.addChild(this.background);
        this.container.x = this.minimapRect.x;
        this.container.y = this.minimapRect.y;
        this.container.interactive = true;
        this.container.addListener('click', async (e: any) => {
            if (! this.areEventListenersActive) { return }
            let minimapX = e.data.global.x - this.minimapRect.x;
            let minimapY = e.data.global.y - this.minimapRect.y;
            let worldX = Math.floor(minimapX / this.minimapRect.width * worldWidth);
            let worldY = Math.floor(minimapY / this.minimapRect.height * worldHeight);
            minimapNavigationCallback(worldX, worldY);
        })
        return this.container;
      }
    
    update(entities: Table[], screen: Rectangle) {
        console.log(`minimap update`);
        this.container.removeChildren();
        this.background = this.initBackground();
        this.container.addChild(this.background);
        for (const entitie of entities) {
            const entity = new PIXI.Graphics();
            entity.lineStyle(1, 0x000, 1);
            entity.beginFill(0x008000, 1);
            entity.drawRect(
                entitie.getBodyRect().x * this.fontWidth / this.worldWidth * this.minimapRect.width, 
                entitie.getBodyRect().y * this.fontHeight / this.worldHeight * this.minimapRect.height, 
                entitie.getBodyRect().width * this.fontWidth / this.worldWidth * this.minimapRect.width, 
                entitie.getBodyRect().height * this.fontHeight / this.worldHeight * this.minimapRect.height
            );
            entity.endFill();
            this.container.addChild(entity);
        }
        let screenBorder = new PIXI.Graphics();
        screenBorder.lineStyle(1, 0xffdc40, 1)
        screenBorder.drawRect(
            screen.x / this.worldWidth * this.minimapRect.width, 
            screen.y / this.worldHeight * this.minimapRect.height, 
            screen.width / this.worldWidth * this.minimapRect.width, 
            screen.height / this.worldHeight * this.minimapRect.height
        );
        this.container.addChild(screenBorder);
    }

    private initBackground() {
        let background = new PIXI.Graphics();
        background.lineStyle(2, 0x000, 1);
        background.beginFill(0x3a3a3a, 1);
        background.drawRect(0, 0, this.minimapRect.width, this.minimapRect.height);
        background.endFill();
        return background;
    }
}