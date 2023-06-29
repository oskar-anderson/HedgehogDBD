import dayjs from "dayjs";
import EnvGlobals from "../../../../EnvGlobals";
import * as PIXI from "pixi.js";
import { Manager } from "../../../Manager";
import { Draw } from "../../../model/Draw";
import { TableDTO } from "../../../model/dto/TableDTO";
import RasterModelerFormat from "../../../RasterModelerFormat";
import { DrawScene } from "../../../scenes/DrawScene";
import { SchemaDTO } from "../../../model/dto/SchemaDTO";
import { IToolManager, IToolNames } from "../../../tools/ITool";
import { useState } from "react";
import { CommandSetSchema, CommandSetSchemaArgs } from "../../../commands/appCommands/CommandSetSchema";

interface TopToolbarListElementIconProps {
    onClickAction: () => void,
    iconSrc?: string,
    children: React.ReactNode
}

function TopToolbarListElementIcon( {onClickAction, iconSrc, children}: TopToolbarListElementIconProps) {
    return (
        <button onClick={onClickAction} className="dropdown-item d-flex">
            {iconSrc !== undefined ? <img className="me-2" src={iconSrc} /> : null }
            <span>{children}</span>
        </button>
    )
}

interface CanvasSecondaryTopToolbarProps {
    setZoomFontSize: (size: number) => void;
    heightPx: number;
}

