import ReactDOM from 'react-dom/client'
import { Routes, Route, BrowserRouter } from "react-router-dom"
import Draw from "./pages/Draw";
import Info from "./pages/system/Info";
import Settings from './pages/Settings';
import Scripting from './pages/Scripting';
import Table from './pages/Table';
import { HOST_SUFFIX } from './Global';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
    <BrowserRouter>
        <Routes>
            <Route path={`${HOST_SUFFIX}/`} element={<Draw />}></Route>
            <Route path={`${HOST_SUFFIX}/draw`} element={<Draw />}></Route>
            <Route path={`${HOST_SUFFIX}/table/:id`} element={<Table />}></Route>
            <Route path={`${HOST_SUFFIX}/settings`} element={<Settings />}></Route>
            <Route path={`${HOST_SUFFIX}/scripting`} element={<Scripting />}></Route>
            <Route path={`${HOST_SUFFIX}/system/info`} element={<Info />}></Route>
        </Routes>
    </BrowserRouter>
)
