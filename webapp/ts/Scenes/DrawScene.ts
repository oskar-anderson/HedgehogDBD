import { Viewport } from "pixi-viewport";
import { BitmapText, Container, Graphics, InteractionEvent, Loader, Point, Rectangle, Sprite } from "pixi.js";
import { IScene, Manager } from "../Manager";
import { Minimap } from "../components/Minimap";
import { Draw } from "../model/Draw";
import * as PIXI from "pixi.js";
import { BottomBar } from "../components/BottomBar";
import { Table } from "../model/Table";
import { Relation } from "../model/Relation";
import { DrawChar } from "../model/DrawChar";
import { Parser } from "../Parser";
import { PanTool } from "../tools/PanTool";
import { SelectTableTool } from "../tools/MoveTableTool";
import { CreateTableTool } from "../tools/CreateTableTool";
import { ScriptingScene } from "./ScriptingScene";
import { IToolManager, IToolNames } from "../tools/ITool";
import { MyRect } from "../MyRect";
import AStarFinderCustom from "../path/AStarFinderCustom";
import { WorldGrid } from "../path/WorldGrid";
import { table } from "console";
import { CostGrid } from "../model/CostGrid";
import { PriorityQueue } from "@datastructures-js/priority-queue";


export class DrawScene extends Container implements IScene {

    viewport: Viewport;
    minimap: Minimap;
    draw: Draw;
    bottomBar: BottomBar;
    
    constructor(draw: Draw) {
        super();

        this.draw = draw;

        this.viewport = this.initViewport();
        this.addChild(this.viewport);
        IToolManager.toolActivate(this.draw, this.draw.activeTool?.getName() ?? IToolNames.pan, { viewport: this.viewport });
        

        this.minimap = new Minimap()
        this.minimap.init(
            this.draw.getWorld().height, 
            this.draw.getWorld().width, 
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
                this.draw.setViewport(this.viewport);
                this.minimap.update(this.draw.getVisibleTables(), this.draw.getScreen());
                this.cullViewport();
            }
        );
        this.addChild(this.minimap.container);

        this.interactive = true;
        this.on('mousemove', (e: InteractionEvent) => { 
            // this is neccessary when using InteractionManager 
            // if (! new Rectangle(0, 0, Manager.width, Manager.height).contains(e.data.global.x, e.data.global.y)) return;  // remove outside events. PIXI is stupid.
            // no idea why y is someinteger.1999969482422 decimal number 
            this.draw.mouseScreenPosition = new Point(this.draw.mouseScreenPositionNext.x, this.draw.mouseScreenPositionNext.y);
            this.draw.mouseScreenPositionNext = new Point(Math.floor(e.data.global.x), Math.floor(e.data.global.y))
        });
        this.on('mousedown', (e: InteractionEvent) => { 
            this.draw.isMouseLeftDown = true;
        });
        this.on('mouseup', (e: InteractionEvent) => { 
            this.draw.isMouseLeftDown = false;
        });

