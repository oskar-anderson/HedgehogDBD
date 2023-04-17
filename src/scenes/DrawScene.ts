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
import RasterModelerFormat from "../RasterModelerFormat";
import { Minimap } from "../components/Minimap";
import { MyRect } from "../model/MyRect";
import { useAppStateManagement } from "../Store";
import { AppState } from "../components/MainContent";


export class DrawScene extends Container implements IScene {

    canvasView: Container;
    draw: Draw;
    minimap: Minimap;
    
    constructor() {
        super();
        this.draw = Manager.getInstance().draw;

        this.canvasView = new PIXI.Container();
        this.canvasView.hitArea = this.draw.getWorld();  // needed for events
        this.canvasView.interactive = true;                         // needed for events
        this.addChild(this.canvasView);

        IToolManager.toolActivate(this.draw, this.draw.activeTool.getName());
        
        this.minimap = new Minimap(this.draw, new Rectangle(0, 0, 180, 120))
        this.minimap.init(
            (x: number, y: number) => { 
                console.log(`minimap navigation (x: ${x}, y: ${y})`);
                Manager.getInstance().scrollTo(
                    x - Math.ceil(Manager.getInstance().getScreen().width / 2), 
                    y - Math.ceil(Manager.getInstance().getScreen().height / 2)
                );
                this.cullViewport();
                this.minimap.update(this.draw.getVisibleTables(), Manager.getInstance().getScreen());
            }
        );
        const { canvasSideMinimapContainerRef } = useAppStateManagement();
        canvasSideMinimapContainerRef.current!.innerHTML = "";
        canvasSideMinimapContainerRef.current!.appendChild(this.minimap.app.view);

        this.interactive = true;
        this.on('mousemove', (e: InteractionEvent) => { 
            // this is neccessary when using InteractionManager 
            // if (! new Rectangle(0, 0, Manager.width, Manager.height).contains(e.data.global.x, e.data.global.y)) return;  // remove outside events. PIXI is stupid.
            // no idea why y is someinteger.1999969482422 decimal number 
            this.draw.mouseScreenPosition = new Point(Math.floor(e.data.global.x - Manager.getInstance().getScreen().x), Math.floor(e.data.global.y - Manager.getInstance().getScreen().y));
        });
    }

    getState(): AppState {
        return AppState.DrawScene
    }

    mouseEventHandler(event: MouseEvent): void {
        let rect = (event.currentTarget! as Element).getBoundingClientRect();
        let worldX = Math.round(event.clientX - rect.x);
        let worldY = Math.round(event.clientY - rect.y);
        this.draw.activeTool.mouseEventHandler(event);
    }

    init() {
        const { setIsTopToolbarVisible } = useAppStateManagement();
        setIsTopToolbarVisible(true);
        this.renderScreen(true);
    }

    async import() {
        let reader = new FileReader();
        reader.onload = async (event: ProgressEvent) => {
            let file = (event.target as FileReader).result as string;
            Manager.getInstance().draw = RasterModelerFormat.parse(file); // TODO make sure it still works - changed
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
        let screen = Manager.getInstance().getScreen();
        this.draw.setScreen(new Point(screen.x, screen.y));
        this.minimap.update(this.draw.getVisibleTables(), screen);
        this.draw.activeTool.update();
        if (this.draw.activeTool.isDirty) {
            this.draw.activeTool.isDirty = false;
            this.renderScreen(false);
        }
    }
}
