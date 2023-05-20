import { BitmapText, Container, InteractionEvent, Point, Rectangle } from "pixi.js";
import { IScene, Manager } from "../Manager";
import { Draw } from "../model/Draw";
import * as PIXI from "pixi.js";
import { Table } from "../model/Table";
import { Relation } from "../model/Relation";
import { DrawChar } from "../model/DrawChar";
import { IToolManager } from "../tools/ITool";
import AStarFinderCustom from "../path/AStarFinderCustom";
import { WorldGrid } from "../path/WorldGrid";
import { CostGrid } from "../model/CostGrid";
import { PriorityQueue } from "@datastructures-js/priority-queue";
import RasterModelerFormat from "../RasterModelerFormat";
import { AppState } from "../components/MainContent";
import { MyRect } from "../model/MyRect";

export class DrawScene extends Container implements IScene {

    canvasView: Container;
    draw: Draw;
    
    constructor(draw: Draw) {
        super();
        this.draw = draw;
        Manager.getInstance().draw = draw;

        this.canvasView = new PIXI.Container();
        this.canvasView.hitArea = this.draw.getWorld();  // needed for events
        this.canvasView.interactive = true;              // needed for events
        this.addChild(this.canvasView);

        IToolManager.toolActivate(this.draw, this.draw.activeTool.getName());

        this.renderScreen();
    }

    getState(): AppState {
        return AppState.DrawScene
    }

    
    renderScreen() {
        this.canvasView.removeChildren();

        for (const table of this.draw.schema.tables) {
            if (table.isDirty) {
                let tableRows = table.tableRows.map(tr => {return { name: tr.name, datatype: tr.datatype, attributes: tr.attributes.join(", ")} });
                let updatedTextArr = DrawScene.setWorldTable2(tableRows, table.head, table.getContainingRect() );
                let updatedText = updatedTextArr.map(z => z.join("")).join("\n");
                table.displayable.text = updatedText;
                table.displayable.fontSize = this.draw.selectedFontSize.size
                table.displayable.tint = 0x000000;
                table.displayable.position = new Point(
                    table.getContainingRect().x * this.draw.selectedFontSize.width, 
                    table.getContainingRect().y * this.draw.selectedFontSize.height
                );
                table.updateRelations(this.draw.schema.tables);
                table.isDirty = false;
            }
        }

        let drawables1 = this.draw.schema.tables.map(x => x.displayable);
        if (drawables1.length === 0) {
            return;
        }
        this.canvasView.addChild(...drawables1);

        let worldSize = this.draw.getWorldCharGrid();
        let costGrid = new CostGrid(worldSize);
        for (let table of this.draw.schema.tables) {
            table.updateTableCost(costGrid, worldSize);
        }
        for (let relation of this.draw.schema.tables.flatMap(x => x.relations)) {
            relation.updateRelationsCost(costGrid, worldSize);
        }
        let orderedRelations = DrawScene.getRelationDrawOrder(this.draw.schema.tables, worldSize)
        for (const relation of orderedRelations) {
            DrawScene.setWorldRelation2(relation, costGrid, worldSize)
            relation.displayable.text = relation.getContent().map(z => z.join("")).join("\n");
            relation.displayable.fontSize = this.draw.selectedFontSize.size
            relation.displayable.tint = 0x000000;
            relation.displayable.position = new Point(
                relation.getPositionCharGrid().x * this.draw.selectedFontSize.width, 
                relation.getPositionCharGrid().y * this.draw.selectedFontSize.height
            );
        }

        let drawables2 = orderedRelations.map(x => x.displayable);
        if (drawables2.length === 0) {
            return;
        }
        this.canvasView.addChild(...drawables2);
    }


