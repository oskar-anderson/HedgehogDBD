import { useEffect } from "react";
import { subscribe, unsubscribe } from "../../Event";
import CommandHistory from "../../commands/CommandHistory";
import { CommandModifyTable, CommandModifyTableArgs } from "../../commands/appCommands/CommandModifyTableArgs";
import DomainTable from "../../model/domain/DomainTable";
import DataType from "../../model/DataTypes/DataType";
import Databases from "../../model/DataTypes/Databases";
import VmTable from "../../model/viewModel/VmTable";
import { useApplicationState } from "../../Store";


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
        const table = e.detail.table as VmTable;
        if (cursorEdge) {
            let newTable = JSON.parse(JSON.stringify(table));
            const sourceTable = tables.find(table => table.id === cursorEdge!.sourceNodeId)!;
            const dataBase = Databases.getAll().find(x => x.id === activeDatabaseId)!;
            newTable.tableRows.push({
                name: sourceTable.head + "_id",
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
                attributes: [`FK("${sourceTable.head}")`]
            })
            const command = new CommandModifyTable(
                { tables },
                new CommandModifyTableArgs(
                    DomainTable.init(table),
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