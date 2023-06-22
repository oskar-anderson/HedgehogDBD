import { useEffect, useRef, useState } from "react";
import { Manager } from "../../../Manager";
import { Draw } from "../../../model/Draw";
import { TableDTO } from "../../../model/dto/TableDTO";
import { DrawScene } from "../../../scenes/DrawScene";
import { TableScene } from "../../../scenes/TableScene";
import { IToolManager, IToolNames } from "../../../tools/ITool";
import { Minimap } from "../../Minimap";


interface CanvasSideProps {
    minimap: Minimap,
    debugInfoContainer: React.RefObject<HTMLDivElement>,
    tables: TableDTO[],
    setZoomFontSize: (size: number) => void,
}

enum TabState {
    Tables = 1,
    Info = 0,
}


function CanvasSide({minimap, debugInfoContainer, tables, setZoomFontSize}: CanvasSideProps) {
    const minimapContainerRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<TabState>(TabState.Tables);

    useEffect(() => {
        minimapContainerRef.current!.appendChild(minimap.app.view);
    }, [])

    return (
        <div className="canvas-side" style={{ display: 'flex', backgroundColor: '#f5f5f5', borderRightWidth: "1px", borderStyle: "solid" }}>
            <div style={{ padding: "2px", display: "flex", flexDirection: "column", width: "184px", gap: "6px" }}>
                <div>
                    <div>
                        <div className="canvas-side-minimap" ref={minimapContainerRef}></div>
                    </div>
                    <div className="d-flex" style={{ alignItems: "center"}}>
                        <span>Zoom:&nbsp;</span>
                        <select style={{ borderColor: "#c2c2c2", boxShadow: "none", borderRadius: 0 }} defaultValue={Manager.getInstance().draw.selectedFontSize.size} onChange={(e) => setZoomFontSize(Number.parseInt((e.target as HTMLSelectElement).value))} className="form-select zoom-font-size" autoComplete="off">
                            {
                                Draw.fontSizes_Inconsolata.map(x =>
                                    <option key={x.size} value={x.size}>{x.size} pt</option>
                                )
                            }
                        </select>
                    </div>
                </div>
                
                <div style={{ display: "flex", height: 0, flex: 1, flexDirection: "column" }}>
                    <div style={{ display: "flex", backgroundColor: "#d2d2d2" }}>
                        <button className="btn" style={{ padding: "0 8px", border: 0, backgroundColor: `${activeTab === TabState.Tables ? "white" : "#d2d2d2"}`, }} onClick={() => setActiveTab(TabState.Tables)}>Tables</button>
                        <button className="btn" style={{ padding: "0 8px", border: 0, backgroundColor: `${activeTab === TabState.Info ? "white" : "#d2d2d2"}`, }} onClick={() => setActiveTab(TabState.Info)}>Info</button>
                    </div>
                    
                    {
                        {
                            0: 
                                <div className="m-1">
                                    <p>Text based ERD modeling tool with scripting support.</p>
                                    <p>View source and make feature requests on <a href="https://github.com/oskar-anderson/RasterModeler">Github</a></p>
                                    
                                    <div>
                                        Mouse position: 
                                        <div ref={debugInfoContainer}></div>
                                    </div>
                                </div>,
                            1: 
                                <div style={{ overflowY: "auto" }}>
                                    <div>
                                    { tables.sort((a, b) => Number(a.head > b.head)).map((table, i) => {
                                        return (
                                            <div key={i} 
                                                onClick={() => { Manager.getInstance().changeScene(new TableScene(table)); } } 
                                                className="btn" style={{ width: "100%", display: "flex" }}>
                                                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{table.head}</span>
                                            </div>
                                        )
                                    })}
                                    </div>
                                </div>
                        }[activeTab]
                    }
                </div>
            </div>
        </div>
    )
}

export default CanvasSide;