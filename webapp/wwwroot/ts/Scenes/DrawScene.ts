import { Viewport } from "pixi-viewport";
import { Container, Graphics, InteractionEvent, Loader, Rectangle } from "pixi.js";
import { IScene, Manager } from "../Manager";
import { Minimap } from "../components/Minimap";
import { Draw } from "../model/Draw";
import * as PIXI from "pixi.js";
import { BottomBar } from "../components/BottomBar";
import { Table } from "../model/Table";
import { CommandMoveTableRelative } from "../commands/appCommands/CommandMoveTableRelative";

export class DrawScene extends Container implements IScene {

    viewport: Viewport;
    minimap: Minimap;
    draw: Draw;
    bottomBar: BottomBar;
    mousemoveListeners: ((x: number, y: number) => void)[] = [];
    
    
    constructor(tables: Table[]) {
        super();

        this.draw = new Draw();
        this.draw.init(tables);

        document.querySelector('#undo')!.addEventListener('click', () => {
            console.log("undo event");
            this.draw.history.undo(this.draw);
            this.renderScreen(false);
        });
        document.querySelector('#redo')!.addEventListener('click', () => {
            console.log("redo event");
            this.draw.history.redo(this.draw);
            this.renderScreen(false);
        });
        document.querySelector('#save-as-png')!.addEventListener('click', () => {
            console.log("save-as-png event");
            Manager.takeScreenshot(this.viewport);
        });
        document.querySelector('#save-to-clipboard')!.addEventListener('click', () => {
            console.log("save-to-clipboard event");
            this.saveToClipboard();
        });

        this.viewport = new Viewport({
            screenHeight: Manager.height,
            screenWidth:  Manager.width,
            worldHeight:  Manager.height * Draw.zoomOut,
            worldWidth:   Manager.width * Draw.zoomOut,

            interaction: Manager.getInteractionManager()
        });
        this.addChild(this.viewport);
        this.initViewport();

        this.minimap = new Minimap()
        this.minimap.init(
            this.getWorld().height, 
            this.getWorld().width, 
            Draw.fontCharSizeWidth, 
            Draw.fontCharSizeHeight, 
            new Rectangle(
                Manager.width - 180 - 20,
                20,
                180,
                120,
            ),
            (x: number, y: number) => { 
                console.log("minimap navigation");
                this.viewport.moveCenter(x, y);
                this.minimap.update(this.draw.getVisibleTables(), this.getScreen()) 
            }
        );
        this.addChild(this.minimap.container);

        this.interactive = true;
        this.on('mousemove', (e: InteractionEvent) => { 
            if (! new Rectangle(0, 0, Manager.width, Manager.height).contains(e.data.global.x, e.data.global.y)) return;  // remove outside events. PIXI is stupid.
            for (const listener of this.mousemoveListeners) {
                listener(Math.floor(e.data.global.x), Math.floor(e.data.global.y))  // no idea why y is someinteger.1999969482422 decimal number 
            }
        });

        this.bottomBar = new BottomBar();
        this.mousemoveListeners.push((x, y) => {
            this.bottomBar.pointermove(x, y);
        });
        this.addChild(this.bottomBar.getContainer());
        this.renderScreen(true);
    }