        this.bottomBar = new BottomBar();
        this.addChild(this.bottomBar.getContainer());
        this.renderScreen(true);
    }

    mouseEventHandler(event: MouseEvent): void {
        let rect = (event.currentTarget! as Element).getBoundingClientRect();
        let relativeX = Math.round(event.clientX - rect.x);
        let relativeY = Math.round(event.clientY - rect.y);
        if (this.minimap.minimapRect.contains(relativeX, relativeY)) {
            return;
        }
        this.draw.activeTool?.mouseEventHandler(event);
    }

    init(): void {
        (document.querySelector(".canvas-container")! as HTMLElement).style.display = "block";
        let header = `
        <header style="display: flex; align-items:center; padding: 2px 0">
            <span style="display: flex; justify-content: center; width: 4em">Tools</span>
            <div class="bar btn-group btn-group-toggle">
                <button class="tool-select btn btn-light ${this.draw.activeTool instanceof PanTool ? "active" : ""}" data-tooltype="${IToolNames.pan}">Pan</button>
                <button class="tool-select btn btn-light ${this.draw.activeTool instanceof SelectTableTool ? "active" : ""}" data-tooltype="${IToolNames.select}">Select table</button>
                <button class="tool-select btn btn-light ${this.draw.activeTool instanceof CreateTableTool ? "active" : ""}" data-tooltype="${IToolNames.newTable}">New table</button>
            </div>
        </header>
        `;   
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
        let actions = `
            <header style="display: flex; align-items:center; padding: 2px 0">
                <span style="display: flex; justify-content: center; width: 4em">Actions</span>
                <div class="bar btn-group btn-group-toggle">
                    <button type="button" class="scripting btn btn-light">Go Scripting</button>
                </div>
            </header>
        `;
        document.querySelector(".top-menu-action-container")!.innerHTML =  topMenuActions + header + actions;
        let toolElements = document.querySelectorAll('.tool-select')
        for (const toolEl of toolElements) {
            toolEl.addEventListener('click', () => {
                let selectedTool = (toolEl as HTMLElement).dataset.tooltype! as IToolNames;
                document.querySelectorAll(".tool-select").forEach(x => x.classList.remove("active"));
                toolEl.classList.toggle("active");
                IToolManager.toolActivate(this.draw, selectedTool, { viewport: this.viewport });
                this.renderScreen(false);  // clean up new table hover
            });
        }
        document.querySelector('#undo')!.addEventListener('click', () => {
            console.log("undo event");
            this.draw.history.undo(this.draw);
            this.draw.schema.relations.forEach(relation => relation.isDirty = true);
            this.renderScreen(false);
        });
        document.querySelector('#redo')!.addEventListener('click', () => {
            console.log("redo event");
            this.draw.history.redo(this.draw);
            this.draw.schema.relations.forEach(relation => relation.isDirty = true);
            this.renderScreen(false);
        });
        document.querySelector('#save-as-png')!.addEventListener('click', async () => {
            console.log("save-as-png event");
            ScriptingScene.execute(await fetch('../wwwroot/scripts/takeScreenshot.js').then(x => x.text()), this.draw)
        });
        document.querySelector('#save-to-clipboard')!.addEventListener('click', async () => {
            console.log("save-to-clipboard event");
            ScriptingScene.execute(await fetch('../wwwroot/scripts/saveToClipboard.js').then(x => x.text()), this.draw)
        });
        document.querySelector('#save-as-txt')!.addEventListener('click', async () => {
            console.log("save-as-txt event");
            ScriptingScene.execute(await fetch('../wwwroot/scripts/saveAsTxt.js').then(x => x.text()), this.draw)
        });
        document.querySelector('#import-btn')!.addEventListener('click', () => {
            console.log("import event");
            this.import();
        });
        document.querySelector('.scripting')?.addEventListener('click', () => {
            this.draw.viewportDTO = { 
                viewportLeft: this.draw.getScreen().x, 
                viewportTop: this.draw.getScreen().y, 
                viewportScale: this.draw.getScale(), 
            }
            Manager.changeScene(new ScriptingScene(this.draw));
        })
    }
    destroyHtmlUi(): void {
        document.querySelector(".top-menu-action-container")!.innerHTML = "";
        (document.querySelector(".canvas-container")! as HTMLElement).style.display = "none";
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
        let worldWidth = 3240;
        let worldHeight = 2160;
        let viewport = new Viewport({
            screenHeight: Manager.height,
            screenWidth:  Manager.width,
            worldHeight:  worldHeight,
            worldWidth:   worldWidth,
        });

        // either of these is supposed to prevent event occuring outside canvas element, but they do not seem to work
        // this.viewport.options.divWheel = document.querySelector("canvas")!; 
        // this.viewport.options.interaction = Manager.getRenderer().plugins.interaction
        viewport.setZoom(this.draw.viewportDTO?.viewportScale ?? 1)
        viewport.left = this.draw.viewportDTO?.viewportLeft ?? 0
        viewport.top = this.draw.viewportDTO?.viewportTop ?? 0
        this.draw.setViewport(viewport);
   

        // activate plugins
        viewport
            .drag({ wheel: false }).clamp({ 
                left:   0,
                top:    0,
                right:  worldWidth,
                bottom: worldHeight,
            });
        if (this.draw.activeTool !== null) {
            viewport.plugins.get("drag")!.pause();
        }

        viewport.on('wheel', (e) => {
            let wheelDirection = e.deltaY > 0 ? +1 : -1;
            let possibleZoomLevels = [1/3, 0.4096, 0.512, 0.64, 0.8, 1, 1.25, 1.5625, 2];
            let index =  possibleZoomLevels.indexOf(this.draw.currentZoomScale) + wheelDirection;
            let newScale = possibleZoomLevels[Math.max(0, Math.min(index, possibleZoomLevels.length - 1))]
            this.draw.currentZoomScale = newScale;
            let mouseWorldPosition = this.draw.getMouseWorldPosition();
            this.draw.setScale(this.viewport, newScale);
            let mouseWorldPositionNew = this.draw.getMouseWorldPosition();
            let translation = new Point(
                mouseWorldPositionNew.x - mouseWorldPosition.x,
                mouseWorldPositionNew.y - mouseWorldPosition.y,
            );
            viewport.left -= translation.x;
            viewport.top -= translation.y;
            this.draw.setViewport(viewport);

            this.cullViewport();
        })
        viewport.on('moved', () => {
            console.log("moved")
            this.cullViewport();
        })
        return viewport;
    }

    cullViewport() {
        let screen = this.draw.getScreen();
        let extraScreen = new Rectangle(
            screen.x - Draw.fontCharSizeWidth, 
            screen.y - Draw.fontCharSizeHeight, 
            screen.width + Draw.fontCharSizeWidth, 
            screen.height + Draw.fontCharSizeHeight
            );
        for (const bitmapText of this.viewport.children) {
            if (! extraScreen.contains(bitmapText.x, bitmapText.y)) {
                bitmapText.visible = false;
            } else {
                bitmapText.visible = (bitmapText as PIXI.BitmapText).text !== " "; 
            }
        }
    }

    
    renderScreen(isForceScreenReset: boolean) {
        let charGridSize = this.draw.getWorldCharGrid();
        for (let y = 0; y < charGridSize.height; y++) {
            for (let x = 0; x < charGridSize.width; x++) {
                this.draw.schema.worldDrawArea[y * charGridSize.width + x] = new DrawChar(' ', 0x008000);
            }
        }
        let tables = this.draw.getVisibleTables();
        for (const table of tables) {
            this.setWorldTable(table);
        }
        this.setWorldRelation();
        

        let screenCharGrid = this.draw.getWorldCharGrid();
        let worldCharGridSize = this.draw.getWorldCharGrid();
        if (isForceScreenReset) {
            this.viewport.removeChildren();
        }
        for (let y = 0; y < screenCharGrid.height; y++) {
            for (let x = 0; x < screenCharGrid.width; x++) {
                // console.log(`x: ${x}, y: ${y}, index: ${y * charGridSize.width + x}`);
                let tile = this.draw.schema.worldDrawArea[y * worldCharGridSize.width + x];
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
        return y * this.draw.getWorldCharGrid().width + x;
    }

    setWorldRelation() {
        let worldSize = this.draw.getWorldCharGrid();

        let costGrid = new CostGrid(this.draw);
        for (let table of this.draw.schema.tables) {
            table.updateTableCost(costGrid, worldSize);
        }
        this.draw.schema.relations.filter((relation) => { return relation.isDirty }).forEach((relation) => relation.remove(this.draw))
        this.draw.schema.relations = this.draw.schema.relations.filter((relation) => { return ! relation.isDirty });
        
        for (let relation of this.draw.schema.relations) {
            relation.updateRelationsCost(costGrid, worldSize);
        }

        let references = new PriorityQueue<{ 
            value: { fromTable: Table, fromTablePointA: { x: number, y: number}, toTable: Table}, 
            cost: number
        }>((a: {cost: number}, b: {cost: number}) => { return a.cost < b.cost ? -1 : 1 });   // lowest cost will pop first
        for (let fromTable of this.draw.schema.tables) {
            let fromTableReferences = fromTable.getReferences(this.draw.schema.tables);
            fromTableReferences = fromTableReferences.filter(reference => { // filter out relations already drawn
                let hasMatchingRelation = (this.draw.schema.relations.some((relation) => { 
                    return relation.equals(fromTable, reference); 
                }));
                return !hasMatchingRelation;
            });
            for (const toTable of fromTableReferences) {
                let referenceCenter =  toTable.getContainingRect().getFittingSquareTowardsPoint(fromTable.getContainingRect().getCenter()).getCenter();
                let closestFromTablePoint: { x: number, y: number } | null = null;
                for (let point of fromTable.getContainingRect().GetRelationAttachmentPoints(worldSize)) {
                    if ((closestFromTablePoint === null || 
                        AStarFinderCustom.euclidean(closestFromTablePoint, referenceCenter) > 
                        AStarFinderCustom.euclidean(point, referenceCenter))
                    ) {
                        closestFromTablePoint = point;
                    }
                }
                if (closestFromTablePoint === null) {
                    continue;
                }
                references.push({ 
                    value: { 
                        fromTable: fromTable,
                        fromTablePointA: closestFromTablePoint,
                        toTable:  toTable
                    }, 
                    cost: AStarFinderCustom.euclidean(closestFromTablePoint, referenceCenter)
                });
            }
        }

        while (! references.isEmpty()) {
            let reference = references.pop();
            let fromTable = reference.value.fromTable;
            let toTable = reference.value.toTable;
            let startPoint = reference.value.fromTablePointA;
            let heuristicEndPoint =  toTable.getContainingRect().getFittingSquareTowardsPoint(fromTable.getContainingRect().getCenter()).getCenter();
            let possibleEnds = toTable.getContainingRect().GetRelationAttachmentPoints(worldSize);
            if (toTable.head === fromTable.head) {
                possibleEnds = possibleEnds.filter((end) => { return AStarFinderCustom.euclidean(startPoint!, end) === 10 });
            }
            let grid = new WorldGrid(costGrid.flatten());
            let path = new AStarFinderCustom(AStarFinderCustom.manhattan).findPath(startPoint, heuristicEndPoint, possibleEnds, grid);
            let points = path.map((point) => { return { point: new Point(point.x, point.y), char: "*" }; })
            let relation = new Relation(points, fromTable, toTable)
            relation.updateRelationsCost(costGrid, worldSize);
            this.draw.schema.relations.push(relation);
        }

        for (const relation of this.draw.schema.relations) {
            for (const point of relation.points) {
                this.draw.schema.worldDrawArea[point.point.y * this.draw.getWorldCharGrid().width + point.point.x].char = "*";
            }
        }
    }

    setWorldTable(table: Table) {
        let tableRect = table.getContainingRect();
        for (let x = tableRect.x; x < tableRect.right; x++) {
            for (let y = tableRect.y; y < tableRect.bottom; y++) {
                this.draw.schema.worldDrawArea[this.getWorldPointCanvasIndex(x, y)].char = ' ';
                this.draw.schema.worldDrawArea[this.getWorldPointCanvasIndex(x, y)].color = this.draw.selectedTable?.equals(table) ? 0x800080 : 0x008000;
            }
        }
        let worldCharGridRect = table.getContainingRect();
        let columnWidths = table.getColumnWidths();
        let firstColumnWidth = columnWidths[0];
        let secondColumnWidth = columnWidths[1];
        let thirdColumnWidth = columnWidths[2];
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
                this.draw.schema.worldDrawArea[this.getWorldPointCanvasIndex(x, y)].char = tile;
            }
        }
        let rectNameRowInner = new Rectangle(rectNameRow.left + 2, rectNameRow.top + 1, rectNameRow.width - 4, rectNameRow.height - 2)
        for (let x = rectNameRowInner.x; x <= rectNameRowInner.right; x++) {
            for (let y = rectNameRowInner.y; y <= rectNameRowInner.bottom; y++) {
                let row = table.tableRows[y - rectNameRowInner.y];
                let tile = row.name[x - rectNameRowInner.x] ?? ' ';
                this.draw.schema.worldDrawArea[this.getWorldPointCanvasIndex(x, y)].char = tile;
            }
        }
        let rectTypeRowInner = new Rectangle(rectTypeRow.left + 2, rectTypeRow.top + 1, rectTypeRow.width - 4, rectTypeRow.height - 2);
        for (let x = rectTypeRowInner.x; x <= rectTypeRowInner.right; x++) {
            for (let y = rectTypeRowInner.y; y <= rectTypeRowInner.bottom; y++) {
                let row = table.tableRows[y - rectTypeRowInner.y];
                let tile = row.datatype[x - rectTypeRowInner.x] ?? ' ';
                this.draw.schema.worldDrawArea[this.getWorldPointCanvasIndex(x, y)].char = tile;
            }
        }
        let rectSpecialRowInner = new Rectangle(rectAttributeRow.left + 2, rectAttributeRow.top + 1, rectAttributeRow.width - 4, rectAttributeRow.height - 2);
        for (let x = rectSpecialRowInner.x; x <= rectSpecialRowInner.right; x++) {
            for (let y = rectSpecialRowInner.y; y <= rectSpecialRowInner.bottom; y++) {
                let row = table.tableRows[y - rectSpecialRowInner.y];
                let tile = row.attributes.join(", ")[x - rectSpecialRowInner.x] ?? ' ';
                this.draw.schema.worldDrawArea[this.getWorldPointCanvasIndex(x, y)].char = tile;
            }
        }
    }

    
    paintWorld9PatchSafe(rect: Rectangle, _9patch: string[]) {
        let [tl, t, tr, ml, _, mr, bl, b, br] = _9patch;  // skip middle
        let paintWorldPointToScreenSafe = (x: number, y: number, char: string) => {
            if (! this.draw.getWorldCharGrid().contains(x, y)) { return; }
            this.draw.schema.worldDrawArea[this.getWorldPointCanvasIndex(x, y)].char = char;
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

    public update(deltaMS: number): void {
        this.draw.mouseScreenPosition = new Point(this.draw.mouseScreenPositionNext.x, this.draw.mouseScreenPositionNext.y);
        this.draw.setViewport(this.viewport);
        this.minimap.update(this.draw.getVisibleTables(), this.draw.getScreen());
        this.bottomBar.pointermove(
            this.draw.mouseScreenPosition.x, 
            this.draw.mouseScreenPosition.y, 
            this.draw.getMouseWorldPosition().x,
            this.draw.getMouseWorldPosition().y,
            Math.floor((this.draw.getScreen().x + this.draw.mouseScreenPosition.x / this.draw.getScale()) / Draw.fontCharSizeWidth),
            Math.floor((this.draw.getScreen().y + this.draw.mouseScreenPosition.y / this.draw.getScale()) / Draw.fontCharSizeHeight),
            Number((this.draw.getScale()).toFixed(2))  // x and y is the same
        );
        this.draw.activeTool?.update();
        if (this.draw.activeTool?.getIsDirty()) {
            console.log("renderScreen")
            this.renderScreen(false);
        }
    }
}
