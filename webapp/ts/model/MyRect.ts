import { Point, Rectangle } from "pixi.js";
import { deflateRawSync } from "zlib";
import '@pixi/math-extras';

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

    getCenter() {
        return new Point(this.x + this.width / 2, this.y + this.height / 2);
    }
    
    getFittingSquareTowardsPoint(target: { x: number, y: number}) {
        let smallestSide = this.width > this.height ? this.height : this.width;
        let square = new MyRect(this.x, this.y, smallestSide, smallestSide);
        let clamp = (number: number, min: number, max: number) => Math.max(min, Math.min(number, max));
        let dx = target.x - this.x + this.width / 2;
        let dy = target.y - this.y + this.height / 2;
        while(
            dx != 0 
            && this.contains(square.x + 1 * clamp(dx, -1, 1), square.y) 
            && this.contains(square.x + square.width + 1 * clamp(dx, -1, 1), square.y)) {
            square.x = square.x + (dx > 0 ? 1 : -1);
            dx = dx + (dx > 0 ? -1 : 1);
        }
        while(
            dy != 0 
            && this.contains(square.x, square.y + 1 * clamp(dy, -1, 1)) 
            && this.contains(square.x, square.y + square.height + 1 * clamp(dy, -1, 1))) {
            square.y = square.y + (dy > 0 ? 1 : -1);
            dy = dy + (dy > 0 ? -1 : 1);
        }
        return square;
    }
}