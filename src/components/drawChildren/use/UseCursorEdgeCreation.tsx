import { useEffect } from "react";
import { subscribe, unsubscribe } from "../../../Event";
import CommandHistory from "../../../commands/CommandHistory";
import { CommandModifyTable, CommandModifyTableArgs } from "../../../commands/appCommands/CommandModifyTableArgs";
import DomainTable from "../../../model/domain/DomainTable";
import DataType from "../../../model/DataTypes/DataType";
import Databases from "../../../model/DataTypes/Databases";
import VmTable from "../../../model/viewModel/VmTable";
import { useApplicationState } from "../../../Store";


export type CursorEdgePayload = {
    sourceNodeId: string,
    sourceHandleId: string,
    sourceHandleIdWithoutSide: string,
    sourceTableRow: string | null,
    targetNodeId: string
} | null


const getNewSourceRowName = (sourceTable: VmTable, targetTable: VmTable) => {
    const rowNameBase = targetTable.head + "_id";
    let rowNameAppendix = 2;
    const rowNameIsUnique = !sourceTable.tableRows.map(x => x.name).includes(targetTable.head + "_id")
    if (! rowNameIsUnique) {
        while (sourceTable.tableRows.map(x => x.name).includes(targetTable.head + rowNameAppendix + "_id")) {
            rowNameAppendix++;
        }
    }
    const newRowName = rowNameIsUnique ? rowNameBase : (targetTable.head + rowNameAppendix + "_id");
    return newRowName;
}

type useCursorEdgeTableHeaderLeftClickProps = {
    cursorEdge: CursorEdgePayload, 
    setCursorEdge: (value: React.SetStateAction<CursorEdgePayload>) => void
}

export default function useCursorEdgeCreation({ cursorEdge, setCursorEdge } : useCursorEdgeTableHeaderLeftClickProps) {
    const history = useApplicationState(state => state.history);
    const tables = useApplicationState(state => state.schemaTables);
    const setTables = useApplicationState(state => state.setTables);
    const activeDatabaseId = useApplicationState(state => state.activeDatabaseId);

    const onCompleteAddingRelation = (e: any) => {
        const targetTable = e.detail.table as VmTable;
        if (!cursorEdge) { return };
        if (!cursorEdge.sourceTableRow) {
            const sourceTable = tables.find(table => table.id === cursorEdge!.sourceNodeId)!;
            const newRowName = getNewSourceRowName(sourceTable, targetTable);
            let newTable = JSON.parse(JSON.stringify(sourceTable));
            const dataBase = Databases.getAll().find(x => x.id === activeDatabaseId)!;
            newTable.tableRows.push({
                name: newRowName,
                datatype: {
                    dataTypeId: DataType.guid().getId(),
                    arguments: DataType.guid().getAllArguments()
                        .filter(x => x.databases.includes(dataBase))
                        .map(arg => ({ 
                            value: arg.defaultValue, 
                            argument: arg 
                        })
                    ),
                    isNullable: false,
                },
                attributes: [`FK("${targetTable.head}")`]
            })
            const command = new CommandModifyTable(
                { tables },
                new CommandModifyTableArgs(
                    DomainTable.init(sourceTable),
                    DomainTable.init(newTable)
                )
            );
            CommandHistory.execute(
                history, 
                command,
                setTables
            );
            setCursorEdge(null);
        }
        if (cursorEdge.sourceTableRow) {
            const sourceTable = tables.find(table => table.id === cursorEdge!.sourceNodeId)!;
            let newTable = JSON.parse(JSON.stringify(sourceTable)) as VmTable;
            let tableRowToChange = newTable.tableRows.find(x => x.name === cursorEdge.sourceTableRow)!
            tableRowToChange.attributes.push(`FK("${targetTable.head}")`)
            const command = new CommandModifyTable(
                { tables },
                new CommandModifyTableArgs(
                    DomainTable.init(sourceTable),
                    DomainTable.init(newTable)
                )
            );
            CommandHistory.execute(
                history, 
                command,
                setTables
            );
            setCursorEdge(null);
        }
    }
    useEffect(() => {
        subscribe("e_completeAddingRelation", onCompleteAddingRelation);
        return () => { 
            unsubscribe("e_completeAddingRelation", onCompleteAddingRelation); 
        }
    }, [cursorEdge, setCursorEdge, history, tables, setTables, activeDatabaseId])
}