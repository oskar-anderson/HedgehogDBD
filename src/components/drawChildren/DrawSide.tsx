import Table from "../../model/Table"

type DrawSide = {
    tables: Table[],
    children: JSX.Element
}

export default function CanvasSide({ tables, children }: DrawSide) {
    return (
        <div className="canvas-side" style={{ display: 'flex', backgroundColor: '#f5f5f5', borderRightWidth: "1px", borderStyle: "solid" }}>
            <div style={{ display: "flex", flexDirection: "column", width: "184px", gap: "6px" }}>
                <div style={{ borderBottom: "1px solid #000"}}>
                    {children}
                </div>
                
                <div style={{ padding: "2px", display: "flex", height: 0, flex: 1, flexDirection: "column" }}>
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
                </div>
            </div>
        </div>
    )

}