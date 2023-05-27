import { BitmapText, Point, Text, Container } from "pixi.js";
import { MyRect } from "./MyRect";
import { CostGrid, CostGridTileTypes } from "./CostGrid";
import { Draw } from "./Draw";
import { Table } from "./Table";

export class Relation {

    points: Point[] = [];
    target: Table;
    source: Table;
    isDrawable = true;
    isDirty = true;
    displayable: Text;

    constructor(
        source: Table, 
        target: Table, 
        {
            displayable = new Text("", { fontFamily: `Inconsolata` }) 
        } = {}
    ) {
        this.source = source;
        this.target = target;
        this.displayable = displayable;
    }

    equals(sourceTable: Table, targetTable: Table) {
        return this.target.equals(targetTable) && this.source.equals(sourceTable)
    }

    getContent(points: Point[]): string[][] {
        if (! this.isDrawable) {
            return [];
        }
        let maxX = Math.max(...points.map(p => p.x));
        let minX = Math.min(...points.map(p => p.x));
        let maxY = Math.max(...points.map(p => p.y));
        let minY = Math.min(...points.map(p => p.y));
        let grid2D: string[][] = [];
        for (let y = minY; y <= maxY; y++) {
            let row = []
            for (let x = minX; x <= maxX; x++) {
                row.push(" ");
            }
            grid2D.push(row);
        }
        // let grid2D: string[][] = new Array(maxY - minY + 1).fill(new Array(maxX - minX + 1).fill(" "));
        points.forEach(p => grid2D[p.y - minY][p.x - minX] = "*");
        return grid2D;
    }

    getPositionCharGrid(points: Point[]) {
        if (points.length === 0) {
            // Return default value. Maybe it would be better to throw error.
            return new Point(0, 0)
        }
        let minX = Math.min(...points.map(p => p.x));
        let minY = Math.min(...points.map(p => p.y));
        return new Point(minX, minY);
    }

    updateRelationsCost(costGrid: CostGrid, worldSize: MyRect) {
        for (let point of this.points) {
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