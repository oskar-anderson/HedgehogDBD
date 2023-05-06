import { Manager } from "../Manager";
import { Draw } from "../model/Draw";
import { Schema } from "../model/Schema";
import RasterModelerFormat from "../RasterModelerFormat";
import { DrawScene } from "../scenes/DrawScene";
import { ScriptingScene } from "../scenes/ScriptingScene";
import { useAppStateManagement } from "../Store";
import { AppState } from "./MainContent";
import EnvGlobals from "../../EnvGlobals";


export default function TopToolbarAction() {
  const { setAppState } = useAppStateManagement();

  const newSchema = () => {
    const oldDraw = Manager.getInstance().draw;
    Manager.getInstance().draw = new Draw(new Schema([]), oldDraw.getWorld());
  }

  const saveAsJpg = async () => {
    ScriptingScene.executeWithLog(await fetch(EnvGlobals.BASE_URL + '/wwwroot/scripts/takeScreenshot.js', { cache: "no-cache" }).then(x => x.text()), Manager.getInstance().draw)
  }

  const saveToClipboard = async () => {
    ScriptingScene.executeWithLog(await fetch(EnvGlobals.BASE_URL + '/wwwroot/scripts/saveToClipboard.js', { cache: "no-cache" }).then(x => x.text()), Manager.getInstance().draw)
  }

  const changeSceneToScripting = async () => {
    if (Manager.getInstance().getScene()!.getState() === AppState.ScriptingScene) { return; }
    Manager.getInstance().changeScene(new ScriptingScene());
    setAppState(AppState.ScriptingScene);
  }
  const changeSceneToDraw = async () => {
    if (Manager.getInstance().getScene()!.getState() === AppState.DrawScene) { return; }
    Manager.getInstance().changeScene(new DrawScene());
    setAppState(AppState.DrawScene);
  }

  const saveAsText = async () => {
    ScriptingScene.executeWithLog(await fetch(EnvGlobals.BASE_URL + '/wwwroot/scripts/saveAsTxt.js', { cache: "no-cache" }).then(x => x.text()), Manager.getInstance().draw)
  }

  const importFile = () => {
    let reader = new FileReader();
    reader.onload = (event: ProgressEvent) => {
      let file = (event.target as FileReader).result as string;
      Manager.getInstance().draw = RasterModelerFormat.parse(file)
      Manager.getInstance().changeScene(new DrawScene())
    }
    let startReadingFile = (thisElement: HTMLInputElement) => {
      let inputFile = thisElement.files![0];
      reader.readAsText(inputFile);
    }
    let input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';
    input.addEventListener("change", () => startReadingFile(input));
    input.click();
  }

  return (
    <nav className="py-1 px-4 navbar navbar-expand-lg" style={{ backgroundColor: 'rgb(255, 73, 73)' }}>
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          <img style={{ height: '36px' }} src={EnvGlobals.BASE_URL + "/wwwroot/img/logo_compact_white.png"} />
        </a>
        <ul className="navbar-nav me-auto" style={{ flexDirection: 'row' }}>
          <li className="nav-item dropdown" style={{ marginLeft: '2em' }}>
            <button className="btn" data-bs-toggle="dropdown" style={{ color: '#fff' }}>
              File
            </button>
            <ul className="dropdown-menu" style={{ position: 'absolute' }}>
              <li>
                {/* https://www.svgrepo.com/svg/376495/file-line */}
                <button onClick={() => newSchema()} className="dropdown-item">
                  <svg width={24} height={24} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none"><path stroke="#000000" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 9v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8m6 6v-.172a2 2 0 0 0-.586-1.414l-3.828-3.828A2 2 0 0 0 14.172 3H14m6 6h-4a2 2 0 0 1-2-2V3" /></svg>
                  New Schema
                </button>
              </li>
              <li>
                <button onClick={() => saveAsText()} className="dropdown-item">
                  <svg fill="#000000" height={24} viewBox="0 0 24 24" width={24} xmlns="http://www.w3.org/2000/svg"><path className="icon" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" /><path d="M0 0h24v24H0z" fill="none" /></svg>
                  Export TXT
                </button>
              </li>
              <li>
                {/* https://www.svgrepo.com/svg/357887/image-download */}
                <button onClick={() => saveAsJpg()} className="dropdown-item">
                  <svg width={24} height={24} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.71,6.29a1,1,0,0,0-1.42,0L20,7.59V2a1,1,0,0,0-2,0V7.59l-1.29-1.3a1,1,0,0,0-1.42,1.42l3,3a1,1,0,0,0,.33.21.94.94,0,0,0,.76,0,1,1,0,0,0,.33-.21l3-3A1,1,0,0,0,22.71,6.29ZM19,13a1,1,0,0,0-1,1v.38L16.52,12.9a2.79,2.79,0,0,0-3.93,0l-.7.7L9.41,11.12a2.85,2.85,0,0,0-3.93,0L4,12.6V7A1,1,0,0,1,5,6h8a1,1,0,0,0,0-2H5A3,3,0,0,0,2,7V19a3,3,0,0,0,3,3H17a3,3,0,0,0,3-3V14A1,1,0,0,0,19,13ZM5,20a1,1,0,0,1-1-1V15.43l2.9-2.9a.79.79,0,0,1,1.09,0l3.17,3.17,0,0L15.46,20Zm13-1a.89.89,0,0,1-.18.53L13.31,15l.7-.7a.77.77,0,0,1,1.1,0L18,17.21Z" /></svg>
                  Export image
                </button>
              </li>
              <li>
                {/* https://www.svgrepo.com/svg/357606/copy */}
                <button onClick={() => saveToClipboard()} className="dropdown-item">
                  <svg width={24} height={24} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21,8.94a1.31,1.31,0,0,0-.06-.27l0-.09a1.07,1.07,0,0,0-.19-.28h0l-6-6h0a1.07,1.07,0,0,0-.28-.19.32.32,0,0,0-.09,0A.88.88,0,0,0,14.05,2H10A3,3,0,0,0,7,5V6H6A3,3,0,0,0,3,9V19a3,3,0,0,0,3,3h8a3,3,0,0,0,3-3V18h1a3,3,0,0,0,3-3V9S21,9,21,8.94ZM15,5.41,17.59,8H16a1,1,0,0,1-1-1ZM15,19a1,1,0,0,1-1,1H6a1,1,0,0,1-1-1V9A1,1,0,0,1,6,8H7v7a3,3,0,0,0,3,3h5Zm4-4a1,1,0,0,1-1,1H10a1,1,0,0,1-1-1V5a1,1,0,0,1,1-1h3V7a3,3,0,0,0,3,3h3Z" /></svg>
                  Export clipboard
                </button>
              </li>
              <li>
                <button onClick={() => { importFile() }} className="dropdown-item">
                  <svg fill="#000000" height={24} viewBox="0 0 24 24" width={24} xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none" /><path className="icon" d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" /></svg>
                  Import
                </button>
              </li>
            </ul>
          </li>
          <li className="nav-item dropdown" style={{ marginLeft: '0.2em' }}>
            <button className="btn" data-bs-toggle="dropdown" style={{ color: '#fff' }}>
              View
            </button>
            <ul className="dropdown-menu" style={{ position: 'absolute' }}>
              <li>
                <button className="nav-draw dropdown-item" onClick={() => changeSceneToDraw()}>
                  Draw
                </button>
              </li>
              <li>
                <button className="dropdown-item" onClick={() => changeSceneToScripting()}>
                  Scripting
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  )
}