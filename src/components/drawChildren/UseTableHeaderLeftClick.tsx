import { useEffect } from "react";
import { subscribe, unsubscribe } from "../../Event";
import CommandHistory from "../../commands/CommandHistory";
import { CommandModifyTable, CommandModifyTableArgs } from "../../commands/appCommands/CommandModifyTableArgs";
import DomainTable from "../../model/domain/DomainTable";
import DataType from "../../model/DataTypes/DataType";
import Databases from "../../model/DataTypes/Databases";
import VmTable from "../../model/viewModel/VmTable";
import { useApplicationState } from "../../Store";

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

type useTableHeaderLeftClickProps = {
    cursorEdge: {
        sourceNodeId: string;
        sourceHandleId: string;
        sourceHandleIdWithoutSide: string;
        targetNodeId: string;
    } | null, 
    setCursorEdge: (value: React.SetStateAction<{
        sourceNodeId: string;
        sourceHandleId: string;
        sourceHandleIdWithoutSide: string;
        targetNodeId: string;
    } | null>) => void
}

export default function useTableHeaderLeftClick({ cursorEdge, setCursorEdge } : useTableHeaderLeftClickProps) {
    const history = useApplicationState(state => state.history);
    const tables = useApplicationState(state => state.schemaTables);
    const setTables = useApplicationState(state => state.setTables);
    const activeDatabaseId = useApplicationState(state => state.activeDatabaseId);

    const onTableHeaderLeftClick = (e: any) => {
        const event = e.detail.event as React.MouseEvent;
        const targetTable = e.detail.table as VmTable;
        if (cursorEdge) {
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
    }
    useEffect(() => {
        subscribe("DrawTable__onHeaderLeftClick", onTableHeaderLeftClick);
        return () => { 
            unsubscribe("DrawTable__onHeaderLeftClick", onTableHeaderLeftClick); 
        }
    }, [cursorEdge, setCursorEdge, history, tables, setTables, activeDatabaseId])
}