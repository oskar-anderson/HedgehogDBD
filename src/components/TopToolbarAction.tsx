import { Manager } from "../Manager";
import { DrawScene } from "../scenes/DrawScene";
import { ScriptingScene } from "../scenes/ScriptingScene";
import { AppState } from "./MainContent";
import EnvGlobals from "../../EnvGlobals";
import { useEffect, useRef, useState } from "react";
import { Tooltip } from 'bootstrap'
import SettingsModal from "./SettingsModal";


interface TopToolbarActionProps {
    currentState: AppState
    heightPx: number
}


export default function TopToolbarAction({ currentState, heightPx } : TopToolbarActionProps) {
    const [isDrawIconFocused, setIsDrawIconFocused] = useState(false)
    const [isScriptIconFocused, setIsScriptIconFocused] = useState(false)
    const [isSettingsIconFocused, setIsSettingsIconFocused] = useState(false)
    const drawTooltipIcon = useRef<HTMLImageElement>(null)
    const scriptingIconRef = useRef<HTMLImageElement>(null)
    const settingsIconRef = useRef<HTMLImageElement>(null)

    const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);

    useEffect(() => {
        const draw = new Tooltip(drawTooltipIcon.current!)
        const scripting = new Tooltip(scriptingIconRef.current!)
        const settings = new Tooltip(settingsIconRef.current!)

        // While using something more React oriented might be more elequent, this works wihout flickering side effects (unlike react-bootstrap - https://github.com/react-bootstrap/react-bootstrap/issues/6314). 
        const [
            handleDrawShow, handleDrawHide, 
            handleScriptingShow, handleScriptingHide, 
            handleSettingsShow, handleSetingsHide] = 
        [
            () => setIsDrawIconFocused(true), () => setIsDrawIconFocused(false), 
            () => setIsScriptIconFocused(true), () => setIsScriptIconFocused(false),
            () => setIsSettingsIconFocused(true), () => setIsSettingsIconFocused(false)
        ]
        drawTooltipIcon.current!.addEventListener("show.bs.tooltip", handleDrawShow);
        drawTooltipIcon.current!.addEventListener("hide.bs.tooltip", handleDrawHide);
    
        scriptingIconRef.current!.addEventListener("show.bs.tooltip", handleScriptingShow);
        scriptingIconRef.current!.addEventListener("hide.bs.tooltip", handleScriptingHide);

        settingsIconRef.current!.addEventListener("show.bs.tooltip", handleSettingsShow);
        settingsIconRef.current!.addEventListener("hide.bs.tooltip", handleSetingsHide);
    }, [])

    const changeSceneToScripting = async () => {
        if (Manager.getInstance().getScene()!.getState() === AppState.ScriptingScene) { return; }
        Manager.getInstance().changeScene(new ScriptingScene());
    }
    const changeSceneToDraw = async () => {
        if (Manager.getInstance().getScene()!.getState() === AppState.DrawScene) { return; }
        Manager.getInstance().changeScene(new DrawScene(Manager.getInstance().draw));
    }

    const linkStyles = {
        // https://angel-rs.github.io/css-color-filter-generator/
        selectedLinkColor_f1f1f1: {
            filter: 'brightness(0) saturate(100%) invert(100%) sepia(12%) saturate(73%) hue-rotate(117deg) brightness(115%) contrast(89%)'
        },
        defaultLinkColor_515151: {
            filter: 'brightness(0) saturate(100%) invert(26%) sepia(0%) saturate(3789%) hue-rotate(43deg) brightness(109%) contrast(83%)'
        }
    }

  return (
    <nav className="py-1 px-4 navbar navbar-expand-lg" style={{ backgroundColor: 'rgb(255, 73, 73)', height: `${heightPx}px` }}>
        <div className="container-fluid">
                <a className="navbar-brand" href="#">
                    <img style={{ height: '36px' }} src={EnvGlobals.BASE_URL + "/wwwroot/img/logo_compact_white.png"} />
                </a>
            <ul className="navbar-nav me-auto flex-row ms-3 gap-3">
                <li>
                    <img ref={drawTooltipIcon} data-bs-toggle="tooltip" data-bs-placement="bottom" title="Draw" style={(currentState === AppState.DrawScene || isDrawIconFocused) ? linkStyles.selectedLinkColor_f1f1f1 : linkStyles.defaultLinkColor_515151} 
                    width={42} height={42} src={EnvGlobals.BASE_URL + "/wwwroot/img/icons/erd-icon.png"} alt="Draw" onClick={() => changeSceneToDraw()} />
                </li>
                <li>
                    <img ref={scriptingIconRef} data-bs-toggle="tooltip" data-bs-placement="bottom" title="Scripting" style={(currentState === AppState.ScriptingScene || isScriptIconFocused) ? linkStyles.selectedLinkColor_f1f1f1 : linkStyles.defaultLinkColor_515151} 
                        width={42} height={42} src={EnvGlobals.BASE_URL + "/wwwroot/img/icons/code-icon.png"} alt="Scripting" onClick={() => changeSceneToScripting()} />
                </li>
            </ul>
        </div>
        <div>
            <img ref={settingsIconRef} data-bs-toggle="tooltip" data-bs-placement="bottom" title="Settings" style={isSettingsIconFocused ? linkStyles.selectedLinkColor_f1f1f1 : linkStyles.defaultLinkColor_515151} 
                width={42} height={42} src={EnvGlobals.BASE_URL + "/wwwroot/img/icons/settings.png"} alt="Settings" onClick={() => setIsSettingsModalVisible(! isSettingsModalVisible) } />
        </div>

        <SettingsModal isSettingsModalVisible={isSettingsModalVisible} setIsSettingsModalVisible={setIsSettingsModalVisible} />
    </nav>
  )
}