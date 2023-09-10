import dayjs from "dayjs";
import DomainDraw from "../../model/domain/DomainDraw";
import { useApplicationState } from "../../Store";
import { CommandSetSchema, CommandSetSchemaArgs } from "../../commands/appCommands/CommandSetSchema";
import { useEffect } from "react";
import CommandHistory from "../../commands/CommandHistory";

interface TopToolbarListElementIconProps {
    onClickAction: () => void,
    iconSrc?: string,
    children: React.ReactNode
}

function TopToolbarListElementIcon( {onClickAction, iconSrc, children}: TopToolbarListElementIconProps) {
    return (
        <button onClick={onClickAction} className="dropdown-item d-flex w-100">
            {iconSrc !== undefined ? <img className="me-2" src={iconSrc} /> : null }
            <span>{children}</span>
        </button>
    )
}

export const SECONDARY_TOOLBAR_HEIGHT_PX = 38;

type SecondaryTopToolbarProps = {
    exportPngImage: () => void
}

export default function SecondaryTopToolbar( { exportPngImage } : SecondaryTopToolbarProps) {
    const tables = useApplicationState(state => state.schemaTables)
    const setTables = useApplicationState(state => state.setTables)
    const history = useApplicationState(state => state.history)
    const activeDatabaseId = useApplicationState(state => state.activeDatabaseId)

    const newSchema = () => {
        setSchema(new DomainDraw([], activeDatabaseId));
    }
    const saveAsJson = () => {
        let element = document.createElement('a');
        let domainDraw = DomainDraw.init({
            tables,
            activeDatabaseId
        })
        // encodeURIComponent is needed to maintain newlines
        element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(domainDraw.getJson()));
        element.setAttribute('download', `HedgehogDBD_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.json`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }
    const importFile = () => {
        let reader = new FileReader();
        reader.onload = (event: ProgressEvent) => {
            let file = (event.target as FileReader).result as string;
            let domainDraw = DomainDraw.parse(file);
            setSchema(domainDraw);
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

    const undo = () => {
        CommandHistory.undo(history, {tables}, setTables);
    }
    const redo = () => {
        CommandHistory.redo(history, {tables}, setTables);
    }

    useEffect(() => {
        const keyboardEventHandlers = (e: KeyboardEvent) => { 
            if (e.key.toLocaleLowerCase() === "z" && e.ctrlKey && !e.shiftKey) {
                undo();
            }
            if (e.key.toLowerCase() === "z" && e.ctrlKey && e.shiftKey) {
                redo();
            }
        }
        window.addEventListener('keydown', keyboardEventHandlers);
        return () => window.removeEventListener('keydown', keyboardEventHandlers)
    }, [])

    const loadSchema = async (fileName: string) => {
        let text = await (await fetch(`/wwwroot/data/${fileName}`, { cache: "no-cache" })).text();
        let newDomainDraw = DomainDraw.parse(text)
        setSchema(newDomainDraw);
   }

   const setSchema = (newDomainDraw: DomainDraw) => {
        let oldDomainDraw = DomainDraw.init({tables, activeDatabaseId})
        const command = new CommandSetSchema(
            {tables}, 
            new CommandSetSchemaArgs(
                oldDomainDraw, 
                newDomainDraw
            )
        )
        CommandHistory.execute(history, command, setTables);
   }

    return (
        <div className="navbar-nav me-auto bg-grey" style={{ flexDirection: 'row', height: `${SECONDARY_TOOLBAR_HEIGHT_PX}px`, borderBottomWidth: "1px", borderStyle: "solid", alignItems: "center" }}>
            <button className="btn rounded-0" onClick={() => newSchema()}>
                <img className="me-2" src={`/wwwroot/img/svg/file-line.svg`} />
                New
            </button>
            <button className="btn rounded-0" onClick={() => saveAsJson()}>
                <img className="me-2" src={`/wwwroot/img/svg/file-download.svg`} />
                Save
            </button>
            <button className="btn rounded-0" onClick={() => importFile()}>
                <img className="me-2" src={`/wwwroot/img/svg/import.svg`} />
                Import
            </button>
            <button className="btn rounded-0" onClick={() => exportPngImage()}>
                <img className="me-2" src={`/wwwroot/img/svg/image-download.svg`} />
                Export
            </button>

            <div className="border-start border-dark h-100"></div>

            <button className="btn rounded-0" onClick={() => undo()}>
                <img src={`/wwwroot/img/svg/undo.svg`} />
            </button>
            <button className="btn rounded-0" onClick={() => redo()}>
                <img src={`/wwwroot/img/svg/redo.svg`} />
            </button>

            <div className="border-start border-dark h-100"></div>

            <div className="nav-item dropdown">
                <button className="btn" data-bs-toggle="dropdown" style={{ borderRadius: "0px" }}>
                    Examples
                </button>
                <ul className="dropdown-menu" style={{ position: 'absolute' }}>
                    <li>
                        <TopToolbarListElementIcon onClickAction={() => loadSchema("Elron.json")}>
                            Elron
                        </TopToolbarListElementIcon>
                        <TopToolbarListElementIcon onClickAction={() => loadSchema("Prescription.json")}>
                            Prescription
                        </TopToolbarListElementIcon>
                        <TopToolbarListElementIcon onClickAction={() => loadSchema("OrderingSystem.json")}>
                            Ordering System
                        </TopToolbarListElementIcon>
                        {/*
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
                        */
                        }
                    </li>
                </ul>
            </div>
            <div className="vertical-seperator" style={{ margin: "0 44px 0 0" }}></div>
        </div>
    )
}