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

    const newSchema = () => {

    }
    const saveAsJson = () => {

    }
    const importFile = () => {

    }

    const undo = () => {

    }
    const redo = () => {

    }

    console.log("SecondaryTopToolbar")


    const loadSchema = async (fileName: string) => {
        let text = await (await fetch(`${ROOT_URL}/wwwroot/data/${fileName}`, { cache: "no-cache" })).text();
        let newDomainDraw = DomainDraw.parse(text)
        let vmDraw = newDomainDraw.mapToVm(
            ManagerSingleton.getDraw().history,
            ManagerSingleton.getDraw().activeDatabase,
        );
        /*
        let oldDomainDraw = DomainDraw.init(ManagerSingleton.getDraw())
        const command = new CommandSetSchema(
            oldDomainDraw, 
            new CommandSetSchemaArgs(
                oldDomainDraw, 
                newDomainDraw
            )
        )
        ManagerSingleton.getDraw().history.execute(command);
        */

        ManagerSingleton.getDraw().schemaTables = vmDraw.schemaTables;
        ManagerSingleton.getDraw().schemaTables.forEach(x => x.isDirty = true);
        ManagerSingleton.getDraw().schemaRelations = vmDraw.schemaTables.flatMap(table => table.getRelations(vmDraw.schemaTables));
        ManagerSingleton.getDraw().schemaRelations.forEach(x => x.isDirty = true);
        console.log(ManagerSingleton.getDraw().schemaTables)
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
        </div>
    )
}