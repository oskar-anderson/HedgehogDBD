import * as PIXI from "pixi.js";
import { Rectangle } from "pixi.js";
import { Table } from "../model/Table";
import { Draw } from "../model/Draw";
import { EventSystem } from "@pixi/events";

export class Minimap {

    container: PIXI.Container = new PIXI.Container();
    // @ts-ignore: Object is possibly 'null'.
    background: PIXI.Container;
    draw: Draw;
    rect = new Rectangle();
    app: PIXI.Application

    constructor(draw: Draw, minimapRect: Rectangle) {
        this.draw = draw;
        this.app = new PIXI.Application({
            width: minimapRect.width,
            height: minimapRect.height
        });
        this.rect = minimapRect;
        // extensions.remove(InteractionManager);
        const { renderer } = this.app;        // InteractionManager with EventSystem
        renderer.addSystem(EventSystem, 'events');
    }

    init(minimapNavigationCallback: (x: number, y: number) => void) {
        this.container = new PIXI.Container();
        this.background = this.initBackground();
        this.container.addChild(this.background);
        this.container.x = this.rect.x;
        this.container.y = this.rect.y;
        this.container.interactive = true;
        this.container.addListener('click', async (e: any) => {
            let minimapX = e.data.global.x - this.rect.x;
            let minimapY = e.data.global.y - this.rect.y;
            let worldX = Math.floor(minimapX / this.rect.width * this.draw.getWorld().width);
            let worldY = Math.floor(minimapY / this.rect.height * this.draw.getWorld().height);
            minimapNavigationCallback(worldX, worldY);
        })
        this.app.stage.addChild(this.container)
      }
    
    update(entities: Table[], screen: Rectangle) {
        this.container.removeChildren();
        this.background = this.initBackground();
        this.container.addChild(this.background);
        for (const entitie of entities) {
            const entity = new PIXI.Graphics();
            entity.lineStyle(1, 0x000, 1);
            entity.beginFill(0x008000, 1);
            entity.drawRect(
                entitie.getContainingRect().x * this.draw.selectedFontSize.width / this.draw.getWorld().width * this.rect.width, 
                entitie.getContainingRect().y * this.draw.selectedFontSize.height / this.draw.getWorld().height * this.rect.height, 
                entitie.getContainingRect().width * this.draw.selectedFontSize.width / this.draw.getWorld().width * this.rect.width, 
                entitie.getContainingRect().height * this.draw.selectedFontSize.height / this.draw.getWorld().height * this.rect.height
            );
            entity.endFill();
            this.container.addChild(entity);
        }
        let screenBorder = new PIXI.Graphics();
        screenBorder.lineStyle(1, 0xffdc40, 1)
        screenBorder.drawRect(
            screen.x / this.draw.getWorld().width * this.rect.width, 
            screen.y / this.draw.getWorld().height * this.rect.height, 
            screen.width / this.draw.getWorld().width * this.rect.width, 
            screen.height / this.draw.getWorld().height * this.rect.height
        );
        this.container.addChild(screenBorder);
    }

    private initBackground(): PIXI.Container {
        let background = new PIXI.Graphics();
        background.lineStyle(2, 0x000, 1);
        background.beginFill(0xffffff, 1);
        background.drawRect(0, 0, this.rect.width, this.rect.height);
        background.endFill();
        return background;
    }
}