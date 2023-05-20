import PIXI from "pixi.js"

export class TableRow {
    readonly name: string;
    readonly datatype: string;
    attributes: string[]

    constructor(name: string, datatype: string, attributes: string[]) {
        this.name = name;
        this.datatype = datatype;
        this.attributes = attributes;
    }
}