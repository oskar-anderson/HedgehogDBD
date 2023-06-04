import { Point, Rectangle } from "pixi.js";
import '@pixi/math-extras';

export class MyRect extends Rectangle {

    constructor(x: number, y: number, width: number, height: number) {
        super(x, y, width, height);
    }

    public toPoints() {
        let rectAsPoints = [];
        for (let y = this.y; y < this.bottom; y++) {
            for (let x = this.x; x < this.right; x++) {
                rectAsPoints.push(new Point(x, y));
            }
        }
        return rectAsPoints;
    }

    getRelationAttachmentPoints(container: Rectangle | null) {
        let hPad = 2;
        let vPad = 1;
        let possibleEnds = 
            new MyRect(this.x + hPad,       this.y - 1,     this.width - 2*hPad,    1).toPoints().concat(
            new MyRect(this.right,          this.y + vPad,  1,                      this.height - 2*vPad).toPoints()).concat(
            new MyRect(this.x + hPad,       this.bottom,    this.width - 2*hPad,    1).toPoints()).concat(
            new MyRect(this.x - 1,          this.y + vPad,  1,                      this.height - 2*vPad).toPoints())
        .filter((point) => { 
            return ! this.contains(point.x, point.y) && (container === null || container.contains(point.x, point.y)); 
        }); // N E S W non-corner tiles
        return possibleEnds;
    }

    getCenter() {
        return new Point(this.x + this.width / 2, this.y + this.height / 2);
    }
    
    getLargestFittingSquareClosestToPoint(target: { x: number, y: number}) {
        let smallestSide = this.width > this.height ? this.height : this.width;
        let square = new MyRect(this.x, this.y, smallestSide, smallestSide);
        let clamp = (number: number, min: number, max: number) => Math.max(min, Math.min(number, max));
        square.x = Math.floor(clamp(target.x - square.width / 2, this.x, this.x + this.width - square.width))
        square.y = Math.floor(clamp(target.y - square.height / 2, this.y, this.y + this.height - square.height))
        return square;
    }
}