import dayjs from "dayjs";
import EnvGlobals from "../../../../EnvGlobals";
import * as PIXI from "pixi.js";
import { Manager } from "../../../Manager";
import { Draw } from "../../../model/Draw";
import { MyRect } from "../../../model/MyRect";
import { Schema } from "../../../model/Schema";
import { TableDTO } from "../../../model/TableDTO";
import RasterModelerFormat from "../../../RasterModelerFormat";
import { DrawScene } from "../../../scenes/DrawScene";
import { ScriptingScene } from "../../../scenes/ScriptingScene";
import { DrawChar } from "../../../model/DrawChar";
import { SchemaDTO } from "../../../model/SchemaDTO";


export default function CanvasSecondaryTopToolbar() {
    
    const newSchema = () => {
        const oldDraw = Manager.getInstance().draw;
        Manager.getInstance().changeScene(new DrawScene(new Draw(new Schema([]), oldDraw.getWorld())));
    }

    const saveAsJpg = async () => {
        async function main(app: PIXI.Application) {
            let draw = Manager.getInstance().draw;
            renderScreen(app, draw.schema.worldDrawArea, draw.getWorldCharGrid().height, draw.getWorldCharGrid().width);
        
            const containerSize = app.stage.getBounds();
            const container = new PIXI.Container();
        
            const background = new PIXI.Graphics();
            background.beginFill(0xFFFFFF);
            background.drawRect(containerSize.x, containerSize.y, containerSize.width, containerSize.height)
            background.endFill();
        
            container.addChild(background);
            container.addChild(app.stage);
            const img = app.renderer.plugins.extract.image(container);
            const a = document.createElement('a');
            document.body.append(a);
            a.download = `RasterModeler_${dayjs().format('YYYY-MM-DD-HH-mm-ss')}_screenshot.jpg`;
            a.href = img.src;
            a.click();
            a.remove();
            app.destroy(false, true);
        }
        
        
        function renderScreen(app: PIXI.Application, worldDrawArea: DrawChar[], worldCharHeight: number, worldCharWidth: number) {
            for (let y = 0; y < worldCharHeight; y++) {
                for (let x = 0; x < worldCharWidth; x++) {
                    let tile = worldDrawArea[y * worldCharWidth + x];
                    if (tile.char === " ") { continue; }
                    let bitmapText = new PIXI.BitmapText(tile.char,
                        {
                            fontName: "Consolas-24",
                            fontSize: 24,
                            tint: tile.color
                        });
                    bitmapText.x = x * 12;
                    bitmapText.y = y * 24;
                    app.stage.addChild(bitmapText);
                }
            }
        }

        const app = new PIXI.Application();
        await main(app)
    }

    const saveToClipboard = async () => {
        let draw = Manager.getInstance().draw;

        let width = draw.getWorldCharGrid().width;
        let height = draw.getWorldCharGrid().height;
        let sb = [];
        let xMax = 0;
        let xMin = width;
        let yMax = 0;
        let yMin = height;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let tile = draw.schema.worldDrawArea[y * width + x];
                if (tile.char !== " ") {
                    xMin = Math.min(xMin, x);
                    xMax = Math.max(xMax, x);
                    yMin = Math.min(yMin, y);
                    yMax = Math.max(yMax, y);
                }
            }
        }
        for (let y = yMin; y <= yMax; y++) {
            for (let x = xMin; x <= xMax; x++) {
                sb.push(draw.schema.worldDrawArea[y * width + x].char);
            }
            sb.push("\n");
        }
        let content = sb.join("");
        navigator.clipboard.writeText(content)
    }

    const saveAsJson = async () => {
        let element = document.createElement('a');
        let schema = SchemaDTO.init(Manager.getInstance().draw)
        element.setAttribute('href', 'data:application/json;charset=utf-8,' + schema.getJson());
        element.setAttribute('download', `RasterModeler_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.json`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    const importFile = () => {
        let reader = new FileReader();
        reader.onload = (event: ProgressEvent) => {
            let file = (event.target as FileReader).result as string;
            let tables = JSON.parse(file);
            let draw = new Draw(new Schema(tables), new MyRect(0, 0, 3240, 2160))
            Manager.getInstance().changeScene(new DrawScene(draw))
        }
        let startReadingFile = (thisElement: HTMLInputElement) => {
            let inputFile = thisElement.files![0];
            reader.readAsText(inputFile);
        }
        let input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.addEventListener("change", () => startReadingFile(input));
        input.click();
    }

    const loadSchema = async (fileName: string) => {
        let text = await (await fetch(EnvGlobals.BASE_URL + `/wwwroot/data/${fileName}`, { cache: "no-cache" })).text();
        let draw = RasterModelerFormat.parse(text);
        Manager.getInstance().changeScene(new DrawScene(draw));
    }
    
    return (
        <ul className="navbar-nav me-auto" style={{ flexDirection: 'row' }}>
            <li className="nav-item dropdown">
                <button className="btn" data-bs-toggle="dropdown">
                    File
                </button>
                <ul className="dropdown-menu" style={{ position: 'absolute' }}>
                    <li>
                        {/* https://www.svgrepo.com/svg/376495/file-line */}
                        <button onClick={() => newSchema()} className="dropdown-item">
                            <svg width={24} height={24} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none"><path stroke="#000000" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 9v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8m6 6v-.172a2 2 0 0 0-.586-1.414l-3.828-3.828A2 2 0 0 0 14.172 3H14m6 6h-4a2 2 0 0 1-2-2V3" /></svg>
                            New schema
                        </button>
                    </li>
                    <li>
                        <button onClick={() => saveAsJson()} className="dropdown-item">
                            <svg fill="#000000" height={24} viewBox="0 0 24 24" width={24} xmlns="http://www.w3.org/2000/svg"><path className="icon" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" /><path d="M0 0h24v24H0z" fill="none" /></svg>
                            Save
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
                            Add to clipboard
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
            <li className="nav-item dropdown">
                <button className="btn" data-bs-toggle="dropdown">
                    Samples
                </button>
                <ul className="dropdown-menu" style={{ position: 'absolute' }}>
                    <li>
                        <button onClick={() => loadSchema("OrderingSystem.json")} className="dropdown-item">
                            Ordering System
                        </button>
                    </li>
                </ul>
            </li>
        </ul>
    );
}