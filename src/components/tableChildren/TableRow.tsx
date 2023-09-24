import { ChangeEvent, HTMLProps, useRef, useState } from "react"
import { useApplicationState } from "../../Store"
import DataType from "../../model/DataTypes/DataType"
import Databases from "../../model/DataTypes/Databases"
import { OverlayTrigger, Popover } from "react-bootstrap"
import AttributeSelect from './AttributeSelect';


interface UiTableRowDatatype {
    id: string,
    arguments: {
        value: {
            isIncluded: boolean,
            realValue: string,
        },
        argumentId: string
    }[],
    isNullable: boolean
}

export interface TableRowProps extends HTMLProps<HTMLTableRowElement> {
    index: number,
    hoverInsertIndicator: React.RefObject<HTMLDivElement>,
    dragItem: React.MutableRefObject<number | null>,
    dragOverItem: React.MutableRefObject<number | null>,
    row: {
        rowName: string
        rowDatatype: UiTableRowDatatype
        rowAttributes: string
    },
    tableRows: {  // I think this cannot be named rows because of a collision with some attribute of type number named rows or _rows
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
    deleteRow: (index: number) => void
}

export default function TableRow({ index, hoverInsertIndicator, dragItem, dragOverItem, row, setRows, tableRows, deleteRow}: TableRowProps) {
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
                value: x.value.realValue
            }
        })
    );

    const activeDatabaseId = useApplicationState(state => state.activeDatabaseId);

    const handleArgumentInputChange = (e: ChangeEvent, argumentId: string) => {
        const newValue = (e.target! as HTMLInputElement).value;
        const newArguments = [...datatypeArguments];
        const isContainingOnlyDigits = (value: string) => /^[0-9]+$/.test(value);
        if (!isContainingOnlyDigits(newValue) && newValue !== "") { return };
        newArguments.find(arg => arg.id === argumentId)!.value = newValue;
        setDatatypeArguments(newArguments);
        tableRows[index].rowDatatype.arguments = newArguments.map(x => {
            return {
                value: {
                    isIncluded: x.isIncluded,
                    realValue: newValue === "" ? "0" : newValue,
                },
                argumentId: x.id
            }
        });
        setRows([...tableRows]);
    }


    const handleSelectInputOnChange = (e: ChangeEvent) => {
        const selectedDatatypeId = (e.target as HTMLSelectElement).value;
        const args = DataType.getArgumentsByDatabaseAndByType(
            Databases.get(activeDatabaseId).select,
            selectedDatatypeId
        )

        const dataTypeArguements = args.map(x => ({
            displayName: x.displayName,
            isReadonly: x.isReadonly,
            isIncluded: true,
            id: x.id,
            typeId: x.typeId,
            value: String(x.defaultValue),
        }))
        setDatatypeArguments(dataTypeArguements);
        const rowCopy = tableRows[index];
        rowCopy.rowDatatype = {
            id: selectedDatatypeId,
            arguments: args.map(x => {
                return {
                    value: {
                        isIncluded: x.isIncluded,
                        realValue: String(x.defaultValue),
                    },
                    argumentId: x.id
                }
            }),
            isNullable: rowCopy.rowDatatype.isNullable
        };
        setRows([...tableRows]);
    }


    const handleArgumentWillNotBeProvidedCheckbox = (isChecked: boolean) => {
        const newArgs = [...datatypeArguments];
        // every field has to be included or excluded as to not mess up the argument order
        newArgs.forEach(x => x.isIncluded = isChecked);
        setDatatypeArguments(newArgs);
        tableRows[index].rowDatatype.arguments.map(x => x.value.isIncluded = isChecked);
        setRows([...tableRows]);
    }

    const handleAttributeChange = (newValue: string) => {
        tableRows[index].rowAttributes = newValue;
        setRows([...tableRows]);
    }


    const popover = (
        <Popover style={{ padding: "12px" }}>
            <input id="inputIncludeCustomArguments" style={{ marginRight: "6px" }} type="checkbox"
                onChange={(e) => { handleArgumentWillNotBeProvidedCheckbox((e.target as HTMLInputElement).checked) }}
                defaultChecked={datatypeArguments.length === 0 ? true : datatypeArguments.every(x => x.isIncluded)}
            />
            <label htmlFor="inputIncludeCustomArguments">Include optional arguments</label>
            {datatypeArguments.map((argument) => {
                return (
                    <div key={argument.id} style={{ display: "flex", alignItems: "center", marginTop: "0.5em" }}>
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
        </Popover>
    )

    const tableRowRef = useRef<HTMLTableRowElement>(null);


    return (
        <tr ref={tableRowRef}
            onMouseMove={(e) => {
                if (dragItem.current === null) { return; }
                const tableRowRect = tableRowRef.current!.getBoundingClientRect();
                const rectContains = (x: number, y: number, width: number, height: number, pointX: number, pointY: number) => {
                    return (x <= pointX)
                        && (pointX < x + width)
                        && (y <= pointY)
                        && (pointY < y + height)
                }
                let extraHeightForBottomIndicator = 0;
                if (dragItem.current > index) { // dragging up
                    if (rectContains(
                        tableRowRect.x,
                        tableRowRect.y,
                        tableRowRect.width,
                        tableRowRect.height / 2,
                        e.clientX, e.clientY
                    )) {
                        dragOverItem.current = index;
                    } else {
                        dragOverItem.current = index + 1;
                        extraHeightForBottomIndicator = tableRowRect.height;
                    }
                } else if (dragItem.current === index) {
                    hoverInsertIndicator.current!.style.display = "none";
                    return;
                } else { // dragging down
                    if (rectContains(
                        tableRowRect.x,
                        tableRowRect.y + tableRowRect.height / 2,
                        tableRowRect.width,
                        tableRowRect.height / 2,
                        e.clientX, e.clientY)
                    ) {
                        dragOverItem.current = index;
                        extraHeightForBottomIndicator = tableRowRect.height;
                    } else {
                        dragOverItem.current = index - 1;
                    }
                }

                hoverInsertIndicator.current!.style.display = "flex";
                hoverInsertIndicator.current!.style.width = `${tableRowRef.current!.offsetWidth}px`;
                hoverInsertIndicator.current!.style.top = `${tableRowRect.top + extraHeightForBottomIndicator - hoverInsertIndicator.current!.clientHeight / 2}px`;
                hoverInsertIndicator.current!.style.left = `${tableRowRect.left + (tableRowRect.width / 2) - hoverInsertIndicator.current!.clientWidth / 2}px`;
            }}
        >
            <td>
                <button
                    className="btn btn-light btn-icon"
                    onMouseDown={(e) => { dragItem.current = index; }}
                >
                    <svg style={{ userSelect: "none" }} stroke="#000000" data-bs-toggle="tooltip" data-bs-placement="bottom" width={28} height={28} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 18C14 18.5523 14.4477 19 15 19C15.5523 19 16 18.5523 16 18C16 17.4477 15.5523 17 15 17C14.4477 17 14 17.4477 14 18Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 18C8 18.5523 8.44772 19 9 19C9.55228 19 10 18.5523 10 18C10 17.4477 9.55228 17 9 17C8.44772 17 8 17.4477 8 18Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 12C14 12.5523 14.4477 13 15 13C15.5523 13 16 12.5523 16 12C16 11.4477 15.5523 11 15 11C14.4477 11 14 11.4477 14 12Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 12C8 12.5523 8.44772 13 9 13C9.55228 13 10 12.5523 10 12C10 11.4477 9.55228 11 9 11C8.44772 11 8 11.4477 8 12Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 6C14 6.55228 14.4477 7 15 7C15.5523 7 16 6.55228 16 6C16 5.44772 15.5523 5 15 5C14.4477 5 14 5.44772 14 6Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 6C8 6.55228 8.44772 7 9 7C9.55228 7 10 6.55228 10 6C10 5.44772 9.55228 5 9 5C8.44772 5 8 5.44772 8 6Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
            </td>
            <td>
                <input className="form-control" style={{ display: "inline" }} onChange={(e) => {
                    const rowsCopy = [...tableRows];
                    rowsCopy[index].rowName = (e.target as HTMLInputElement).value
                    setRows(rowsCopy);
                }} type="text" value={row.rowName} />
            </td>
            <td style={{ width: "math(220px + 320px)"}}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <select style={{ width: "180px", textOverflow: "ellipsis" }}
                        className={"form-select" + ` ${row.rowDatatype.id}`}
                        name="input-datatype"
                        onChange={handleSelectInputOnChange}
                        value={row.rowDatatype.id }
                    >
                        {DataType.getTypes().map(x => {
                            let selectedOptionDisplayParameters = "";
                            if (x.getId() === row.rowDatatype.id) {
                                const selectedDataTypeArguments = datatypeArguments.filter(x => x.isIncluded);
                                selectedOptionDisplayParameters = (selectedDataTypeArguments.length !== 0) ?
                                    `(${selectedDataTypeArguments.map(x => x.value === "" ? "0" : x.value).join(", ")})` :
                                    "";
                            } else {
                                const notSelectedDataTypeArguments = DataType.getArgumentsByDatabaseAndByType(
                                    Databases.get(activeDatabaseId).select,
                                    x.getId());
                                selectedOptionDisplayParameters = (notSelectedDataTypeArguments.length !== 0) ?
                                    `(${notSelectedDataTypeArguments.map(x => x.defaultValue).join(", ")})` :
                                    "";
                            }

                            return (
                                <option key={x.getId()} value={x.getId()}>{x.getSelectListName() + selectedOptionDisplayParameters}</option>
                            )
                        })}
                    </select>
                    <button className="btn btn-light btn-icon"
                        onClick={() => {
                            const rowsCopy = [...tableRows];
                            rowsCopy[index].rowDatatype.isNullable = ! row.rowDatatype.isNullable;
                            setRows(rowsCopy);
                        }}>
                        {row.rowDatatype.isNullable ? "?" : "!"}
                    </button>
                    <OverlayTrigger trigger="click" placement="right" overlay={popover} rootClose={true}>
                        <button className={`btn btn-light btn-icon ${datatypeArguments.length === 0 ? "disabled" : ""}`} disabled={datatypeArguments.length === 0}>
                            <svg width="28px" height="28px" viewBox="0 0 24 24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17 12C17 12.5523 17.4477 13 18 13C18.5523 13 19 12.5523 19 12C19 11.4477 18.5523 11 18 11C17.4477 11 17 11.4477 17 12Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M11 12C11 12.5523 11.4477 13 12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M5 12C5 12.5523 5.44772 13 6 13C6.55228 13 7 12.5523 7 12C7 11.4477 6.55228 11 6 11C5.44772 11 5 11.4477 5 12Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </OverlayTrigger>
                </div>
            </td>
            <td>
                <AttributeSelect />
                <input className="form-control" style={{ display: "inline" }} list="attribute-suggestions" type="text" value={row.rowAttributes}
                    onChange={(e) => handleAttributeChange((e.target as HTMLInputElement).value) }
                />
            </td>
            <td>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    <button className="row-delete-btn btn btn-danger" onClick={(e) => deleteRow(index)}>Delete</button>
                </div>
            </td>
        </tr>
    );
}