    static paintWorld9PatchSafe2(rect: Rectangle, out: string[][] | null = null, _9patch: string[] = ['+', '-', '+', '|', 'X', '|', '+', '-', '+']): (string)[][] {
        if (out == null) {
            out = new Array(rect.height).fill([]).map(() => new Array(rect.width).fill(" "));
        }
        let [tl, t, tr, ml, _, mr, bl, b, br] = _9patch;  // skip middle
        let paintWorldRectToScreenSafe = (rect: Rectangle, fillchar: string) => {
            for (let y = rect.y; y < rect.bottom; y++) {
                for (let x = rect.x; x < rect.right; x++) {
                    out![y][x] = fillchar;
                }
            }
        }
        paintWorldRectToScreenSafe(new Rectangle(rect.left, rect.top, 1, 1), tl);
        paintWorldRectToScreenSafe(new Rectangle(rect.x + 1, rect.top, rect.width - 2, 1), t);
        paintWorldRectToScreenSafe(new Rectangle(rect.right - 1, rect.top, 1, 1), tr);

        paintWorldRectToScreenSafe(new Rectangle(rect.x, rect.y + 1, 1, rect.height - 2), ml);
        paintWorldRectToScreenSafe(new Rectangle(rect.right - 1, rect.y + 1, 1, rect.height - 2), mr);

        paintWorldRectToScreenSafe(new Rectangle(rect.left, rect.bottom - 1, 1, 1), bl);
        paintWorldRectToScreenSafe(new Rectangle(rect.x + 1, rect.bottom - 1, rect.width - 2, 1), b);
        paintWorldRectToScreenSafe(new Rectangle(rect.right - 1, rect.bottom - 1, 1, 1), br);
        return out;
    }

    static setWorldTable2(rows: { name: string, datatype: string, attributes: string }[], head: string, tableRect: Rectangle): string[][] {
        let longestnameLenght = rows.map(x => x.name).reduce((acc, row) => Math.max(acc, row.length), 0);
        let longestDatatypeLenght = rows.map(x => x.datatype).reduce((acc, row) => Math.max(acc, row.length), 0);
        let longestAttributeLenght = rows.map(x => x.attributes).reduce((acc, row) => Math.max(acc, row.length), 0);

        let pad = 4;  // padding plus one non-writable wall
        let firstColumnWidth = longestnameLenght + pad;
        let secondColumnWidth =  longestDatatypeLenght + pad;
        let thirdColumnWidth = longestAttributeLenght + pad;

        let rectHead = new Rectangle(0, 0, tableRect.width, 3);
        let rectNameRow = new Rectangle(0, 2, firstColumnWidth, tableRect.height - 2);
        let rectTypeRow = new Rectangle(0 + firstColumnWidth - 1, 2, secondColumnWidth, tableRect.height - 2);
        let rectAttributeRow = new Rectangle(0 + firstColumnWidth + secondColumnWidth - 2, 2, thirdColumnWidth, tableRect.height - 2);
        let parts = ['+', '-', '+', '|', 'X', '|', '+', '-', '+'];
        let result: string[][] = new Array(tableRect.height).fill([]).map(() => new Array(tableRect.width).fill(' '));
        DrawScene.paintWorld9PatchSafe2(rectHead, result, parts);
        DrawScene.paintWorld9PatchSafe2(rectNameRow, result, parts);
        DrawScene.paintWorld9PatchSafe2(rectTypeRow, result, parts);
        DrawScene.paintWorld9PatchSafe2(rectAttributeRow, result, parts);
        let rectHeadInner = new Rectangle(rectHead.left + 2, rectHead.top + 1, rectHead.width - 4, 1);
        for (let y = rectHeadInner.y; y < rectHeadInner.bottom; y++) {
            for (let x = rectHeadInner.x; x < rectHeadInner.right; x++) {
                result[y][x] = head[x - rectHeadInner.x] ?? ' ';
            }
        }
        let rectNameRowInner = new Rectangle(rectNameRow.left + 2, rectNameRow.top + 1, rectNameRow.width - 3, rectNameRow.height - 2)
        let rectNameRowInnerRelativeToTable = new Rectangle(rectNameRowInner.x, rectNameRowInner.y, rectNameRowInner.width, rectNameRowInner.height)
        
        for (let y = rectNameRowInnerRelativeToTable.y; y < rectNameRowInnerRelativeToTable.bottom; y++) {
            for (let x = rectNameRowInnerRelativeToTable.x; x < rectNameRowInnerRelativeToTable.right; x++) {
                result[y][x] = rows[y - rectNameRowInnerRelativeToTable.y].name[x - rectNameRowInnerRelativeToTable.x] ?? ' ';
            }
        }
        let rectTypeRowInner = new Rectangle(rectTypeRow.left + 2, rectTypeRow.top + 1, rectTypeRow.width - 3, rectTypeRow.height - 2);
        let rectTypeRowInnerRelativeToTable = new Rectangle(rectTypeRowInner.x, rectTypeRowInner.y, rectTypeRowInner.width, rectTypeRowInner.height);
        for (let y = rectTypeRowInnerRelativeToTable.y; y < rectTypeRowInnerRelativeToTable.bottom; y++) {
            for (let x = rectTypeRowInnerRelativeToTable.x; x < rectTypeRowInnerRelativeToTable.right; x++) {
                result[y][x] = rows[y - rectTypeRowInnerRelativeToTable.y].datatype[x - rectTypeRowInnerRelativeToTable.x] ?? ' ';
            }
        }
        let rectSpecialRowInner = new Rectangle(rectAttributeRow.left + 2, rectAttributeRow.top + 1, rectAttributeRow.width - 3, rectAttributeRow.height - 2);
        let rectSpecialRowInnerRelative = new Rectangle(rectSpecialRowInner.x, rectSpecialRowInner.y, rectSpecialRowInner.width, rectSpecialRowInner.height);
        for (let y = rectSpecialRowInnerRelative.y; y < rectSpecialRowInnerRelative.bottom; y++) {
            for (let x = rectSpecialRowInnerRelative.x; x < rectSpecialRowInnerRelative.right; x++) {
                result[y][x] = rows[y - rectSpecialRowInnerRelative.y].attributes[x - rectSpecialRowInnerRelative.x] ?? ' ';
            }
        }
        return result;
    }

