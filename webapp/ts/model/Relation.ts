import { Point } from "pixi.js";
import { Table } from "./Table";

export class Relation {

    points: { point: Point, char: string }[];
    target: Table;
    source: Table;

    constructor(points: { point: Point, char: string }[], source: Table, target: Table) {
        this.points = points;
        this.source = source;
        this.target = target;
    }

    getTargetConnectionPoint() {
        return this.points[0]
    }

    getSourceConnectionPoint() {
        return this.points[this.points.length - 1]
    }

}