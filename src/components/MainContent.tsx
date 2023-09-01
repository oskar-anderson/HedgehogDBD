import Table from "./mainContentChildren/Table";
import Drawing from "./mainContentChildren/Drawing";
import Scripting from "./mainContentChildren/Scripting";
import { useAppStateManagement } from "../Store";
import TopToolbarAction from "./TopToolbarAction";
import { Draw } from "../model/Draw";
import { useContext, useEffect, useRef, useState } from "react";
import { Schema } from "../model/Schema";
import { MyRect } from "../model/MyRect";
import { TableDTO } from "../model/dto/TableDTO";


export enum AppState {
    DrawScene,
    LoaderScene,
    ScriptingScene,
    TableScene
}

export default function MainComponent() {
    const { appState, setAppState } = useAppStateManagement();
    const [tables, setTables] = useState<TableDTO[]>([]);
    const [tableBeingEdited, setTableBeingEdited] = useState<TableDTO | null>(null);
    
    const onTablesUpdateCallbackOuterReadonly = (tables: TableDTO[]) => {
        setTables(tables);
    };
    let schema = new Schema(tables.map(x => x.mapToTable()));
    let draw = new Draw(schema, new MyRect(0, 0, 3240, 2160), onTablesUpdateCallbackOuterReadonly);
    draw.onTablesChangeCallback(tables);

    const switchToTableView = (table: TableDTO) => { 
        setTableBeingEdited(table);
        setAppState(AppState.TableScene);
    }

    const switchToDrawView = (_draw: Draw) => {
        draw = _draw;
        setAppState(AppState.DrawScene);
    }

    return (
        <>
            <TopToolbarAction draw={draw} setAppState={setAppState} appState={AppState.ScriptingScene} heightPx={54} />
            { appState === AppState.DrawScene && <Drawing draw={draw} switchToTableView={switchToTableView} /> }
            { appState === AppState.ScriptingScene && <Scripting draw={draw} /> }
            { appState === AppState.TableScene && <Table draw={draw} switchToDrawView={switchToDrawView} tableBeingEdited={tableBeingEdited!} /> }
        </>
    );
}