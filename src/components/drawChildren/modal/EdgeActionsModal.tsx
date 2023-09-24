import { publish } from "../../../Event";
import { useApplicationState } from "../../../Store";
import CommandHistory from "../../../commands/CommandHistory";
import { CommandModifyTable, CommandModifyTableArgs } from "../../../commands/appCommands/CommandModifyTableArgs";
import DomainTable from "../../../model/domain/DomainTable";
import DomainTableRow from "../../../model/domain/DomainTableRow";
import DomainTableRowDataTypeArguments from "../../../model/domain/DomainTableRowDataTypeArguments";
import VmTable from "../../../model/viewModel/VmTable";
import VmTableRow from "../../../model/viewModel/VmTableRow";


export type EdgeActionPayload = {
    show: boolean,
    props: {
        x: number,
        y: number,
        sourceTable: VmTable,
        sourceTableRow: VmTableRow,
        targetTableName: string,
        targetTableRowName: string
    } | null
}

export const edgeActionPayloadDefault: EdgeActionPayload = {
    show: false,
    props: null
}

const toggleRelationSourceRequiredness = (
    history: {
        undoHistory: string[];
        redoHistory: string[];
    }, 
    tables: VmTable[], 
    setTables: (tables: VmTable[]) => void,
    setEdgeActions: React.Dispatch<React.SetStateAction<EdgeActionPayload>>, 
    tableId: string, 
    rowName: string) => {
    const table = tables.find(x => x.id === tableId);
    if (! table) { 
        console.error("Table not found!")
        return;
    }
    CommandHistory.execute(history, new CommandModifyTable(
        { tables }, 
        new CommandModifyTableArgs(
            DomainTable.init(table), 
            new DomainTable(
                table.id, 
                table.position, 
                table.head, 
                table.tableRows.map(tr => 
                    {
                        return new DomainTableRow(
                            tr.name,
                            tr.datatype.dataTypeId,
                            tr.datatype.arguments.map(arg => {
                                return new DomainTableRowDataTypeArguments(arg.value, arg.argument.id)
                            }),
                            tr.name === rowName ? !tr.datatype.isNullable : tr.datatype.isNullable,
                            tr.attributes
                        );
                    }
                )
            )
        )
    ), setTables);
    
    setEdgeActions((state) => { 
        const edgeActionsCopy = JSON.parse(JSON.stringify(state)) as EdgeActionPayload;
        edgeActionsCopy.props!.sourceTableRow.datatype.isNullable = !edgeActionsCopy.props!.sourceTableRow.datatype.isNullable;
        return {...edgeActionsCopy }; 
    });
}

const deleteRelation = (
    history: {
        undoHistory: string[];
        redoHistory: string[];
    }, 
    tables: VmTable[], 
    setTables: (tables: VmTable[]) => void, 
    setEdgeActions: React.Dispatch<React.SetStateAction<EdgeActionPayload>>, 
    tableId: string, 
    rowName: string, 
    targetTableName: string
    ) => {
    const table = tables.find(x => x.id === tableId);
    if (! table) { 
        console.error("Table not found!")
        return;
    }
    CommandHistory.execute(history, new CommandModifyTable(
        { tables }, 
        new CommandModifyTableArgs(
            DomainTable.init(table), 
            new DomainTable(
                table.id, 
                table.position, 
                table.head, 
                table.tableRows.map(tr => 
                    {
                        return new DomainTableRow(
                            tr.name,
                            tr.datatype.dataTypeId,
                            tr.datatype.arguments.map(arg => {
                                return new DomainTableRowDataTypeArguments(arg.value, arg.argument.id)
                            }),
                            tr.datatype.isNullable,
                            tr.name !== rowName ? tr.attributes :
                            tr.attributes.filter(attribute => attribute !== `FK("${targetTableName}")`)
                        );
                    }
                )
            )
        )
    ), setTables);
    setEdgeActions(edgeActionPayloadDefault);
}

const deleteTableRow = (
    history: {
        undoHistory: string[];
        redoHistory: string[];
    }, 
    tables: VmTable[], 
    setTables: (tables: VmTable[]) => void, 
    setEdgeActions: React.Dispatch<React.SetStateAction<EdgeActionPayload>>, 
    tableId: string, 
    rowName: string) => {

    const table = tables.find(x => x.id === tableId);
    if (! table) { 
        console.error("Table not found!")
        return;
    }
    CommandHistory.execute(history, new CommandModifyTable(
        { tables }, 
        new CommandModifyTableArgs(
            DomainTable.init(table), 
            new DomainTable(
                table.id, 
                table.position, 
                table.head, 
                table.tableRows
                    .filter(tr => tr.name !== rowName)
                    .map(tr => 
                    {
                        return new DomainTableRow(
                            tr.name,
                            tr.datatype.dataTypeId,
                            tr.datatype.arguments.map(arg => {
                                return new DomainTableRowDataTypeArguments(arg.value, arg.argument.id)
                            }),
                            tr.datatype.isNullable,
                            tr.attributes
                        );
                    }
                )
            )
        )
    ), setTables);
    setEdgeActions(edgeActionPayloadDefault);
}

type EdgeActionModalProps = {
    edgeActions: EdgeActionPayload, 
    setEdgeActions: React.Dispatch<React.SetStateAction<EdgeActionPayload>>
}

export default function EdgeActionsModal({ edgeActions, setEdgeActions } : EdgeActionModalProps) {
    const history = useApplicationState(state => state.history);
    const tables = useApplicationState(state => state.schemaTables);
    const setTables = useApplicationState(state => state.setTables);

    return (
        edgeActions.show ? 
        <div style={{ 
            position: "absolute", 
            top: edgeActions.props!.y, 
            left: edgeActions.props!.x,
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "4px",
        }}
        >
            <div className="modal-header p-2" style={{ borderBottom: "solid 1px #eee", height: "3em" }}>
                <h5 className="modal-title">Relation</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={() => setEdgeActions(edgeActionPayloadDefault)}></button>
            </div>

            <div className="p-2" style={{ borderBottom: "solid 1px #eee"}}>
                <div className="d-flex">
                    <span style={{ width: "80px" }}>Source: </span>
                    <span>{edgeActions.props!.sourceTable.head}.{edgeActions.props!.sourceTableRow!.name}</span>
                </div> 
                <div className="d-flex">
                    <span style={{ width: "80px" }}>Target: </span>
                    <span>{edgeActions.props!.targetTableName}.{edgeActions.props!.targetTableRowName}</span>
                </div>
            </div>
            <div className="p-2">
                <div className="d-flex mb-1 gap-1">
                    <button className="btn btn-light w-50" onClick={() => toggleRelationSourceRequiredness(history, tables, setTables, setEdgeActions, edgeActions.props!.sourceTable.id, edgeActions.props!.sourceTableRow.name)}>Source: {edgeActions.props!.sourceTableRow.datatype.isNullable ? "?" : "!"}</button>
                    <button className="btn btn-light w-50 disabled">Target: m</button> 
                </div>
                <button className="btn btn-danger w-100 mb-1" onClick={() => deleteRelation(history, tables, setTables, setEdgeActions, edgeActions.props!.sourceTable.id, edgeActions.props!.sourceTableRow.name, edgeActions.props!.targetTableName)}>Delete relation</button>
                <button className="btn btn-danger w-100" onClick={() => deleteTableRow(history, tables, setTables, setEdgeActions, edgeActions.props!.sourceTable.id, edgeActions.props!.sourceTableRow.name)}>Delete source</button>
            </div>
        </div>
        : null
    )
}