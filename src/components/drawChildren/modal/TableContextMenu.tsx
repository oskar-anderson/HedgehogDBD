import { publish } from "../../../Event";
import { CursorEdgePayload } from "../use/UseCursorEdgeCreation"

const addRelation = (tableContextMenuProps: { 
    type: "table" | "row";
    tableId: string,
    tableName: string;
    row: {
        name: string;
    } | null;
}) => {
    publish("e_setTableContextMenu", tableContextMenuDefault)
    const sourceNodeId = tableContextMenuProps.tableId;
    const sourceHandleId = tableContextMenuProps.type === "table" ? 
        `${tableContextMenuProps.tableName}-head` : 
        `${tableContextMenuProps.tableName}-row-${tableContextMenuProps.row!.name}`;
    publish("e_setCursorEdge",
        {
            sourceNodeId: sourceNodeId,
            sourceHandleId: sourceHandleId + "-left",
            sourceHandleIdWithoutSide: sourceHandleId,
            sourceTableRow: tableContextMenuProps.row?.name ?? null,
            targetNodeId: "cursor-node",
        } as CursorEdgePayload
    ) 
}

export type TableContextMenuProps = {
    show: boolean,
    props: {
        x: number,
        y: number,
        type: "table" | "row"
        tableId: string,
        tableName: string,
        row: {
            name: string
        } | null
    } | null
}

export const tableContextMenuDefault: TableContextMenuProps = {
    show: false,
    props: null
}


export default function TableContextMenu(tableContextMenu: TableContextMenuProps) {

    return (
        tableContextMenu.show ?
        <div style={{ 
            position: "absolute", 
            top: tableContextMenu.props!.y, 
            left: tableContextMenu.props!.x,
            width: "200px",
            backgroundColor: "white",
            borderRadius: "6px",
            border: "1px solid #eee",
        }} className="py-1"
            onContextMenu={(e) => { 
            // prevent right click context menu from appearing unless shift is down
            if (! e.shiftKey) {
                e.preventDefault();
            }
        }}>
            { 
                tableContextMenu.props!.type === "row" ?
                    <div className="px-3 py-1 text-muted" style={{ whiteSpace: "nowrap", overflow: "clip", textOverflow: "ellipsis" }}>{tableContextMenu.props?.row?.name} field</div>
                    :
                    <div className="px-3 py-1 text-muted" style={{ whiteSpace: "nowrap", overflow: "clip", textOverflow: "ellipsis"}}>{tableContextMenu.props?.tableName} table</div>
            }
            <div className="px-3 py-1 hover-gray" onClick={() => addRelation(tableContextMenu.props!) }>Add relation</div>
        </div> :
        null
    );
}