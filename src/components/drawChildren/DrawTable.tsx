import React, { memo, useRef } from 'react';
import ReactFlow, { NodeProps, Handle, Position } from 'reactflow';
import VmTableRow from '../../model/viewModel/VmTableRow';
import VmTable from '../../model/viewModel/VmTable';


type DrawTableRowProps = {
    row: VmTableRow,
    rowStartY: number,
    height: number,
    tableName: string
}

function DrawTableRow( { row, rowStartY, height, tableName }: DrawTableRowProps) {
    const handleStyle: React.CSSProperties = { opacity: 0, background: "#555", border: "none", cursor: "inherit" }
    return (
        <div>
            <Handle type="target" id={`${tableName}-${row.name}-left`} position={Position.Left} style={{ top: `${rowStartY}px`, left: '2px', ...handleStyle }} />
            <Handle type="source" id={`${tableName}-${row.name}-left`} position={Position.Left} style={{ top: `${rowStartY}px`, left: '2px', ...handleStyle }} />
            
            <div className="d-flex" style={{ gap: "16px", justifyContent: "space-between", height: `${height}px`, whiteSpace: "nowrap" }}>
                <div style={{ paddingRight: "6px" }}>{row.name}</div>
                <div style={{ color: "#b0b8c4" }}>{row.datatype.getDisplayableText()}</div>
            </div>

            <Handle type="target" id={`${tableName}-${row.name}-right`} position={Position.Right} style={{ top: `${rowStartY}px`, right: '2px', ...handleStyle}} />
            <Handle type="source" id={`${tableName}-${row.name}-right`} position={Position.Right} style={{ top: `${rowStartY}px`, right: '2px', ...handleStyle}} />
        </div>
    );
}


export default function DrawTable(node: NodeProps<{ table: VmTable }>) {
    const tableRef = useRef(null)
    const table = node.data.table;

    const outerBorderWidth = 2;
    const innerBorderWidth = 1;
    const headingPaddingY = 8;
    const rowHeight = 24;

    const headingStyle: React.CSSProperties = { 
        borderRadius: "4px 4px 0 0", 
        border: `solid ${innerBorderWidth}px #dee5ee`, 
        padding: `${headingPaddingY}px 12px`, 
        backgroundColor: "#f1f6f8"
    }
    const contentBorderStyle: React.CSSProperties = {
        borderLeft: `solid ${innerBorderWidth}px #dee5ee`,
        borderRight: `solid ${innerBorderWidth}px #dee5ee`,
        borderBottom: `solid ${innerBorderWidth}px #dee5ee`
    }
    return (
        <>
            <div ref={tableRef} style={{  
                borderRadius: "6px", 
                border: `solid ${outerBorderWidth}px ${node.selected ? '#5a67d8' : 'transparent'}`,
                width: "min-content"
            }}>
                <div className="tableHeader" style={{ borderRadius: "4px",  backgroundColor: "#eee" }}>
                    <div className="d-flex" style={headingStyle}>
                        <div className="w-100 d-flex justify-content-center" style={{ fontWeight: "500" }}>{table.head}</div>
                    </div>
                    <div style={{ borderRadius: "0 0 4px 4px", backgroundColor: "white", padding: `0 4px`, ...contentBorderStyle }}>
                        {
                            table.tableRows.map((row, i) => {
                                const alignCenterTweak = 2;
                                const rowStartY = (outerBorderWidth + 2 * innerBorderWidth + rowHeight + 2*headingPaddingY) + (rowHeight / 2) + (i * rowHeight) + alignCenterTweak;  
                                return (
                                    <DrawTableRow key={row.name} tableName={table.head} row={row} rowStartY={rowStartY} height={rowHeight} />
                                );
                            })
                        }
                    </div>
                </div>
            </div>
        </>
    );
};