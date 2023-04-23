import Table from "./mainContentChildren/Table";
import Drawing from "./mainContentChildren/Drawing";
import Loading from "./mainContentChildren/Loading"
import Scripting from "./mainContentChildren/Scripting";
import { useAppStateManagement } from "../Store";
import TopToolbarAction from "./TopToolbarAction";
import { Draw } from "../model/Draw";
import { Manager } from "../Manager";
import { LoaderScene } from "../scenes/LoaderScene";
import { useContext, useEffect, useRef, useState } from "react";
import { LocalStorageData, Script } from "../model/LocalStorageData";
import { TableScene } from "../scenes/TableScene";


interface MainComponentProps {
    draw: Draw
}

export enum AppState {
    DrawScene,
    LoaderScene,
    ScriptingScene,
    TableScene
}

export default function mainComponent({ draw }: MainComponentProps) {
    const { appState, setAppState } = useAppStateManagement();
    const canvasContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        Manager.constructInstance(
            draw.getWorld().width,
            draw.getWorld().height,
            0xffffff,
            draw
        );
        canvasContainerRef.current!.appendChild(Manager.getInstance().getView());
        let scene = new LoaderScene(canvasContainerRef.current!.offsetWidth, 720);
        Manager.getInstance().changeScene(scene);
    }, [])

    const optionalTopToolbar = (appState === AppState.DrawScene || appState === AppState.ScriptingScene) ? <TopToolbarAction /> : null

    return (
        <>
            <div className="top-menu-action-container" >
                { optionalTopToolbar }
            </div>

            { appState === AppState.LoaderScene && <Loading canvasContainerRef={canvasContainerRef} /> }
            { appState === AppState.DrawScene && <Drawing/> }
            { appState === AppState.ScriptingScene && <Scripting/> }
            { appState === AppState.TableScene && <Table/> }
        </>
    );
}