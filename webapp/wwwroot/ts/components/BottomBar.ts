import { BitmapText, Container, Graphics, Rectangle } from "pixi.js"
import { Manager } from "../Manager";
import { Draw } from "../model/Draw";

export class BottomBar {
    screenCursorLocationIndicator: BitmapText;
    worldCursorLocationIndicator: BitmapText;
    worldCharGridCursorLocationIndicator: BitmapText;

    constructor(screen: Rectangle) {
        this.screenCursorLocationIndicator = new BitmapText("",
        {
            fontName: "Consolas",
            tint: 0xffffff
        });
        this.screenCursorLocationIndicator.x = 10;
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


        this.pointermove(0, 0, screen);
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
        return container;
    }

    pointermove(x: number, y: number, screen: Rectangle) {
        this.screenCursorLocationIndicator.text = `Sx: ${x}, Sy: ${y}`;
        this.worldCursorLocationIndicator.text = `Wx: ${screen.x + x}, Wy: ${screen.y + y}`;
        this.worldCharGridCursorLocationIndicator.text = `WCx: ${Math.floor((screen.x + x) / Draw.fontCharSizeWidth)}, WCy: ${Math.floor((screen.y + y) / Draw.fontCharSizeHeight)}`;
    }
}