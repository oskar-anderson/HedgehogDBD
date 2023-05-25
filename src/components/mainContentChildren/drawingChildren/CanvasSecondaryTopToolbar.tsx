import dayjs from "dayjs";
import EnvGlobals from "../../../../EnvGlobals";
import * as PIXI from "pixi.js";
import { Manager } from "../../../Manager";
import { Draw } from "../../../model/Draw";
import { MyRect } from "../../../model/MyRect";
import { Schema } from "../../../model/Schema";
import { TableDTO } from "../../../model/dto/TableDTO";
import RasterModelerFormat from "../../../RasterModelerFormat";
import { DrawScene } from "../../../scenes/DrawScene";
import { ScriptingScene } from "../../../scenes/ScriptingScene";
import { SchemaDTO } from "../../../model/dto/SchemaDTO";
import { CostGrid } from "../../../model/CostGrid";
import { History } from "../../../commands/History";


interface CanvasSecondaryTopToolbarProps {
    setZoomFontSize: (size: number) => void;
    heightPx: number;
}
export default function CanvasSecondaryTopToolbar({ setZoomFontSize, heightPx}: CanvasSecondaryTopToolbarProps) {

    const newSchema = () => {
        const oldDraw = Manager.getInstance().draw;
        Manager.getInstance().changeScene(new DrawScene(new Draw(new Schema([]), oldDraw.getWorld())));
    }

    const saveAsJpg = async () => {
        let app = Manager.getInstance().getApp();
        let oldFontSize = Manager.getInstance().draw.selectedFontSize.size;
        let maxFontSize = Math.max(...Draw.fontSizes_Inconsolata.map(x => x.size))
        setZoomFontSize(maxFontSize);
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
        setZoomFontSize(oldFontSize);
    }

    const saveToClipboard = async () => {
        let draw = Manager.getInstance().draw;

        let worldRect = draw.getWorldCharGrid();
        let drawArea: string[][] = [];
        for (let y = 0; y < worldRect.height; y++) {
            let row: string[] = [];
            for (let x = 0; x < worldRect.width; x++) {
                row.push(' ');
            }
            drawArea.push(row);
        }
        for (let table of draw.schema.tables) {
            let table2D = DrawScene.setWorldTable2(
                table.tableRows.map(x => { return { name: x.name, datatype: x.datatype, attributes: x.attributes.join(", ") } }),
                table.head,
                table.getContainingRect()
            );
            for (let y = 0; y < table2D.length; y++) {
                for (let x = 0; x < table2D[0].length; x++) {
                    drawArea[y + table.getPosition().y][x + table.getPosition().x] = table2D[y][x];
                }
            }
            for (let relation of table.relations) {
                for (let path of relation.points) {
                    drawArea[path.y][path.x] = "*";
                }
            }
        }

        let content2D = trim(drawArea);
        let content = content2D.map(x => x.join("")).join("\n")
        navigator.clipboard.writeText(content)
    }

    function trim<T>(drawArea: T[][]): T[][] {
        let result: T[][] = [];
        let xMax = 0;
        let xMin = Number.MAX_VALUE;
        let yMax = 0;
        let yMin = Number.MAX_VALUE;
        for (let y = 0; y < drawArea.length; y++) {
            for (let x = 0; x < drawArea[0].length; x++) {
                if (drawArea[y][x] !== " ") {
                    xMin = Math.min(xMin, x);
                    xMax = Math.max(xMax, x);
                    yMin = Math.min(yMin, y);
                    yMax = Math.max(yMax, y);
                }
            }
        }
        for (let y = yMin; y <= yMax; y++) {
            let row: T[] = []
            for (let x = xMin; x <= xMax; x++) {
                row.push(drawArea[y][x]);
            }
            result.push(row);
        }
        return result;
    }

    const saveAsJson = async () => {
        let element = document.createElement('a');
        let schema = SchemaDTO.init(Manager.getInstance().draw)
        // encodeURIComponent is needed to maintain newlines
        element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(schema.getJson()));
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
            let schema = RasterModelerFormat.parse(file);
            Manager.getInstance().draw.schema = schema;
            Manager.getInstance().draw.history = new History();
            Manager.getInstance().changeScene(new DrawScene(Manager.getInstance().draw));
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
        let schema = RasterModelerFormat.parse(text);
        Manager.getInstance().draw.schema = schema;
        Manager.getInstance().draw.history = new History();
        Manager.getInstance().changeScene(new DrawScene(Manager.getInstance().draw));
    }

    return (
        <div className="navbar-nav me-auto" style={{ flexDirection: 'row', height: `${heightPx}px`, borderBottomWidth: "1px", borderStyle: "solid", alignItems: "center" }}>
            <div className="nav-item dropdown">
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
            </div>
            <div className="nav-item dropdown">
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
            </div>
            <div className="vertical-seperator" style={{ margin: "0 44px 0 0" }}></div>
            <select defaultValue={Manager.getInstance().draw.selectedFontSize.size} name="zoom-font-size" onChange={(e) => setZoomFontSize(Number.parseInt((e.target as HTMLSelectElement).value))} className="zoom-font-size" autoComplete="off">
                {
                    Draw.fontSizes_Inconsolata.map(x =>
                        <option key={x.size} value={x.size}>{x.size} pt</option>
                    )
                }
            </select>
        </div>
    );
}