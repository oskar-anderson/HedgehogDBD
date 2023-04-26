import { ChangeEvent, FormEvent } from "react"

export interface TableRowProps {
    index: number,
    numberOfTableRows: number,
    row: {
        rowName: string
        rowDatatype: string
        rowAttributes: string
    },
    handleFormChange: (index: number, event: ChangeEvent, name: "rowName" | "rowDatatype" | "rowAttributes") => void
    insertNewRow: (event: FormEvent<HTMLButtonElement>, index: number) => void,
    moveRowUp: (index: number) => void,
    moveRowDown: (index: number) => void,
    deleteRow: (index: number) => void
}


export default function TableRow({index, numberOfTableRows, row, handleFormChange, insertNewRow, moveRowUp, moveRowDown, deleteRow} : TableRowProps) {

    return (
        <tr>
            <td>
                <input className="input-name" onChange={(e) => handleFormChange(index, e, "rowName")} type="text" value={ row.rowName } />
            </td>
            <td>
                <input className="input-datatype" onChange={(e) => handleFormChange(index, e, "rowDatatype") } list="mysql-data-types" style={{width: "120px" }} value={ row.rowDatatype } />
            </td>
            <td>
                <input className="input-attributes" onChange={(e) => handleFormChange(index, e, "rowAttributes") } list="attribute-suggestions" type="text" value={ row.rowAttributes } />
            </td>
            <td>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    <button className="row-insert-btn btn btn-primary" onClick={(e) => insertNewRow(e, index) }>Insert</button>
                    <button className="row-up-btn btn btn-primary" disabled={index === 0} onClick={(e) => moveRowUp(index) }>Up</button>
                    <button className="row-down-btn btn btn-primary" disabled={index >= numberOfTableRows - 1} onClick={(e) => moveRowDown(index) }>Down</button>
                    <button className="row-delete-btn btn btn-danger" onClick={(e) => deleteRow(index) }>Delete</button>
                </div>
            </td>
        </tr>
    )
}