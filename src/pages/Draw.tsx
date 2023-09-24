import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./../components/Layout"
import ReactFlow, { ReactFlowProvider, useNodesState, useEdgesState, MiniMap, Background, Controls, BackgroundVariant, NodeChange, NodePositionChange, Node, getRectOfNodes, getTransformForBounds, useReactFlow, useViewport, EdgeTypes, Viewport, Edge, ConnectionLineType, Position } from 'reactflow';
import DrawTable from "../components/drawChildren/DrawTable";
import 'reactflow/dist/style.css';
import { TOP_TOOLBAR_HEIGHT_PX } from "../components/TopToolbarAction"
import SecondaryTopToolbar, { SECONDARY_TOOLBAR_HEIGHT_PX } from "../components/drawChildren/SecondaryTopToolbar";
import CommandMoveTableRelative, { CommandMoveTableRelativeArgs } from "../commands/appCommands/CommandMoveTableRelative"
import {useApplicationState} from "../Store";
import DrawSide from "../components/drawChildren/DrawSide";
import VmTable from "../model/viewModel/VmTable";
import Databases from "../model/DataTypes/Databases";
import DataType from "../model/DataTypes/DataType";
import { toPng } from 'html-to-image';
import VmRelation from "../model/viewModel/VmRelation";
import { CommandCreateTable, CommandCreateTableArgs } from "../commands/appCommands/CommandCreateTable";
import DomainTable from "../model/domain/DomainTable";
import DomainTableRow from "../model/domain/DomainTableRow";
import DomainTableRowDataTypeArguments from "../model/domain/DomainTableRowDataTypeArguments";
import CommandHistory from "../commands/CommandHistory";
import ErdEdge from "../components/drawChildren/ErdEdge";
import { CommandModifyTable, CommandModifyTableArgs } from "../commands/appCommands/CommandModifyTableArgs";
import VmTableRow from "../model/viewModel/VmTableRow";
import { subscribe, unsubscribe } from "../Event";
import CursorNode from "../components/drawChildren/CursorNode";
import CursorEdgePayload from "../components/drawChildren/CursorEdge";
import useTableHeaderLeftClick from "../components/drawChildren/UseTableHeaderLeftClick";
import EdgeActionsModal, { edgeActionPayloadDefault } from "../components/drawChildren/modal/EdgeActionsModal";
import DebugModal from "../components/drawChildren/modal/DebugModal";
import TableContextMenu, { TableContextMenuProps, tableContextMenuDefault } from "../components/drawChildren/modal/TableContextMenu"

// nodeTypes need to be defined outside the render function or using memo
const nodeTypes = { 
    tableNode: DrawTable,
    cursorNode: CursorNode
}

const edgeTypes: EdgeTypes = {
    'erd-edge': ErdEdge,
    'cursor-edge': CursorEdgePayload
};

function getCursorNode(mouseWorldPosition: { x: number, y: number }): Node {
    return {
        id: "cursor-node",
        type: "cursorNode",
        position: { x: mouseWorldPosition.x, y: mouseWorldPosition.y },
    } as Node
}

export type CursorEdgePayload = {
    sourceNodeId: string,
    sourceHandleId: string,
    sourceHandleIdWithoutSide: string,
    targetNodeId: string
} | null

export type NodePayload = {
    table: VmTable,
}

const convertTableToNode = (table: VmTable, node: undefined|Node<NodePayload>): Node<NodePayload> => {
    return {
        id: table.id,
        type: "tableNode",
        position: table.position,
        data: {
            table: table,
        },
        width: node?.width,
        height: node?.height,
    }
}

const convertRelationToEdgeId = (relation: VmRelation) => {
    return `${relation.source.head}(${relation.sourceRow.name}) references ${relation.target.head}(${relation.targetRow.name})`;
}

export type EdgePayload = {
    pathType: string,
    sourceSide: 'left' | 'right'
    targetSide: 'left' | 'right'
    onClick: (e: React.MouseEvent, edgeId: string) => void,
    sourceRowName: string,
    targetRowName: string,
};

