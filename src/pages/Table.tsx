import { useNavigate, useParams } from "react-router-dom";
import { useApplicationState } from "../Store";
import { FormEvent, useEffect, useRef, useState } from "react";
import { CommandDeleteTable, CommandDeleteTableArgs } from "../commands/appCommands/CommandDeleteTable";
import DataType from "../model/DataTypes/DataType";
import Databases from "../model/DataTypes/Databases";
import DomainTableRow from "../model/domain/DomainTableRow";
import DomainTableRowDataTypeArguments from "../model/domain/DomainTableRowDataTypeArguments";
import DomainTable from "../model/domain/DomainTable";
import TableRow, { UiTableRowDatatype } from "../components/tableChildren/TableRow"
import { CommandModifyTable, CommandModifyTableArgs } from "../commands/appCommands/CommandModifyTableArgs";
import CommandHistory from "../commands/CommandHistory";
import { CreateAttributeModel } from "../components/modals/createAttribute";

export interface rowData {
    rowName: string
    rowDatatype: UiTableRowDatatype
    rowAttributes: string[]
}

export default function Table() {
    const { id } = useParams();
    const tables = useApplicationState(state => state.schemaTables);
    const setTables = useApplicationState(state => state.setTables);
    const activeDatabaseId = useApplicationState(state => state.activeDatabaseId);
    const history = useApplicationState(state => state.history);
    const navigate = useNavigate();

    // Figure out why a simple argument not found is so difficult to implement in React
    const tableBeingEditedNullable = tables.find(x => x.id === id);
    useEffect(() => {
        if (!tableBeingEditedNullable){
            console.error("No table could be selected!");
            navigate(`/`);
        }
    }, []);
    if (!tableBeingEditedNullable){
        return null;
    }
    const tableBeingEdited = DomainTable.init(tableBeingEditedNullable!);

    useEffect(() => {
        const onMouseUp = (e: MouseEvent) => {
            dragEnd();
            dragOverItem.current = null;
            dragItem.current = null;
            hoverInsertIndicator.current!.style.display = "none";
        }
        window.onmouseup = onMouseUp;
        return () => {
            window.onmouseup = null;
        }
    })

    const dragEnd = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        const copyRows = [...rows];
        const dragItemContent = copyRows[dragItem.current];
        copyRows.splice(dragItem.current, 1);
        copyRows.splice(dragOverItem.current, 0, dragItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        setRows(copyRows);
    };

    const [rows, setRows] = useState(tableBeingEdited.tableRows.map((x) => {
        return {
            key: crypto.randomUUID() as string,
            rowName: x.name,
            rowDatatype: {
                id: x.datatypeId,
                arguments: x.datatypeArguments.map(y => {
                    const argument = DataType.getArgumentById(y.id)
                    return {
                        value: {
                            isIncluded: argument.isIncluded,
                            realValue: String(y.value),
                        },
                        argumentId: argument.id
                    }
                }),
                isNullable: x.datatypeIsNullable,
            },
            rowAttributes: x.attributes
        }
    }));

    const [tableName, setTableName] = useState(tableBeingEdited.head);
    const [addRowAttributeModal , setAddRowAttributeModal ] = useState<{row : rowData | null}>({row : null})
    const saveChanges = () => {
        let oldTable = tables.find(x => x.id === tableBeingEdited.id)!;
        let newTableRows = rows.map(tableRow => new DomainTableRow(
            tableRow.rowName,
            tableRow.rowDatatype.id,
            tableRow.rowDatatype.arguments.map(arg => {
                const value = arg.value.realValue === "" ? 0 : parseInt(arg.value.realValue);
                const argument = DataType.getArgumentById(arg.argumentId);
                return new DomainTableRowDataTypeArguments(value, argument.id)
            }),
            tableRow.rowDatatype.isNullable,
            tableRow.rowAttributes
        ));
        CommandHistory.execute(history, new CommandModifyTable(
            { tables }, 
            new CommandModifyTableArgs(
                DomainTable.init(oldTable), 
                new DomainTable(
                    tableBeingEdited.id, 
                    tableBeingEdited.position, 
                    tableName, 
                    newTableRows
                )
            )
        ), setTables);
        
        navigate(`/draw`)
    }

    const insertNewRow = (event: FormEvent<HTMLButtonElement>, index: number) => {
        if (index === -1) { index = rows.length }
        const activeDatabase = Databases.get(activeDatabaseId);
        const newDataType = DataType.string();
        const newRow = {
            key: crypto.randomUUID(),
            rowName: "",
            rowDatatype: {
                id: newDataType.getId(),
                arguments: DataType.getArgumentsByDatabaseAndByType(activeDatabase.select, newDataType.getId())
                    .map(x => {
                        return {
                            value: {
                                isIncluded: x.isIncluded,
                                realValue: String(x.defaultValue),
                            },
                            argumentId: x.id
                        }
                    }),
                isNullable: false,
            },
            rowAttributes: [],
        };
        const newRows = [
            ...[...rows].slice(0, index),
            newRow,
            ...[...rows].slice(index)
        ]
        setRows(newRows)
    }

    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const deleteRow = (index: number) => {
        const newRows = [...rows];
        newRows.splice(index, 1);
        setRows(newRows);
    }

    const deleteTable = () => {
        CommandHistory.execute(
            history,
            new CommandDeleteTable(
                { tables }, new CommandDeleteTableArgs(
                    tableBeingEdited!, 
                    tables.findIndex(x => x.id === tableBeingEdited.id)
                )
            ), setTables
        )
        navigate(`/draw`)
    }

    const hoverInsertIndicator = useRef<HTMLDivElement>(null);

    return (
        <>
        <CreateAttributeModel table={tableBeingEdited}  addRowAttributeModal={addRowAttributeModal} setAddRowAttributeModal={setAddRowAttributeModal}   ></CreateAttributeModel>
        <div>
        <div className="table-edit-container">
            <div className="vh-100 p-4 bg-grey" tabIndex={-1} style={{ display: "block" }}>
                <div className=" modal-dialog modal-dialog-scrollable" style={{ maxWidth: "80%" }}>
                    <div className="p-3 border rounded border-grey modal-content bg-white">
                        <div className="modal-header pb-2  border-bottom  border-grey">
                            <h5>Editing table</h5>
                            <button type="button" className="btn-close" onClick={() => navigate(`/draw`)} aria-label="Close"></button>
                        </div>
                        <div className="modal-body py-3">
                            <div className="modal-title" style={{ display: "flex", gridGap: "1em" }}>
                                <div style={{ flex: "50%", display: "flex", alignItems: "center" }}>
                                    <label htmlFor="table-name" className="me-3">Table name</label>
                                    <input id="table-name" className="form-control" style={{ width: "auto" }} onChange={(e) => setTableName(e.target.value)} type="text" value={tableName} />
                                </div>
                                <div style={{ flex: "50%", display: "flex", alignItems: "center" }}>
                                    <label className="me-3">Table action</label>
                                    <button className="table-delete-btn btn btn-danger" onClick={() => deleteTable()}>Delete table</button>
                                </div>
                            </div>

                            <hr />
                            <table>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Name</th>
                                        <th style={{ width: "120px" }}>Datatype</th>
                                        <th>Attributes</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        rows.map((row, index) => (
                                            <TableRow
                                                setAddRowAttributeModal={setAddRowAttributeModal}
                                                key={row.key}
                                                dragItem={dragItem}
                                                dragOverItem={dragOverItem}
                                            
                                                index={index} hoverInsertIndicator={hoverInsertIndicator} row={row} setRows={setRows} tableRows={rows} deleteRow={deleteRow}
                                            />
                                        ))
                                    }
                                    <tr>
                                        <td colSpan={5}>
                                            <button className="row-insert-btn btn btn-light" style={{ width: "100%" }} onClick={(e) => insertNewRow(e, -1)}>Insert Row</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <div ref={hoverInsertIndicator} className="horizontal-strike" style={{ position: "fixed", display: "none", justifyContent: "center", pointerEvents: "none" }}>
                                Drop
                            </div>
                            <hr />
                        </div>
                        <div className="modal-footer" style={{ display: "grid", gridTemplateColumns: "1fr 3fr" }}>
                            <button type="button" className="btn btn-light" onClick={() => navigate(`/draw`)}>Discard changes</button>
                            <button type="button" className="btn btn-light btn-create" id="modal-save-changes" onClick={() => saveChanges()} style={{ fontWeight: 600}}>Save changes</button>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </div>
        </>

    );
}

