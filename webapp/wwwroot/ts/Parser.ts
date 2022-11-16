import { Point, Rectangle } from "pixi.js";
import { Draw } from "./model/Draw";
import { Relation } from "./model/Relation";
import { Schema } from "./model/Schema";
import { Table } from "./model/Table";
import { TableRow } from "./model/TableRow";
import { MyRect } from "./MyRect";

export class Parser {
    constructor() {

    }

    parse(schema: string): Draw {
        let rows = schema.split('\n');
        let width = Math.max(...(rows.map(el => el.length)));
        let height = rows.length;

        let board: string[] = new Array(width * height);
        board.fill(" ");
        for (let y = 0; y < rows.length; y++) {
            let row = rows[y];
            for (let x = 0; x < row.length; x++) {
                board[y * width + x] = row[x];
            }
        }

        let tablesRects: Rectangle[] = [];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let tile = board[y * width + x];
                if (tile === "+" && 
                    ! tablesRects.some(
                        function(table) { 
                            return table.contains(x, y);
                        }
                    )
                ) {
                    let possibleTable = new Rectangle(x, y, 0, 0);
                    for (let a = 0; 
                        a < width - x
                        && ["-", "+"].includes(board[y * width + x + a]); 
                        a++) {
                        if (x + a + 1 < width && board[y * width + x + a + 1] === " ") {
                            possibleTable.width = a + 1;
                            break;
                        }
                    }possibleTable
                    for (let a = 0; 
                        possibleTable.width != 0 
                        && a < height - y
                        && ["|", "+"].includes(board[(y + a) * width + x]); 
                        a++) {
                        if (y + a + 1 < height && board[(y + a + 1) * width + x] === " ") {
                            possibleTable.height = a + 1;
                            break;
                        }
                    }
                    if (possibleTable.width != 0 && possibleTable.height != 0) {
                        tablesRects.push(possibleTable)
                    }
                }
            }
        }

        let tables = [];
        for (let rect of tablesRects) {
            let tableSpec = board.slice(
                (rect.y + 1) * width + rect.left + 1, 
                (rect.y + 1) * width + rect.right - 2)
                .join("").trim();
            let head = tableSpec.split(":")[0];
            let tableRows = []
            for (let cy = rect.y + 3; cy < rect.bottom - 1; cy++) {
                let row = board.slice(
                    (cy) * width + rect.left + 1, 
                    (cy) * width + rect.right - 2)
                    .join("").trim();
                let columns = row.split("|").map(function(item) { return item.trim(); });
                let attributeList = columns[2].split(',').map(x => x.trim());
                tableRows.push(TableRow.init(columns[0], columns[1], attributeList));
            }
            tables.push(Table.init(rect, head, tableRows));
        }

        let relations: Relation[] = [];
        for (let table of tables) {
            let outer = (new MyRect(table.rect.x - 1, table.rect.y - 1, table.rect.width + 2, table.rect.height + 2)).ToPoints();
            let edgePoints = outer.filter(point => ! table.rect.contains(point.x, point.y))
            for (const edgePoint of edgePoints) {
                if (! new Rectangle(0, 0, width, height).contains(edgePoint.x, edgePoint.y)) continue
                let edgeChar = board[edgePoint.y * width + edgePoint.x];
                if (! ["!", "?", "m"].includes(edgeChar)) continue;
                if (relations.some(relation => 
                    relation.points[relation.points.length - 1].point.x === edgePoint.x &&
                    relation.points[relation.points.length - 1].point.y === edgePoint.y
                )) { continue; }

                let getNext = (currentPoint: Point, direction: string) => {
                    switch (direction) {
                        case "right":
                            return new Point(currentPoint.x + 1, currentPoint.y);
                        case "left":
                            return new Point(currentPoint.x - 1, currentPoint.y);
                        case "down":
                            return new Point(currentPoint.x, currentPoint.y + 1);
                        case "up":
                            return new Point(currentPoint.x, currentPoint.y - 1);
                        default:
                            throw Error(`Unknown direction ${direction}`);
                    }
                };
                let direction = "";
                direction += table.rect.contains(edgePoint.x - 1, edgePoint.y) ? "right" : "";
                direction += table.rect.contains(edgePoint.x + 1, edgePoint.y) ? "left" : "";
                direction += table.rect.contains(edgePoint.x, edgePoint.y - 1) ? "down" : "";
                direction += table.rect.contains(edgePoint.x, edgePoint.y + 1) ? "up" : "";
                // console.log(edgePoint, edgeChar, direction);
                let pointToCheck = getNext(edgePoint, direction)
                
                let points = [{ point: edgePoint, char: edgeChar}];
                let targetTable = null;
                let isRelationBuildingDone = false;
                while (! isRelationBuildingDone) {
                    let char = board[pointToCheck.y * width + pointToCheck.x]
                    points.push({ point: pointToCheck, char: char});
                    switch (char) {
                        case ".":
                            pointToCheck = getNext(pointToCheck, direction);
                            continue;
                        case "/":
                            direction = { "right": "up", "down": "left", "left": "down", "up": "right" }[direction]!
                            pointToCheck = getNext(pointToCheck, direction);
                            continue;
                        case "\\":
                            direction = { "right": "down", "down": "right", "left": "up", "up": "left" }[direction]!
                            pointToCheck = getNext(pointToCheck, direction);
                            continue;
                        case "!":
                        case "?":
                        case "m":
                            pointToCheck = getNext(pointToCheck, direction);
                            for (const table of tables) {
                                if (table.rect.contains(pointToCheck.x, pointToCheck.y)) {
                                    targetTable = table;
                                }
                            }
                            if (targetTable === null) throw Error(`Cannot parse input! No table at: '${pointToCheck}', symbol: '${char}'`);
                            isRelationBuildingDone = true;
                            break;
                        default:
                            console.error(points)
                            throw Error(`Cannot parse input! Unknown symbol at: '${pointToCheck}', symbol: '${char}'`)
                    }
                }
                let relation = new Relation(points, table, targetTable!);
                relations.push(relation);
            }
        }


        return new Draw(new Schema(tables, relations));
    }
}