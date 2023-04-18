import { Container } from "pixi.js";
import { IScene } from "../Manager";
import { Table } from "../model/Table";
import { AppState } from "../components/MainContent";

export class TableScene extends Container implements IScene {

    tableBeingEdited: Table;

    constructor(selectedTable: Table) {
        super();
        this.tableBeingEdited = Table.initClone(selectedTable!);
    }
    
    getState(): AppState {
        return AppState.TableScene;
    }
}
