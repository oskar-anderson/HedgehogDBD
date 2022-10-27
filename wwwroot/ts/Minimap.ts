import * as PIXI from "pixi.js";
import { Rectangle } from "pixi.js";
import { Table } from "./model/Table";

export class Minimap {

    container: PIXI.Container = new PIXI.Container();
    // @ts-ignore: Object is possibly 'null'.
    background: PIXI.Graphics;
    worldHeight: number = 0;
    worldWidth: number = 0;
    minimapRect = new Rectangle(150, 150, 180, 120);
    fontWidth: number = 0;
    fontHeight: number = 0;

    constructor() {

    }

    init(worldHeight: number, worldWidth: number, fontWidth: number, fontHeight: number, minimapRect: Rectangle) {
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
        return this.container;
      }
    
    update(entities: Table[], screen: Rectangle) {
        console.log(`minimap update, screen: ${screen}`);
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