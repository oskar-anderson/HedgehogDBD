import { Container, InteractionEvent, Point, Rectangle } from "pixi.js";
import { IScene, Manager } from "../Manager";
import { Draw } from "../model/Draw";
import * as PIXI from "pixi.js";
import { Table } from "../model/Table";
import { Relation } from "../model/Relation";
import { DrawChar } from "../model/DrawChar";
import { SelectTableTool } from "../tools/SelectTableTool";
import { CreateTableTool } from "../tools/CreateTableTool";
import { ScriptingScene } from "./ScriptingScene";
import { IToolManager, IToolNames } from "../tools/ITool";
import AStarFinderCustom from "../path/AStarFinderCustom";
import { WorldGrid } from "../path/WorldGrid";
import { CostGrid } from "../model/CostGrid";
import { PriorityQueue } from "@datastructures-js/priority-queue";
import { Schema } from "../model/Schema";
import { Programm } from "../Programm";
import { Minimap } from "../components/Minimap";
import { MyRect } from "../model/MyRect";


export class DrawScene extends Container implements IScene {

    canvasView: Container;
    draw: Draw;
    minimap: Minimap;
    
    constructor(draw: Draw) {
        super();
        this.draw = draw;

        this.canvasView = new PIXI.Container();
        this.canvasView.hitArea = this.draw.getWorld();  // needed for events
        this.canvasView.interactive = true;                         // needed for events
        this.addChild(this.canvasView);

        IToolManager.toolActivate(this.draw, this.draw.activeTool.getName());
        
        this.minimap = new Minimap(this.draw, new Rectangle(0, 0, 180, 120))
        this.minimap.init(
            (x: number, y: number) => { 
                console.log(`minimap navigation (x: ${x}, y: ${y})`);
                Manager.scrollTo(
                    x - Math.ceil(Manager.getScreen().width / 2), 
                    y - Math.ceil(Manager.getScreen().height / 2)
                );
                this.cullViewport();
                this.minimap.update(this.draw.getVisibleTables(), Manager.getScreen());
            }
        );
        document.querySelector(".canvas-side-minimap")!.innerHTML = "";
        document.querySelector(".canvas-side-minimap")!.appendChild(this.minimap.app.view);

        this.interactive = true;
        this.on('mousemove', (e: InteractionEvent) => { 
            // this is neccessary when using InteractionManager 
            // if (! new Rectangle(0, 0, Manager.width, Manager.height).contains(e.data.global.x, e.data.global.y)) return;  // remove outside events. PIXI is stupid.
            // no idea why y is someinteger.1999969482422 decimal number 
            this.draw.mouseScreenPosition = new Point(Math.floor(e.data.global.x - Manager.getScreen().x), Math.floor(e.data.global.y - Manager.getScreen().y));
        });
    }

    mouseEventHandler(event: MouseEvent): void {
        let rect = (event.currentTarget! as Element).getBoundingClientRect();
        let worldX = Math.round(event.clientX - rect.x);
        let worldY = Math.round(event.clientY - rect.y);
        this.draw.activeTool.mouseEventHandler(event);
    }

