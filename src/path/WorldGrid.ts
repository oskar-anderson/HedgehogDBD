
export class WorldGrid {

    width: number; 
    height: number;
    nodes: { [id: string]: number };  // keys are from function getPointId

    constructor(grid: number[][]) {
        this.height = grid.length;
        this.width = grid[0].length ?? 0;
        this.nodes = {};
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.nodes[this.getPointId({ x: x, y: y})] = grid[y][x];
            }
        }
    }

    inBounds(point: { x: number, y: number }) {
        return 0 <= point.x && point.x < this.width && 0 <= point.y && point.y < this.height;
    }

    passable(point: { x: number, y: number }) {
        return this.nodes[this.getPointId(point)] !== 0;
    }

    getPointId(point: { x: number, y: number}) {
        return `${point.y},${point.x}`;
    }

    neighbors(x: number, y: number): { x: number, y: number }[] {
        return [ 
            {x: x+1, y: y}, 
            {x: x-1, y: y}, 
            {x: x, y: y-1}, 
            {x: x, y: y+1}  // E W N S
        ]
            .filter((item) => this.inBounds(item))
            .filter((item) => this.passable(item));
    }

    getNeighborCost(orig: { x: number, y: number}, neighbor: { x: number, y: number}): number {
        let cost = this.nodes[this.getPointId(neighbor)];
        let nudge = 0; // manhattan diagonal path nudge
        if ((orig.x + orig.y) % 2 == 0 && neighbor.x != orig.x) { nudge = 1 }
        if ((orig.x + orig.y) % 2 == 1 && neighbor.y != orig.y) { nudge = 1 }
        return cost + 0.0000001 * nudge; 
    }
}