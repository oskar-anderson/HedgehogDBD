import { Container } from "pixi.js";
import { IScene, Manager } from "../Manager";
import { Table } from "../model/Table";
import { AppState } from "../components/MainContent";

export class TableScene extends Container implements IScene {

    tableBeingEdited: Table;

    constructor() {
        super();
        const selectedTable = Manager.getInstance().draw.selectedTable;
        if (selectedTable === null) {
            throw Error("No table selected!");
        }
        this.tableBeingEdited = Table.initClone(selectedTable);
    }
    
    getState(): AppState {
        return AppState.TableScene;
    }
}
