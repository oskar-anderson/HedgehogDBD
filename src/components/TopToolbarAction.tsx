import { useRef } from "react";
import { HOST_SUFFIX, ROOT_URL } from "../Global";
import useIsElementFocused from "./UseIsElementFocused";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";

interface TopToolbarActionProps {
    currentlyLoadedLink: "Settings" | "Scripting" | "Draw";
}

export const TOP_TOOLBAR_HEIGHT_PX = 54;

export default function TopToolbarAction({ currentlyLoadedLink } : TopToolbarActionProps) {
    const drawTooltipIcon = useRef<HTMLImageElement>(null);
    const scriptingIconRef = useRef<HTMLImageElement>(null);
    const settingsIconRef = useRef<HTMLImageElement>(null);
    const drawIconIsFocused = useIsElementFocused(drawTooltipIcon)
    const scriptingIconIsFocused = useIsElementFocused(scriptingIconRef)
    const settingsIconIsFocused = useIsElementFocused(settingsIconRef)

    const navigate = useNavigate();

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
        <nav className="py-1 px-4 navbar" style={{ backgroundColor: 'rgb(255, 73, 73)', height: `${TOP_TOOLBAR_HEIGHT_PX}px`, flexWrap: "inherit" }}>
            <div className="container-fluid">
                <Link className="navbar-brand" to={ROOT_URL}>
                    <img style={{ height: '36px' }} src={ROOT_URL + "/wwwroot/img/logo_with_name_white.png"} />
                </Link>
                <ul className="navbar-nav me-auto flex-row ms-3 gap-3">
                    <li>
                        <img ref={drawTooltipIcon} data-bs-toggle="tooltip" data-bs-placement="bottom" title="Draw" style={(currentlyLoadedLink === "Draw" || drawIconIsFocused) ? linkStyles.selectedLinkColor_f1f1f1 : linkStyles.defaultLinkColor_515151} 
                            width={42} height={42} src={ROOT_URL + "/wwwroot/img/icons/erd-icon.png"} alt="Draw" onClick={() => navigate(`${HOST_SUFFIX}/draw`)} />
                    </li>
                    <li>
                        <img ref={scriptingIconRef} data-bs-toggle="tooltip" data-bs-placement="bottom" title="Scripting" style={(currentlyLoadedLink === "Scripting" || scriptingIconIsFocused) ? linkStyles.selectedLinkColor_f1f1f1 : linkStyles.defaultLinkColor_515151} 
                            width={42} height={42} src={ROOT_URL + "/wwwroot/img/icons/code-icon.png"} alt="Scripting" onClick={() => navigate(`${HOST_SUFFIX}/scripting`)} />
                    </li>
                </ul>
            </div>
            <div>
                <img ref={settingsIconRef} data-bs-toggle="tooltip" data-bs-placement="bottom" title="Settings" style={currentlyLoadedLink === "Settings" || settingsIconIsFocused ? linkStyles.selectedLinkColor_f1f1f1 : linkStyles.defaultLinkColor_515151} 
                    width={42} height={42} src={ROOT_URL + "/wwwroot/img/icons/settings.png"} 
                        onClick={() => navigate(`${HOST_SUFFIX}/settings`) } 
                    />
            </div>
        </nav>
    );
}