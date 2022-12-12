import pathfinding from 'pathfinding'
import AStarFinderCustom from './path/AStarFinderCustom';
import astar from "javascript-astar"
import easystarjs from "easystarjs"
import { PriorityQueue } from '@datastructures-js/priority-queue';
import { WorldGrid } from './path/WorldGrid';

export class PathTest {

    static async test() {
        // # - cost, 99 blocked
        let matrix = [
            [ 0,  0,  0,  0,  1,  1,  1,  1,  1,  1,  1,  1,  1,  0,  0,  0],
            [ 0,  0,  0,  0,  1,  3,  3,  3,  3,  3,  3,  3,  1,  0,  0,  0],
            [ 1,  1,  1,  1,  2,  3, 99, 99, 99, 99, 99,  3,  1,  0,  0,  0],
            [ 3,  3,  3,  3,  2,  3, 99, 99, 99, 99, 99,  4,  2,  1,  1,  1],
            [99, 99, 99,  3,  2,  3, 99, 99, 99, 99, 99,  4,  4,  3,  3,  3],
            [99, 99, 99,  3,  2,  3, 99, 99, 99, 99, 99,  4,  4, 99, 99, 99],
            [99, 99, 99,  3,  2,  3, 99, 99, 99, 99, 99,  4,  4, 99, 99, 99],
            [99, 99, 99,  3,  2,  3, 99, 99, 99, 99, 99,  4,  4, 99, 99, 99],
            [99, 99, 99,  3,  2,  3, 99, 99, 99, 99, 99,  4,  4, 99, 99, 99],
            [99, 99, 99,  3,  2,  3, 99, 99, 99, 99, 99,  4,  4, 99, 99, 99],
            [ 3,  3,  3,  3,  2,  3, 99, 99, 99, 99, 99,  4,  4, 99, 99, 99],
        ];
        // PathFinding.js - no weight costs, no custom heuristic
        // javascript-astar - x and y cordinats are reversed // https://github.com/bgrins/javascript-astar/issues/70
        // rot.js - no weight costs, no callback ending https://github.com/ondras/rot.js/issues/196
        // astar-typescript - no weight, https://github.com/digitsensitive/astar-typescript/issues/24, no custom heuristic
        // easystarjs - no custom heuristic

        let matrix2 = [
            [1, 0, 1, 0],
            [1, 0, 1, 1],
            [1, 0, 6, 1],
            [1, 1, 1, 1]
        ];

        let astarGraph = new astar.Graph(matrix2);
        let resultWithDiagonals = astar.astar.search(astarGraph, astarGraph.grid[0][0], astarGraph.grid[0][2]);
        console.log(resultWithDiagonals);

        let easystar = new easystarjs.js();
        easystar.setGrid(matrix2);
        easystar.setAcceptableTiles([1, 6]);
        easystar.setAdditionalPointCost(2, 2, 6);;
        let easystarWrapper = () => {
            return new Promise<{x: number, y: number}[]>((resolve, reject) => {
                easystar.findPath(0, 0, 2, 0, (path) => { 
                    resolve(path); 
                });
                easystar.calculate();
            })
        }
        let result = await easystarWrapper();
        console.log(result);

        let grid = new WorldGrid(matrix2);
        console.log(new AStarFinderCustom().findPath({ x: 0, y: 0 }, { x: 2, y: 0 }, [{ x: 2, y: 0 }], grid));
        console.log(new AStarFinderCustom().findPath({ x: 0, y: 0 }, { x: 2, y: 0 }, [{ x: 2, y: 0 }], 
            new WorldGrid([
                [1, 1, 1, 1, 1, 1],
                [1, 3, 3, 3, 1, 1],
                [1, 3, 2, 2, 1, 1],
                [1, 3, 2, 1, 1, 1],
                [1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1]
            ])
        ));

        
        // let finder = new AStarFinderCustom();
        // console.log(finder.findPath(0, 0, 3, 3, matrix2))

    }
}