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
import Table from "../model/Table";
import TableRow from "../model/TableRow";
import Databases from "../model/DataTypes/Databases";
import DataType from "../model/DataTypes/DataType";
import TableRowDataType from "../model/TableRowDataType";


// nodeTypes need to be defined outside the render function or using memo
const nodeTypes = { 
    tableNode: DrawTable
}


const personTable = new Table(
    { x: 100, y: 200 }, 
    "person", 
    [
        new TableRow(
            "id", 
            new TableRowDataType(DataType.guid(), [], false), 
            ["PK"]
        ),
        new TableRow(
            "firstname", 
            new TableRowDataType(DataType.string(), [], false), 
            []
        ),
        new TableRow(
            "lastname", 
            new TableRowDataType(DataType.string(), [], false), 
            []
        ),
        new TableRow(
            "email", 
            new TableRowDataType(DataType.string(), [], false), 
            []
        )
    ]
);
const registrationTable = new Table(
    { x: 500, y: 200},
    "registration",
    [
        new TableRow(
            "id", 
            new TableRowDataType(DataType.guid(), [], false), 
            ["PK"]
        ),
        new TableRow(
            "person_id", 
            new TableRowDataType(DataType.guid(), [], false), 
            ['FK("person")']
        ),
        new TableRow(
            "service_id", 
            new TableRowDataType(DataType.guid(), [], false), 
            ['FK("service")']
        )
    ]
);
const serviceTable = new Table(
    { x: 900, y: 200 },
    "service",
    [
        new TableRow(
            "id",
            new TableRowDataType(DataType.guid(), [], false),
            ["PK"]
        ),
        new TableRow(
            "name",
            new TableRowDataType(DataType.string(), [], false),
            []
        ),
    ]
);

const tables = [personTable, registrationTable, serviceTable];
tables.forEach(table => table.updateRelations(tables));
const initialNodes2: Node<{table: Table}>[] = tables.map(table => (
    {
        id: table.id,
        type: "tableNode",
        position: table.position,
        data: {
            table: table
        }
    }
));

const initialEdges2: Edge[] = tables
    .flatMap(table => table.relations)
    .filter(relation => {
        const targetRow = relation.target.tableRows.find(x => x.attributes.includes("PK"));
        return targetRow;
    }).map(relation => {   
        return {
            id: `${relation.source.head}(${relation.sourceRow.name}) references ${relation.target.head}(${relation.targetRow.name})`,
            source: relation.source.id,
            sourceHandle: `${relation.source.head}-${relation.sourceRow.name}-left`,
            target: relation.target.id,
            targetHandle: `${relation.target.head}-${relation.targetRow.name}-left`,
        }
    });

export default function draw() {
    const draw = ManagerSingleton.getDraw();
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes2);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges2);

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