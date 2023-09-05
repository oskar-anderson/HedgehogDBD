import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./../components/Layout"
import ReactFlow, { ReactFlowProvider, useNodesState, useEdgesState, addEdge, MiniMap, Background, Controls, Position, BackgroundVariant, NodeChange, NodePositionChange, Edge, Node, getRectOfNodes, getTransformForBounds, useReactFlow } from 'reactflow';
import DrawTable from "../components/drawChildren/DrawTable";
import 'reactflow/dist/style.css';
import { TOP_TOOLBAR_HEIGHT_PX } from "../components/TopToolbarAction"
import SecondaryTopToolbar, { SECONDARY_TOOLBAR_HEIGHT_PX } from "../components/drawChildren/SecondaryTopToolbar";
import CommandMoveTableRelative, { CommandMoveTableRelativeArgs } from "../commands/appCommands/CommandMoveTableRelative"
import ManagerSingleton from "../ManagerSingleton";
import DrawSide from "../components/drawChildren/DrawSide";
import VmTable from "../model/viewModel/VmTable";
import VmTableRow from "../model/viewModel/VmTableRow";
import Databases from "../model/DataTypes/Databases";
import DataType from "../model/DataTypes/DataType";
import VmTableRowDataType from "../model/viewModel/VmTableRowDataType";
import { toPng } from 'html-to-image';
import DomainDraw from "../model/domain/DomainDraw";
import VmRelation from "../model/viewModel/VmRelation";

// nodeTypes need to be defined outside the render function or using memo
const nodeTypes = { 
    tableNode: DrawTable
}


const convertTableToNode = (table: VmTable) => {
    return {
        id: table.id,
        type: "tableNode",
        position: table.position,
        data: {
            table: table
        }
    }
}

const convertRelationToEdge = (relation: VmRelation) => {
    return {
        id: `${relation.source.head}(${relation.sourceRow.name}) references ${relation.target.head}(${relation.targetRow.name})`,
        source: relation.source.id,
        sourceHandle: `${relation.source.head}-${relation.sourceRow.name}-left`,
        target: relation.target.id,
        targetHandle: `${relation.target.head}-${relation.targetRow.name}-left`,
    }
}

export default function draw() {
    const draw = ManagerSingleton.getDraw();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (draw.isDirty || draw.schemaTables.some(table => table.isDirty)) {
                setEdges([]);
                setNodes(draw.schemaTables.map(table => convertTableToNode(table.setIsDirty(false))));    
                setEdges(draw.schemaRelations.map(relation => convertRelationToEdge(relation.setIsDirty(false))));
            }
            draw.isDirty = false;
        }, 1000/30);
        return () => clearInterval(intervalId);
    }, [])

    const [nodeDraggedChangesStart, setNodeDraggedChangesStart] = 
        useState<NodePositionChange | null>(null);
    const [nodeDraggedChangesEnd, setNodeDraggedChangesEnd] = 
        useState<NodePositionChange | null>(null);
    const onNodesChangeCommandListener = (nodeChanges: NodeChange[]) => {
        if (nodeChanges.every(x => x.type === "position")) {
            if (nodeChanges.length !== 1) throw Error("Unexpected nodeChanges array lenght!")
            let nodeChange = nodeChanges[0] as NodePositionChange;
            if (! nodeDraggedChangesStart) {
                setNodeDraggedChangesStart(nodeChange);
            } else {
                setNodeDraggedChangesEnd(nodeChange)
            }

            if (! nodeChange.dragging) {
                if (!nodeDraggedChangesStart || !nodeDraggedChangesEnd) {
                    return
                }
                const command = new CommandMoveTableRelative(draw, new CommandMoveTableRelativeArgs(
                    nodeChange.id, 
                    nodeDraggedChangesEnd.position!.x - nodeDraggedChangesStart.position!.x, 
                    nodeDraggedChangesEnd.position!.y - nodeDraggedChangesStart.position!.y
                ));
                console.log("move")
                setNodeDraggedChangesStart(null);
                setNodeDraggedChangesEnd(null);
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
            <ReactFlowProvider>
                <SecondaryTopToolbar exportPngImage={ downloadImagePng }  />
                <div style={{ display: 'flex', width: '100vw', height: `calc(100vh - ${TOP_TOOLBAR_HEIGHT_PX}px  - ${SECONDARY_TOOLBAR_HEIGHT_PX}px)` }}>
                    <DrawSide tables={[]}>
                        <MiniMap style={{ position: "relative", margin: 0 }} pannable maskColor="rgba(213, 213, 213, 0.7)" nodeColor="#ffc8c8" />
                    </DrawSide>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        onNodesChange={onNodesChangeCommandListener}
                        onEdgesChange={onEdgesChange}
                        disableKeyboardA11y={true}  // keyboard arrow key movement is not supported
                    >
                        <Controls />
                        <Background variant={BackgroundVariant.Dots} gap={36} size={1} style={{ backgroundColor: "#f8fafc"}} />
                    </ReactFlow>
                </div>
            </ReactFlowProvider>
        </Layout>
    </>
}