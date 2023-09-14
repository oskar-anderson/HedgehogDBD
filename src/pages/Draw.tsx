import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./../components/Layout"
import ReactFlow, { ReactFlowProvider, useNodesState, useEdgesState, MiniMap, Background, Controls, BackgroundVariant, NodeChange, NodePositionChange, Node, getRectOfNodes, getTransformForBounds, useReactFlow, useViewport, EdgeTypes, Viewport } from 'reactflow';
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

// nodeTypes need to be defined outside the render function or using memo
const nodeTypes = { 
    tableNode: DrawTable
}


const edgeTypes: EdgeTypes = {
    'erd-edge': ErdEdge
};

const convertTableToNode = (table: VmTable, node: undefined|Node) => {
    return {
        id: table.id,
        type: "tableNode",
        position: table.position,
        data: {
            table: table
        },
        width: node?.width
    }
}

const convertRelationToEdgeId = (relation: VmRelation) => {
    return `${relation.source.head}(${relation.sourceRow.name}) references ${relation.target.head}(${relation.targetRow.name})`;
}

const convertRelationToEdge = (relation: VmRelation) => {
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
        sourceHandle: `${relation.source.head}-${relation.sourceRow.name}-${sourceSide}`,
        target: relation.target.id,
        targetHandle: `${relation.target.head}-${relation.targetRow.name}-${targetSide}`,
        style: style,
        data: {
            pathType,
            sourceSide,
            targetSide
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
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const { x, y, zoom } = useViewport();
    const navigate = useNavigate();
    
    useEffect(() => {
        setEdges([]);
        setNodes(tables.map(table => {
            const node = nodes.find(node => table.id === node.id);
            return convertTableToNode(table, node);
        }));
        setEdges(relations.map(relation => convertRelationToEdge(relation)));
    }, [tables])

    const onNodeClick = (event: React.MouseEvent, node: Node) => {
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

    const onMove = (event: MouseEvent | TouchEvent, viewport: Viewport) => {
        currentViewport.x = viewport.x;
        currentViewport.y = viewport.y;
        currentViewport.zoom = viewport.zoom;
    }

    const downloadImagePng = () => {
        const nodesBounds = getRectOfNodes(nodes);
        const viewportElement = document.querySelector('.react-flow__viewport') as HTMLElement;
        const imageWidth = viewportElement.offsetWidth;
        const imageHeight = viewportElement.offsetHeight;
        console.log(imageWidth, imageHeight)
        const transform = getTransformForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2);
    
        toPng(viewportElement, {
            width: imageWidth / transform[2],
            height: imageHeight / transform[2],
            pixelRatio: 4,
            style: {
                width: `${imageWidth}px`,
                height: `${imageHeight}px`,
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
    }, [])

    return <>
        <Layout currentlyLoadedLink={"Draw"}>
            <SecondaryTopToolbar exportPngImage={ downloadImagePng }  />
            <div style={{ display: 'flex', width: '100vw', height: `calc(100vh - ${TOP_TOOLBAR_HEIGHT_PX}px  - ${SECONDARY_TOOLBAR_HEIGHT_PX}px)` }}>
                <DrawSide tables={tables} createNewTable={createNewTable}>
                    <MiniMap style={{ position: "relative", margin: 0 }} pannable maskColor="rgba(213, 213, 213, 0.7)" nodeColor="#ffc8c8" />
                </DrawSide>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    onNodesChange={onNodesChangeCommandListener}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={onNodeClick}
                    disableKeyboardA11y={true}  // keyboard arrow key movement is not supported
                    defaultViewport={currentViewport}
                    onMove={onMove}
                >
                    <Controls />
                    <Background variant={BackgroundVariant.Dots} gap={36} size={1} style={{ backgroundColor: "#f8fafc"}} />
                </ReactFlow>
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