export default function CanvasSecondaryTopToolbar({ setZoomFontSize, heightPx}: CanvasSecondaryTopToolbarProps) {

    const newSchema = () => {
        setSchemaAndUpdateUi(new SchemaDTO([]));
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
        for (let table of draw.schema.getTables()) {
            let table2D = DrawScene.setWorldTable2(table);
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
            let schemaDTO = RasterModelerFormat.parse(file);
            setSchemaAndUpdateUi(schemaDTO);
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
        let schemaDTO = RasterModelerFormat.parse(text);
        setSchemaAndUpdateUi(schemaDTO);
    }

    const setSchemaAndUpdateUi = (newSchema: SchemaDTO) => {
        const oldDtoTables = Manager.getInstance().draw.schema.tables.map(x => TableDTO.initFromTable(x))
        const command = new CommandSetSchema(
            Manager.getInstance().draw, new CommandSetSchemaArgs(
                new SchemaDTO(oldDtoTables), 
                newSchema
            )
        )
        Manager.getInstance().draw.history.execute(command);
        (Manager.getInstance().getScene() as DrawScene).renderScreen();
    }

    const undo = (): void => {
        const draw = Manager.getInstance().draw;
        draw.history.undo(draw);
        (Manager.getInstance().getScene() as DrawScene).renderScreen();
    }

    const redo = (): void => {
        const draw = Manager.getInstance().draw;
        draw.history.redo(draw);
        (Manager.getInstance().getScene() as DrawScene).renderScreen();
    }

    const [highlightActiveSideToolbarTool, setHighlightActiveSideToolbarTool] = useState(IToolNames.select);


    const onToolSelectClick = (selectedTool: IToolNames): void => {
        const draw = Manager.getInstance().draw;
        setHighlightActiveSideToolbarTool(selectedTool);
        IToolManager.toolActivate(draw, selectedTool);
        (Manager.getInstance().getScene() as DrawScene).renderScreen();  // clean up new table hover
    };

    return (
        <div className="navbar-nav me-auto" style={{ flexDirection: 'row', height: `${heightPx}px`, borderBottomWidth: "1px", borderStyle: "solid", alignItems: "center" }}>
            <div className="nav-item dropdown">
                <button className="btn" data-bs-toggle="dropdown" style={{ borderRadius: "0px" }}>
                    File
                </button>
                <ul className="dropdown-menu" style={{ position: 'absolute' }}>
                    <li>
                        <TopToolbarListElementIcon onClickAction={() => newSchema()} iconSrc={EnvGlobals.BASE_URL + "/wwwroot/img/svg/file-line.svg"} >
                            New schema
                        </TopToolbarListElementIcon>
                    </li>
                    <li>
                        <TopToolbarListElementIcon onClickAction={() => saveAsJson()} iconSrc={EnvGlobals.BASE_URL + "/wwwroot/img/svg/file-download.svg"} >
                            Save
                        </TopToolbarListElementIcon>
                    </li>
                    <li>
                        <TopToolbarListElementIcon onClickAction={() => saveAsJpg()} iconSrc={EnvGlobals.BASE_URL + "/wwwroot/img/svg/image-download.svg"} >
                            Export image
                        </TopToolbarListElementIcon>
                    </li>
                    <li>
                        <TopToolbarListElementIcon onClickAction={() => saveToClipboard()} iconSrc={EnvGlobals.BASE_URL + "/wwwroot/img/svg/copy.svg"} >
                            Add to clipboard
                        </TopToolbarListElementIcon>
                    </li>
                    <li>
                        <TopToolbarListElementIcon onClickAction={() => importFile()} iconSrc={EnvGlobals.BASE_URL + "/wwwroot/img/svg/import.svg"}>
                            Import
                        </TopToolbarListElementIcon>
                    </li>
                </ul>
            </div>
            <div className="nav-item dropdown">
                <button className="btn" data-bs-toggle="dropdown" style={{ borderRadius: "0px" }}>
                    Edit
                </button>
                <ul className="dropdown-menu" style={{ position: 'absolute' }}>
                    <li>
                        <TopToolbarListElementIcon onClickAction={() => undo()} iconSrc={EnvGlobals.BASE_URL + "/wwwroot/img/svg/undo.svg"}>
                            Undo
                        </TopToolbarListElementIcon>
                    </li>
                    <li>
                        <TopToolbarListElementIcon onClickAction={() => redo()} iconSrc={EnvGlobals.BASE_URL + "/wwwroot/img/svg/redo.svg"}>
                            Redo
                        </TopToolbarListElementIcon>
                    </li>
                </ul>
            </div>
            <div className="nav-item dropdown">
                <button className="btn" data-bs-toggle="dropdown" style={{ borderRadius: "0px" }}>
                    Samples
                </button>
                <ul className="dropdown-menu" style={{ position: 'absolute' }}>
                    <li>
                        <TopToolbarListElementIcon onClickAction={() => loadSchema("Bookit.json")}>
                            Bookit
                        </TopToolbarListElementIcon>
                        <TopToolbarListElementIcon onClickAction={() => loadSchema("BorderGuard.json")}>
                            Border Guard
                        </TopToolbarListElementIcon>
                        <TopToolbarListElementIcon onClickAction={() => loadSchema("ChickenCoop.json")}>
                            Chicken Coop
                        </TopToolbarListElementIcon>
                        <TopToolbarListElementIcon onClickAction={() => loadSchema("Horse.json")}>
                            Horse
                        </TopToolbarListElementIcon>
                        <TopToolbarListElementIcon onClickAction={() => loadSchema("TaxIT.json")}>
                            TaxIT
                        </TopToolbarListElementIcon>
                        <TopToolbarListElementIcon onClickAction={() => loadSchema("OrderingSystem.json")}>
                            Ordering System
                        </TopToolbarListElementIcon>
                    </li>
                </ul>
            </div>
            <div className="vertical-seperator" style={{ margin: "0 44px 0 0" }}></div>
            
            <button onClick={() => onToolSelectClick(IToolNames.select)} className={`tool-select btn ${highlightActiveSideToolbarTool === IToolNames.select ? 'active' : ''}`} style={{ borderRadius: 0 }} title="Select/Edit table">
                <svg width="16px" height="16px" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M3.29227 0.048984C3.47033 -0.032338 3.67946 -0.00228214 3.8274 0.125891L12.8587 7.95026C13.0134 8.08432 13.0708 8.29916 13.0035 8.49251C12.9362 8.68586 12.7578 8.81866 12.5533 8.82768L9.21887 8.97474L11.1504 13.2187C11.2648 13.47 11.1538 13.7664 10.9026 13.8808L8.75024 14.8613C8.499 14.9758 8.20255 14.8649 8.08802 14.6137L6.15339 10.3703L3.86279 12.7855C3.72196 12.934 3.50487 12.9817 3.31479 12.9059C3.1247 12.8301 3 12.6461 3 12.4414V0.503792C3 0.308048 3.11422 0.130306 3.29227 0.048984ZM4 1.59852V11.1877L5.93799 9.14425C6.05238 9.02363 6.21924 8.96776 6.38319 8.99516C6.54715 9.02256 6.68677 9.12965 6.75573 9.2809L8.79056 13.7441L10.0332 13.178L8.00195 8.71497C7.93313 8.56376 7.94391 8.38824 8.03072 8.24659C8.11753 8.10494 8.26903 8.01566 8.435 8.00834L11.2549 7.88397L4 1.59852Z" fill="#000000" />
                </svg>
            </button>

            <button onClick={() => onToolSelectClick(IToolNames.newTable)} className={`tool-select btn ${highlightActiveSideToolbarTool === IToolNames.newTable ? 'active' : ''}`} style={{ borderRadius: 0 }} title="New table">
                <svg width="16px" height="16px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
                    <path stroke="#000000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2M3 8v6m0-6h6m12 0v4m0-4H9m-6 6v4a2 2 0 0 0 2 2h4m-6-6h6m0-6v6m0 0h4a2 2 0 0 0 2-2V8m-6 6v6m0 0h2m7-5v3m0 0v3m0-3h3m-3 0h-3" />
                </svg>
            </button>
        </div>
    );
}