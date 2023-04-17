import { Container } from "pixi.js";
import { IScene, Manager } from "../Manager";
import { Draw } from "../model/Draw";
import { DrawScene } from "./DrawScene";
import { CommandModifyTable } from "../commands/appCommands/CommandModifyTable";
import { Table } from "../model/Table";
import { CommandDeleteTable } from "../commands/appCommands/CommandDeleteTable";
import { TableRow } from "../model/TableRow";
import { AppState } from "../components/MainContent";

export class TableScene extends Container implements IScene {

    tableBeingEdited: Table;

    constructor(selectedTable: Table) {
        super();
        this.tableBeingEdited = Table.initClone(selectedTable!);
    }

    mouseEventHandler(event: MouseEvent): void {
        throw new Error("Method not implemented.");
    }

    update(deltaMS: number): void {

    }

    
    getState(): AppState {
        return AppState.TableScene;
    }

    init(): void {
        
    }
}
