import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { CommandDeleteTable, CommandDeleteTableArgs } from "../../commands/appCommands/CommandDeleteTable";
import { CommandModifyTable, CommandModifyTableArgs } from "../../commands/appCommands/CommandModifyTable";
import DataType, { DataTypeString } from "../../model/DataTypes/DataType";
import { Draw } from "../../model/Draw";
import { TableDTO } from "../../model/dto/TableDTO";
import TableRowDataTypeArgumentsDTO from "../../model/dto/TableRowDataTypeArgumentsDTO";
import TableRowDataTypeDTO from "../../model/dto/TableRowDataTypeDTO";
import { TableRowDTO } from "../../model/dto/TableRowDTO";
import { TableRow } from "../../model/TableRow";
import { useAppStateManagement } from "../../Store";
import { AppState } from "../MainContent";
import TableRowJSX from "./tableChildren/TableRow"


type TableProps = {
    draw: Draw;
    tableBeingEdited: TableDTO;
    switchToDrawView: (draw: Draw) => void;
}


export default function Table({ draw, tableBeingEdited, switchToDrawView }: TableProps ) {

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
            key: crypto.randomUUID(),
            rowName: x.name,
            rowDatatype: {
                id: x.datatype.id,
                arguments: x.datatype.arguments.map(y => {
                    const argument = DataType.getArgumentById(y.id)
                    return {
                        value: {
                            isIncluded: argument.isIncluded,
                            realValue: y.value,
                        },
                        argumentId: argument.id
                    }
                }),
                isNullable: x.datatype.isNullable,
            },
            rowAttributes: x.attributes.join(", ")
        }
    }));

    const [tableName, setTableName] = useState(tableBeingEdited.head);

    const saveChanges = () => {
        let oldTable = draw.schema.getTables().find(x => x.id === tableBeingEdited.id)!;
        let newTableRows = rows.map(tableRow => new TableRowDTO(
            tableRow.rowName,
            new TableRowDataTypeDTO(
                tableRow.rowDatatype.id,
                tableRow.rowDatatype.arguments.map(arg => {
                    const argument = DataType.getArgumentById(arg.argumentId);
                    return new TableRowDataTypeArgumentsDTO(arg.value.realValue, argument.id)
                }),
                tableRow.rowDatatype.isNullable
            ),
            tableRow.rowAttributes.split(",").map(x => x.trim())
        ));
        draw.history.execute(new CommandModifyTable(
            draw, new CommandModifyTableArgs(TableDTO.initFromTable(oldTable), new TableDTO(tableBeingEdited.id, tableBeingEdited.position, tableName, newTableRows))
        ));
        switchToDrawView(draw)
    }

    const insertNewRow = (event: FormEvent<HTMLButtonElement>, index: number) => {
        if (index === -1) { index = rows.length }
        const activeDatabase = draw.activeDatabase.select;
        const newDataType = DataType.string();
        const newRow = {
            key: crypto.randomUUID(),
            rowName: "",
            rowDatatype: {
                id: newDataType.getId(),
                arguments: DataType.getArgumentsByDatabaseAndByType(activeDatabase, newDataType.getId())
                    .map(x => {
                        return {
                            value: {
                                isIncluded: x.isIncluded,
                                realValue: x.defaultValue,
                            },
                            argumentId: x.id
                        }
                    }),
                isNullable: false,
            },
            rowAttributes: "",
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
        draw.history.execute(
            new CommandDeleteTable(
                draw, new CommandDeleteTableArgs(tableBeingEdited!, draw.schema.getTables().findIndex(x => x.id === tableBeingEdited.id))
            )
        )
        switchToDrawView(draw)
    }
    const hoverInsertIndicator = useRef<HTMLDivElement>(null);
    
    return (
        <div className="table-edit-container">
            <div className="modal bg-grey" tabIndex={-1} style={{ display: "block" }}>
                <div className="modal-dialog modal-dialog-scrollable" style={{ maxWidth: "80%" }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5>Editing table</h5>
                            <button type="button" className="btn-close" onClick={() => switchToDrawView(draw)} aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
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
                                            <TableRowJSX
                                                key={row.key}
                                                dragItem={dragItem}
                                                dragOverItem={dragOverItem}
                                            
                                                index={index} hoverInsertIndicator={hoverInsertIndicator} row={row} setRows={setRows} tableRows={rows} deleteRow={deleteRow}
                                                database={draw.activeDatabase}
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
                            <datalist id="attribute-suggestions">
                                <option value="PK" />
                                <option value='FK("TableName")' />
                            </datalist>
                            <hr />
                        </div>
                        <div className="modal-footer" style={{ display: "grid", gridTemplateColumns: "1fr 3fr" }}>
                            <button type="button" className="btn btn-light" onClick={() => switchToDrawView(draw)}>Discard changes</button>
                            <button type="button" id="modal-save-changes" onClick={() => saveChanges()} className="btn btn-primary">Save changes</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}