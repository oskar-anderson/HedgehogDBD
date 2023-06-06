import { ChangeEvent, FormEvent, useState } from "react"
import DataType from "../../../model/DataTypes/DataType"
import TableRowDataTypeDTO from "../../../model/dto/TableRowDataTypeDTO";
import TableRowDataTypeArgumentsDTO from "../../../model/dto/TableRowDataTypeArgumentsDTO";
import { Manager } from "../../../Manager";

export interface TableRowProps {
    index: number,
    row: {
        rowName: string
        rowDatatype: TableRowDataTypeDTO
        rowAttributes: string
    },
    rows: {
        rowName: string;
        rowDatatype: TableRowDataTypeDTO;
        rowAttributes: string;
    }[],
    setRows: React.Dispatch<React.SetStateAction<{
        rowName: string;
        rowDatatype: TableRowDataTypeDTO;
        rowAttributes: string;
    }[]>>,
    insertNewRow: (event: FormEvent<HTMLButtonElement>, index: number) => void,
    moveRowUp: (index: number) => void,
    moveRowDown: (index: number) => void,
    deleteRow: (index: number) => void
}


export default function TableRow({ index, row, setRows, rows, insertNewRow, moveRowUp, moveRowDown, deleteRow }: TableRowProps) {

    const [datatypeArguments, setDatatypeArguments] = useState<{
        value: string;
        defaultValue: string;
        displayName: string;
        id: string;
        isRequired: boolean;
        type: string;
    }[]>(row.rowDatatype.arguments
        .map(x => ({
            displayName: x.argument.displayName,
            isRequired: x.argument.isRequired,
            id: x.argument.id,
            type: x.argument.type,
            value: String(x.value),
            defaultValue: String(x.argument.defaultValue)
        }))
    );
    const [mandatoryFieldBtnText, setMandatoryFieldBtnText] = useState('!');
    const handleArgumentInputChange = (e: ChangeEvent, argumentId: string) => {
        const newValue = (e.target! as HTMLInputElement).value;
        const newArguments = [...datatypeArguments];
        const argumentToUpdate = newArguments.find(arg => arg.id === argumentId)!;
        const isContainingOnlyDigits = (value: string) => /^[0-9]+$/.test(value);
        if (! isContainingOnlyDigits(newValue)) { return };
        const newDataTypeArgumentValueNumber = Number.parseInt(newValue);
        argumentToUpdate.value = String(newDataTypeArgumentValueNumber)
        setDatatypeArguments(newArguments);
        const rowsCopy = [...rows];
        rowsCopy[index].rowDatatype.arguments = newArguments.map(x =>
            new TableRowDataTypeArgumentsDTO(
                newDataTypeArgumentValueNumber,
                DataType.getType(x.type).getArgumentById(x.id)
            )
        );
        setRows(rowsCopy);
    }

    const handleSelectInputOnChange = (e: ChangeEvent) => {
        const selectedValue = (e.target as HTMLSelectElement).value;
        const draw = Manager.getInstance().draw;
        setDatatypeArguments(
            DataType.getTypes()
                .filter(x => x.getSelectListName() === selectedValue)
                .map(x => x.base_getDatabaseArgumentsSorted(draw.activeDatabase.selectedDatabase.select))
                .flat()
                .map(x => ({
                    displayName: x.displayName,
                    isRequired: x.isRequired,
                    id: x.id,
                    type: x.type,
                    value: String(x.defaultValue),
                    defaultValue: String(x.defaultValue)
                }))
        );
        const rowsCopy = [...rows];
        rowsCopy[index].rowDatatype.name = DataType.getType(selectedValue);
        setRows(rowsCopy);
    }

    return (
        <tr>
            <td>
                <input className="input-name" onChange={(e) => {
                    const rowsCopy = [...rows];
                    rowsCopy[index].rowName = (e.target as HTMLInputElement).value
                    setRows(rowsCopy);
                }} type="text" value={row.rowName} />
            </td>
            <td>
                <div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <select style={{ width: "120px", textOverflow: "ellipsis" }}
                            className="form-select"
                            name="input-datatype"
                            onChange={handleSelectInputOnChange}
                            defaultValue={row.rowDatatype.name.getSelectListName()}
                        >
                            {DataType.getTypes().map(x => {
                                return (
                                    <option key={x.getSelectListName()} value={x.getSelectListName()}>{x.getSelectListName()}</option>
                                )
                            })}
                        </select>
                        <button style={{ height: "38px", width: "38px" }} className="btn btn-light"
                            onClick={() => {
                                const isNullable = mandatoryFieldBtnText !== "!"
                                setMandatoryFieldBtnText(mandatoryFieldBtnText === "!" ? "?" : "!")
                                const rowsCopy = [...rows];
                                rowsCopy[index].rowDatatype.isNullable = isNullable;
                                setRows(rowsCopy);
                            }}>
                            {mandatoryFieldBtnText}
                        </button>
                    </div>
                    {datatypeArguments.map(argument => {
                        return (
                            <div key={argument.id} style={{ display: "flex", alignItems: "center", marginTop: "0.5em" }}>
                                <span style={{ paddingRight: "0.5em" }}>{argument.displayName}: </span>
                                <input style={{ width: "100%" }} type="text"
                                    onChange={(e) => handleArgumentInputChange(e, argument.id)}
                                    value={argument.value}
                                />
                            </div>
                        )
                    })}
                </div>
                {
                    /*
                        <Select 
                            options={DataType.getTypes().map(x => { 
                                return { 
                                    value: x.getSelectListName(), 
                                    label: x.getSelectListName() 
                                } 
                            } )}
                            name="input-datatype" 
                            onChange={(selectedValue) => { 
                                setDatatypeArguments(DataType.getTypes().filter(x => x.getSelectListName() === selectedValue!.label).map(x => x.getRequiredArguments(new DataType())).flat()); 
                            }}
                        />
                        <div>
                            {datatypeArguments.map(argument => { 
                                return (
                                    <>
                                        <label htmlFor={argument.displayName}>{argument.displayName}</label>
                                        <input id={argument.displayName} key={argument.displayName} style={{width: "120px" }} value={ argument.value } />    
                                    </>
                                )
                            })}
                        </div>
                    */
                }
            </td>
            <td>
                <input className="input-attributes" onChange={(e) => row.rowAttributes = (e.target as HTMLInputElement).value} list="attribute-suggestions" type="text" value={row.rowAttributes} />
            </td>
            <td>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    <button className="row-insert-btn btn btn-primary" onClick={(e) => insertNewRow(e, index)}>Insert</button>
                    <button className="row-up-btn btn btn-primary" disabled={index === 0} onClick={(e) => moveRowUp(index)}>Up</button>
                    <button className="row-down-btn btn btn-primary" disabled={index >= rows.length - 1} onClick={(e) => moveRowDown(index)}>Down</button>
                    <button className="row-delete-btn btn btn-danger" onClick={(e) => deleteRow(index)}>Delete</button>
                </div>
            </td>
        </tr>
    )
}