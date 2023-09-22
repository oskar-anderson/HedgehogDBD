import React, { HTMLAttributes, useRef } from 'react';
import ReactFlow, { NodeProps, Handle, Position, useStore } from 'reactflow';
import VmTableRow from '../../model/viewModel/VmTableRow';
import VmTable from '../../model/viewModel/VmTable';
import { useApplicationState } from '../../Store';
import DataType from '../../model/DataTypes/DataType';
import { EdgeNotationPadding } from './ErdEdge';
import { NodePayload } from '../../pages/Draw';
import { publish } from '../../Event';


type DrawTableRowProps = {
    row: VmTableRow,
    rowStartY: number,
    height: number,
    table: VmTable,
    handleStyle: React.CSSProperties
}

function DrawTableRow( { row, rowStartY, height, table, handleStyle }: DrawTableRowProps) {
    const relations = useApplicationState(state => state.schemaRelations);
    const relation = relations
                        .filter(relation => relation.source.head === table.head)
                        .find(relation => relation.sourceRow.name === row.name);
    const nullabilitySymbol = row.datatype.isNullable ? "?" : "";
    const selectListName = DataType.getTypeById(row.datatype.dataTypeId).getSelectListName();
    const displayName = `${selectListName}${nullabilitySymbol}`;
    
    return (
        <div 
            onContextMenu={ (e) => { 
                e.preventDefault();
                e.stopPropagation();
                publish("DrawTableRow__onRightClick", { event: e, row, table }); 
            }} 
            onMouseUp={ (e) => { 
                e.stopPropagation();
                publish("DrawTableRow__onMouseUp", { event: e }); 
            }}
        >
            <Handle type="target" id={`${table.head}-row-${row.name}-left`} position={Position.Left} style={{ top: `${rowStartY}px`, left: `calc(3px - ${EdgeNotationPadding}px)`, ...handleStyle }} />
            <Handle type="source" id={`${table.head}-row-${row.name}-left`} position={Position.Left} style={{ top: `${rowStartY}px`, left: `calc(3px - ${EdgeNotationPadding}px)`, ...handleStyle }} />
            
            <div className='d-flex' style={{ height: `${height}px`, whiteSpace: "nowrap" }}>
                <div className='d-flex align-items-center' style={{ width: "16px", paddingRight: "4px" }}>
                    {row.attributes.includes("PK") ? 
                        <svg width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M22 8.29344C22 11.7692 19.1708 14.5869 15.6807 14.5869C15.0439 14.5869 13.5939 14.4405 12.8885 13.8551L12.0067 14.7333C11.4883 15.2496 11.6283 15.4016 11.8589 15.652C11.9551 15.7565 12.0672 15.8781 12.1537 16.0505C12.1537 16.0505 12.8885 17.075 12.1537 18.0995C11.7128 18.6849 10.4783 19.5045 9.06754 18.0995L8.77362 18.3922C8.77362 18.3922 9.65538 19.4167 8.92058 20.4412C8.4797 21.0267 7.30403 21.6121 6.27531 20.5876L5.2466 21.6121C4.54119 22.3146 3.67905 21.9048 3.33616 21.6121L2.45441 20.7339C1.63143 19.9143 2.1115 19.0264 2.45441 18.6849L10.0963 11.0743C10.0963 11.0743 9.3615 9.90338 9.3615 8.29344C9.3615 4.81767 12.1907 2 15.6807 2C19.1708 2 22 4.81767 22 8.29344ZM15.681 10.4889C16.8984 10.4889 17.8853 9.50601 17.8853 8.29353C17.8853 7.08105 16.8984 6.09814 15.681 6.09814C14.4635 6.09814 13.4766 7.08105 13.4766 8.29353C13.4766 9.50601 14.4635 10.4889 15.681 10.4889Z" fill="#1C274C"/>
                        </svg>
                        : null
                    }
                    {
                        relation ?
                        <span title={`FK(${relation.target.head})`}>
                            <svg style={{ width: "100%" }} width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16.4481 1.50023C14.844 1.4862 13.3007 2.10727 12.15 3.22645L12.1351 3.24107L11.6464 3.7298C11.2559 4.12032 11.2559 4.75349 11.6464 5.14401L12.3535 5.85112C12.7441 6.24164 13.3772 6.24164 13.7677 5.85112L14.2484 5.37048C14.834 4.80437 15.6142 4.49305 16.4218 4.50012C17.2326 4.50721 18.0103 4.83463 18.5868 5.41517C19.1637 5.99606 19.4927 6.78402 19.4998 7.60991C19.5069 8.43176 19.1946 9.22174 18.633 9.81182L15.5209 12.9432C15.2056 13.2609 14.8269 13.5058 14.4107 13.6622C13.9945 13.8185 13.5501 13.8828 13.1076 13.8509C12.6651 13.8189 12.2341 13.6915 11.8438 13.4768C11.7456 13.4228 11.6504 13.3635 11.5588 13.2993C11.1066 12.9823 10.4859 12.8717 10.0425 13.201L9.23978 13.7973C8.79642 14.1266 8.69902 14.7603 9.09601 15.1443C9.48444 15.52 9.9219 15.8435 10.3977 16.1053C11.1664 16.5282 12.0171 16.78 12.8918 16.8431C13.7666 16.9062 14.6444 16.779 15.4656 16.4706C16.2868 16.1621 17.0317 15.6797 17.65 15.0568L20.7712 11.9162L20.7898 11.8971C21.9007 10.7389 22.5136 9.18987 22.4997 7.58402C22.4859 5.97817 21.8463 4.43996 20.7155 3.30127C19.5844 2.16225 18.0521 1.51427 16.4481 1.50023Z" fill="#000000"/>
                                <path d="M11.1082 7.15685C10.2334 7.09376 9.35555 7.22089 8.53436 7.52937C7.71347 7.83773 6.96821 8.32053 6.34994 8.94317L3.22873 12.0838L3.21011 12.1029C2.09928 13.261 1.48637 14.8101 1.50023 16.416C1.51409 18.0218 2.15365 19.56 3.28441 20.6987C4.41551 21.8377 5.94781 22.4857 7.55185 22.4997C9.15591 22.5138 10.6993 21.8927 11.85 20.7735L11.8648 20.7589L12.3536 20.2701C12.7441 19.8796 12.7441 19.2465 12.3536 18.8559L11.6464 18.1488C11.2559 17.7583 10.6228 17.7583 10.2322 18.1488L9.75155 18.6295C9.16598 19.1956 8.38576 19.5069 7.5781 19.4999C6.76732 19.4928 5.98963 19.1653 5.41313 18.5848C4.83629 18.0039 4.50725 17.216 4.50012 16.3901C4.49303 15.5682 4.80532 14.7782 5.36694 14.1881L8.47904 11.0567C8.79434 10.7391 9.1731 10.4941 9.58932 10.3378C10.0055 10.1814 10.4498 10.1172 10.8924 10.1491C11.3349 10.181 11.7659 10.3084 12.1561 10.5231C12.2544 10.5772 12.3495 10.6365 12.4411 10.7007C12.8934 11.0177 13.5141 11.1282 13.9574 10.7989L14.7602 10.2026C15.2036 9.87328 15.301 9.23958 14.904 8.85563C14.5155 8.47995 14.0781 8.15644 13.6022 7.89464C12.8335 7.47172 11.9829 7.21993 11.1082 7.15685Z" fill="#000000"/>
                            </svg>
                        </span>
                        : null
                    }
                </div>
                <div className="d-flex" style={{ gap: "16px", justifyContent: "space-between", width: "100%" }}>
                    <div style={{ paddingRight: "6px" }}>{row.name}</div>
                    <div style={{ color: "#b0b8c4" }}>{displayName}</div>
                </div>
            </div>

            <Handle type="target" id={`${table.head}-row-${row.name}-right`} position={Position.Right} style={{ top: `${rowStartY}px`, right: `calc(3px - ${EdgeNotationPadding}px)`, ...handleStyle}} />
            <Handle type="source" id={`${table.head}-row-${row.name}-right`} position={Position.Right} style={{ top: `${rowStartY}px`, right: `calc(3px - ${EdgeNotationPadding}px)`, ...handleStyle}} />
        </div>
    );
}

