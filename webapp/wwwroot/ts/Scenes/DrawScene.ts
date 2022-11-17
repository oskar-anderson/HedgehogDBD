import { Viewport } from "pixi-viewport";
import { BitmapText, Container, Graphics, InteractionEvent, Loader, Point, Rectangle, Sprite } from "pixi.js";
import { IScene, Manager } from "../Manager";
import { Minimap } from "../components/Minimap";
import { Draw } from "../model/Draw";
import * as PIXI from "pixi.js";
import { BottomBar } from "../components/BottomBar";
import { Table } from "../model/Table";
import { CommandMoveTableRelative } from "../commands/appCommands/CommandMoveTableRelative";
import { Schema } from "../model/Schema";
import { Relation } from "../model/Relation";
import { DrawChar } from "../model/DrawChar";
import { LoaderScene } from "./LoaderScene";
import { TableScene } from "./TableScene";
import { Parser } from "../Parser";
import { TableHoverPreview } from "../model/tableHoverPreview";

export class DrawScene extends Container implements IScene {

    viewport: Viewport;
    minimap: Minimap;
    draw: Draw;
    bottomBar: BottomBar;
    
    constructor(draw: Draw) {
        super();

        this.draw = draw;

        this.viewport = new Viewport({
            screenHeight: Manager.height,
            screenWidth:  Manager.width,
            worldHeight:  Manager.height * Draw.zoomOut,
            worldWidth:   Manager.width * Draw.zoomOut,
        });
        this.viewport.setZoom(this.draw.transferData?.viewportScaleX ?? 1)
        this.viewport.left = this.draw.transferData?.viewportLeft ?? 0
        this.viewport.top = this.draw.transferData?.viewportTop ?? 0
        this.initViewport();
        this.addChild(this.viewport);

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
        this.viewport.on('mousemove', (e: InteractionEvent) => { 
            if (! new Rectangle(0, 0, Manager.width, Manager.height).contains(e.data.global.x, e.data.global.y)) return;  // remove outside events. PIXI is stupid.
            // no idea why y is someinteger.1999969482422 decimal number 
            this.draw.mouseScreenPosition = new Point(Math.floor(e.data.global.x), Math.floor(e.data.global.y))
        });
        this.on('mousedown', (e: InteractionEvent) => { 
            this.draw.isMouseLeftDown = true;
        });
        this.on('mouseup', (e: InteractionEvent) => { 
            this.draw.isMouseLeftDown = false;
        });

        this.bottomBar = new BottomBar(this.getScreen());
        this.addChild(this.bottomBar.getContainer());
        this.toolActivate(this.draw.activeTool);
        this.renderScreen(true);
        console.log(this.draw.activeTool)
    }

