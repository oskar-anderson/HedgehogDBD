import { Point } from "pixi.js";
import { Table } from "./Table";

export class relation {

    points = [];
    target: Table;
    source: Table;
    targetConnectionPoint: Point;
    sourceConnectionPoint: Point;

    constructor(source: Table, target: Table, sourceConnectionPoint: Point, targetConnectionPoint: Point) {
        this.source = source;
        this.target = target;
        this.sourceConnectionPoint = sourceConnectionPoint;
        this.targetConnectionPoint = targetConnectionPoint;
    }




}