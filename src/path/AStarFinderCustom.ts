import { PriorityQueue } from '@datastructures-js/priority-queue';
import { WorldGrid } from './WorldGrid';


export default class AStarFinderCustom {

    heuristic: (a: { x: number, y: number }, b: { x: number, y: number }) => number;

    constructor(heuristic: ((a: { x: number, y: number }, b: { x: number, y: number }) => number)) {
        this.heuristic = heuristic;
    }

    static euclidean(a:{x:number,y: number}, b:{x:number,y:number}) {
        let dx = Math.abs(a.x - b.x);
        let dy = Math.abs(a.y - b.y);
        return Math.sqrt(dx ** 2 + dy ** 2);
    };

    static manhattan(a: { x: number, y: number }, b: { x: number, y: number }) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    };
    
    /**
     * Find and return the path.
     * @return {Array<Array<number>>} The path, including both start and end positions.
     */
    findPath(start: { x: number, y: number }, heuristicTarget: { x: number, y: number }, ends: { x: number, y: number }[], grid: WorldGrid) {
        if (ends.length === 0) return [];
        let frontier = new PriorityQueue<{ value: {x: number, y: number}, cost: number}>
            ((
                a: {value: any, cost: number}, 
                b: {value: any, cost: number}
            ) => { return a.cost < b.cost ? -1 : 1 })   // lowest cost will pop first
            .push({ value: start, cost: 0 });
        let cameFrom: Map<string, { x: number, y: number } | null> = new Map()
            .set(grid.getPointId(start), null);
        let costSoFar: Map<string, number> = new Map()
            .set(grid.getPointId(start), 0);
        let end = null;
        while (! frontier.isEmpty()) {
            let current = frontier.pop().value;

            if (ends.findIndex(end => end.x === current.x && end.y === current.y) !== -1) { 
                end = current; 
                break;
            }

            for (let next of grid.neighbors(current.x, current.y)) {
                // the multiplication makes the algorithm greedy for the endpoint which helps eliminate randomness deciding between same cost cells
                let startToNextCost = (costSoFar.get(grid.getPointId(current))! + grid.getNeighborCost(current, next)) * 1.001; 
                if (! costSoFar.has(grid.getPointId(next)) || startToNextCost < costSoFar.get(grid.getPointId(next))!) {
                    costSoFar.set(grid.getPointId(next), startToNextCost);
                    let priority = startToNextCost + this.heuristic(next, heuristicTarget);
                    frontier.push({ value: next, cost: priority });
                    cameFrom.set(grid.getPointId(next), { x: current.x, y: current.y });
                }
            }
        }

        if (end === null) { return []; }
        let route: { x: number, y: number }[] = [end];
        while (true) {
            let next = cameFrom.get(grid.getPointId(route[0]));
            if (!next) { break; }
            route.unshift(next);
        }
        return route;
    }
}