    initHtmlUi(): void {
        let header = `
        <header style="display: flex; align-items:center; padding: 2px 0">
            <span style="display: flex; justify-content: center; width: 4em">Tools</span>
            <div class="bar btn-group btn-group-toggle">
                <button class="tool-select btn btn-light ${this.draw.activeTool === "pan" ? "active" : ""}" data-tooltype="pan">Pan</button>
                <button class="tool-select btn btn-light ${this.draw.activeTool === "select" ? "active" : ""}" data-tooltype="select">Move table</button>
                <button class="tool-select btn btn-light ${this.draw.activeTool === "editTable" ? "active" : ""}" data-tooltype="editTable">Edit table</button>
                <button class="tool-select btn btn-light ${this.draw.activeTool === "newTable" ? "active" : ""}" data-tooltype="newTable">New table</button>
                <button class="tool-select btn btn-light ${this.draw.activeTool === "newRelation" ? "active" : ""}" data-tooltype="newRelation">New relation</button>
            </div>
        </header>
        `;
        document.querySelector(".tool-select-container")!.innerHTML = header;
        let toolElements = document.querySelectorAll('.tool-select')
        for (const toolEl of toolElements) {
            toolEl.addEventListener('click', () => {
                let selectedTool = (toolEl as HTMLElement).dataset.tooltype!;
                document.querySelectorAll(".tool-select").forEach(x => x.classList.remove("active"));
                toolEl.classList.toggle("active");
                this.handleToolChange(selectedTool)
            });
        }
            
        let topMenuActions = `
        <div>

            <!-- File -->
            <header style="display: flex; align-items: center; padding: 2px 0;">
                <span style="display: flex; justify-content: center; width: 4em">File</span>
                <div class="bar">
                    <button id="save-as-txt" class="btn btn-light">
                        <svg id="saveButton" fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path class="icon" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"></path><path d="M0 0h24v24H0z" fill="none"></path></svg>
                        Export TXT
                    </button>
                    
                    <!-- https://www.svgrepo.com/svg/357887/image-download -->
                    <button id="save-as-png" class="btn btn-light">
                        <svg width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.71,6.29a1,1,0,0,0-1.42,0L20,7.59V2a1,1,0,0,0-2,0V7.59l-1.29-1.3a1,1,0,0,0-1.42,1.42l3,3a1,1,0,0,0,.33.21.94.94,0,0,0,.76,0,1,1,0,0,0,.33-.21l3-3A1,1,0,0,0,22.71,6.29ZM19,13a1,1,0,0,0-1,1v.38L16.52,12.9a2.79,2.79,0,0,0-3.93,0l-.7.7L9.41,11.12a2.85,2.85,0,0,0-3.93,0L4,12.6V7A1,1,0,0,1,5,6h8a1,1,0,0,0,0-2H5A3,3,0,0,0,2,7V19a3,3,0,0,0,3,3H17a3,3,0,0,0,3-3V14A1,1,0,0,0,19,13ZM5,20a1,1,0,0,1-1-1V15.43l2.9-2.9a.79.79,0,0,1,1.09,0l3.17,3.17,0,0L15.46,20Zm13-1a.89.89,0,0,1-.18.53L13.31,15l.7-.7a.77.77,0,0,1,1.1,0L18,17.21Z"/></svg>
                        Export PNG
                    </button>
                    
                    <!-- https://www.svgrepo.com/svg/357606/copy -->
                    <button id="save-to-clipboard" class="btn btn-light">
                        <svg width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21,8.94a1.31,1.31,0,0,0-.06-.27l0-.09a1.07,1.07,0,0,0-.19-.28h0l-6-6h0a1.07,1.07,0,0,0-.28-.19.32.32,0,0,0-.09,0A.88.88,0,0,0,14.05,2H10A3,3,0,0,0,7,5V6H6A3,3,0,0,0,3,9V19a3,3,0,0,0,3,3h8a3,3,0,0,0,3-3V18h1a3,3,0,0,0,3-3V9S21,9,21,8.94ZM15,5.41,17.59,8H16a1,1,0,0,1-1-1ZM15,19a1,1,0,0,1-1,1H6a1,1,0,0,1-1-1V9A1,1,0,0,1,6,8H7v7a3,3,0,0,0,3,3h5Zm4-4a1,1,0,0,1-1,1H10a1,1,0,0,1-1-1V5a1,1,0,0,1,1-1h3V7a3,3,0,0,0,3,3h3Z"/></svg>
                        Export clipboard
                    </button>
                    
                    <button id="import-btn" class="btn btn-light">
                        <svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"></path><path class="icon" d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"></path></svg>
                        Import
                    </button>

                </div>
            </header>

            <!-- Edit -->
            <header style="display: flex; align-items: center; padding: 2px 0;">
                <span style="display: flex; justify-content: center; width: 4em">Edit</span>
                <div class="bar">
                    <button id="undo" class="btn btn-light">
                        <svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"></path><path class="icon inactive" d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"></path></svg>
                        Undo
                    </button>

                    <button id="redo" class="btn btn-light">
                        <svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"></path><path class="icon inactive" d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"></path></svg>
                        Redo
                    </button>
                </div>
            </header>
        </div>
        `;
        document.querySelector(".top-menu-action-container")!.innerHTML = topMenuActions;
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
        document.querySelector('#save-as-txt')!.addEventListener('click', () => {
            console.log("save-as-txt event");
            this.saveAsTxt();
        });
        document.querySelector('#import-btn')!.addEventListener('click', () => {
            console.log("import event");
            this.import();
        });
    }
    destroyHtmlUi(): void {
        document.querySelector(".tool-select-container")!.innerHTML = "";
        document.querySelector(".top-menu-action-container")!.innerHTML = "";
    }

