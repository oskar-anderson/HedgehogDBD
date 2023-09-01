import { useEffect, useRef, useState } from "react";
import { Draw } from "../../../model/Draw";
import { TableDTO } from "../../../model/dto/TableDTO";
import { IToolManager, IToolNames } from "../../../tools/ITool";



interface CanvasSideProps {
    debugInfoContainer: React.RefObject<HTMLDivElement>,
    tables: TableDTO[],
}

enum TabState {
    Tables = 1,
    Info = 0,
}


function CanvasSide({debugInfoContainer, tables}: CanvasSideProps) {
    const minimapContainerRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<TabState>(TabState.Tables);

    useEffect(() => {
        // minimapContainerRef.current!.appendChild(minimap.app.view);
    }, [])

    return (
        <div className="canvas-side" style={{ display: 'flex', backgroundColor: '#f5f5f5', borderRightWidth: "1px", borderStyle: "solid" }}>
            <div style={{ padding: "2px", display: "flex", flexDirection: "column", width: "184px", gap: "6px" }}>
                <div>
                    <div>
                        <div className="canvas-side-minimap" ref={minimapContainerRef}></div>
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
                                                onClick={() => { /* TODO */ } } 
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