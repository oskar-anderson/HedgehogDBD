import { Container } from "pixi.js";
import { IScene, Manager } from "../Manager";
import { AppState } from "../components/MainContent";
import { TableDTO } from "../model/dto/TableDTO";

export class TableScene extends Container implements IScene {

    tableBeingEdited: TableDTO;

    constructor(selectedTable: TableDTO) {
        super();
        this.tableBeingEdited = selectedTable;
    }
    
    getState(): AppState {
        return AppState.TableScene;
    }
}
