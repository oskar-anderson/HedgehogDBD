import { Viewport } from "pixi-viewport";
import * as PIXI from "pixi.js";
import { Point, Rectangle } from "pixi.js";
import { Table } from "./model/Table";

export class Draw {

    // @ts-ignore: Object is possibly 'null'.
    app: PIXI.Application = null;
    // @ts-ignore: Object is possibly 'null'.
    viewport: Viewport = null;
    worldDrawArea: string[] = [];
    fontCharSizeWidth = 14;
    fontCharSizeHeight = 14;
    minZoomOut = 4;
    maxZoomIn = 2;
    tables: Table[] = [];

    constructor() {

    }

    getWorld() {
        return new Rectangle(
            0,
            0,
            this.viewport.worldWidth,
            this.viewport.worldHeight
        );
    }

    getScreen() {
        return new Rectangle(
            // @ts-ignore: Object is possibly 'null'.
            Math.floor(this.viewport.hitArea.x),
            // @ts-ignore: Object is possibly 'null'.
            Math.floor(this.viewport.hitArea.y),
            this.viewport.screenWidth,
            this.viewport.screenHeight
        );
    }

    getScreenCharGrid() {
        let screenSize = this.getScreen();
        return new Rectangle(
            Math.floor(screenSize.x / this.fontCharSizeWidth),
            Math.floor(screenSize.y / this.fontCharSizeHeight),
            Math.ceil(screenSize.width / this.fontCharSizeWidth),
            Math.ceil(screenSize.height / this.fontCharSizeHeight), 
            );
    }

    getWorldCharGrid() {
        let worldSize = this.getWorld();
        return new Rectangle(
            0,
            0,
            Math.ceil(worldSize.width / this.fontCharSizeWidth),
            Math.ceil(worldSize.height / this.fontCharSizeHeight), 
            );
    }

    convertWorldCharGridRectToScreenCharGridRect(rect: Rectangle) {
        return new Rectangle(
            rect.x + this.getScreenCharGrid().x,
            rect.y + this.getScreenCharGrid().y,
            rect.width + this.getScreenCharGrid().x,
            rect.height + this.getScreenCharGrid().y,
        )
    }

    convertWorldPointToScreenPoint(x: number, y: number) {
        return new Point(
            x + this.getScreenCharGrid().x,
            y + this.getScreenCharGrid().y
        );
    }

