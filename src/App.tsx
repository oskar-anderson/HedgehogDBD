import { useEffect, useState } from 'react'
import { Draw } from "./model/Draw";
import RasterModelerFormat from './RasterModelerFormat';
import { AppStateManagementContext, useAppStateManagementDefault } from './Store';
import MainContent from './components/MainContent';
import EnvGlobals from "../EnvGlobals"


function App() {
  const appStateManagementValue = useAppStateManagementDefault();

  return (
    <AppStateManagementContext.Provider value={appStateManagementValue}>
      <MainContent />
    </AppStateManagementContext.Provider>
  )
}

export default App
