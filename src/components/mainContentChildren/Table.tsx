import { ChangeEvent, FormEvent, useState } from "react";
import { CommandDeleteTable } from "../../commands/appCommands/CommandDeleteTable";
import { CommandModifyTable } from "../../commands/appCommands/CommandModifyTable";
import { Manager } from "../../Manager";
import { Table } from "../../model/Table"
import { TableRow } from "../../model/TableRow";
import { DrawScene } from "../../scenes/DrawScene";
import { TableScene } from "../../scenes/TableScene";



export default function table() {

    const tableBeingEdited = (Manager.getInstance().getScene() as TableScene).tableBeingEdited;

    const switchToDraw = () => {
        Manager.getInstance().changeScene(new DrawScene())
    }

    const rowData: {
        rowName: string, setRowName: React.Dispatch<React.SetStateAction<string>>,
        rowDatatype: string, setRowDatatype: React.Dispatch<React.SetStateAction<string>>,
        rowAttributes: string, setRowAttributes: React.Dispatch<React.SetStateAction<string>>
    }[] = [];
    const [trackedRowData, setTrackedRowData] = useState(rowData);
    for(const row of tableBeingEdited.tableRows) {
        const [rowName, setRowName] = useState(row.name);
        const [rowDatatype, setRowDatatype] = useState(row.datatype);
        const [rowAttributes, setRowAttributes] = useState(row.attributes.join(", "))
        rowData.push({
            rowName: rowName, setRowName: setRowName,
            rowDatatype: rowDatatype, setRowDatatype: setRowDatatype,
            rowAttributes: rowAttributes, setRowAttributes: setRowAttributes
        })
    }

    const [tableName, setTableName] = useState(tableBeingEdited.head);

    const saveChanges = () => {
        const draw = Manager.getInstance().draw;
        let oldTable = draw.schema.tables.find(x => x.equals(tableBeingEdited))!;
        const newTable = Table.initClone(tableBeingEdited);
        newTable.head = tableName;
        newTable.tableRows = trackedRowData.map(tableRow => TableRow.init(
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
    }

    const changeRowNameField = (event: ChangeEvent, index: number) => {
        rowData[index].setRowName((event.target as HTMLInputElement).value)
    }

    const changeRowDatatypeField = (event: ChangeEvent, index: number) => {
        rowData[index].setRowDatatype((event.target as HTMLInputElement).value)
    }

    const changeRowAttributesField = (event: ChangeEvent, index: number) => {
        rowData[index].setRowAttributes((event.target as HTMLInputElement).value)
    }

    const insertNewRow = (event: FormEvent<HTMLButtonElement>, index: number) => {
        if (index === -1) { index = trackedRowData.length}
        const [rowName, setRowName] = useState("");
        const [rowDatatype, setRowDatatype] = useState("");
        const [rowAttributes, setRowAttributes] = useState("");
        const newTrackedRows = [...trackedRowData].splice(index, 0, {
            rowName: rowName, setRowName: setRowName,
            rowDatatype: rowDatatype, setRowDatatype: setRowDatatype,
            rowAttributes: rowAttributes, setRowAttributes: setRowAttributes,
        });;
        setTrackedRowData(newTrackedRows)
        rowData[index].setRowAttributes((event.target as HTMLInputElement).value)
    }

    const moveRowUp = (index: number) => {
        if (index <= 0) return;
        [trackedRowData[index], trackedRowData[index - 1]] = [trackedRowData[index - 1], trackedRowData[index]];
    }

    const moveRowDown = (index: number) => {
        if (index >= trackedRowData.length - 1) return;
        [trackedRowData[index], trackedRowData[index + 1]] = [trackedRowData[index + 1], trackedRowData[index]];
    }

    const deleteRow = (index: number) => {
        setTrackedRowData([...trackedRowData].splice(index, 1));
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
    }


    return (
        <div className="table-edit-container">
            <div className="modal" tabIndex={-1}>
                <div className="modal-dialog modal-dialog-scrollable" style={{maxWidth: "80%"}}>
                    <div className="modal-header">
                        <p className="modal-title">
                            Table
                            <input className="input-tablename" onChange={(e) => setTableName(e.target.value)} type="text" value={ tableName } />
                        </p>
                        <button type="button" className="btn-close" onClick={() => switchToDraw() } data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <table>
                            <tr>
                                <th>Name</th>
                                <th style={{ width: "120px" }}>Datatype</th>
                                <th>Attributes</th>
                                <th>Actions</th>
                            </tr>
                            { 
                                trackedRowData.map((row, index) => (
                                    <tr key={index} data-index="{{ loop.index0 }}">
                                        <td>
                                            <input className="input-name" onChange={(e) => changeRowNameField(e, index)} type="text" value={ row.rowName } />
                                        </td>
                                        <td>
                                            <input className="input-datatype" onChange={(e) => changeRowDatatypeField(e, index) } list="mysql-data-types" style={{width: "120px" }} value={ row.rowDatatype } />
                                        </td>
                                        <td>
                                            <input className="input-attributes" onChange={(e) => changeRowAttributesField(e, index) } list="attribute-suggestions" type="text" value={ row.rowAttributes } />
                                        </td>
                                        <td>
                                            <button className="row-insert-btn btn btn-primary" onClick={(e) => insertNewRow(e, index) }>Insert</button>
                                            <button className="row-up-btn btn btn-primary" onClick={(e) => moveRowUp(index) }>Up</button>
                                            <button className="row-down-btn btn btn-primary" onClick={(e) => moveRowDown(index) }>Down</button>
                                            <button className="row-delete-btn btn btn-danger" onClick={(e) => deleteRow(index) }>Delete</button>
                                        </td>
                                    </tr>
                                ))
                            }
                            <tr data-index="{{ loop.index0 + 1 }}">
                                <td></td>
                                <td></td>
                                <td></td>
                                <td>
                                    <button className="row-insert-btn btn btn-primary" onClick={(e) => insertNewRow(e, -1) }>Insert</button>
                                </td>
                            </tr>
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
                        </table>
                    </div>
                    <div className="modal-footer" style={{justifyContent: "space-between" }}>
                        <button className="table-delete-btn btn btn-danger" onClick={() => deleteTable() }>Delete table</button>
                        <div>
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" id="modal-save-changes" onClick={() => saveChanges() } className="btn btn-primary">Save changes</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}