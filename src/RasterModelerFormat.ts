import { Point, Rectangle } from "pixi.js";
import { Draw } from "./model/Draw";
import { MyRect } from "./model/MyRect";
import { Schema } from "./model/Schema";
import { Table } from "./model/Table";
import { TableRow } from "./model/TableRow";


class RasterModelerFormat {

    public static parse(schema: string): Draw {
        let tablesUnhydrated = JSON.parse(schema);
        let tables = [];
        for (let tableUnhydrated of tablesUnhydrated) {
            tables.push(Table.initClone(tableUnhydrated));
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