const convertRelationToEdge = (relation: VmRelation, onClick: (e: React.MouseEvent, edgeId: string) => void): Edge<EdgePayload> => {
    let sourceSide: 'left' | 'right' = relation.source.position.x > relation.target.position.x ? "left" : "right";
    let targetSide: 'left' | 'right' = relation.source.position.x > relation.target.position.x ? "right" : "left";
    let pathType: 'default' | 'straight' | 'step' | 'smoothstep' | 'simplebezier' = 'default';
    if (relation.source.id === relation.target.id) { 
        targetSide = sourceSide;
        pathType = "smoothstep";
    }
    const style = relation.sourceRow.datatype.isNullable ? { strokeDasharray: "5 5" } : {};
    return {
        id: convertRelationToEdgeId(relation),
        type: 'erd-edge',
        source: relation.source.id,
        sourceHandle: `${relation.source.head}-row-${relation.sourceRow.name}-${sourceSide}`,
        target: relation.target.id,
        targetHandle: `${relation.target.head}-row-${relation.targetRow.name}-${targetSide}`,
        style: style,
        data: {
            pathType,
            sourceSide,
            targetSide,
            onClick,
            sourceRowName: relation.sourceRow.name,
            targetRowName: relation.targetRow.name,
        }
    }
}

export const WrappedDraw = () => {
    const history = useApplicationState(state => state.history);
    const tables = useApplicationState(state => state.schemaTables);
    const setTables = useApplicationState(state => state.setTables);
    const relations = useApplicationState(state => state.schemaRelations);
    const activeDatabaseId = useApplicationState(state => state.activeDatabaseId);
    const currentViewport = useApplicationState(state => state.currentViewport);
    const setViewport = useApplicationState(state => state.setViewport);
    const [nodes, setNodes, onNodesChange] = useNodesState<NodePayload>([]);
    const nodesRef = useRef<Node<NodePayload>[]>([]);
    nodesRef.current = nodes;
    const [edges, setEdges, onEdgesChange] = useEdgesState<EdgePayload>([]);
    const edgesRef = useRef<Edge<EdgePayload>[]>([]);
    edgesRef.current = edges;
    const { x, y, zoom } = useViewport();
    const navigate = useNavigate();
    const [edgeActions, setEdgeActions] = useState(edgeActionPayloadDefault);
    const mainContentRef = useRef<HTMLDivElement>(null);
    const [mouseScreenPosition, setMouseScreenPosition] = useState({x: 0, y: 0});
    const [mouseWorldPosition, setMouseWorldPosition] = useState({x: 0, y: 0});
    const [tableContextMenu, setTableContextMenu] = useState<TableContextMenuProps>(tableContextMenuDefault);
    const [cursorEdge, setCursorEdge] = useState<CursorEdgePayload>(null);
    useTableHeaderLeftClick({ cursorEdge, setCursorEdge })

    useEffect(() => {
        const setCursorEdgeCallback = (e: any) => {
            setCursorEdge(e.detail);
        }
        subscribe("e_setCursorEdge", setCursorEdgeCallback)
        return () => { 
            unsubscribe("e_setCursorEdge", setCursorEdgeCallback); 
        }
    }, []);

    useEffect(() => {
        const setTableContextMenuCallback = (e: any) => {
            setTableContextMenu(e.detail);
        }
        subscribe("e_setTableContextMenu", setTableContextMenuCallback)
        return () => { 
            unsubscribe("e_setTableContextMenu", setTableContextMenuCallback); 
        }
    }, [])

    useEffect(() => {
        const onTableHeaderRightClick = (e: any) => {
            console.log("onTableHeaderRightClick")
            const event = e.detail.event as React.MouseEvent;
            const table = e.detail.table as VmTable;
            setTableContextMenu({
                show: true,
                props: {
                    x: event.clientX - mainContentRef.current!.getBoundingClientRect().x,
                    y: event.clientY - mainContentRef.current!.getBoundingClientRect().y,
                    type: "table",
                    tableId: table.id,
                    tableName: table.head,
                    row: null
                }
            });
        }
        subscribe("DrawTable__onHeaderRightClick", onTableHeaderRightClick);
        return () => { 
            unsubscribe("DrawTable__onHeaderRightClick", onTableHeaderRightClick); 
        }
    }, []);
    useEffect(() => {
        const onTableRowMouseUp = (e: any) => {
            
        }
        subscribe("DrawTableRow__onMouseUp", (e) => onTableRowMouseUp(e));
        return () => { 
            unsubscribe("DrawTableRow__onMouseUp", onTableRowMouseUp); 
        }
    }, [])
    useEffect(() => {
        const onTableRowRightClick = (e: any) => {
            console.log("onTableRowRightClick")
            const event = e.detail.event as React.MouseEvent;
            const row = e.detail.row as VmTableRow;
            const table = e.detail.table as VmTable;
            setTableContextMenu({
                show: true,
                props: {
                    x: event.clientX - mainContentRef.current!.getBoundingClientRect().x,
                    y: event.clientY - mainContentRef.current!.getBoundingClientRect().y,
                    type: "row",
                    tableId: table.id,
                    tableName: table.head,
                    row: {
                        name: row.name
                    },
                }
            });
        }
        subscribe("DrawTableRow__onRightClick", (e) => onTableRowRightClick(e));
        return () => { 
            unsubscribe("DrawTableRow__onRightClick", onTableRowRightClick);  
        }
    }, [])

    const onEdgeClick = (e: React.MouseEvent, edgeId: string) => {
        e.stopPropagation();
        let selectedEdge = edgesRef.current.find(x => x.id === edgeId)!;
        if (!selectedEdge) { 
            console.error(`Edge with id (${edgeId}) not found.`); 
            return; 
        }
        const sourceTable = nodesRef.current.find(x => x.id === selectedEdge.source)!.data.table;
        const sourceTableRow = sourceTable.tableRows.find(tr => tr.name === selectedEdge.data!.sourceRowName)!;
        const targetTable = nodesRef.current.find(x => x.id === selectedEdge.target)!.data.table;
        setEdgeActions({
            show: true,
            props: {
                x: e.clientX - mainContentRef.current!.getBoundingClientRect().x,
                y: e.clientY - mainContentRef.current!.getBoundingClientRect().y,
                sourceTable: sourceTable,
                sourceTableRow: sourceTableRow,
                targetTableName: targetTable.head,
                targetTableRowName: selectedEdge.data!.targetRowName
            }
        });
    };

    useEffect(() => {
        setEdges([]);
        setNodes([...tables.map(table => {
            const node = nodes.find(node => table.id === node.id);
            return convertTableToNode(table, node);
        }), getCursorNode(mouseWorldPosition)]);
        const cursorEdgeDrawable = cursorEdge ? {
            id: "cursor-edge",
            type: 'cursor-edge',
            source: cursorEdge!.sourceNodeId,
            sourceHandle: cursorEdge!.sourceHandleId,
            target: cursorEdge!.targetNodeId,
            zIndex: 1
        } : null;
        const edges = relations.map(relation => convertRelationToEdge(relation, onEdgeClick))
        if (cursorEdgeDrawable) {
            edges.push(cursorEdgeDrawable);
        }
        
        setEdges(edges);
    }, [tables, cursorEdge])

    const onClick = () => { 
        console.log("onClick")
        setTableContextMenu(tableContextMenuDefault);
        setEdgeActions(edgeActionPayloadDefault); 
    }

    const onNodeDoubleClick = (event: React.MouseEvent, node: Node) => {
        navigate(`/table/${node.data.table.id}`);
    }

    const createNewTable = () =>  {
        const dataBase = Databases.getAll().find(x => x.id === activeDatabaseId)!;
        const defaultPkDataType = DataType.guid();
        const tableRowDataTypeArguments = defaultPkDataType.getAllArguments()
            .filter(arg => arg.databases.includes(dataBase))
            .map(x => new DomainTableRowDataTypeArguments(x.defaultValue, x.id)
        );
        const newTable = new DomainTable(
            crypto.randomUUID(),
            { 
                x: -x / zoom + 20, 
                y: -y / zoom + 20
            }, 
            "new_table", 
            [
                new DomainTableRow(
                    "id", 
                    defaultPkDataType.getId(),
                    tableRowDataTypeArguments,
                    false, 
                    ["PK"]
                )
            ]
        );
        CommandHistory.execute(
            history,
            new CommandCreateTable(
                { tables }, new CommandCreateTableArgs(newTable)
            ),
            setTables
        );
    }

    let nodeDraggedChangesStart = useRef<NodePositionChange | null>(null);
    let nodeDraggedChangesEnd = useRef<NodePositionChange | null>(null);
    const onNodesChangeCommandListener = (nodeChanges: NodeChange[]) => {
        if (nodeChanges.every(x => x.type === "position")) {
            if (nodeChanges.length !== 1) throw Error("Unexpected nodeChanges array lenght!")
            let nodeChange = nodeChanges[0] as NodePositionChange;
            if (nodeChange.position) {
                if (!nodeDraggedChangesStart.current) {
                    nodeDraggedChangesStart.current = nodeChange;
                } else {
                    nodeDraggedChangesEnd.current = nodeChange;
                }
            }

            if (! nodeChange.dragging && nodeDraggedChangesStart.current && nodeDraggedChangesEnd.current) {
                const command = new CommandMoveTableRelative({ tables }, new CommandMoveTableRelativeArgs(
                    nodeChange.id, 
                    nodeDraggedChangesEnd.current!.position!.x - nodeDraggedChangesStart.current!.position!.x, 
                    nodeDraggedChangesEnd.current!.position!.y - nodeDraggedChangesStart.current!.position!.y
                ));
                nodeDraggedChangesStart.current = null;
                nodeDraggedChangesEnd.current = null;
                CommandHistory.execute(history, command, setTables);
            } else {
              onNodesChange(nodeChanges);
            }
        }
        else {
            onNodesChange(nodeChanges);
        }
    }

    const onMoveWorldToViewport = (event: MouseEvent | TouchEvent, viewport: Viewport) => {
        setEdgeActions(edgeActionPayloadDefault);
        setViewport(viewport);
    }

    const downloadImagePng = () => {
        const nodesBounds = getRectOfNodes(nodes);
        const viewportElement = document.querySelector('.react-flow__viewport') as HTMLElement;
        const transform = getTransformForBounds(nodesBounds, nodesBounds.width, nodesBounds.height, 0.5, 2);

        toPng(viewportElement, {
            width: nodesBounds.width,
            height: nodesBounds.height,
            pixelRatio: 2,
            style: {
                transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`
            },
        },
        ).then(dataUrl => {
            const a = document.createElement('a');
            a.setAttribute('download', 'hedgehogDBD.png');
            a.setAttribute('href', dataUrl);
            a.click();
        });
    }

    useEffect(() => {
        const attribution = document.querySelector(".react-flow__attribution");
        const attribuitionTextElement = attribution?.children[0] as HTMLLinkElement;
        attribuitionTextElement!.innerHTML = "HedgehogDBD uses React Flow";
    }, []);

    const onDrawMouseMove = (e: React.MouseEvent) => {
        const screenPosition = { 
            x: e.clientX - mainContentRef.current!.getBoundingClientRect().x, 
            y: e.clientY - mainContentRef.current!.getBoundingClientRect().y 
        }
        const worldPosition = { 
            x: (screenPosition.x - currentViewport.x) / currentViewport.zoom, 
            y: (screenPosition.y - currentViewport.y) / currentViewport.zoom 
        };
        setMouseScreenPosition(screenPosition);
        setMouseWorldPosition(worldPosition);
        setNodes([...tables.map(table => {
            const node = nodes.find(node => table.id === node.id);
            return convertTableToNode(table, node);
        }), getCursorNode(worldPosition)]);
        if (cursorEdge) {
            const sourceNode = nodes.find(x => x.id === cursorEdge.sourceNodeId);
            const sourceNodeXMiddle = sourceNode!.position.x + sourceNode!.width! / 2;
            const side = worldPosition.x < sourceNodeXMiddle ? "-left" : "-right"
            const newSourceHandleId = cursorEdge.sourceHandleIdWithoutSide + side;
            cursorEdge.sourceHandleId = newSourceHandleId;
            setCursorEdge({...cursorEdge})
        }
    }

    return <>
        <Layout currentlyLoadedLink={"Draw"}>
            <SecondaryTopToolbar exportPngImage={ downloadImagePng }  />
            <div style={{ display: 'flex', width: '100vw', height: `calc(100vh - ${TOP_TOOLBAR_HEIGHT_PX}px  - ${SECONDARY_TOOLBAR_HEIGHT_PX}px)` }}>
                <DrawSide tables={tables} createNewTable={createNewTable}>
                    <MiniMap style={{ position: "relative", margin: 0 }} pannable maskColor="rgba(213, 213, 213, 0.7)" nodeColor="#ffc8c8" />
                </DrawSide>
                <div ref={mainContentRef} className="w-100 h-100 position-relative overflow-hidden">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        onContextMenu={(e) => { 
                            // prevent right click context menu from appearing unless shift is down
                            if (! e.shiftKey) {
                                e.preventDefault();
                            }
                        }}
                        onNodesChange={onNodesChangeCommandListener}
                        onEdgesChange={onEdgesChange}
                        onClick={onClick}
                        onMouseMove={onDrawMouseMove}
                        
                        onNodeDoubleClick={onNodeDoubleClick}
                        disableKeyboardA11y={true}  // keyboard arrow key movement is not supported
                        defaultViewport={currentViewport}
                        onMove={onMoveWorldToViewport}
                    >
                        <Controls />
                        <Background variant={BackgroundVariant.Dots} gap={36} size={1} style={{ backgroundColor: "#f8fafc"}} />
                    </ReactFlow>
                    <EdgeActionsModal 
                        edgeActions={edgeActions} 
                        setEdgeActions={setEdgeActions} />
                    <DebugModal 
                        currentViewport={currentViewport} 
                        mouseScreenPosition={mouseScreenPosition} 
                        mouseWorldPosition={mouseWorldPosition}
                    />
                    <TableContextMenu show={tableContextMenu.show} props={tableContextMenu.props} />
                </div>
            </div>
        </Layout>
    </>
}

export default function draw() {
    return (
        <ReactFlowProvider>
            <WrappedDraw />
        </ReactFlowProvider>
    )
}