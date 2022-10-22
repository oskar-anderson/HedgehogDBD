import { Rectangle } from "pixi.js";
import { Table } from "./Table";

export class Display {

    screenCharSize = new Rectangle()
    offsetX = 0;
    offsetY = 0;
    screen: string[] = [];

    constructor(height: number, width: number) {
        this.screenCharSize.height = height;
        this.screenCharSize.width = width;
    }

    init() {
        // this.screen = new Array(this.screenCharSize.height * this.screenCharSize.width).fill(' ');
        for (let y = 0; y < this.screenCharSize.height; y++) {
            for (let x = 0; x < this.screenCharSize.width; x++) {
                this.screen.push(' ');
            }
        }
    }

    getCanvasIndex(x: number, y: number) {
        return y * this.screenCharSize.width + x;
    }

    
    getCanvasIndexWithCameraOffset(x: number, y: number) {
        return this.getCanvasIndex(x - this.offsetX, y - this.offsetY);
    }

    isWorldPointInScreen(x: number, y: number) {
        return this.screenCharSize.contains(x - this.offsetX, y - this.offsetY);
    }

    setWorldTable(table: Table) {
        let rect = table.rect;
        let headIndex = 0;
        let firstColumnWidth = table.getColumnWidths()[0];
        let secondColumnWidth = table.getColumnWidths()[1];
        let thirdColumnWidth = table.getColumnWidths()[2];
        this.paintWorldPatch8Safe(new Rectangle(rect.x, rect.y, rect.width, 2));
        this.paintWorldPatch8Safe(new Rectangle(rect.x, rect.y + 2, firstColumnWidth, rect.height - 2));
        this.paintWorldPatch8Safe(new Rectangle(rect.x + firstColumnWidth, rect.y + 2, secondColumnWidth, rect.height - 2));
        this.paintWorldPatch8Safe(new Rectangle(rect.x + firstColumnWidth + secondColumnWidth, rect.y + 2, thirdColumnWidth, rect.height - 2));
        for (let x = rect.x; x <= rect.right; x++) {
            for (let y = rect.y; y <= rect.bottom; y++) {
                if (! this.isWorldPointInScreen(x, y)) {
                    continue;
                }
                if (rect.y + 1 === y && x < rect.right && x > rect.left) {
                    let tile = table.head[headIndex] ?? ' ';
                    headIndex++;
                    this.screen[this.getCanvasIndexWithCameraOffset(x, y)] = tile;
                }
            }    
        }
    }

    
    paintWorldPatch8Safe(rect: Rectangle) {
        let [tl, t, tr, ml, mr, bl, b, br] = ['+', '-', '+', '|', '|', '+', '-', '+'];
        this.paintWorldPointToScreenSafe(rect.left, rect.top, tl);
        this.paintWorldRectToScreenSafe(new Rectangle(rect.x + 1, rect.y, rect.width - 1, 1), t);
        this.paintWorldPointToScreenSafe(rect.right, rect.top, tr);
        this.paintWorldRectToScreenSafe(new Rectangle(rect.x, rect.y + 1, 1, rect.height - 1), ml);
        this.paintWorldRectToScreenSafe(new Rectangle(rect.right, rect.y + 1, 1, rect.height - 1), mr);
        this.paintWorldPointToScreenSafe(rect.left, rect.bottom, bl);
        this.paintWorldRectToScreenSafe(new Rectangle(rect.x + 1, rect.bottom, rect.width - 1, 1), b);
        this.paintWorldPointToScreenSafe(rect.right, rect.bottom, br);
    }

    paintWorldPointToScreenSafe(x: number, y: number, char: string) {
        if (! this.isWorldPointInScreen(x, y)) {
            return
        }
        this.screen[this.getCanvasIndexWithCameraOffset(x, y)] = char;
    }

    paintWorldRectToScreenSafe(rect: Rectangle, fillchar: string) {
        for (let y = rect.y; y < rect.bottom; y++) {
            for (let x = rect.x; x < rect.right; x++) {
                this.paintWorldPointToScreenSafe(x, y, fillchar);
            } 
        }
    }
}