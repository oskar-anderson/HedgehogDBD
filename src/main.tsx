import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Draw from "./pages/Draw";
import Info from "./pages/system/Info";
import Settings from './pages/Settings';
import Scripting from './pages/Scripting';
import Table from './pages/Table';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

export const HOST_SUFFIX = window.location.hostname === "localhost" ? "" : "/HedgehogDBD";
export const ROOT_URL = `${window.location.protocol}//${window.location.host}${HOST_SUFFIX}`;
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
