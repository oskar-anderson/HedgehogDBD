import React, { memo, useRef } from 'react';
import ReactFlow, { NodeProps, Handle, Position } from 'demo-reactflow--reactflow';


type DrawTableRowProps = {
    row: {
        name: string,
        type: string
    },
    rowStartY: number,
    tableName: string
}

function DrawTableRow( { row, rowStartY, tableName }: DrawTableRowProps) {
    return (
        <div key={row.name} >
            <Handle type="target" id={`${tableName}-${row.name}-left`} position={Position.Left} style={{ top: `${rowStartY}px`}} />
            <div className="d-flex" style={{ gap: "16px", justifyContent: "space-between", height: "24px" }}>
                <div style={{ paddingRight: "6px" }}>{row.name}</div>
                <div style={{ color: "#b0b8c4" }}>{row.type}</div>
            </div>
            <Handle type="source" id={`${tableName}-${row.name}-right`} position={Position.Right} style={{ top: `${rowStartY}px`}} />
        </div>
    );
}

type DrawTableProps = {
    id: string, 
    type: string, 
    position: { x: number, y: number }, 
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


export default function DrawTable({ data }: NodeProps<DrawTableProps>) {
    const tableRef = useRef(null)
    const table = data.table;
    return (
        <>
            <div ref={tableRef} style={{  
                borderRadius: "6px", 
                border: "solid 3px purple",
                boxShadow: "box-shadow: var(0 0 #0000), var(0 0 #0000), var(0 0 #0000)", 
                width: "min-content"
            }} key={data.id}>
                <div className="tableHeader" style={{ borderRadius: "4px", borderTop: "4px solid yellow",  backgroundColor: "#eee" }}>
                    <div className="d-flex" style={{ padding: "8px 12px"}}>
                        <div className="w-100 d-flex justify-content-center" style={{ fontWeight: "bold" }}>{table.title}</div>
                    </div>
                    <div style={{ backgroundColor: "white", padding: "0 4px" }}>
                        {
                            table.rows.map((row, i) => {
                                const rowStartY = (3 + 4 + 24 + 8 * 2) + (24 / 2) + (i * 24);
                                return (
                                    <DrawTableRow key={row.name} tableName={table.title} row={row} rowStartY={rowStartY} />
                                );
                            })
                        }
                    </div>
                </div>
            </div>
        </>
    );
};