import dayjs from "dayjs";
import { ROOT_URL } from "../../Main"
import DomainDraw from "../../model/domain/DomainDraw";
import ManagerSingleton from "../../ManagerSingleton";
import { CommandSetSchema, CommandSetSchemaArgs } from "../../commands/appCommands/CommandSetSchema";

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

export const SECONDARY_TOOLBAR_HEIGHT_PX = 38;

type SecondaryTopToolbarProps = {
    exportPngImage: () => void
}

export default function SecondaryTopToolbar( { exportPngImage } : SecondaryTopToolbarProps) {
    const draw = ManagerSingleton.getDraw();

    const newSchema = () => {
        setSchema(new DomainDraw([]));
    }
    const saveAsJson = () => {
        let element = document.createElement('a');
        let domainDraw = DomainDraw.init(draw)
        // encodeURIComponent is needed to maintain newlines
        element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(domainDraw.getJson()));
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
        const draw = ManagerSingleton.getDraw();
        draw.history.undo(draw);
    }
    const redo = () => {
        const draw = ManagerSingleton.getDraw();
        draw.history.redo(draw);
    }

    const loadSchema = async (fileName: string) => {
        let text = await (await fetch(`${ROOT_URL}/wwwroot/data/${fileName}`, { cache: "no-cache" })).text();
        let newDomainDraw = DomainDraw.parse(text)
        setSchema(newDomainDraw);
   }

   const setSchema = (newDomainDraw: DomainDraw) => {
        let oldDomainDraw = DomainDraw.init(ManagerSingleton.getDraw())
        const command = new CommandSetSchema(
            ManagerSingleton.getDraw(), 
            new CommandSetSchemaArgs(
                oldDomainDraw, 
                newDomainDraw
            )
        )
        draw.history.execute(command);
   }

    return (
        <div className="navbar-nav me-auto bg-grey" style={{ flexDirection: 'row', height: `${SECONDARY_TOOLBAR_HEIGHT_PX}px`, borderBottomWidth: "1px", borderStyle: "solid", alignItems: "center" }}>
            <div className="nav-item dropdown">
                <button className="btn" data-bs-toggle="dropdown" style={{ borderRadius: "0px" }}>
                    File
                </button>
                <ul className="dropdown-menu" style={{ position: 'absolute' }}>
                    <li>
                        <TopToolbarListElementIcon onClickAction={() => newSchema()} iconSrc={`${ROOT_URL}/wwwroot/img/svg/file-line.svg`} >
                            New schema
                        </TopToolbarListElementIcon>
                    </li>
                    <li>
                        <TopToolbarListElementIcon onClickAction={() => saveAsJson()} iconSrc={`${ROOT_URL}/wwwroot/img/svg/file-download.svg`} >
                            Save
                        </TopToolbarListElementIcon>
                    </li>
                    <li>
                        <TopToolbarListElementIcon onClickAction={() => exportPngImage()} iconSrc={`${ROOT_URL}/wwwroot/img/svg/image-download.svg`} >
                            Export image
                        </TopToolbarListElementIcon>
                    </li>
                    <li>
                        <TopToolbarListElementIcon onClickAction={() => importFile()} iconSrc={`${ROOT_URL}/wwwroot/img/svg/import.svg`}>
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
                        <TopToolbarListElementIcon onClickAction={() => undo()} iconSrc={`${ROOT_URL}/wwwroot/img/svg/undo.svg`}>
                            Undo
                        </TopToolbarListElementIcon>
                    </li>
                    <li>
                        <TopToolbarListElementIcon onClickAction={() => redo()} iconSrc={`${ROOT_URL}/wwwroot/img/svg/redo.svg`}>
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
                        <TopToolbarListElementIcon onClickAction={() => loadSchema("OrderingSystem.json")}>
                            Ordering System
                        </TopToolbarListElementIcon>
                        <TopToolbarListElementIcon onClickAction={() => loadSchema("Prescription.json")}>
                            Prescription
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