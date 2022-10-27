import { Viewport } from "pixi-viewport";
import * as PIXI from "pixi.js";
import { Point, Rectangle } from "pixi.js";
import '@pixi/math-extras';
import { Table } from "./model/Table";
import { Minimap } from "./Minimap";

export class Draw {

    // @ts-ignore: Object is possibly 'null'.
    app: PIXI.Application = null;
    // @ts-ignore: Object is possibly 'null'.
    viewport: Viewport = null;
    worldDrawArea: string[] = [];
    fontCharSizeWidth = 14;
    fontCharSizeHeight = 14;
    zoomOut = 3;
    zoomIn = 2;
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

    getWorldCharCridRectToScreenRect(rect: Rectangle) {
        return new Rectangle(
            rect.x * this.fontCharSizeWidth,
            rect.y * this.fontCharSizeHeight,
            rect.width * this.fontCharSizeWidth,
            rect.height * this.fontCharSizeHeight,
        )
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
            worldHeight:  screenSize.height * this.zoomOut * maxWorldSizeToZoomOutRatio,
            worldWidth:   screenSize.width * this.zoomOut * maxWorldSizeToZoomOutRatio,

            interaction: this.app.renderer.plugins.interaction
        });
        this.app.stage.addChild(this.viewport);
        
        // activate plugins
        this.viewport
            .drag().clamp({ 
                left:  - screenSize.width * 0.5, //  + screenSize.width
                top:   - screenSize.height * 0.5, //  + screenSize.height
                right:  screenSize.width * this.zoomOut + screenSize.width * 0.5,
                bottom: screenSize.height * this.zoomOut + screenSize.height * 0.5,
            })
            .wheel().clampZoom({ 
                maxScale: this.zoomIn, 
                minScale: 1/this.zoomOut
            });


        this.viewport.addListener('wheel', () => {
            console.log("wheel")
            this.initScreen()
            this.render(true)
            let screen = this.getScreen();
            screen.width = this.viewport.screenWidth / this.viewport.scale.x;
            screen.height = this.viewport.screenHeight / this.viewport.scale.y;
            mm.update(this.tables, screen);
        });

        this.viewport.addListener('moved', () => {
            console.log("moved")
            let screen = this.getScreen();
            screen.width = this.viewport.screenWidth / this.viewport.scale.x;
            screen.height = this.viewport.screenHeight / this.viewport.scale.y;
            mm.update(this.tables, screen);
        })

        this.initScreen();

        let mm = new Minimap()
        mm.init(
            this.getWorld().height, 
            this.getWorld().width, 
            this.fontCharSizeWidth, 
            this.fontCharSizeHeight, 
            new Rectangle(
                this.getScreen().right - 180 - 20,
                this.getScreen().top + 20,
                180,
                120,
            )
        );
        this.app.stage.addChild(mm.container);
        mm.update(this.tables, this.getScreen());

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
        this.worldDrawArea = [];
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
        let screenCharGrid = this.getWorldCharGrid();
        let worldCharGridSize = this.getWorldCharGrid();
        console.log(`getScreenSize`, this.getScreen());
        console.log(`getCharGridSize`, screenCharGrid);
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

    isWorldCharGridInScreenCharGrid(x: number, y: number) {
        return this.getScreenCharGrid().contains(x, y);
    }

    setWorldTable(table: Table) {
        let worldCharGridRect = table.rect;
        let headIndex = 0;
        let firstColumnWidth = table.getColumnWidths()[0];
        let secondColumnWidth = table.getColumnWidths()[1];
        let thirdColumnWidth = table.getColumnWidths()[2];
        this.paintWorldPatch8Safe(new Rectangle(worldCharGridRect.x, worldCharGridRect.y, worldCharGridRect.width, 2));
        this.paintWorldPatch8Safe(new Rectangle(worldCharGridRect.x, worldCharGridRect.y + 2, firstColumnWidth, worldCharGridRect.height - 2));
        this.paintWorldPatch8Safe(new Rectangle(worldCharGridRect.x + firstColumnWidth, worldCharGridRect.y + 2, secondColumnWidth, worldCharGridRect.height - 2));
        this.paintWorldPatch8Safe(new Rectangle(worldCharGridRect.x + firstColumnWidth + secondColumnWidth, worldCharGridRect.y + 2, thirdColumnWidth, worldCharGridRect.height - 2));
        for (let x = worldCharGridRect.x; x <= worldCharGridRect.right; x++) {
            for (let y = worldCharGridRect.y; y <= worldCharGridRect.bottom; y++) {
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
        if (! this.getWorldCharGrid().contains(x, y)) {
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