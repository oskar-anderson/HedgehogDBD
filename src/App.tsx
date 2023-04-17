import { createElement, useEffect, useRef, useState, createContext, useContext, useCallback } from 'react'
import { Draw } from "./model/Draw";
import { Rectangle, Point } from "pixi.js";
import { Schema } from "./model/Schema";
import { Table } from "./model/Table";
import { TableRow } from "./model/TableRow";
import { MyRect } from "./model/MyRect";
import './App.css'
import { Manager } from './Manager';
import { LoaderScene } from './scenes/LoaderScene';
import RasterModelerFormat from './RasterModelerFormat';
import CanvasSide from './components/mainContentChildren/drawingChildren/CanvasSide';
import { AppStateManagementContext, useAppStateManagement, useAppStateManagementDefault } from './Store';
import TopToolbarAction from './components/TopToolbarAction';
import MainContent from './components/MainContent';



function App() {
  const [ draw, setDraw ] = useState<Draw | null>(null);

  useEffect(() => {
    async function fetchApp() {
      let text = await (await fetch('/src/wwwroot/data/SchemaTest2.txt', { cache: "no-cache" })).text();
      let draw = RasterModelerFormat.parse(text);
      setDraw(draw)
    }

    fetchApp();
  }, [])

  const appStateManagementValue = useAppStateManagementDefault();
  useAppStateManagement();

  if (! draw) {
    return (<div>Loading...</div>);
  }



  return (
    <AppStateManagementContext.Provider value={appStateManagementValue}>
      <MainContent draw={draw} />
    </AppStateManagementContext.Provider>
  )
}

export default App