    async init(screenSizeWidth: number, screenSizeHeight: number, tables: Table[]) {
        this.tables = tables;
        let screenSize = new Rectangle(0, 0, screenSizeWidth, screenSizeHeight);
        let maxWorldSizeToZoomOutRatio = 1;
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
            worldHeight:  screenSize.height * this.minZoomOut * maxWorldSizeToZoomOutRatio,
            worldWidth:   screenSize.width * this.minZoomOut * maxWorldSizeToZoomOutRatio,

            interaction: this.app.renderer.plugins.interaction
        });
        console.log(`init viewport - X: ${this.viewport.x}, Y: ${this.viewport.height}, width: ${this.viewport.width}, height: ${this.viewport.height}`)
        console.log(JSON.parse(JSON.stringify(this.viewport.hitArea)));
        console.log(this.viewport);

        this.app.stage.addChild(this.viewport);
        
        // activate plugins
        this.viewport
            .drag().clamp({ 
                left:  -screenSize.width * this.minZoomOut * maxWorldSizeToZoomOutRatio + screenSize.width,
                top:   -screenSize.height * this.minZoomOut * maxWorldSizeToZoomOutRatio + screenSize.height,
                right:  screenSize.width * this.minZoomOut,
                bottom: screenSize.height * this.minZoomOut,
            })
            .wheel().clampZoom({ 
                maxScale: this.maxZoomIn, 
                minScale: 1/this.minZoomOut
            });


        this.viewport.addListener('wheel', () => {
            this.initScreen()
            this.render(true)
        });

        this.initScreen();

        await new Promise<void>((resolve, reject) => {
            this.app.loader.load();
            
            this.app.loader.onComplete.add(() => {
                console.log("Loader complete");
                this.render(true)
                resolve();
            })
            this.app.loader.onError.add(() => {
                console.log("Loader error");
                reject();
            })
        })
        
    }

    initScreen() {
        let charGridSize = this.getWorldCharGrid();
        for (let y = 0; y < charGridSize.height; y++) {
            for (let x = 0; x < charGridSize.width; x++) {
                this.worldDrawArea.push(' ');
            }
        }
        for (const table of this.tables) {
            this.setWorldTable(table);
        }
    }

    render(isForceScreenReset = true) {
        let screenCharGrid = this.getScreenCharGrid();
        let worldCharGridSize = this.getWorldCharGrid();
        console.log(`getScreenSize`, this.getScreen());
        console.log(`getCharGridSize`, screenCharGrid);
        // @ts-ignore: Object is possibly 'null'.
        console.log(`Y: ${Math.floor(this.viewport.hitArea.y)}, X: ${this.viewport.hitArea.x}`)
        console.log(this.viewport);
        console.log(this.worldDrawArea);
        if (isForceScreenReset) {
            this.viewport.removeChildren();
        }
        for (let y = 0; y < screenCharGrid.height; y++) {
            for (let x = 0; x < screenCharGrid.width; x++) {
                // console.log(`x: ${x}, y: ${y}, index: ${y * charGridSize.width + x}`);
                let tile = this.worldDrawArea[y * worldCharGridSize.width + x];
                if (isForceScreenReset) {
                    let bitmapText = new PIXI.BitmapText(tile,
                        {
                            fontName: "Press Start 2P",
                            align: 'right',
                            tint: 0x008000
                        });
                    bitmapText.x = x * this.fontCharSizeWidth;
                    bitmapText.y = y * this.fontCharSizeHeight;
                    this.viewport.addChild(bitmapText)
                } else {
                    (this.viewport.children[y * screenCharGrid.width + x] as PIXI.Text).text = tile;
                }
            }
        }
    }

    getWorldPointCanvasIndex(x: number, y: number) {
        return y * this.getWorldCharGrid().width + x;
    }

    isWorldPointInScreen(x: number, y: number) {
        return this.getScreenCharGrid().contains(x, y);
    }

    setWorldTable(table: Table) {
        let worldCharGridRect = table.rect;
        let screenCharGridRect = this.convertWorldCharGridRectToScreenCharGridRect(table.rect);
        let headIndex = 0;
        let firstColumnWidth = table.getColumnWidths()[0];
        let secondColumnWidth = table.getColumnWidths()[1];
        let thirdColumnWidth = table.getColumnWidths()[2];
        this.paintWorldPatch8Safe(
            this.convertWorldCharGridRectToScreenCharGridRect(
                new Rectangle(worldCharGridRect.x, worldCharGridRect.y, worldCharGridRect.width, 2)
            )
        );
        this.paintWorldPatch8Safe(
            this.convertWorldCharGridRectToScreenCharGridRect(
                new Rectangle(worldCharGridRect.x, worldCharGridRect.y + 2, firstColumnWidth, worldCharGridRect.height - 2)
            )
        );
        this.paintWorldPatch8Safe(
            this.convertWorldCharGridRectToScreenCharGridRect(
                new Rectangle(worldCharGridRect.x + firstColumnWidth, worldCharGridRect.y + 2, secondColumnWidth, worldCharGridRect.height - 2)
            )
        );
        this.paintWorldPatch8Safe(
            this.convertWorldCharGridRectToScreenCharGridRect(
                new Rectangle(worldCharGridRect.x + firstColumnWidth + secondColumnWidth, worldCharGridRect.y + 2, thirdColumnWidth, worldCharGridRect.height - 2)
            )
        );
        for (let x = screenCharGridRect.x; x <= screenCharGridRect.right; x++) {
            for (let y = screenCharGridRect.y; y <= screenCharGridRect.bottom; y++) {
                let worldPoint = this.convertWorldPointToScreenPoint(x, y);
                if (! this.isWorldPointInScreen(worldPoint.x, worldPoint.y)) {
                    continue;
                }
                if (worldCharGridRect.y + 1 === y && x < worldCharGridRect.right && x > worldCharGridRect.left) {
                    let tile = table.head[headIndex] ?? ' ';
                    headIndex++;
                    this.worldDrawArea[this.getWorldPointCanvasIndex(x, y)] = tile;
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
        this.worldDrawArea[this.getWorldPointCanvasIndex(x, y)] = char;
    }

    paintWorldRectToScreenSafe(rect: Rectangle, fillchar: string) {
        for (let y = rect.y; y < rect.bottom; y++) {
            for (let x = rect.x; x < rect.right; x++) {
                this.paintWorldPointToScreenSafe(x, y, fillchar);
            } 
        }
    }
}