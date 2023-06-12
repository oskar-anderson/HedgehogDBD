import { BitmapText, Point } from "pixi.js";
import DataType from "../DataTypes/DataType";
import { Table } from "../Table";
import TableRowDataTypeArgumentsDTO from "./TableRowDataTypeArgumentsDTO";
import TableRowDataTypeDTO from "./TableRowDataTypeDTO";
import { TableRowDTO } from "./TableRowDTO";


export class TableDTO {
    id: string;
    position: Point;
    head: string;
    tableRows: TableRowDTO[];

    constructor(id: string, position: Point, head: string, tableRows: TableRowDTO[]) {
        this.id = id;
        this.position = position;
        this.head = head;
        this.tableRows = tableRows;
    }

    static initFromTable(table: Table) {
        return new TableDTO(
            table.id, 
            table.getPosition().clone(), 
            table.head, 
            table.tableRows.map(x => 
                new TableRowDTO(
                    x.name, 
                    new TableRowDataTypeDTO(
                        x.datatype.dataTypeId, 
                        x.datatype.arguments.map(y => {
                            return new TableRowDataTypeArgumentsDTO(
                                y.value,
                                y.argument.id
                            )
                        }),
                        x.datatype.isNullable
                    ), 
                    [...x.attributes]
                )
            )
        )
    }

    static parse(content: string) {
        return TableDTO.hydrate(JSON.parse(content) as TableDTO);
    }

    static hydrate(jsonObject: TableDTO) {
        return new TableDTO(
            jsonObject.id,
            new Point(jsonObject.position.x, jsonObject.position.y),
            jsonObject.head,
            jsonObject.tableRows.map(x => TableRowDTO.hydrate(x)),
        );
    }

    mapToTable() {
        return new Table(
            new Point(this.position.x, this.position.y),
            this.head,
            this.tableRows.map(x => x.mapToTableRow()),
            {
                id: this.id
            },
        );
    }
}