import { Viewport } from "pixi-viewport";
import * as PIXI from "pixi.js";
import { Rectangle } from "pixi.js";
import { Table } from "./Table";

export class Draw {

    // @ts-ignore: Object is possibly 'null'.
    app: PIXI.Application = null;
    // @ts-ignore: Object is possibly 'null'.
    viewport: Viewport = null;
    screenDrawArea: string[] = [];
    fontCharSizeWidth = 14;
    fontCharSizeHeight = 14;

    constructor() {

    }

    getScreenSize() {
        return new Rectangle(Math.floor(this.viewport.x), Math.floor(this.viewport.y), this.viewport.width, this.viewport.height);
    }

    getCharGridSize() {
        let screenSize = this.getScreenSize();
        return new Rectangle(
            Math.floor(screenSize.x / this.fontCharSizeWidth),
            Math.floor(screenSize.y / this.fontCharSizeHeight),
            Math.floor(screenSize.width / this.fontCharSizeWidth),
            Math.floor(screenSize.height / this.fontCharSizeHeight), 
            );
    }

    async init(screenSizeWidth: number, screenSizeHeight: number) {
        let screenSize = new Rectangle(0, 0, screenSizeWidth, screenSizeHeight);
        let maxWorldSizeToZoomOutRatio = 1;
        let minZoomOut = 4;
        let maxZoomIn = 2;
        this.app = new PIXI.Application({
            width: screenSize.width,
            height: screenSize.height,
            backgroundColor: 0xAAAAAA
        });

        document.querySelector('.canvas-container')?.appendChild(this.app.view);

        this.app.loader.add('../wwwroot/font/ps2p/14xml/ps2p-14.fnt');

        this.viewport = new Viewport({
            screenHeight: screenSize.height,
            screenWidth:  screenSize.width,
            worldHeight:  screenSize.height * minZoomOut * maxWorldSizeToZoomOutRatio,
            worldWidth:   screenSize.width * minZoomOut * maxWorldSizeToZoomOutRatio,

            interaction: this.app.renderer.plugins.interaction
        });
        console.log(`init viewport - X: ${this.viewport.x}, Y: ${this.viewport.height}, width: ${this.viewport.width}, height: ${this.viewport.height}`)
        console.log(JSON.parse(JSON.stringify(this.viewport.hitArea)));
        console.log(this.viewport);

        this.app.stage.addChild(this.viewport);
        
        // activate plugins
        this.viewport
            .drag().clamp({ 
                left:  -screenSize.width * minZoomOut * maxWorldSizeToZoomOutRatio + screenSize.width,
                top:   -screenSize.height * minZoomOut * maxWorldSizeToZoomOutRatio + screenSize.height,
                right:  screenSize.width * minZoomOut,
                bottom: screenSize.height * minZoomOut,
            })
            .wheel().clampZoom({ 
                maxScale: maxZoomIn, 
                minScale: 1/minZoomOut
            });

        await new Promise<void>((resolve, reject) => {
            this.app.loader.load();
            
            this.app.loader.onComplete.add(() => {
                console.log("Loader complete");
                resolve();
            })
            this.app.loader.onError.add(() => {
                console.log("Loader error");
                reject();
            })
        })
        
    }

    initScreen() {
        let charGridSize = this.getCharGridSize();
        for (let y = 0; y < charGridSize.height; y++) {
            for (let x = 0; x < charGridSize.width; x++) {
                this.screenDrawArea.push(' ');
            }
        }
        for (let y = 0; y < charGridSize.height; y++) {
            for (let x = 0; x < charGridSize.width; x++) {
                let tile = this.screenDrawArea[y * charGridSize.width + x];
                let bitmapText = new PIXI.BitmapText(tile,
                    {
                        fontName: "Press Start 2P",
                        align: 'right',
                        tint: 0x008000
                    });
                bitmapText.x = x * this.fontCharSizeWidth;
                bitmapText.y = y * this.fontCharSizeHeight;
                this.viewport.addChild(bitmapText)
            }
        }
    }

    render() {
        let charGridSize = this.getCharGridSize();
        console.log(`getScreenSize`, this.getScreenSize());
        console.log(`getCharGridSize`, charGridSize);
        console.log(this.viewport.children);
        console.log(this.screenDrawArea);
        for (let y = 0; y < charGridSize.height; y++) {
            for (let x = 0; x < charGridSize.width; x++) {
                console.log(`x: ${x}, y: ${y}, index: ${y * charGridSize.width + x}`);
                (this.viewport.children[y * charGridSize.width + x] as PIXI.Text).text = this.screenDrawArea[y * charGridSize.width + x]
            }
        }
    }

    getWorldPontCanvasIndex(x: number, y: number) {
        return y * this.getCharGridSize().width + x;
    }

    isWorldPointInScreen(x: number, y: number) {
        return this.getCharGridSize().contains(x, y);
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
                    this.screenDrawArea[this.getWorldPontCanvasIndex(x, y)] = tile;
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
        this.screenDrawArea[this.getWorldPontCanvasIndex(x, y)] = char;
    }

    paintWorldRectToScreenSafe(rect: Rectangle, fillchar: string) {
        for (let y = rect.y; y < rect.bottom; y++) {
            for (let x = rect.x; x < rect.right; x++) {
                this.paintWorldPointToScreenSafe(x, y, fillchar);
            } 
        }
    }
}

