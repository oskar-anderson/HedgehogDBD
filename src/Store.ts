import { createContext, useContext, useRef, useState } from "react";
import { AppState } from "./components/MainContent";

interface AppStateManagement {
    appState: AppState,
    setAppState: React.Dispatch<React.SetStateAction<AppState>>
}
  
export const AppStateManagementContext = createContext({} as AppStateManagement);

export function useAppStateManagement(): AppStateManagement {
    return useContext(AppStateManagementContext);
}

export function useAppStateManagementDefault(): AppStateManagement {
    const [appState, setAppState] = useState(AppState.LoaderScene)

    return {
        appState: appState,
        setAppState: setAppState
    }
}
