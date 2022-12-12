import { Point, Rectangle } from "pixi.js";

export class MyRect extends Rectangle {

    constructor(x: number, y: number, width: number, height: number) {
        super(x, y, width, height);
    }

    static init(tr: Point, bl: Point) {
        return new MyRect(tr.x, tr.y, bl.x, bl.y);
    }

    getBr() {
        return new Point(this.width, this.height);
    }

    getTl() {
        return new Point(this.width, this.height);
    }

    public ToPoints() {
        let rectAsPoints = [];
        for (let y = this.y; y < this.bottom; y++) {
            for (let x = this.x; x < this.right; x++) {
                rectAsPoints.push(new Point(x, y));
            }
        }
        return rectAsPoints;
    }

    GetRelationAttachmentPoints(container: Rectangle | null) {
        let hPad = 2;
        let vPad = 1;
        let possibleEnds = 
            new MyRect(this.x + hPad,       this.y - 1,     this.width - 2*hPad,    1).ToPoints().concat(
            new MyRect(this.right,          this.y + vPad,  1,                      this.height - 2*vPad).ToPoints()).concat(
            new MyRect(this.x + hPad,       this.bottom,    this.width - 2*hPad,    1).ToPoints()).concat(
            new MyRect(this.x - 1,          this.y + vPad,  1,                      this.height - 2*vPad).ToPoints())
        .filter((point) => { 
            return ! this.contains(point.x, point.y) && (container === null || container.contains(point.x, point.y)); 
        }); // N E S W non-corner tiles
        return possibleEnds;
    }
}