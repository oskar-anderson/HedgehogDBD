import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./../components/Layout"
import ReactFlow, { ReactFlowProvider, useNodesState, useEdgesState, MiniMap, Background, Controls, BackgroundVariant, NodeChange, NodePositionChange, Node, getRectOfNodes, getTransformForBounds, useReactFlow, useViewport } from 'reactflow';
import DrawTable from "../components/drawChildren/DrawTable";
import 'reactflow/dist/style.css';
import { TOP_TOOLBAR_HEIGHT_PX } from "../components/TopToolbarAction"
import SecondaryTopToolbar, { SECONDARY_TOOLBAR_HEIGHT_PX } from "../components/drawChildren/SecondaryTopToolbar";
import CommandMoveTableRelative, { CommandMoveTableRelativeArgs } from "../commands/appCommands/CommandMoveTableRelative"
import ManagerSingleton from "../ManagerSingleton";
import DrawSide from "../components/drawChildren/DrawSide";
import VmTable from "../model/viewModel/VmTable";
import Databases from "../model/DataTypes/Databases";
import DataType from "../model/DataTypes/DataType";
import { toPng } from 'html-to-image';
import VmRelation from "../model/viewModel/VmRelation";
import { CommandCreateTable, CommandCreateTableArgs } from "../commands/appCommands/CommandCreateTable";
import DomainTable from "../model/domain/DomainTable";
import DomainTableRow from "../model/domain/DomainTableRow";
import DomainTableRowDataType from "../model/domain/DomainTableRowDataType";
import DomainTableRowDataTypeArguments from "../model/domain/DomainTableRowDataTypeArguments";
import { HOST_SUFFIX } from "../Global";

// nodeTypes need to be defined outside the render function or using memo
const nodeTypes = { 
    tableNode: DrawTable
}


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
    let type: 'default' | 'straight' | 'step' | 'smoothstep' | 'simplebezier' = 'default';
    if (relation.source.id === relation.target.id) { 
        targetSide = sourceSide;
        type = "smoothstep";
    }
    return {
        id:convertRelationToEdgeId(relation),
        type: type,
        source: relation.source.id,
        sourceHandle: `${relation.source.head}-${relation.sourceRow.name}-${sourceSide}`,
        target: relation.target.id,
        targetHandle: `${relation.target.head}-${relation.targetRow.name}-${targetSide}`,
    }
}

export const WrappedDraw = () => {
    const draw = ManagerSingleton.getDraw();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const { x, y, zoom } = useViewport();
    const navigate = useNavigate();
    
    useEffect(() => {
        draw.areTablesDirty = true;
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (draw.areTablesDirty || draw.schemaTables.some(table => table.isDirty)) {
                setEdges([]);
                setNodes(draw.schemaTables.map(table => {
                    const node = nodes.find(node => table.id === node.id);
                    // console.log(node?.data.table.head, "node: ", node, "witdh: ", node?.width, "converted node: ", convertTableToNode(table, node));
                    return table.isDirty || !node ? 
                        convertTableToNode(table.setIsDirty(false), node) : 
                        node;
                }));
                setEdges(draw.schemaRelations.map(relation => {
                    return convertRelationToEdge(relation)
                }));
                draw.areTablesDirty = false;
            }
        }, 1000/30);
        return () => clearInterval(intervalId);
    }, [nodes, edges])

    const onNodeClick = (event: React.MouseEvent, node: Node) => {
        navigate(`${HOST_SUFFIX}/table/${node.data.table.id}`);
    }

    const createNewTable = () =>  {
        const dataBase = Databases.getAll().find(x => x.id === draw.activeDatabaseId)!;
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
                    new DomainTableRowDataType(
                        defaultPkDataType.getId(),
                        tableRowDataTypeArguments,
                        false
                    ), 
                    ["PK"]
                )
            ]
        );
        draw.history.execute(
            new CommandCreateTable(
                draw, new CommandCreateTableArgs(newTable)
            )
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
                const command = new CommandMoveTableRelative(draw, new CommandMoveTableRelativeArgs(
                    nodeChange.id, 
                    nodeDraggedChangesEnd.current!.position!.x - nodeDraggedChangesStart.current!.position!.x, 
                    nodeDraggedChangesEnd.current!.position!.y - nodeDraggedChangesStart.current!.position!.y
                ));
                nodeDraggedChangesStart.current = null;
                nodeDraggedChangesEnd.current = null;
                draw.history.execute(command);
            } else {
              onNodesChange(nodeChanges);
            }
        }
        else {
            onNodesChange(nodeChanges);
        }
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
                <DrawSide tables={draw.schemaTables} createNewTable={createNewTable}>
                    <MiniMap style={{ position: "relative", margin: 0 }} pannable maskColor="rgba(213, 213, 213, 0.7)" nodeColor="#ffc8c8" />
                </DrawSide>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={onNodesChangeCommandListener}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={onNodeClick}
                    disableKeyboardA11y={true}  // keyboard arrow key movement is not supported
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