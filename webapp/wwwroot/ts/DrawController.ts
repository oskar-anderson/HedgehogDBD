import { Viewport } from "pixi-viewport";
import * as PIXI from "pixi.js";
import { InteractionEvent, Point, Rectangle } from "pixi.js";
import '@pixi/math-extras';
import '@pixi/events';
import { Table } from "./model/Table";
import { Minimap } from "./Minimap";
import { Draw } from "./model/Draw";
import { ICommandRegister } from "./commands/ICommandRegister";
import { MoveTableRelative } from "./commands/appCommands/MoveTableRelative";
import { MoveTableTest } from "./commands/appCommands/MoveTableTest";

export class DrawController {

    // @ts-ignore: Object is possibly 'null'.
    app: PIXI.Application = null;
    // @ts-ignore: Object is possibly 'null'.
    viewport: Viewport = null;
    // @ts-ignore: Object is possibly 'null'.
    minimap: Minimap = null;
    // @ts-ignore: Object is possibly 'null'.
    draw: Draw = null;

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
            Math.floor(this.viewport.left), // positive number
            Math.floor(this.viewport.top), // positive number
            this.viewport.screenWidth / this.viewport.scale.x,
            this.viewport.screenHeight / this.viewport.scale.y
        );
    }

    getWorldCharCridToScreen(rect: Rectangle) {
        return new Rectangle(
            rect.x * this.draw.fontCharSizeWidth,
            rect.y * this.draw.fontCharSizeHeight,
            rect.width * this.draw.fontCharSizeWidth,
            rect.height * this.draw.fontCharSizeHeight,
        )
    }


    getScreenCharGrid() {
        let screenSize = this.getScreen();
        return new Rectangle(
            Math.floor(screenSize.x / this.draw.fontCharSizeWidth),
            Math.floor(screenSize.y / this.draw.fontCharSizeHeight),
            Math.ceil(screenSize.width / this.draw.fontCharSizeWidth),
            Math.ceil(screenSize.height / this.draw.fontCharSizeHeight), 
            );
    }

    getWorldCharGrid() {
        let worldSize = this.getWorld();
        return new Rectangle(
            0,
            0,
            Math.ceil(worldSize.width / this.draw.fontCharSizeWidth),
            Math.ceil(worldSize.height / this.draw.fontCharSizeHeight), 
        );
    }

    async init(screenSizeWidth: number, screenSizeHeight: number, tables: Table[]) {
        console.log(ICommandRegister.GetImplementations()[0].name);
        console.log(ICommandRegister.GetImplementations()[0].prototype);
        this.draw = new Draw();
        this.draw.init(tables, new Rectangle(0, 0, screenSizeWidth, screenSizeHeight));
        this.app = new PIXI.Application({
            width: this.draw.screenContainerSize.width,
            height: this.draw.screenContainerSize.height,
            backgroundColor: 0xAAAAAA
        });

        document.querySelector('.canvas-container')?.appendChild(this.app.view);

        this.app.loader.add('../wwwroot/font/ps2p/14xml/ps2p-14.fnt');

        this.viewport = new Viewport({
            screenHeight: this.draw.screenContainerSize.height,
            screenWidth:  this.draw.screenContainerSize.width,
            worldHeight:  this.draw.screenContainerSize.height * this.draw.zoomOut,
            worldWidth:   this.draw.screenContainerSize.width * this.draw.zoomOut,

            interaction: this.app.renderer.plugins.interaction
        });
        this.app.stage.addChild(this.viewport);
        this.initViewport();

        this.minimap = new Minimap()
        this.minimap.init(
            this.getWorld().height, 
            this.getWorld().width, 
            this.draw.fontCharSizeWidth, 
            this.draw.fontCharSizeHeight, 
            new Rectangle(
                this.draw.screenContainerSize.right - 180 - 20,
                this.draw.screenContainerSize.top + 20,
                180,
                120,
            ),
            (x: number, y: number) => { 
                console.log("minimap navigation");
                this.viewport.moveCenter(x, y);
                this.minimap.update(this.draw.getVisibleTables(), this.getScreen()) 
            }
        );
        this.app.stage.addChild(this.minimap.container);
        

        await new Promise<void>((resolve, reject) => {
            this.app.loader.load();
            
            this.app.loader.onComplete.add(() => {
                console.log("Loader complete");
                this.render(true);
                resolve();
            })
            this.app.loader.onError.add(() => {
                console.log("Loader error");
                reject();
            })
        })
        
    }

    render(isForceScreenReset = true) {
        let charGridSize = this.getWorldCharGrid();
        this.draw.worldDrawArea = [];
        for (let y = 0; y < charGridSize.height; y++) {
            for (let x = 0; x < charGridSize.width; x++) {
                this.draw.worldDrawArea.push(' ');
            }
        }
        let tables = this.draw.getVisibleTables();
        for (const table of tables) {
            this.setWorldTable(table);
        }
        this.minimap.update(tables, this.getScreen());

        let screenCharGrid = this.getWorldCharGrid();
        let worldCharGridSize = this.getWorldCharGrid();
        if (isForceScreenReset) {
            this.viewport.removeChildren();
        }
        for (let y = 0; y < screenCharGrid.height; y++) {
            for (let x = 0; x < screenCharGrid.width; x++) {
                // console.log(`x: ${x}, y: ${y}, index: ${y * charGridSize.width + x}`);
                let tile = this.draw.worldDrawArea[y * worldCharGridSize.width + x];
                if (isForceScreenReset) {
                    let bitmapText = new PIXI.BitmapText(tile,
                        {
                            fontName: "Press Start 2P",
                            align: 'right',
                            tint: 0x008000
                        });
                    bitmapText.x = x * this.draw.fontCharSizeWidth;
                    bitmapText.y = y * this.draw.fontCharSizeHeight;
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

    setWorldTable(table: Table) {
        let worldCharGridRect = table.getCornerRect();
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
                    this.draw.worldDrawArea[this.getWorldPointCanvasIndex(x, y)] = tile;
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
        this.draw.worldDrawArea[this.getWorldPointCanvasIndex(x, y)] = char;
    }

    paintWorldRectToScreenSafe(rect: Rectangle, fillchar: string) {
        for (let y = rect.y; y < rect.bottom; y++) {
            for (let x = rect.x; x < rect.right; x++) {
                this.paintWorldPointToScreenSafe(x, y, fillchar);
            } 
        }
    }

    initViewport(enableDrag: boolean = true) {
        // activate plugins
        this.viewport
            .drag({ pressDrag: enableDrag }).clamp({ 
                left:   0,
                top:    0,
                right:  this.draw.screenContainerSize.width * this.draw.zoomOut,
                bottom: this.draw.screenContainerSize.height * this.draw.zoomOut,
            })
            .wheel().clampZoom({ 
                maxScale: this.draw.zoomIn, 
                minScale: 1/this.draw.zoomOut
            });

        // make zooming update minimap
        this.viewport.addEventListener('wheel', () => {
            console.log("wheel")
            this.minimap.update(this.draw.getVisibleTables(), this.getScreen());
        });

        // make panning update minimap camera indicator location
        this.viewport.addEventListener('moved', () => {
            console.log("moved")
            this.minimap.update(this.draw.getVisibleTables(), this.getScreen());
        })
    }

    pausePanning() {
        this.initViewport(false) // viewport is still needed for minimap updating
    }

    resumePanning() {
        this.initViewport(true)
    }

    pauseSelect() {
        this.viewport.removeAllListeners('mousedown');
        this.viewport.removeAllListeners('mouseup');
        this.viewport.removeAllListeners('mousemove');
        this.viewport.removeAllListeners('mouseout');  
    }

    resumeSelect() {

        let mouseMoveFunc = (e: PIXI.InteractionEvent, table: Table, tablePivotX: number, tablePivotY: number) => {
            console.log(`mousemove`);
            let x = this.getScreen().x + e.data.global.x / this.viewport.scale.x;
            let y = this.getScreen().y + e.data.global.y / this.viewport.scale.y;
            console.log(`Y: ${y}, X: ${x}`);
            let charGridX = Math.floor(x / this.draw.fontCharSizeWidth);
            let charGridY = Math.floor(y / this.draw.fontCharSizeHeight);
            let newX = charGridX + tablePivotX
            let newY = charGridY + tablePivotY
            if (table.rect.x === newX && table.rect.y === newY) return;
            table.rect.x = newX;
            table.rect.y = newY;
            this.render(false)
        };


        this.viewport.on('mousedown', (e: PIXI.InteractionEvent) => {  // same as addEventListener except type can be specified inside parameter
            console.log("mousedown");
            let x = this.getScreen().x + e.data.global.x / this.viewport.scale.x;
            let y = this.getScreen().y + e.data.global.y / this.viewport.scale.y;
            console.log(`Y: ${y}, X: ${x}`);
            let charGridX = Math.floor(x / this.draw.fontCharSizeWidth);
            let charGridY = Math.floor(y / this.draw.fontCharSizeHeight);
            let hover: Table | null = null;
            for (let table of this.draw.tables) {
                if (table.getContainingRect().contains(charGridX, charGridY)) {
                    let tablePivotX = table.rect.x - charGridX;
                    let tablePivotY = table.rect.y - charGridY;
                    hover = table.copy();
                    hover.isHoverTarget = true;
                    table.isHoverSource = true;
                    this.viewport.on('mousemove', (e) => mouseMoveFunc(e, hover!, tablePivotX, tablePivotY));
                    this.viewport.on('mouseout', () => {
                        console.log("mouseout");
                        this.viewport.removeAllListeners('mousemove');
                        this.viewport.removeAllListeners('mouseout');  
                    });
                }
            }
            if (hover !== null) {
                this.draw.tables.push(hover);
            }
        })

        this.viewport.on('mouseup', (e: PIXI.InteractionEvent) => {  // same as addEventListener except type can be specified inside parameter
            console.log("mouseup");
            let x = this.getScreen().x + e.data.global.x / this.viewport.scale.x;
            let y = this.getScreen().y + e.data.global.y / this.viewport.scale.y;
            console.log(`Y: ${y}, X: ${x}`);
            let isGoodPlaceForTableFunc = (hover: Table | null) => {
                if (hover != null) {
                    let isGoodPlacement = true;
                    for (let table of this.draw.tables.filter(x => !x.isHoverSource && !x.isHoverTarget)) {
                        let isIntersecting = !(table.rect.left > hover.rect.right || 
                            table.rect.right < hover.rect.left || 
                            table.rect.top > hover.rect.bottom ||
                            table.rect.bottom < hover.rect.top);
                        console.log(isIntersecting);
                        if (table.rect.intersects(hover.rect)) {
                            console.log(
                                `intersects table: ${table.head}`,
                                `table: `, JSON.parse(JSON.stringify(table.rect)), 
                                `hover: `, JSON.parse(JSON.stringify(hover.rect)),
                                )
                            isGoodPlacement = false;
                        }
                    }
                    return isGoodPlacement;

                }
                return false;
            }
            let hover = this.draw.tables.find(x => x.isHoverTarget) ?? null;
            this.draw.tables = this.draw.tables.filter(x => !x.isHoverTarget);
            let isGoodPlaceForTable = isGoodPlaceForTableFunc(hover)
            console.log(`isGoodPlaceForTable: ${isGoodPlaceForTable}`);
            if (isGoodPlaceForTable) {
                let invisible = this.draw.tables.find(x => x.isHoverSource)!;
                let xDiff = hover!.rect.x - invisible.rect.x;
                let yDiff = hover!.rect.y - invisible.rect.y;
                
                
                invisible.rect = this.draw.transactions.execute(
                    MoveTableTest.name, 
                    {
                        id: invisible.id,
                        x: xDiff, 
                        y: yDiff 
                    },
                    this.draw
                )!;
                invisible.isHoverSource = false;
            } else {
                this.draw.tables.forEach(x => x.isHoverSource = false);
            }

            this.render(false);
            this.viewport.removeAllListeners('mousemove');
            this.viewport.removeAllListeners('mouseout');  
        })
    }

    handleToolChange(toolname: string) {
        let previousTool = this.draw.activeTool;
        this.draw.activeTool = toolname;
        
        switch(previousTool) {
            case "pan":
                this.pausePanning();
                break;
            case "select":
                this.pauseSelect()
                break;
        }
        
        switch(this.draw.activeTool) {
            case "pan":
                this.resumePanning();
                break;
            case "select":
                this.resumeSelect()
                break;
        }
    }
}