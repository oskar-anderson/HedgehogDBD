import { useNavigate } from "react-router-dom";
import VmTable from "../../model/viewModel/VmTable"

type DrawSide = {
    tables: VmTable[],
    createNewTable: () => void,
    children: JSX.Element
}

export default function CanvasSide({ tables, createNewTable, children }: DrawSide) {
    const navigate = useNavigate();
    return (
        <div className="canvas-side" style={{ display: 'flex', backgroundColor: '#f5f5f5', borderRightWidth: "1px", borderStyle: "solid" }}>
            <div style={{ display: "flex", flexDirection: "column", width: "184px" }}>
                <div style={{ borderBottom: "1px solid #000"}}>
                    {children}
                </div>
                

                <div style={{ overflowY: "auto" }}>
                    <div className="p-1 d-flex flex-row align-items-center justify-content-between">
                        <h2 className="px-1 my-0">Tables</h2>
                            <button className="btn btn-light btn-create d-flex align-items-center py-1 px-1" onClick={createNewTable}>
                            <svg width="20px" height="20px" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="none">
                                <path fill="#ffffff" fillRule="evenodd" d="M9 17a1 1 0 102 0v-6h6a1 1 0 100-2h-6V3a1 1 0 10-2 0v6H3a1 1 0 000 2h6v6z"/>
                            </svg>
                        </button>
                    </div>
                    <div>
                    { [...tables].sort((a, b) => Number(a.head > b.head)).map((table, i) => {
                        return (
                            <div key={table.id} 
                                onClick={() => navigate(`/table/${table.id}`) } 
                                className="ps-3 pe-2 btn" style={{ width: "100%", display: "flex" }}>
                                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{table.head}</span>
                            </div>
                        )
                    })}
                    </div>
                </div>
                
            </div>
        </div>
    )

}