export const handleSize = 6;

export const handleStyle: React.CSSProperties = { 
    height: `${handleSize}px`,
    width: `${handleSize}px`,
    background: "#555", 
    border: "none", 
    cursor: "inherit" 
}
    

export default function DrawTable(node: NodeProps<NodePayload>) {
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

    const handleStyleDynamic: React.CSSProperties = {...handleStyle, opacity: 1, pointerEvents: "all"}
    const alignCenterTweak = 2;
    const tableY = outerBorderWidth + 2 * innerBorderWidth + headingPaddingY + rowHeight/2 + alignCenterTweak;

    return (
        <>
            <div ref={tableRef} style={{  
                borderRadius: "6px", 
                border: `solid ${outerBorderWidth}px ${node.selected ? '#5a67d8' : 'transparent'}`,
                width: "min-content"
            }}>
                <div style={{ borderRadius: "4px",  backgroundColor: "#eee" }}>

                    <div className="d-flex" style={headingStyle} 
                        onMouseUp={(e) => {
                            e.stopPropagation();
                            publish("DrawTable__onHeaderMouseUp", { event: e, table: table}) 
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            publish("DrawTable__onHeaderMouseClick", { event: e, table: table}) 
                        }}    
                    >
                        <Handle type="source" id={`${table.head}-head-left`} position={Position.Left} style={{ top: `${tableY}px`, left: `calc(3px - ${EdgeNotationPadding}px)`, ...handleStyle }} />
            
                        <div className="w-100 d-flex justify-content-center" style={{ fontWeight: "500" }}>{table.head}</div>
                    
                        <Handle type="source" id={`${table.head}-head-right`} position={Position.Right} style={{ top: `${tableY}px`, right: `calc(3px - ${EdgeNotationPadding}px)`, ...handleStyle}} />
                    </div>



                    <div style={{ borderRadius: "0 0 4px 4px", backgroundColor: "white", padding: `0 4px`, ...contentBorderStyle }}>
                        {
                            table.tableRows.map((row, i) => {
                                const rowStartY = (outerBorderWidth + 2 * innerBorderWidth + rowHeight + 2*headingPaddingY) + (rowHeight / 2) + (i * rowHeight) + alignCenterTweak;  
                                return (
                                    <DrawTableRow key={row.name} handleStyle={handleStyleDynamic} table={table} row={row} rowStartY={rowStartY} height={rowHeight} />
                                );
                            })
                        }
                    </div>
                </div>
            </div>
        </>
    );
};