    saveToClipboard() {
        navigator.clipboard.writeText(this.getSaveContent());
    }

    getSaveContent() {
        let charGridSize = this.getWorldCharGrid();
        let sb = [];
        for (let y = 0; y < charGridSize.height; y++) {
            for (let x = 0; x < charGridSize.width; x++) {
                let letter = this.draw.worldDrawArea[y * charGridSize.width + x].char;
                sb.push(letter);
            }
            sb.push("\n");
        }
        return sb.join("");
    }

    saveAsTxt() {
        let element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(this.getSaveContent()));
        let date = new Date();
        element.setAttribute('download', 
            `RasterModeler_${
                date.getFullYear() + "-" + 
                date.getMonth().toString().padStart(2, '0') + "-" + 
                date.getDay().toString().padStart(2, '0') + "_" + 
                date.getDay().toString().padStart(2, '0') + "-" + 
                date.getMinutes().toString().padStart(2, '0') + "-" + 
                date.getSeconds().toString().padStart(2, '0') 
            }.txt`);
      
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    import() {
        let reader = new FileReader();
        reader.onload = function(event: ProgressEvent) {
            // Both of these work: 
            // * this.result
            // * (event.target as FileReader).result
            let file = this.result as string;
            Manager.changeScene(new DrawScene(new Parser().parse(file)))
        }
        let startReadingFile = (thisElement: HTMLInputElement) => {
            let inputFile = thisElement.files![0];
            reader.readAsText(inputFile);
        }
        let input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt';
        input.addEventListener("change", () => startReadingFile(input));
        input.click();
    }

    
    initViewport() {
        // activate plugins
        this.viewport
            .drag().clamp({ 
                left:   0,
                top:    0,
                right:  Manager.width * Draw.zoomOut,
                bottom: Manager.height * Draw.zoomOut,
            })
            .wheel().clampZoom({ 
                maxScale: Draw.zoomIn, 
                minScale: 1/Draw.zoomOut
            });

        // make panning update minimap camera indicator location
        this.viewport.on('moved', () => {
            console.log("moved")
            this.cullViewport();
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

    
    renderScreen(isForceScreenReset: boolean) {
        let charGridSize = this.getWorldCharGrid();
        for (let y = 0; y < charGridSize.height; y++) {
            for (let x = 0; x < charGridSize.width; x++) {
                this.draw.worldDrawArea[y * charGridSize.width + x] = new DrawChar(' ', 0x008000);
            }
        }
        let tables = this.draw.getVisibleTables();
        for (const table of tables) {
            this.setWorldTable(table);
        }
        for (const relation of this.draw.schema.relations) {
            this.setWorldRelation(relation);
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
                    let bitmapText = new PIXI.BitmapText(tile.char,
                        {
                            fontName: "Consolas",
                            align: 'right',
                            tint: tile.color
                        });
                    bitmapText.x = x * Draw.fontCharSizeWidth;
                    bitmapText.y = y * Draw.fontCharSizeHeight;
                    this.viewport.addChild(bitmapText)
                } else {
                    (this.viewport.children[y * screenCharGrid.width + x] as PIXI.Text).text = tile.char;
                    (this.viewport.children[y * screenCharGrid.width + x] as PIXI.Text).tint = tile.color;
                }
            }
        }
        this.cullViewport();
    }

    getWorldPointCanvasIndex(x: number, y: number) {
        return y * this.getWorldCharGrid().width + x;
    }

    setWorldRelation(relation: Relation) {
        for (const point of relation.points) {
            this.draw.worldDrawArea[point.point.y * this.getWorldCharGrid().width + point.point.x].char = point.char;
        }
    }

    setWorldTable(table: Table) {
        let tableRect = table.getContainingRect();
        for (let x = tableRect.x; x < tableRect.right; x++) {
            for (let y = tableRect.y; y < tableRect.bottom; y++) {
                this.draw.worldDrawArea[this.getWorldPointCanvasIndex(x, y)].char = ' ';
                this.draw.worldDrawArea[this.getWorldPointCanvasIndex(x, y)].color = this.draw.selectedTable?.id === table.id ? 0x800080 : 0x008000;
            }
        }
        let worldCharGridRect = table.getContainingRect();
        let firstColumnWidth = table.getColumnWidths()[0];
        let secondColumnWidth = table.getColumnWidths()[1];
        let thirdColumnWidth = table.getColumnWidths()[2];
        let rectHead = new Rectangle(worldCharGridRect.x, worldCharGridRect.y, worldCharGridRect.width - 1, 2);
        let rectNameRow = new Rectangle(worldCharGridRect.x, worldCharGridRect.y + 2, firstColumnWidth, worldCharGridRect.height - 1 - 2);
        let rectTypeRow = new Rectangle(worldCharGridRect.x + firstColumnWidth, worldCharGridRect.y + 2, secondColumnWidth, worldCharGridRect.height - 1 - 2);
        let rectAttributeRow = new Rectangle(worldCharGridRect.x + firstColumnWidth + secondColumnWidth, worldCharGridRect.y + 2, thirdColumnWidth, worldCharGridRect.height - 1 - 2);
        // console.log(table.head)
        // console.log(rectHead)
        // console.log(rectNameRow)
        // console.log(rectTypeRow)
        // console.log(rectAttributeRow)
        let parts = ['+', '-', '+', '|', 'X', '|', '+', '-', '+'];
        this.paintWorld9PatchSafe(rectHead, parts);
        this.paintWorld9PatchSafe(rectNameRow, parts);
        this.paintWorld9PatchSafe(rectTypeRow, parts);
        this.paintWorld9PatchSafe(rectAttributeRow, parts);
        let rectHeadInner = new Rectangle(rectHead.left + 2, rectHead.top + 1, rectHead.width - 4, rectHead.height - 2);
        for (let x = rectHeadInner.x; x <= rectHeadInner.right; x++) {
            for (let y = rectHeadInner.y; y <= rectHeadInner.bottom; y++) {
                let tile = table.head[x - rectHeadInner.x] ?? ' ';
                this.draw.worldDrawArea[this.getWorldPointCanvasIndex(x, y)].char = tile;
            }
        }
        let rectNameRowInner = new Rectangle(rectNameRow.left + 2, rectNameRow.top + 1, rectNameRow.width - 4, rectNameRow.height - 2)
        for (let x = rectNameRowInner.x; x <= rectNameRowInner.right; x++) {
            for (let y = rectNameRowInner.y; y <= rectNameRowInner.bottom; y++) {
                let row = table.tableRows[y - rectNameRowInner.y];
                let tile = row.name[x - rectNameRowInner.x] ?? ' ';
                this.draw.worldDrawArea[this.getWorldPointCanvasIndex(x, y)].char = tile;
            }
        }
        let rectTypeRowInner = new Rectangle(rectTypeRow.left + 2, rectTypeRow.top + 1, rectTypeRow.width - 4, rectTypeRow.height - 2);
        for (let x = rectTypeRowInner.x; x <= rectTypeRowInner.right; x++) {
            for (let y = rectTypeRowInner.y; y <= rectTypeRowInner.bottom; y++) {
                let row = table.tableRows[y - rectTypeRowInner.y];
                let tile = row.datatype[x - rectTypeRowInner.x] ?? ' ';
                this.draw.worldDrawArea[this.getWorldPointCanvasIndex(x, y)].char = tile;
            }
        }
        let rectSpecialRowInner = new Rectangle(rectAttributeRow.left + 2, rectAttributeRow.top + 1, rectAttributeRow.width - 4, rectAttributeRow.height - 2);
        for (let x = rectSpecialRowInner.x; x <= rectSpecialRowInner.right; x++) {
            for (let y = rectSpecialRowInner.y; y <= rectSpecialRowInner.bottom; y++) {
                let row = table.tableRows[y - rectSpecialRowInner.y];
                let tile = row.attributes.join(", ")[x - rectSpecialRowInner.x] ?? ' ';
                this.draw.worldDrawArea[this.getWorldPointCanvasIndex(x, y)].char = tile;
            }
        }
    }

    
    paintWorld9PatchSafe(rect: Rectangle, _9patch: string[]) {
        let [tl, t, tr, ml, _, mr, bl, b, br] = _9patch;  // skip middle
        let paintWorldPointToScreenSafe = (x: number, y: number, char: string) => {
            if (! this.getWorldCharGrid().contains(x, y)) { return; }
            this.draw.worldDrawArea[this.getWorldPointCanvasIndex(x, y)].char = char;
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
        console.log(previousTool);
        console.log(toolname);
        this.toolDisable(previousTool);
        this.toolActivate(this.draw.activeTool);
    }

    toolDisable(previousTool: string) {
        this.draw.selectedTable = null;
        this.renderScreen(false)
        // disable Panning 
        // @ts-ignore
        this.viewport.plugins.get("drag")!.options.pressDrag = false;
        switch(previousTool) {
            case "pan":
                break;
            case "select":
                // pauseSelect
                this.viewport.removeListener('mousedown', this.mouseDown);
                this.viewport.removeListener('mouseup', this.selectToolMouseUp);
                this.viewport.removeListener('mousemove', this.selectToolMouseMove);
                this.viewport.removeListener('mouseout', this.selectToolMouseOut);
                break;
            case "editTable":
                break;
        }
    }


    selectToolMouseMove = (e: PIXI.InteractionEvent) => {
        console.log(`mousemove`);
        console.log(JSON.parse(JSON.stringify(e.data.global)));
        if (! this.draw.hover) return;
        let x = this.getScreen().x + e.data.global.x / this.viewport.scale.x;
        let y = this.getScreen().y + e.data.global.y / this.viewport.scale.y;
        let charGridX = Math.floor(x / Draw.fontCharSizeWidth);
        let charGridY = Math.floor(y / Draw.fontCharSizeHeight);
        let newX = charGridX + this.draw.hover.hoverTablePivotX;
        let newY = charGridY + this.draw.hover.hoverTablePivotY;
        if (this.draw.hover.hoverTable!.position.x === newX && this.draw.hover.hoverTable!.position.y === newY) return;
        this.draw.hover.hoverTable!.position.x = newX;
        this.draw.hover.hoverTable!.position.y = newY;
        this.renderScreen(false)
    };

    selectToolMouseOut = () => {
        console.log("mouseout");
        this.viewport.removeListener('mousemove', this.selectToolMouseMove);
        this.viewport.removeListener('mouseout', this.selectToolMouseOut);  
    }

    mouseDown = (e: PIXI.InteractionEvent) => {  // same as addEventListener except type can be specified inside parameter
        console.log("mousedown");
        console.log(JSON.parse(JSON.stringify(e.data.global)));
        let x = this.getScreen().x + e.data.global.x / this.viewport.scale.x;
        let y = this.getScreen().y + e.data.global.y / this.viewport.scale.y;
        let charGridX = Math.floor(x / Draw.fontCharSizeWidth);
        let charGridY = Math.floor(y / Draw.fontCharSizeHeight);
        for (let table of this.draw.schema.tables) {
            if (table.getContainingRect().contains(charGridX, charGridY)) {
                let hover = Table.initClone(table);
                hover.initNewId();
                this.draw.selectedTable = hover;
                this.draw.hover = new TableHoverPreview(hover, table, table.position.x - charGridX, table.position.y - charGridY);
                this.viewport.on('mousemove', this.selectToolMouseMove);
                this.viewport.on('mouseout', this.selectToolMouseOut);
            }
        }
        if (this.draw.hover !== null) {
            this.draw.schema.tables.push(this.draw.hover.hoverTable);
            this.renderScreen(false);
        }
    }

    selectToolMouseUp = (e: PIXI.InteractionEvent) => {  // same as addEventListener except type can be specified inside parameter
        console.log("mouseup");
        let isGoodPlaceForTableFunc = () => {
            if (this.draw.hover !== null) {
                let hoverRect = this.draw.hover.hoverTable.getContainingRect();
                return this.draw.schema.tables
                    .filter(x => x.id !== this.draw.hover!.hoverTable?.id && x.id !== this.draw.hover!.hoverTableSource?.id)
                    .every(x => !x.getContainingRect().intersects(hoverRect))
            }
            return false
        }
        this.draw.schema.tables = this.draw.schema.tables.filter(x => x.id !== this.draw.hover?.hoverTable?.id);
        let isGoodPlaceForTable = isGoodPlaceForTableFunc();
        console.log(`isGoodPlaceForTable: ${isGoodPlaceForTable}`);
        if (isGoodPlaceForTable) {
            let hoverSource = this.draw.hover!.hoverTableSource;
            let xDiff = this.draw.hover!.hoverTable.position.x - hoverSource.position.x;
            let yDiff = this.draw.hover!.hoverTable.position.y - hoverSource.position.y;
            
            this.draw.history.execute(new CommandMoveTableRelative(
                this.draw, {
                    id: hoverSource.id,
                    x: xDiff, 
                    y: yDiff
                })
            );
        }
        this.draw.hover = null;
        this.draw.selectedTable = null;

        this.renderScreen(false);
        this.viewport.removeListener('mousemove', this.selectToolMouseMove);
        this.viewport.removeListener('mouseout', this.selectToolMouseOut);  
    }
    

    toolActivate(tool: string) {
        switch(tool) {
            case "pan":
                // enable Panning 
                // @ts-ignore
                this.viewport.plugins.get("drag")!.options.pressDrag = true;
                break;
            case "select":
                // pointerdown unlike mousedown captures right click as well
                this.viewport.on('mousedown', this.mouseDown)
                this.viewport.on('mouseup', this.selectToolMouseUp)
                break;
            case "editTable":
                break;
        }
    }

    public update(deltaMS: number): void {
        this.minimap.update(this.draw.getVisibleTables(), this.getScreen());
        this.bottomBar.pointermove(this.draw.mouseScreenPosition.x, this.draw.mouseScreenPosition.y, this.getScreen());
        switch (this.draw.activeTool) {
            case "editTable":
                if (! this.draw.isMouseLeftDown) break;
                console.log("update editTable")
                this.draw.isMouseLeftDown = false;
                let x = this.getScreen().x + this.draw.mouseScreenPosition.x / this.viewport.scale.x;
                let y = this.getScreen().y + this.draw.mouseScreenPosition.y / this.viewport.scale.y;
                let charGridX = Math.floor(x / Draw.fontCharSizeWidth);
                let charGridY = Math.floor(y / Draw.fontCharSizeHeight);
                console.log("this.draw.mouseWorldPosition.x: ", this.draw.mouseScreenPosition.x, ", this.draw.mouseWorldPosition.y: ", this.draw.mouseScreenPosition.y)
                console.log("charGridX: ", charGridX, ", charGridY: ", charGridY)
                for (let table of this.draw.schema.tables) {
                    if (table.getContainingRect().contains(charGridX, charGridY)) {
                        this.draw.selectedTable = table;
                        this.draw.transferData = { 
                            viewportLeft: this.viewport.left, 
                            viewportTop: this.viewport.top, 
                            viewportScaleX: this.viewport.scale.x, 
                            viewportScaleY: this.viewport.scale.y, 
                        }
                        Manager.changeScene(new TableScene(this.draw))
                    }
                }
                break;
            default:
                break;
        }
    }
}
