import { ChangeEvent, FormEvent, HTMLProps, useState } from "react"
import DataType, { IDataTypeArgument } from "../../../model/DataTypes/DataType"
import { Manager } from "../../../Manager";
import { IDataType } from "../../../model/DataTypes/IDataType";

interface UiTableRowDatatype {
    id: string,
    arguments: {
        value: {
            isIncluded: boolean,
            realValue: number,
        },
        argumentId: string
    }[],
    isNullable: boolean
}

export interface TableRowProps extends HTMLProps<HTMLTableRowElement> {
    index: number,
    row: {
        rowName: string
        rowDatatype: UiTableRowDatatype
        rowAttributes: string
    },
    rows: {
        key: string; // this is only needed in the parent component to manage state on new row insertion
        rowName: string;
        rowDatatype: UiTableRowDatatype;
        rowAttributes: string;
    }[],
    setRows: React.Dispatch<React.SetStateAction<{
        key: string;
        rowName: string;
        rowDatatype: UiTableRowDatatype;
        rowAttributes: string;
    }[]>>,
    insertNewRow: (event: FormEvent<HTMLButtonElement>, index: number) => void,
    deleteRow: (index: number) => void
}


export default function TableRow({ index, row, setRows, rows, insertNewRow, deleteRow, ...restProps}: TableRowProps) {
    const [datatypeArguments, setDatatypeArguments] = useState<{
        value: string;
        displayName: string;
        id: string;
        isReadonly: boolean;
        isIncluded: boolean;
        typeId: string;
    }[]>(row.rowDatatype.arguments
        .map(x => {
            const argument = DataType.getArgumentById(x.argumentId);
            return {
                displayName: argument.displayName,
                isReadonly: argument.isReadonly,
                isIncluded: x.value.isIncluded,
                id: argument.id,
                typeId: argument.typeId,
                value: String(x.value.realValue)
            }
        })
    );
    const [mandatoryFieldBtnText, setMandatoryFieldBtnText] = useState(row.rowDatatype.isNullable ? "?" : "!");
    const handleArgumentInputChange = (e: ChangeEvent, argumentId: string) => {
        const newValue = (e.target! as HTMLInputElement).value;
        const newArguments = [...datatypeArguments];
        const argumentToUpdate = newArguments.find(arg => arg.id === argumentId)!;
        const isContainingOnlyDigits = (value: string) => /^[0-9]+$/.test(value);
        if (!isContainingOnlyDigits(newValue)) { return };
        const newDataTypeArgumentValueNumber = Number.parseInt(newValue);
        argumentToUpdate.value = String(newDataTypeArgumentValueNumber)
        setDatatypeArguments(newArguments);
        const rowsCopy = [...rows];
        rowsCopy[index].rowDatatype.arguments = newArguments.map(x => {
            return {
                value: {
                    isIncluded: x.isIncluded,
                    realValue: newDataTypeArgumentValueNumber,
                },
                argumentId: x.id
            }
        });
        setRows(rowsCopy);
    }

    const handleSelectInputOnChange = (e: ChangeEvent) => {
        const selectedDatatypeId = (e.target as HTMLSelectElement).value;
        const draw = Manager.getInstance().draw;
        const args = DataType.getArgumentsByDatabaseAndByType(draw.activeDatabase.select, selectedDatatypeId)
        
        const dataTypeArguements = args.map(x => ({
            displayName: x.displayName,
            isReadonly: x.isReadonly,
            isIncluded: true,
            id: x.id,
            typeId: x.typeId,
            value: String(x.defaultValue),
        }))
        setDatatypeArguments(dataTypeArguements);
        const rowsCopy = [...rows];
        const activeDatabase = Manager.getInstance().draw.activeDatabase;
        const newArguments = DataType.getArgumentsByDatabaseAndByType(activeDatabase.select, selectedDatatypeId);
        rowsCopy[index].rowDatatype = {
            id: selectedDatatypeId,
            arguments: newArguments.map(x => {
                return {
                    value: {
                        isIncluded: x.isIncluded,
                        realValue: x.defaultValue,
                    },
                    argumentId: x.id
                }
            }),
            isNullable: false
        };
        setRows(rowsCopy);
    }

    const handleArgumentWillNotBeProvidedCheckbox = (isChecked: boolean, argumentIndex: number) => {
        const newArgs = [...datatypeArguments];
        // every field has to be included or excluded as to not mess up the argument order
        newArgs.map(x => x.isIncluded = isChecked);
        setDatatypeArguments(newArgs);
        const rowsCopy = [...rows];
        rowsCopy[index].rowDatatype.arguments.map(x => x.value.isIncluded = isChecked);
        setRows(rowsCopy);
    }

    const handleAttributeChange = (newValue: string) => {
        const rowsCopy = [...rows];
        rowsCopy[index].rowAttributes = newValue;
        setRows(rowsCopy);
    }

    return (
        <tr {...restProps}>
            <td>
                <input className="form-control" style={{ display: "inline" }} onChange={(e) => {
                    const rowsCopy = [...rows];
                    rowsCopy[index].rowName = (e.target as HTMLInputElement).value
                    setRows(rowsCopy);
                }} type="text" value={row.rowName} />
            </td>
            <td>
                <div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <select style={{ width: "120px", textOverflow: "ellipsis" }}
                            className={"form-select" + ` ${row.rowDatatype.id}`}
                            name="input-datatype"
                            onChange={handleSelectInputOnChange}
                            value={row.rowDatatype.id }
                        >
                            {DataType.getTypes().map(x => {
                                return (
                                    <option key={x.getId()} value={x.getId()}>{x.getSelectListName()}</option>
                                )
                            })}
                        </select>
                        <button style={{ height: "38px", width: "38px", border: "1px solid #ced4da" }} className="btn btn-light"
                            onClick={() => {
                                const wasNullable = mandatoryFieldBtnText !== "!"
                                setMandatoryFieldBtnText(wasNullable ? "!" : "?")
                                const rowsCopy = [...rows];
                                rowsCopy[index].rowDatatype.isNullable = ! wasNullable;
                                setRows(rowsCopy);
                            }}>
                            {mandatoryFieldBtnText}
                        </button>
                    </div>
                    {datatypeArguments.map((argument, index) => {
                        return (
                            <div key={argument.id} style={{ display: "flex", alignItems: "center", marginTop: "0.5em" }}>
                                <input style={{ marginRight: "6px" }} type="checkbox"
                                    onChange={(e) => { handleArgumentWillNotBeProvidedCheckbox((e.target as HTMLInputElement).checked, index) }}
                                    checked={argument.isIncluded}
                                    title={argument.isReadonly ? "Readonly" : undefined}
                                    disabled={argument.isReadonly}
                                />
                                <span style={{ paddingRight: "0.5em" }}>{argument.displayName}: </span>
                                <input style={{ width: "100%" }} type="text" className="form-control"
                                    onChange={(e) => handleArgumentInputChange(e, argument.id)}
                                    value={argument.isIncluded ? argument.value : "Omited"}
                                    title={argument.isReadonly ? "Readonly" : undefined}
                                    disabled={argument.isReadonly || !argument.isIncluded}
                                />
                            </div>
                        )
                    })}
                </div>
            </td>
            <td>
                <input className="form-control" style={{ display: "inline" }} list="attribute-suggestions" type="text" value={row.rowAttributes}
                    onChange={(e) => handleAttributeChange((e.target as HTMLInputElement).value) }
                />
            </td>
            <td>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    <button className="row-insert-btn btn btn-primary" onClick={(e) => insertNewRow(e, index)}>Insert</button>
                    <button className="row-delete-btn btn btn-danger" onClick={(e) => deleteRow(index)}>Delete</button>
                </div>
            </td>
        </tr>
    )
}