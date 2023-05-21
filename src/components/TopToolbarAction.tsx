import { Manager } from "../Manager";
import { DrawScene } from "../scenes/DrawScene";
import { ScriptingScene } from "../scenes/ScriptingScene";
import { AppState } from "./MainContent";
import EnvGlobals from "../../EnvGlobals";
import { useEffect, useRef, useState } from "react";
import { Tooltip } from 'bootstrap'


interface TopToolbarActionProps {
  currentState: AppState
}


export default function TopToolbarAction({ currentState } : TopToolbarActionProps) {
  const [isDrawIconFocused, setIsDrawIconFocused] = useState(false)
  const [isScriptIconFocused, setIsScriptIconFocused] = useState(false)
  const drawTooltipRef = useRef<HTMLImageElement>(null)
  const scriptingTooltipRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const draw = new Tooltip(drawTooltipRef.current!)
    const scripting = new Tooltip(scriptingTooltipRef.current!)

    // While using something more React oriented might be more elequent, this works wihout flickering side effects (unlike react-bootstrap - https://github.com/react-bootstrap/react-bootstrap/issues/6314). 
    const [handleDrawShow, handleDrawHide, handleScriptingShow, handleScriptingHide] = 
    [() => setIsDrawIconFocused(true), () => setIsDrawIconFocused(false), () => setIsScriptIconFocused(true), () => setIsScriptIconFocused(false) ]
    drawTooltipRef.current!.addEventListener("show.bs.tooltip", handleDrawShow);
    drawTooltipRef.current!.addEventListener("hide.bs.tooltip", handleDrawHide);
    
    scriptingTooltipRef.current!.addEventListener("show.bs.tooltip", handleScriptingShow);
    scriptingTooltipRef.current!.addEventListener("hide.bs.tooltip", handleScriptingHide);

    return () => {
      draw.dispose()
      scripting.dispose()
    }
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
    defaultLinkColor_f1f1f1: {
      filter: 'brightness(0) saturate(100%) invert(100%) sepia(12%) saturate(73%) hue-rotate(117deg) brightness(115%) contrast(89%)'
    },
    selectedLinkColor_99968c: {
      filter: 'brightness(0) saturate(100%) invert(69%) sepia(0%) saturate(6996%) hue-rotate(219deg) brightness(84%) contrast(91%)'
    },
    activeLinkColor_edca63: {
      filter: 'brightness(0) saturate(100%) invert(82%) sepia(47%) saturate(504%) hue-rotate(349deg) brightness(96%) contrast(93%)'
    }
  }

  return (
    <nav className="py-1 px-4 navbar navbar-expand-lg" style={{ backgroundColor: 'rgb(255, 73, 73)' }}>
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          <img style={{ height: '36px' }} src={EnvGlobals.BASE_URL + "/wwwroot/img/logo_compact_white.png"} />
        </a>
        <ul className="navbar-nav me-auto flex-row ms-3 gap-3">
          <li>
            <img ref={drawTooltipRef} data-bs-toggle="tooltip" data-bs-placement="bottom" title="Draw" style={currentState === AppState.DrawScene ? linkStyles.activeLinkColor_edca63 : (isDrawIconFocused ? linkStyles.selectedLinkColor_99968c : linkStyles.defaultLinkColor_f1f1f1)} 
              width={42} height={42} src={EnvGlobals.BASE_URL + "/wwwroot/img/icons/erd-icon.png"} alt="Draw" onClick={() => changeSceneToDraw()} />
          </li>
          <li>
            <img ref={scriptingTooltipRef} data-bs-toggle="tooltip" data-bs-placement="bottom" title="Scripting" style={currentState === AppState.ScriptingScene ? linkStyles.activeLinkColor_edca63 : (isScriptIconFocused ? linkStyles.selectedLinkColor_99968c : linkStyles.defaultLinkColor_f1f1f1)} 
                width={42} height={42} src={EnvGlobals.BASE_URL + "/wwwroot/img/icons/code-icon.png"} alt="Scripting" onClick={() => changeSceneToScripting()} />
          </li>
        </ul>
      </div>
    </nav>
  )
}