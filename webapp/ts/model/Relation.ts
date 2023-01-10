import { Point } from "pixi.js";
import { MyRect } from "./MyRect";
import { CostGrid, CostGridTileTypes } from "./CostGrid";
import { Draw } from "./Draw";
import { Table } from "./Table";

export class Relation {

    points: { point: Point, char: string }[];
    target: Table;
    source: Table;
    isDirty = false;

    constructor(points: { point: Point, char: string }[], source: Table, target: Table) {
        this.points = points;
        this.source = source;
        this.target = target;
    }

    equals(sourceTable: Table, targetTable: Table) {
        return this.target.equals(targetTable) && this.source.equals(sourceTable)
    }

    getTargetConnectionPoint() {
        return this.points[0]
    }

    getSourceConnectionPoint() {
        return this.points[this.points.length - 1]
    }

    remove(draw: Draw) {
        let points = [];
        for (let relation of draw.schema.relations) {
            for (let point of relation.points) {
                points.push(point);
            }
        }

        for (let point of this.points) {
            let tile = draw.schema.worldDrawArea[point.point.y * draw.getWorldCharGrid().width + point.point.x];
            if (points.filter((possibleDuplicatePoint) => { possibleDuplicatePoint.point.equals(point.point) } ).length === 1) {
                tile.char = ' '
            }
        }
    }

    updateRelationsCost(costGrid: CostGrid, worldSize: MyRect) {
        for (let _point of this.points) {
            let point = _point.point;
            costGrid.value[point.y][point.x].push(CostGridTileTypes.EXISTINGPATH)
            
            let neighbors = [
                { x: point.x, y: point.y - 1},
                { x: point.x + 1, y: point.y},
                { x: point.x, y: point.y + 1},
                { x: point.x - 1, y: point.y}
            ].filter(neighbor => {
                return worldSize.contains(neighbor.x, neighbor.y)
            });
            for (let neighbor of neighbors) {
                costGrid.value[neighbor.y][neighbor.x].push(CostGridTileTypes.EXISTINGPATHPADDING)
            }
        }
    }

}