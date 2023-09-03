import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./../components/Layout"
import ReactFlow, { ReactFlowProvider, useNodesState, useEdgesState, addEdge, MiniMap, Background, Controls, Position, BackgroundVariant, NodeChange, NodePositionChange, Edge, Node } from 'demo-reactflow--reactflow';
import DrawTable from "../components/drawChildren/DrawTable";
import 'demo-reactflow--reactflow/dist/style.css';
import { TOP_TOOLBAR_HEIGHT_PX } from "../components/TopToolbarAction"
import SecondaryTopToolbar, { SECONDARY_TOOLBAR_HEIGHT_PX } from "../components/drawChildren/SecondaryTopToolbar";
import CommandMoveTableRelative, { CommandMoveTableRelativeArgs } from "../commands/appCommands/CommandMoveTableRelative"
import ManagerSingleton from "../ManagerSingleton";
import DrawSide from "../components/drawChildren/DrawSide";


// nodeTypes need to be defined outside the render function or using memo
const nodeTypes = { 
    tableNode: DrawTable
}

const initialNodes = [
    { 
        id: 'person',
        type: "tableNode", 
        position: { x: 100, y: 200 },
        data: 
        {
            table: {
                position: {
                    x: 0,
                    y: 0
                },
                title: "person",
                rows: [
                    {
                        name: "id",
                        type: "int",
                        attributes: ["PK"]
                    },
                    {
                        name: "firstname",
                        type: "string",
                        attributes: []
                    },
                    {
                        name: "lastname",
                        type: "string",
                        attributes: []
                    },
                    {
                        name: "email",
                        type: "string",
                        attributes: []
                    },
                ]
            }
        }
    },
    { 
        id: 'registration', 
        type: "tableNode", 
        position: { x: 500, y: 200 }, 
        data: { 
            table: {
                position: {
                    x: 0,
                    y: 100
                },
                title: "registration",
                rows: [
                    {
                        name: "id",
                        type: "int",
                        attributes: ["PK"]
                    },
                    {
                        name: "person_id",
                        type: "int",
                        attributes: ["FK"]
                    },
                    {
                        name: "service_id",
                        type: "int",
                        attributes: ["FK"]
                    }
                ]
            } 
      } 
    },
    { 
        id: 'service',
        type: "tableNode", 
        position: { x: 900, y: 200 },
        data: 
        { 
            table: {  
                position: {
                    x: 0,
                    y: 200
                },
                title: "service",
                rows: [
                    {
                        name: "id",
                        type: "int",
                        attributes: ["PK"]
                    },
                    {
                        name: "name",
                        type: "string",
                        attributes: []
                    }
                ]
            }
        } 
    }
];
const initialEdges: Edge[] = [
    { id: 'e1-2', source: 'registration', sourceHandle: "registration-person_id-left", target: 'person', targetHandle: "person-id-right" },
    { id: 'e2-3', source: 'registration', sourceHandle: "registration-service_id-right", target: 'service', targetHandle: "service-id-left" }
];

export default function draw() {
    const draw = ManagerSingleton.getDraw();
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    let nodeDraggedChanges: NodePositionChange[] = [];
    const onNodesChangeAfterListener = (nodeChanges: NodeChange[]) => {
        if (nodeChanges.every(x => x.type === "position")) {
            if (nodeChanges.length !== 1) throw Error("Unexpected nodeChanges array lenght!")
            let nodeChange = nodeChanges[0] as NodePositionChange;
            nodeDraggedChanges.push(nodeChange);

            // console.log(nodeChange);
            if (! nodeChange.dragging) {
                if (nodeDraggedChanges.length <= 2) {
                    return
                }
                const startPosition = nodeDraggedChanges[0];
                const endPosition = nodeDraggedChanges[nodeChanges.length - 2];
                const command = new CommandMoveTableRelative(draw, new CommandMoveTableRelativeArgs(
                    nodeChange.id, 
                    startPosition.position!.x - endPosition.position!.x, 
                    startPosition.position!.y - endPosition.position!.y
                ));
                draw.history.execute(command);
                nodeDraggedChanges = [];
            } else {
              onNodesChange(nodeChanges);
            }
        }
        else {
            onNodesChange(nodeChanges);
        }
    }

    useEffect(() => {
        const attribution = document.querySelector(".react-flow__attribution");
        const attribuitionTextElement = attribution?.children[0] as HTMLLinkElement;
        attribuitionTextElement!.innerHTML = "HedgehogDBD uses React Flow";
        // attribuitionTextElement!.href = "https://github.com/oskar-anderson/RasterModeler";
    }, [])

    return <>
        
        <Layout currentlyLoadedLink={"Draw"}>
            <ReactFlowProvider>
                <SecondaryTopToolbar />
                <div style={{ display: 'flex', width: '100vw', height: `calc(100vh - ${TOP_TOOLBAR_HEIGHT_PX}px  - ${SECONDARY_TOOLBAR_HEIGHT_PX}px)` }}>
                    <DrawSide tables={[]}>
                        <MiniMap style={{ position: "relative", margin: 0 }} pannable maskColor="rgb(213, 213, 213)" nodeColor="#ffc8c8" />
                    </DrawSide>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        onNodesChange={onNodesChangeAfterListener}
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