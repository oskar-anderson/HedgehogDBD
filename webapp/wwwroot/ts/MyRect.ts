import { Point, Rectangle } from "pixi.js";

export class MyRect extends Rectangle {

    constructor(x: number, y: number, width: number, height: number) {
        super(x, y, width, height);
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
}