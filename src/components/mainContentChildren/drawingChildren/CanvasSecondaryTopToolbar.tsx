import dayjs from "dayjs";
import EnvGlobals from "../../../../EnvGlobals";
import * as PIXI from "pixi.js";
import { Draw } from "../../../model/Draw";
import { TableDTO } from "../../../model/dto/TableDTO";
import RasterModelerFormat from "../../../RasterModelerFormat";
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
    heightPx: number;
    draw: Draw;
    setIsScreenDirty: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CanvasSecondaryTopToolbar({ heightPx, draw, setIsScreenDirty }: CanvasSecondaryTopToolbarProps) {

    const newSchema = () => {
        setSchemaAndUpdateUi(new SchemaDTO([]));
    }

    const saveAsJson = async () => {
        let element = document.createElement('a');
        let schema = SchemaDTO.init(draw)
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
        const oldDtoTables = draw.schema.tables.map(x => TableDTO.initFromTable(x))
        const command = new CommandSetSchema(
            draw, new CommandSetSchemaArgs(
                new SchemaDTO(oldDtoTables), 
                newSchema
            )
        )
        draw.history.execute(command);
        setIsScreenDirty(true);
    }

    const undo = (): void => {
        draw.history.undo(draw);
        setIsScreenDirty(true);
    }

    const redo = (): void => {
        draw.history.redo(draw);
        setIsScreenDirty(true);
    }

    const [highlightActiveSideToolbarTool, setHighlightActiveSideToolbarTool] = useState(IToolNames.select);


    const onToolSelectClick = (selectedTool: IToolNames): void => {
        setHighlightActiveSideToolbarTool(selectedTool);
        IToolManager.toolActivate(draw, selectedTool);
        setIsScreenDirty(true);  // clean up new table hover
    };

    return (
        <div className="navbar-nav me-auto bg-grey" style={{ flexDirection: 'row', height: `${heightPx}px`, borderBottomWidth: "1px", borderStyle: "solid", alignItems: "center" }}>
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
                        <TopToolbarListElementIcon onClickAction={() => { /* TODO */}} iconSrc={EnvGlobals.BASE_URL + "/wwwroot/img/svg/image-download.svg"} >
                            Export image
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
                        <TopToolbarListElementIcon onClickAction={() => loadSchema("Elron.json")}>
                            Elron
                        </TopToolbarListElementIcon>
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
                        <TopToolbarListElementIcon onClickAction={() => loadSchema("Prescription.json")}>
                            Prescription
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