    saveToClipboard() {
        let charGridSize = this.getWorldCharGrid();
        let sb = [];
        for (let y = 0; y < charGridSize.height; y++) {
            for (let x = 0; x < charGridSize.width; x++) {
                let letter = this.draw.worldDrawArea[y * charGridSize.width + x];
                sb.push(letter);
            }
            sb.push("\n");
        }
        navigator.clipboard.writeText(sb.join(""));
    }

    
    initViewport(enableDrag: boolean = true) {
        // activate plugins
        this.viewport
            .drag({ pressDrag: enableDrag }).clamp({ 
                left:   0,
                top:    0,
                right:  Manager.width * Draw.zoomOut,
                bottom: Manager.height * Draw.zoomOut,
            })
            .wheel().clampZoom({ 
                maxScale: Draw.zoomIn, 
                minScale: 1/Draw.zoomOut
            });

        // make zooming update minimap
        this.viewport.on('wheel', () => {
            console.log("wheel")
            this.minimap.update(this.draw.getVisibleTables(), this.getScreen());
        });

        // make panning update minimap camera indicator location
        this.viewport.on('moved', () => {
            console.log("moved")
            this.cullViewport();
            this.minimap.update(this.draw.getVisibleTables(), this.getScreen());
        })
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
    
    getScreenCharGrid() {
        let screenSize = this.getScreen();
        return new Rectangle(
            Math.floor(screenSize.x / Draw.fontCharSizeWidth),
            Math.floor(screenSize.y / Draw.fontCharSizeHeight),
            Math.ceil(screenSize.width / Draw.fontCharSizeWidth),
            Math.ceil(screenSize.height / Draw.fontCharSizeHeight), 
            );
    }

    getWorldCharGrid() {
        let worldSize = this.getWorld();
        return new Rectangle(
            0,
            0,
            Math.ceil(worldSize.width / Draw.fontCharSizeWidth),
            Math.ceil(worldSize.height / Draw.fontCharSizeHeight), 
        );
    }

    
    cullViewport() {
        let screen = this.getScreen();
        let extraScreen = new Rectangle(
            screen.x - Draw.fontCharSizeWidth, 
            screen.y - Draw.fontCharSizeHeight, 
            screen.width + Draw.fontCharSizeWidth, 
            screen.height + Draw.fontCharSizeHeight
            );
        for (const bitmapText of this.viewport.children) {
            bitmapText.visible = extraScreen.contains(bitmapText.x, bitmapText.y);
            bitmapText.visible = (bitmapText as PIXI.BitmapText).text !== " "; 
        }
    }

    
    renderScreen(isForceScreenReset = true) {
        let charGridSize = this.getWorldCharGrid();
        this.draw.worldDrawArea = new Array(charGridSize.height * charGridSize.width).fill(' ');
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
                            fontName: "Consolas",
                            align: 'right',
                            tint: 0x008000
                        });
                    bitmapText.x = x * Draw.fontCharSizeWidth;
                    bitmapText.y = y * Draw.fontCharSizeHeight;
                    this.viewport.addChild(bitmapText)
                } else {
                    (this.viewport.children[y * screenCharGrid.width + x] as PIXI.Text).text = tile;
                }
            }
        }
        this.cullViewport();
    }

    getWorldPointCanvasIndex(x: number, y: number) {
        return y * this.getWorldCharGrid().width + x;
    }

    setWorldTable(table: Table) {
        let worldCharGridRect = table.getCornerRect();
        for (let x = worldCharGridRect.x; x <= worldCharGridRect.right; x++) {
            for (let y = worldCharGridRect.y; y <= worldCharGridRect.bottom; y++) {
                this.draw.worldDrawArea[this.getWorldPointCanvasIndex(x, y)] = ' ';
            }
        }
        let firstColumnWidth = table.getColumnWidths()[0];
        let secondColumnWidth = table.getColumnWidths()[1];
        let thirdColumnWidth = table.getColumnWidths()[2];
        let rectHead = new Rectangle(worldCharGridRect.x, worldCharGridRect.y, worldCharGridRect.width, 2);
        let rectNameRow = new Rectangle(worldCharGridRect.x, worldCharGridRect.y + 2, firstColumnWidth, worldCharGridRect.height - 2);
        let rectTypeRow = new Rectangle(worldCharGridRect.x + firstColumnWidth, worldCharGridRect.y + 2, secondColumnWidth, worldCharGridRect.height - 2);
        let rectAttributeRow = new Rectangle(worldCharGridRect.x + firstColumnWidth + secondColumnWidth, worldCharGridRect.y + 2, thirdColumnWidth, worldCharGridRect.height - 2);
        if (table.head === "customers") console.log("worldCharGridRect: ", worldCharGridRect);
        let parts = ['+', '-', '+', '|', 'X', '|', '+', '-', '+'];
        this.paintWorld9PatchSafe(rectHead, parts);
        this.paintWorld9PatchSafe(rectNameRow, parts);
        this.paintWorld9PatchSafe(rectTypeRow, parts);
        this.paintWorld9PatchSafe(rectAttributeRow, parts);
        let rectHeadInner = new Rectangle(rectHead.left + 2, rectHead.top + 1, rectHead.width - 4, rectHead.height - 2);
        for (let x = rectHeadInner.x; x <= rectHeadInner.right; x++) {
            for (let y = rectHeadInner.y; y <= rectHeadInner.bottom; y++) {
                let tile = table.head[x - rectHeadInner.x] ?? ' ';
                this.draw.worldDrawArea[this.getWorldPointCanvasIndex(x, y)] = tile;
            }
        }
        let rectNameRowInner = new Rectangle(rectNameRow.left + 2, rectNameRow.top + 1, rectNameRow.width - 4, rectNameRow.height - 2)
        if (table.head === "customers") console.log("rectNameRowInner: ", rectNameRowInner);
        for (let x = rectNameRowInner.x; x <= rectNameRowInner.right; x++) {
            for (let y = rectNameRowInner.y; y <= rectNameRowInner.bottom; y++) {
                let row = table.tableRows[y - rectNameRowInner.y];
                let tile = row.name[x - rectNameRowInner.x] ?? ' ';
                this.draw.worldDrawArea[this.getWorldPointCanvasIndex(x, y)] = tile;
                
            }
        }
        let rectTypeRowInner = new Rectangle(rectTypeRow.left + 2, rectTypeRow.top + 1, rectTypeRow.width - 4, rectTypeRow.height - 2);
        if (table.head === "customers") console.log("rectTypeRowInner: ", rectTypeRowInner);
        for (let x = rectTypeRowInner.x; x <= rectTypeRowInner.right; x++) {
            for (let y = rectTypeRowInner.y; y <= rectTypeRowInner.bottom; y++) {
                let row = table.tableRows[y - rectTypeRowInner.y];
                let tile = row.datatype[x - rectTypeRowInner.x] ?? ' ';
                this.draw.worldDrawArea[this.getWorldPointCanvasIndex(x, y)] = tile;
                
            }
        }
        let rectSpecialRowInner = new Rectangle(rectAttributeRow.left + 2, rectAttributeRow.top + 1, rectAttributeRow.width - 4, rectAttributeRow.height - 2);
        for (let x = rectSpecialRowInner.x; x <= rectSpecialRowInner.right; x++) {
            for (let y = rectSpecialRowInner.y; y <= rectSpecialRowInner.bottom; y++) {
                let row = table.tableRows[y - rectSpecialRowInner.y];
                let tile = row.attributes[x - rectSpecialRowInner.x] ?? ' ';
                this.draw.worldDrawArea[this.getWorldPointCanvasIndex(x, y)] = tile;
                
            }
        }
    }

    
    paintWorld9PatchSafe(rect: Rectangle, _9patch: string[]) {
        let [tl, t, tr, ml, _, mr, bl, b, br] = _9patch;  // skip middle
        let paintWorldPointToScreenSafe = (x: number, y: number, char: string) => {
            if (! this.getWorldCharGrid().contains(x, y)) { return; }
            this.draw.worldDrawArea[this.getWorldPointCanvasIndex(x, y)] = char;
        }
        let paintWorldRectToScreenSafe = (rect: Rectangle, fillchar: string) => {
            for (let y = rect.y; y < rect.bottom; y++) {
                for (let x = rect.x; x < rect.right; x++) {
                    paintWorldPointToScreenSafe(x, y, fillchar);
                } 
            }
        }
        paintWorldRectToScreenSafe(new Rectangle(rect.left, rect.top, 1, 1), tl);
        paintWorldRectToScreenSafe(new Rectangle(rect.x + 1, rect.y, rect.width - 1, 1), t);
        paintWorldRectToScreenSafe(new Rectangle(rect.right, rect.top, 1, 1), tr);
        paintWorldRectToScreenSafe(new Rectangle(rect.x, rect.y + 1, 1, rect.height - 1), ml);
        paintWorldRectToScreenSafe(new Rectangle(rect.right, rect.y + 1, 1, rect.height - 1), mr);
        paintWorldRectToScreenSafe(new Rectangle(rect.left, rect.bottom, 1, 1), bl);
        paintWorldRectToScreenSafe(new Rectangle(rect.x + 1, rect.bottom, rect.width - 1, 1), b);
        paintWorldRectToScreenSafe(new Rectangle(rect.right, rect.bottom, 1, 1), br);
    }


    handleToolChange(toolname: string) {
        let previousTool = this.draw.activeTool;
        this.draw.activeTool = toolname;

        let resumeSelect = () => {
            let mouseMoveFunc = (e: PIXI.InteractionEvent, table: Table, tablePivotX: number, tablePivotY: number) => {
                console.log(`mousemove`);
                console.log(e);
                let x = this.getScreen().x + e.data.global.x / this.viewport.scale.x;
                let y = this.getScreen().y + e.data.global.y / this.viewport.scale.y;
                console.log(`Y: ${y}, X: ${x}`);
                let charGridX = Math.floor(x / Draw.fontCharSizeWidth);
                let charGridY = Math.floor(y / Draw.fontCharSizeHeight);
                let newX = charGridX + tablePivotX
                let newY = charGridY + tablePivotY
                if (table.rect.x === newX && table.rect.y === newY) return;
                table.rect.x = newX;
                table.rect.y = newY;
                this.renderScreen(false)
            };
    
    
            this.viewport.on('mousedown', (e: PIXI.InteractionEvent) => {  // same as addEventListener except type can be specified inside parameter
                console.log("mousedown");
                console.log(e);
                console.log(JSON.stringify(e.data));
                // @ts-ignore
                console.log(JSON.stringify(e.data.originalEvent.clientY));
                console.log(this.getScreen());
                console.log(this.viewport.scale);
                let x = this.getScreen().x + e.data.global.x / this.viewport.scale.x;
                let y = this.getScreen().y + e.data.global.y / this.viewport.scale.y;
                console.log(`Y: ${y}, X: ${x}`);
                let charGridX = Math.floor(x / Draw.fontCharSizeWidth);
                let charGridY = Math.floor(y / Draw.fontCharSizeHeight);
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
                            if (table.rect.intersects(hover.rect)) {
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
                    
                    this.draw.history.execute(new CommandMoveTableRelative(
                        this.draw, {
                            id: invisible.id,
                            x: xDiff, 
                            y: yDiff
                        })
                    );
                    invisible.isHoverSource = false;
                } else {
                    this.draw.tables.forEach(x => x.isHoverSource = false);
                }
    
                this.renderScreen(false);
                this.viewport.removeAllListeners('mousemove');
                this.viewport.removeAllListeners('mouseout');  
            })
        }
        
        switch(previousTool) {
            case "pan":
                // pausePanning
                this.initViewport(false); // viewport is still needed for minimap updating
                break;
            case "select":
                // pauseSelect
                this.viewport.removeAllListeners('mousedown');
                this.viewport.removeAllListeners('mouseup');
                this.viewport.removeAllListeners('mousemove');
                this.viewport.removeAllListeners('mouseout');  
                break;
        }
        
        switch(this.draw.activeTool) {
            case "pan":
                // resumePanning
                this.initViewport(true)
                break;
            case "select":
                resumeSelect()
                break;
        }
    }

    public update(deltaMS: number): void {

    }
}
