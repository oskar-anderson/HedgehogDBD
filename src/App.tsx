import { useEffect, useState } from 'react'
import { Draw } from "./model/Draw";
import RasterModelerFormat from './RasterModelerFormat';
import { AppStateManagementContext, useAppStateManagementDefault } from './Store';
import MainContent from './components/MainContent';



function App() {
  const [ draw, setDraw ] = useState<Draw | null>(null);

  useEffect(() => {
    async function fetchApp() {
      let text = await (await fetch('/src/wwwroot/data/SchemaTest2.txt', { cache: "no-cache" })).text();
      let draw = RasterModelerFormat.parse(text);
      setDraw(draw)
    }

    fetchApp();
  }, [])

  const appStateManagementValue = useAppStateManagementDefault();

  if (! draw) {
    return (<div>Loading...</div>);
  }



  return (
    <AppStateManagementContext.Provider value={appStateManagementValue}>
      <MainContent draw={draw} />
    </AppStateManagementContext.Provider>
  )
}

export default App