    static setWorldRelation2(relation: Relation, costGrid: CostGrid, worldSize: MyRect): void {
        let startPoint = relation.source.getRelationStartingPoint(worldSize, relation.target)!;
        let heuristicEndPoint =  relation.target.getContainingRect().getLargestFittingSquareClosestToPoint(relation.source.getContainingRect().getCenter()).getCenter();
        let possibleEnds = relation.target.getContainingRect().GetRelationAttachmentPoints(worldSize);
        if (relation.target.head === relation.source.head) {
            possibleEnds = possibleEnds.filter((end) => { return AStarFinderCustom.euclidean(startPoint!, end) === 10 });
        }
        let grid = new WorldGrid(costGrid.flatten());
        let path = new AStarFinderCustom(AStarFinderCustom.manhattan).findPath(startPoint, heuristicEndPoint, possibleEnds, grid);
        relation.points = path.map((point) => { return new Point(point.x, point.y); })
    }

    static getRelationDrawOrder(tables: Table[], worldSize: MyRect): Relation[] {
        let references = new PriorityQueue<{ 
            value: Relation, 
            cost: number
        }>((a: {cost: number}, b: {cost: number}) => { return a.cost < b.cost ? -1 : 1 });   // lowest cost will pop first
        for (let fromTable of tables) {
            for (const relation of fromTable.relations) {
                let referenceCenter =  relation.target.getContainingRect().getLargestFittingSquareClosestToPoint(fromTable.getContainingRect().getCenter()).getCenter();
                let closestFromTablePoint = relation.source.getRelationStartingPoint(worldSize, relation.target);
                if (closestFromTablePoint === null) {
                    continue;
                }
                references.push({ 
                    value: relation, 
                    cost: AStarFinderCustom.euclidean(closestFromTablePoint, referenceCenter)
                });
            }
        }
        return references.toArray().map(x => x.value);
    }
}
