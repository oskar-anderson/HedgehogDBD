import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { CommandDeleteTable, CommandDeleteTableArgs } from "../../commands/appCommands/CommandDeleteTable";
import { CommandModifyTable, CommandModifyTableArgs } from "../../commands/appCommands/CommandModifyTable";
import { Manager } from "../../Manager";
import DataType, { DataTypeString } from "../../model/DataTypes/DataType";
import { TableDTO } from "../../model/dto/TableDTO";
import TableRowDataTypeArgumentsDTO from "../../model/dto/TableRowDataTypeArgumentsDTO";
import TableRowDataTypeDTO from "../../model/dto/TableRowDataTypeDTO";
import { TableRowDTO } from "../../model/dto/TableRowDTO";
import { TableRow } from "../../model/TableRow";
import { DrawScene } from "../../scenes/DrawScene";
import { TableScene } from "../../scenes/TableScene";
import { useAppStateManagement } from "../../Store";
import { AppState } from "../MainContent";
import TableRowJSX from "./tableChildren/TableRow"


export default function Table() {
    const { setAppState } = useAppStateManagement();

    const tableBeingEdited = (Manager.getInstance().getScene() as TableScene).tableBeingEdited;

    const switchToDraw = () => {
        const draw = Manager.getInstance().draw;
        Manager.getInstance().changeScene(new DrawScene(draw))
        setAppState(AppState.DrawScene);
    }

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
        const draw = Manager.getInstance().draw;
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
        Manager.getInstance().changeScene(new DrawScene(draw))
        setAppState(AppState.DrawScene);
    }

    const insertNewRow = (event: FormEvent<HTMLButtonElement>, index: number) => {
        if (index === -1) { index = rows.length }
        const activeDatabase = Manager.getInstance().draw.activeDatabase.select;
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

    const deleteRow = (index: number) => {
        const newRows = [...rows];
        newRows.splice(index, 1);
        setRows(newRows);
    }

    const deleteTable = () => {
        const draw = Manager.getInstance().draw;
        draw.history.execute(
            new CommandDeleteTable(
                draw, new CommandDeleteTableArgs(tableBeingEdited!, draw.schema.getTables().findIndex(x => x.id === tableBeingEdited.id))
            )
        )
        Manager.getInstance().changeScene(new DrawScene(draw))
        setAppState(AppState.DrawScene);
    }


    return (
        <div className="table-edit-container">
            <div className="modal" tabIndex={-1} style={{ display: "block" }}>
                <div className="modal-dialog modal-dialog-scrollable" style={{ maxWidth: "80%" }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <p className="modal-title" style={{ display: "flex", alignItems: "center" }}>
                                <label htmlFor="table-name" style={{ marginRight: "6px" }}>Table</label>
                                <input id="table-name" className="form-control" style={{ display: "inline" }} onChange={(e) => setTableName(e.target.value)} type="text" value={tableName} />
                            </p>
                            <button type="button" className="btn-close" onClick={() => switchToDraw()} aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <table>
                                <thead>
                                    <tr>
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
                                                // dragging logic
                                                draggable
                                                style={{ cursor: "grabbing" }}
                                                onDragStart={(e) => { dragItem.current = index; }}
                                                onDragEnter={(e) => { dragOverItem.current = index }}
                                                onDragEnd={(e) => { dragEnd(); }}
                                                onDragOver={e => e.preventDefault()} // this is needed for correct cursor icon display for dragEnd
                                                
                                                // everything else
                                                key={row.key}
                                                index={index} row={row} setRows={setRows} rows={rows} insertNewRow={insertNewRow} deleteRow={deleteRow}
                                            />
                                        ))
                                    }
                                    <tr>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td>
                                            <button className="row-insert-btn btn btn-primary" onClick={(e) => insertNewRow(e, -1)}>Insert</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <datalist id="attribute-suggestions">
                                <option value="PK" />
                                <option value='FK("TableName")' />
                            </datalist>
                        </div>
                        <div className="modal-footer" style={{ justifyContent: "space-between" }}>
                            <button className="table-delete-btn btn btn-danger" onClick={() => deleteTable()}>Delete table</button>
                            <div>
                                <button type="button" className="btn btn-secondary" onClick={() => switchToDraw()}>Close</button>
                                <button type="button" id="modal-save-changes" onClick={() => saveChanges()} className="btn btn-primary">Save changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}