    async init(): Promise<void> {
        (document.querySelector(".canvas-visibility-container")! as HTMLElement).style.display = "block";
        let topMenuActions = await fetch("./partial/navbar.html", {cache: "no-cache"}).then(x => x.text());
        let tools = `
        <header style="display: flex; align-items:center; flex-direction: column;">

            <!-- https://www.svgrepo.com/svg/361459/cursor-arrow -->
            <button class="tool-select btn btn-light ${this.draw.activeTool instanceof SelectTableTool ? "active" : ""}" data-tooltype="${IToolNames.select}" title="Select/Edit table">
                <svg width="16px" height="16px" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M3.29227 0.048984C3.47033 -0.032338 3.67946 -0.00228214 3.8274 0.125891L12.8587 7.95026C13.0134 8.08432 13.0708 8.29916 13.0035 8.49251C12.9362 8.68586 12.7578 8.81866 12.5533 8.82768L9.21887 8.97474L11.1504 13.2187C11.2648 13.47 11.1538 13.7664 10.9026 13.8808L8.75024 14.8613C8.499 14.9758 8.20255 14.8649 8.08802 14.6137L6.15339 10.3703L3.86279 12.7855C3.72196 12.934 3.50487 12.9817 3.31479 12.9059C3.1247 12.8301 3 12.6461 3 12.4414V0.503792C3 0.308048 3.11422 0.130306 3.29227 0.048984ZM4 1.59852V11.1877L5.93799 9.14425C6.05238 9.02363 6.21924 8.96776 6.38319 8.99516C6.54715 9.02256 6.68677 9.12965 6.75573 9.2809L8.79056 13.7441L10.0332 13.178L8.00195 8.71497C7.93313 8.56376 7.94391 8.38824 8.03072 8.24659C8.11753 8.10494 8.26903 8.01566 8.435 8.00834L11.2549 7.88397L4 1.59852Z" fill="#000000"/>
                </svg>
            </button>

            <!-- https://www.svgrepo.com/svg/377078/table-plus -->
            <button class="tool-select btn btn-light ${this.draw.activeTool instanceof CreateTableTool ? "active" : ""}" data-tooltype="${IToolNames.newTable}" title="New table">
                <svg width="16px" height="16px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
                    <path stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2M3 8v6m0-6h6m12 0v4m0-4H9m-6 6v4a2 2 0 0 0 2 2h4m-6-6h6m0-6v6m0 0h4a2 2 0 0 0 2-2V8m-6 6v6m0 0h2m7-5v3m0 0v3m0-3h3m-3 0h-3"/>
                </svg>
            </button>

            <button id="undo" class="btn btn-light" title="Undo">
                <svg fill="#000000" height="16px" viewBox="0 0 24 24" width="16px" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"></path><path class="icon inactive" d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"></path></svg>
            </button>

            <button id="redo" class="btn btn-light" title="Redo">
                <svg fill="#000000" height="16px" viewBox="0 0 24 24" width="16px" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"></path><path class="icon inactive" d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"></path></svg>
            </button>
 
        </header>
        `;
        document.querySelector(".top-menu-action-container")!.innerHTML = topMenuActions;
        document.querySelector(".canvas-side-tools")!.innerHTML = tools;
        document.querySelector(".zoom-font-size")!.addEventListener("change", (e) => {
            let size = Number.parseInt((e.target as HTMLSelectElement).value);
            let centerScreenOriginalXPercent = Manager.getScreen().getCenter().x / this.draw.getWorld().width;
            let centerScreenOriginalYPercent = Manager.getScreen().getCenter().y / this.draw.getWorld().height;
            let widthCharGridOriginal = this.draw.getWorldCharGrid().width;
            let heightCharGridOriginal = this.draw.getWorldCharGrid().height;
            this.draw.selectedFontSize = Draw.fontSizes.find(x => x.size === size)!;
            let widthWorldResize = widthCharGridOriginal * this.draw.selectedFontSize.width;
            let heightWorldResize = heightCharGridOriginal * this.draw.selectedFontSize.height;
            Manager.getRenderer().resize(widthWorldResize, heightWorldResize);
            this.draw.setWorld(new MyRect(0, 0, widthWorldResize, heightWorldResize))
            let centerScreenResizeXPercent = Manager.getScreen().getCenter().x / this.draw.getWorld().width;
            let centerScreenResizeYPercent = Manager.getScreen().getCenter().y / this.draw.getWorld().height;
            Manager.scrollTo(
                Manager.getScreen().x + this.draw.getWorld().width * (centerScreenOriginalXPercent - centerScreenResizeXPercent),
                Manager.getScreen().y + this.draw.getWorld().height * (centerScreenOriginalYPercent - centerScreenResizeYPercent),
            );
            this.renderScreen(true);
        }) 
        let toolElements = document.querySelectorAll('.tool-select')
        for (const toolEl of toolElements) {
            toolEl.addEventListener('click', () => {
                let selectedTool = (toolEl as HTMLElement).dataset.tooltype! as IToolNames;
                document.querySelectorAll(".tool-select").forEach(x => x.classList.remove("active"));
                toolEl.classList.toggle("active");
                IToolManager.toolActivate(this.draw, selectedTool);
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
        document.querySelector('#new-schema')!.addEventListener('click', () => {
            Manager.changeScene(new DrawScene(new Draw(new Schema([], []), this.draw.getWorld(), this.draw.getScreenPosition())));
        })
        document.querySelector('#save-as-png')!.addEventListener('click', async () => {
            console.log("save-as-png event");
            ScriptingScene.executeWithLog(await fetch('../wwwroot/scripts/takeScreenshot.js', {cache: "no-cache"}).then(x => x.text()), this.draw)
        });
        document.querySelector('#save-to-clipboard')!.addEventListener('click', async () => {
            console.log("save-to-clipboard event");
            ScriptingScene.executeWithLog(await fetch('../wwwroot/scripts/saveToClipboard.js', {cache: "no-cache"}).then(x => x.text()), this.draw)
        });
        document.querySelector('#save-as-txt')!.addEventListener('click', async () => {
            console.log("save-as-txt event");
            ScriptingScene.executeWithLog(await fetch('../wwwroot/scripts/saveAsTxt.js', {cache: "no-cache"}).then(x => x.text()), this.draw)
        });
        document.querySelector('#import-btn')!.addEventListener('click', () => {
            console.log("import event");
            this.import();
        });
        document.querySelector('.nav-scripting')?.addEventListener('click', () => {
            Manager.changeScene(new ScriptingScene(this.draw));
        });
        this.renderScreen(true);
    }
    destroyHtmlUi(): void {
        document.querySelector(".top-menu-action-container")!.innerHTML = "";
        (document.querySelector(".canvas-visibility-container")! as HTMLElement).style.display = "none";
    }

    async import() {
        let reader = new FileReader();
        reader.onload = async (event: ProgressEvent) => {
            let file = (event.target as FileReader).result as string;
            Manager.changeScene(new DrawScene(Programm.parse(file)))
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


    cullViewport() {
        for (const bitmapText of this.canvasView.children) {
            bitmapText.visible = (bitmapText as PIXI.BitmapText).text !== " "; 
        }
    }

    
    renderScreen(isForceScreenReset: boolean) {
        let charGridSize = this.draw.getWorldCharGrid();
        for (let y = 0; y < charGridSize.height; y++) {
            for (let x = 0; x < charGridSize.width; x++) {
                this.draw.schema.worldDrawArea[y * charGridSize.width + x] = new DrawChar(' ', 0x000000);
            }
        }
        this.setWorldTables();
        this.setWorldRelation();
        

        let screenCharGrid = this.draw.getWorldCharGrid();
        let worldCharGridSize = this.draw.getWorldCharGrid();
        if (isForceScreenReset) {
            this.canvasView.removeChildren();
        }
        for (let y = 0; y < screenCharGrid.height; y++) {
            for (let x = 0; x < screenCharGrid.width; x++) {
                // console.log(`x: ${x}, y: ${y}, index: ${y * charGridSize.width + x}`);
                let tile = this.draw.schema.worldDrawArea[y * worldCharGridSize.width + x];
                if (isForceScreenReset) {
                    let bitmapText = new PIXI.BitmapText(tile.char,
                        {
                            fontName: "Consolas",
                            fontSize: this.draw.selectedFontSize.size,
                            tint: tile.color,
                        });
                    bitmapText.x = x * this.draw.selectedFontSize.width;
                    bitmapText.y = y * this.draw.selectedFontSize.height;
                    this.canvasView.addChild(bitmapText)
                } else {
                    (this.canvasView.children[y * screenCharGrid.width + x] as PIXI.Text).text = tile.char;
                    (this.canvasView.children[y * screenCharGrid.width + x] as PIXI.Text).tint = tile.color;
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

    setWorldTables() {
        let tableRect = this.draw.selectedTable?.getContainingRect() ?? new Rectangle();
        for (let x = tableRect.x; x < tableRect.right; x++) {
            for (let y = tableRect.y; y < tableRect.bottom; y++) {
                this.draw.schema.worldDrawArea[this.getWorldPointCanvasIndex(x, y)].color = 0x800080;
            }
        }
        for (const table of this.draw.getVisibleTables()) {
            this.setWorldTable(table);
        }
    }

    setWorldTable(table: Table) {
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
        let screen = Manager.getScreen();
        this.draw.setScreen(new Point(screen.x, screen.y));
        this.minimap.update(this.draw.getVisibleTables(), screen);
        document.querySelector(".debug-info")!.innerHTML = `
            <div>
                Sx: ${this.draw.mouseScreenPosition.x}, Sy: ${this.draw.mouseScreenPosition.y}
            </div>
            <div>
                Wx: ${this.draw.getScreenToWorldPoint2(this.draw.mouseScreenPosition).x}, Wy: ${this.draw.getScreenToWorldPoint2(this.draw.mouseScreenPosition).y}
            </div>
            <div>
                WCx: ${this.draw.getScreenToCharGridPoint2(this.draw.mouseScreenPosition).x}, WCy: ${this.draw.getScreenToCharGridPoint2(this.draw.mouseScreenPosition).y}
            </div>
        `;
        this.draw.activeTool.update();
        if (this.draw.activeTool.isDirty) {
            this.draw.activeTool.isDirty = false;
            this.renderScreen(false);
        }
    }
}
