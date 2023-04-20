import { Point, Rectangle } from "pixi.js";
import { Draw } from "./model/Draw";
import { MyRect } from "./model/MyRect";
import { Schema } from "./model/Schema";
import { Table } from "./model/Table";
import { TableRow } from "./model/TableRow";


class RasterModelerFormat {

    public static parse(schema: string): Draw {
        let rows = schema.split(new RegExp('\r?\n'));
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
                if (tile === "+" && ! tablesRects.some(table => table.contains(x, y))) {
                    let possibleTable = new Rectangle(x, y, 0, 0);
                    for (let a = 0; 
                        x + a < width 
                        && ["-", "+"].includes(board[y * width + x + a]); 
                        a++) {
                        if (x + a + 2 === width && board[y * width + x + a + 1] === "+") {
                            possibleTable.width = a + 2;
                            break;
                        }
                        if ((x + a + 1 < width && board[y * width + x + a + 1] === " ")) {
                            possibleTable.width = a + 1;
                            break;
                        }
                    }
                    for (let a = 0; 
                        possibleTable.width != 0 
                        && y + a < height
                        && ["|", "+"].includes(board[(y + a) * width + x]); 
                        a++) {
                        if (y + a + 2 === height && board[(y + a + 1) * width + x] === "+") {
                            possibleTable.height = a + 2;
                            break;
                        }
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
            tables.push(Table.init(new Point(rect.x, rect.y), head, tableRows));
        }

        return new Draw(
            new Schema(tables), 
            new MyRect(0, 0, 3240, 2160)
        );
        /*
        const defaultFontSize = Draw.fontSizes.find(x => x.size === 14)!;
        return new Draw(
            new Schema(tables), 
            new MyRect(
                0, 0, 
                Math.floor(3240 / defaultFontSize.width) * defaultFontSize.width, 
                Math.floor(2160 / defaultFontSize.height) * defaultFontSize.height
            )
        );
        */
    }
}

export default RasterModelerFormat;