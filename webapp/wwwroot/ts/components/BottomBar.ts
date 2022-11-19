import { BitmapText, Container, Graphics, Rectangle } from "pixi.js"
import { Manager } from "../Manager";
import { Draw } from "../model/Draw";

export class BottomBar {
    screenCursorLocationIndicator: BitmapText;
    worldCursorLocationIndicator: BitmapText;
    worldCharGridCursorLocationIndicator: BitmapText;
    screenScaleIndicator: BitmapText;

    constructor() {
        this.screenCursorLocationIndicator = new BitmapText("",
        {
            fontName: "Consolas",
            tint: 0xffffff
        });
        this.screenCursorLocationIndicator.x = 0;
        this.screenCursorLocationIndicator.y = Manager.height - 1 * Draw.fontCharSizeHeight;


        this.worldCursorLocationIndicator = new BitmapText("",
        {
            fontName: "Consolas",
            tint: 0xffffff
        });
        this.worldCursorLocationIndicator.x = 160;
        this.worldCursorLocationIndicator.y = Manager.height - 1 * Draw.fontCharSizeHeight;

        this.worldCharGridCursorLocationIndicator = new BitmapText("",
        {
            fontName: "Consolas",
            tint: 0xffffff
        });
        this.worldCharGridCursorLocationIndicator.x = 320;
        this.worldCharGridCursorLocationIndicator.y = Manager.height - 1 * Draw.fontCharSizeHeight;

        this.screenScaleIndicator = new BitmapText("",
        {
            fontName: "Consolas",
            tint: 0xffffff
        });
        this.screenScaleIndicator.x = 480;
        this.screenScaleIndicator.y = Manager.height - 1 * Draw.fontCharSizeHeight;


        this.pointermove(0, 0, 0, 0, 0, 0, 1);
    }

    getContainer() {
        let container = new Container();
        let fill = new Graphics()
        fill.beginFill(0x005588, 1)
        let fillHeight = Draw.fontCharSizeHeight;
        fill.drawRect(0, Manager.height - fillHeight, Manager.width, fillHeight)
        fill.endFill()
        container.addChild(fill);
        container.addChild(this.screenCursorLocationIndicator);
        container.addChild(this.worldCursorLocationIndicator);
        container.addChild(this.worldCharGridCursorLocationIndicator);
        container.addChild(this.screenScaleIndicator);
        return container;
    }

    pointermove(sx: number, sy: number, wx: number, wy: number, WCx: number, WCy: number, scale: number) {
        this.screenCursorLocationIndicator.text = `Sx: ${sx}, Sy: ${sy}`;
        this.worldCursorLocationIndicator.text = `Wx: ${wx}, Wy: ${wy}`;
        this.worldCharGridCursorLocationIndicator.text = `WCx: ${WCx}, WCy: ${WCy}`;
        this.screenScaleIndicator.text = `Scale: ${scale}`;
    }
}