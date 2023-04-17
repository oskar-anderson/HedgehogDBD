import Table from "./mainContentChildren/Table";
import Drawing from "./mainContentChildren/Drawing";
import Loading from "./mainContentChildren/Loading"
import Scripting from "./mainContentChildren/Scripting";
import { useAppStateManagement } from "../Store";
import TopToolbarAction from "./TopToolbarAction";
import { Draw } from "../model/Draw";
import { Manager } from "../Manager";
import { LoaderScene } from "../scenes/LoaderScene";
import { useContext, useEffect, useState } from "react";
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

    console.log("mainComponent")

    useEffect(() => {
        console.log("mainComponent useEffect")
        Manager.constructInstance(
            draw.getWorld().width,
            draw.getWorld().height,
            0xffffff,
            draw
        );
        let scene = new LoaderScene();
        Manager.getInstance().changeScene(scene);
    }, [])


    return (
        <>
            <div className="top-menu-action-container" >
                {useAppStateManagement().isTopToolbarVisible || <TopToolbarAction />}
            </div>



        </>
    );
}