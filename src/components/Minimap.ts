import * as PIXI from "pixi.js";
import { Rectangle } from "pixi.js";
import { Table } from "../model/Table";
import { Draw } from "../model/Draw";
import { EventSystem } from "@pixi/events";
import { Manager } from "../Manager";
import { MyRect } from "../model/MyRect";

export class Minimap {

    container: PIXI.Container = new PIXI.Container();
    // @ts-ignore: Object is possibly 'null'.
    background: PIXI.Container;
    minimapSize = new Rectangle();
    app: PIXI.Application

    constructor(minimapRect: Rectangle) {
        this.app = new PIXI.Application({
            width: minimapRect.width,
            height: minimapRect.height
        });
        this.minimapSize = minimapRect;
        // extensions.remove(InteractionManager);
        const { renderer } = this.app;        // InteractionManager with EventSystem
        renderer.addSystem(EventSystem, 'events');
    }

    init(minimapNavigationCallback: (x: number, y: number) => void) {
        const draw = Manager.getInstance().draw;
        this.container = new PIXI.Container();
        this.background = this.initBackground();
        this.container.addChild(this.background);
        this.container.x = this.minimapSize.x;
        this.container.y = this.minimapSize.y;
        this.container.interactive = true;
        this.container.addListener('click', async (e: any) => {
            let minimapX = e.data.global.x - this.minimapSize.x;
            let minimapY = e.data.global.y - this.minimapSize.y;
            let worldX = Math.floor(minimapX / this.minimapSize.width * draw.getWorld().width);
            let worldY = Math.floor(minimapY / this.minimapSize.height * draw.getWorld().height);
            minimapNavigationCallback(worldX, worldY);
        })
        this.app.stage.addChild(this.container)
      }
    
    update(entities: Table[], screen: Rectangle) {
        const draw = Manager.getInstance().draw;
        this.container.removeChildren();
        this.background = this.initBackground();
        this.container.addChild(this.background);
        for (const entitie of entities) {
            const entity = new PIXI.Graphics();
            entity.lineStyle(1, 0x000, 1);
            entity.beginFill(0x008000, 1);
            entity.drawRect(
                entitie.getContainingRect().x * draw.selectedFontSize.width / draw.getWorld().width * this.minimapSize.width, 
                entitie.getContainingRect().y * draw.selectedFontSize.height / draw.getWorld().height * this.minimapSize.height, 
                entitie.getContainingRect().width * draw.selectedFontSize.width / draw.getWorld().width * this.minimapSize.width, 
                entitie.getContainingRect().height * draw.selectedFontSize.height / draw.getWorld().height * this.minimapSize.height
            );
            entity.endFill();
            this.container.addChild(entity);
        }
        let screenBorder = new PIXI.Graphics();
        screenBorder.lineStyle(1, 0xffdc40, 1)
        let screenBorderRect = new MyRect(
            Math.floor(screen.x / draw.getWorld().width * this.minimapSize.width),
            Math.floor(screen.y / draw.getWorld().height * this.minimapSize.height),
            Math.floor(screen.width / draw.getWorld().width * this.minimapSize.width),
            Math.floor(screen.height / draw.getWorld().height * this.minimapSize.height)
        );
        // dirty hack to make screenBorder be drawn over the minimap border on all edges
        screenBorderRect = screenBorderRect.fit(new MyRect(1, 0, this.minimapSize.width, this.minimapSize.height - 1))
        screenBorder.drawRect(
            screenBorderRect.x,
            screenBorderRect.y,
            screenBorderRect.width,
            screenBorderRect.height
        );
        this.container.addChild(screenBorder);
    }

    private initBackground(): PIXI.Container {
        let background = new PIXI.Graphics();
        background.lineStyle(2, 0x8c8c8c, 1);
        background.beginFill(0xffffff, 1);
        background.drawRect(0, 0, this.minimapSize.width, this.minimapSize.height);
        background.endFill();
        return background;
    }
}