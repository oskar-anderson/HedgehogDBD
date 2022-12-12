import { PriorityQueue } from '@datastructures-js/priority-queue';
import { WorldGrid } from './WorldGrid';


export default class AStarFinderCustom {

    heuristic: (from: { x: number, y: number }, to: { x: number, y: number }) => number;

    constructor(heuristic: ((from: { x: number, y: number }, to: { x: number, y: number }) => number) | null = null) {
        let manhattan = (from: { x: number, y: number }, to: { x: number, y: number }) => {
            return Math.abs(from.x - to.x) + Math.abs(from.y - to.y) 
        };
        this.heuristic = heuristic ?? manhattan
    }
    
    /**
     * Find and return the the path.
     * @return {Array<Array<number>>} The path, including both start and end positions.
     */
    findPath(start: { x: number, y: number }, heuristicTarget: { x: number, y: number }, ends: { x: number, y: number }[], grid: WorldGrid) {
        let frontier = new PriorityQueue<{ value: {x: number, y: number}, cost: number}>
            ((
                a: {value: {x: number, y: number}, cost: number}, 
                b: {value: {x: number, y: number}, cost: number}
            ) => { return a.cost < b.cost ? -1 : 1 });   // lowest cost will pop first
        frontier.push({ value: start, cost: 0 });
        let cameFrom: { [key: string]: { x: number, y: number} | null } = {};
        let costSoFar: { [key: string]: number } = {};
        cameFrom[grid.getPointId(start)] = null;
        costSoFar[grid.getPointId(start)] = 0;
        let end = null;
        while (! frontier.isEmpty()) {
            // console.log(frontier.toArray())
            let current = frontier.pop().value;
            // console.log(`x: ${current.x}, y: ${current.y}`)

            if (ends.findIndex(end => end.x === current.x && end.y === current.y) !== -1) { 
                console.log(`x: ${current.x}, y: ${current.y}`)
                end = current; 
                break;
            }

            for (let next of grid.neighbors(current.x, current.y)) {
                let newCost = costSoFar[grid.getPointId(current)] + grid.cost(current, next);
                if (costSoFar[grid.getPointId(next)] === undefined || newCost < costSoFar[grid.getPointId(next)]) {
                    costSoFar[grid.getPointId(next)] = newCost;
                    let priority = newCost + this.heuristic(next, heuristicTarget);
                    frontier.push({ value: next, cost: priority });
                    cameFrom[grid.getPointId(next)] = { x: current.x, y: current.y };
                }
            }
        }

        let route: { x: number, y: number }[] = [];
        while (end !== null) {
            if (route.length === 0) {
                route = [end!];
            }
            let next = cameFrom[grid.getPointId(route[0])];
            if (next === null) {
                break;
            }
            route.unshift(next);
        }

        return route;
    }

    private refinePathToReduceCornerCount(route: { x: number, y: number }[]): { x: number, y: number }[] {
        for (let routeTile of route) {
            
        }
        return route;
    }
}
