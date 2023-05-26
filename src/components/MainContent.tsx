import Table from "./mainContentChildren/Table";
import Drawing from "./mainContentChildren/Drawing";
import Loading from "./mainContentChildren/Loading"
import Scripting from "./mainContentChildren/Scripting";
import { useAppStateManagement } from "../Store";
import TopToolbarAction from "./TopToolbarAction";
import { Draw } from "../model/Draw";
import { IScene, Manager } from "../Manager";
import { LoaderScene } from "../scenes/LoaderScene";
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
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const [tables, setTables] = useState<TableDTO[]>([]);
    
    const onTablesUpdateCallbackOuterReadonly = (tables: TableDTO[]) => {
        setTables(tables);
    };
    useEffect(() => {
        let draw = new Draw(new Schema([], onTablesUpdateCallbackOuterReadonly), new MyRect(0, 0, 3240, 2160));
        Manager.constructInstance(
            3240,
            2160,
            0xffffff,
            draw,
            (newScene: IScene) => { setAppState(newScene.getState()); }
        );
        canvasContainerRef.current!.appendChild(Manager.getInstance().getView());
        let scene = new LoaderScene(canvasContainerRef.current!.offsetWidth, 720, draw);
        Manager.getInstance().changeScene(scene);
    }, [])

    const topToolBarHeightPx = 54;
    const optionalTopToolbar = (appState === AppState.DrawScene || appState === AppState.ScriptingScene) ? 
        <TopToolbarAction currentState={appState} heightPx={topToolBarHeightPx} /> : 
        null

    return (
        <>
            <div className="top-menu-action-container" >
                { optionalTopToolbar }
            </div>

            { appState === AppState.LoaderScene && <Loading canvasContainerRef={canvasContainerRef} /> }
            { appState === AppState.DrawScene && <Drawing topToolBarHeightPx={topToolBarHeightPx} tables={tables} onTablesUpdateCallbackOuterReadonly={onTablesUpdateCallbackOuterReadonly} /> }
            { appState === AppState.ScriptingScene && <Scripting/> }
            { appState === AppState.TableScene && <Table/> }
        </>
    );
}