import { ChangeEvent, FormEvent, useState } from "react";
import { CommandDeleteTable } from "../../commands/appCommands/CommandDeleteTable";
import { CommandModifyTable } from "../../commands/appCommands/CommandModifyTable";
import { Manager } from "../../Manager";
import { Table as TableModel } from "../../model/Table"
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
        Manager.getInstance().changeScene(new DrawScene())
        setAppState(AppState.DrawScene);
    }

    const [rowData, setRowData] = useState(tableBeingEdited.tableRows.map((x) => { return {
        rowName: x.name,
        rowDatatype: x.datatype,
        rowAttributes: x.attributes.join(", ")
    } }));

    const [tableName, setTableName] = useState(tableBeingEdited.head);

    const saveChanges = () => {
        const draw = Manager.getInstance().draw;
        let oldTable = draw.schema.tables.find(x => x.equals(tableBeingEdited))!;
        const newTable = TableModel.initClone(tableBeingEdited);
        newTable.head = tableName;
        newTable.tableRows = rowData.map(tableRow => TableRow.init(
            tableRow.rowName, 
            tableRow.rowDatatype, 
            tableRow.rowAttributes.split(",").map(x => x.trim())
        ));
        draw.selectedTable = newTable;
        draw.history.execute(new CommandModifyTable(
            draw, 
            {
                oldTableJson: JSON.stringify(oldTable), 
                newTableJson: JSON.stringify(newTable)
            }
        ));
        draw.schema.relations.forEach(relation => relation.isDirty = true);
        Manager.getInstance().changeScene(new DrawScene())
        setAppState(AppState.DrawScene);
    }

    const handleFormChange = (index: number, event: ChangeEvent, name: "rowName" | "rowDatatype" | "rowAttributes") => {
        const data = [...rowData];
        const value = (event.target as HTMLInputElement).value;
        data[index][name] = value;
        setRowData(data);
    }

    const insertNewRow = (event: FormEvent<HTMLButtonElement>, index: number) => {
        if (index === -1) { index = rowData.length}
        const newRows = [
            ...[...rowData].slice(0, index),
            {
                rowName: "",
                rowDatatype: "",
                rowAttributes: "",
            },
            ...[...rowData].slice(index)
        ]
        setRowData(newRows)
    }

    const moveRowUp = (index: number) => {
        if (index <= 0) return;
        const newRows = [...rowData];
        [newRows[index], newRows[index - 1]] = [newRows[index - 1], newRows[index]];
        setRowData(newRows);
    }

    const moveRowDown = (index: number) => {
        if (index >= rowData.length - 1) return;
        const newRows = [...rowData];
        [newRows[index], newRows[index + 1]] = [newRows[index + 1], newRows[index]];
        setRowData(newRows);
    }

    const deleteRow = (index: number) => {
        const newRows = [...rowData];
        newRows.splice(index, 1);
        setRowData(newRows);
    }

    const deleteTable = () => {
        const draw = Manager.getInstance().draw;
        draw.history.execute(
            new CommandDeleteTable(
                draw, 
                {
                    tableJson: JSON.stringify(tableBeingEdited!),
                    listIndex: draw.schema.tables.findIndex(x => x.equals(tableBeingEdited))
                }
            )
        )
        draw.schema.relations.forEach(relation => relation.isDirty = true);
        Manager.getInstance().changeScene(new DrawScene())
        setAppState(AppState.DrawScene);
    }


    return (
        <div className="table-edit-container">
            <div className="modal" tabIndex={-1} style={{ display: "block" }}>
                <div className="modal-dialog modal-dialog-scrollable" style={{maxWidth: "80%"}}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <p className="modal-title">
                                <label htmlFor="table-name" style={{ marginRight: "6px" }}>Table</label>
                                <input id="table-name" className="input-tablename" onChange={(e) => setTableName(e.target.value)} type="text" value={ tableName } />
                            </p>
                            <button type="button" className="btn-close" onClick={() => switchToDraw() } aria-label="Close"></button>
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
                                        rowData.map((row, index) => (
                                            <TableRowJSX key={index} index={index} numberOfTableRows={rowData.length} row={row} handleFormChange={handleFormChange} insertNewRow={insertNewRow} moveRowUp={moveRowUp} moveRowDown={moveRowDown} deleteRow={deleteRow} />
                                        ))
                                    }
                                    <tr>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td>
                                            <button className="row-insert-btn btn btn-primary" onClick={(e) => insertNewRow(e, -1) }>Insert</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <datalist id="mysql-data-types">
                                <option value="VARCHAR(255)" />
                                <option value="VARCHAR(255)?" />
                                <option value="INT" />
                                <option value="INT?" />
                                <option value="FLOAT(14,2)" />
                                <option value="FLOAT(14,2)?" />
                                <option value="BOOLEAN" />
                                <option value="BOOLEAN?" />
                            </datalist>
                            <datalist id="attribute-suggestions">
                                <option value="PK" />
                                <option value='FK("TableName")' />
                            </datalist> 
                        </div>
                        <div className="modal-footer" style={{justifyContent: "space-between" }}>
                            <button className="table-delete-btn btn btn-danger" onClick={() => deleteTable() }>Delete table</button>
                            <div>
                                <button type="button" className="btn btn-secondary" onClick={() => switchToDraw() }>Close</button>
                                <button type="button" id="modal-save-changes" onClick={() => saveChanges() } className="btn btn-primary">Save changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}