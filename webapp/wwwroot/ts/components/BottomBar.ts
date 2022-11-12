import { BitmapText, Container, Graphics } from "pixi.js"
import { Manager } from "../Manager";
import { Draw } from "../model/Draw";

export class BottomBar {
    screenCursorLocationIndicator: BitmapText;

    constructor() {
        let bitmapText = new BitmapText("",
        {
            fontName: "Consolas",
            align: 'right',
            tint: 0x008000
        });
        bitmapText.x = 10;
        bitmapText.y = Manager.height - 1 * Draw.fontCharSizeHeight;
        this.screenCursorLocationIndicator = bitmapText
        this.pointermove(0, 0)
    }

    getContainer() {
        let container = new Container();
        let fill = new Graphics()
        fill.beginFill(0x000088, 1)
        let fillHeight = 1.2 * Draw.fontCharSizeHeight;
        fill.drawRect(0, Manager.height - fillHeight, Manager.width, fillHeight)
        fill.endFill()
        container.addChild(fill);
        container.addChild(this.screenCursorLocationIndicator);
        return container;
    }

    pointermove(x: number, y: number) {
        this.screenCursorLocationIndicator.text = `x: ${x}, y: ${y}`;
    }
}