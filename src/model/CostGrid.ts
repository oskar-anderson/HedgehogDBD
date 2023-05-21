import { MyRect } from "./MyRect";
import { Draw } from "./Draw";
import { Table } from "./Table";
import { Relation } from "./Relation";

export class CostGrid {

    value: CostGridTileTypes[][][];
    size: MyRect;
    constructor(sizeWorldCharGrid: MyRect) {
        this.size = sizeWorldCharGrid;
        this.value = this.getEmptyWorldCharGridCost();
    }

    private getEmptyWorldCharGridCost() {
        let costGrid: CostGridTileTypes[][][] = [];
        for (let y = 0; y < this.size.height; y++) {
            let row = []
            for (let x = 0; x < this.size.width; x++) {
                row.push([]);
            }              
            costGrid.push(row);
        }
        return costGrid;
    }

    static getCostGrid(size: MyRect, tables: Table[]) {
        let costGrid = new CostGrid(size);
        
        for (let table of tables.filter(x => ! x.getIsHover())) {
            table.updateTableCost(costGrid, size);
        }

        for (let relation of tables.flatMap(x => x.relations).filter(x => ! x.isDirty)) {
            relation.updateRelationsCost(costGrid, size);
        }
        return costGrid;
    }

    merge(other: CostGrid) {
        if (this.size.equals(other.size)) throw Error("Cannot merge different size CostGrids!")
        for (let y = 0; y < this.size.height; y++) {
            for (let x = 0; x < this.size.width; x++) {
                this.value[y][x].push(...other.value[y][x])
            }
        }
    }

    flatten() {
        let flat: number[][] = [];
        for (let y = 0; y < this.size.height; y++) {
            let row = []
            for (let x = 0; x < this.size.width; x++) {
                row.push(0);
            }              
            flat.push(row);
        }
        let flattenTile = (tileModifiers: CostGridTileTypes[]): number => {
            if (tileModifiers.some((x) => x.value === CostGridTileTypes.WALL.value)) {
                return CostGridTileTypes.WALL.value;
            }
            let sum = CostGridTileTypes.REGULAR.value;
            for (let tileModifier of tileModifiers) {
                sum += tileModifier.value; 
            }
            return sum;
        }
        for (let y = 0; y < this.size.height; y++) {
            for (let x = 0; x < this.size.width; x++) {
                flat[y][x] = flattenTile(this.value[y][x])
            }
        }
        return flat;
    }
}

export class CostGridTileTypes {
    static readonly WALL: CostGridTileTypes = new CostGridTileTypes(0);
    static readonly REGULAR: CostGridTileTypes = new CostGridTileTypes(1);
    static readonly PADDINGINNER: CostGridTileTypes = new CostGridTileTypes(4);
    static readonly PADDINGOUTER: CostGridTileTypes = new CostGridTileTypes(1);
    static readonly EXISTINGPATH: CostGridTileTypes = new CostGridTileTypes(30);
    static readonly EXISTINGPATHPADDING: CostGridTileTypes = new CostGridTileTypes(1);

    value: number;
    constructor(value: number) {
        this.value = value;
    }
}