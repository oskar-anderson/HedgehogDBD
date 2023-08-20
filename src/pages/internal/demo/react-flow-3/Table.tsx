
import ReactFlow, { NodeProps, Handle, Position } from 'demo-reactflow--reactflow';

interface TableProps {
    table: {
        position: {
            x: number,
            y: number
        },
        title: string,
        rows: {
            name: string,
            type: string
        }[]
    }
}

export default function memo({ data }: NodeProps<TableProps>) {
    const table = data.table;
    return (
        <>
            <div style={{  
                borderRight: "2px solid #e5e7eb", borderBottom: "2px solid #e5e7eb", borderLeft: "2px solid #e5e7eb", borderRadius: "2px", 
                boxShadow: "box-shadow: var(0 0 #0000), var(0 0 #0000), var(0 0 #0000)", 
                width: "min-content"
            }} key={table.title}>
                <div className="tableHeader" style={{ borderRadius: "4px", borderTop: "4px solid yellow",  backgroundColor: "#eee" }}>
                    <div className="d-flex px-4">
                        <div className="w-100 d-flex justify-content" style={{ fontWeight: "bold" }}>{table.title}</div>
                        <div>
                            <svg style={{ height: "1rem", color: "#8c8c8c" }} viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" fillRule="evenodd" clipRule="evenodd"></path>
                            </svg>
                        </div>
                    </div>
                    <div style={{ backgroundColor: "white", padding: "0 4px" }}>
                        {
                            table.rows.map((row, i) => {
                                return (
                                    <div key={row.name} >
                                        <Handle type="target" position={Position.Left} style={{ top: 4 + 24 + (24 / 2) + (i * 24) + "px"}} />
                                        <div className="d-flex" style={{ justifyContent: "space-between", height: "24px" }}>
                                            <div style={{ paddingRight: "6px" }}>{row.name}</div>
                                            <div style={{ color: "#b0b8c4" }}>{row.type}</div>
                                        </div>
                                        <Handle type="source" position={Position.Right} style={{ top: 4 + 24 + (24 / 2) + (i * 24) + "px"}} />
                                    </div>
                                    
                                );
                            })
                        }
                    </div>
                </div>
            </div>
            
        </>
    )
}