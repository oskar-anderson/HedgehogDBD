import Point from "../Point"
import VmTable from "../viewModel/VmTable"
import DomainTableRow from "./DomainTableRow";
import DomainTableRowDataTypeArguments from "./DomainTableRowDataTypeArguments";


export default class DomainTable {
    id: string;
    position: Point;
    head: string;
    tableRows: DomainTableRow[];

    constructor(id: string, position: Point, head: string, tableRows: DomainTableRow[]) {
        this.id = id;
        this.position = position;
        this.head = head;
        this.tableRows = tableRows;
    }

    static init(table: VmTable) {
        return new DomainTable(
            table.id, 
            { ...table.position }, 
            table.head, 
            table.tableRows.map(x => 
                new DomainTableRow(
                    x.name, 
                    x.datatype.dataTypeId, 
                    x.datatype.arguments.map(y => {
                        return new DomainTableRowDataTypeArguments(
                            y.value,
                            y.argument.id
                        )
                    }),
                    x.datatype.isNullable, 
                    [...x.attributes]
                )
            )
        )
    }

    static parse(content: string) {
        return DomainTable.hydrate(JSON.parse(content) as DomainTable);
    }

    static hydrate(jsonObject: DomainTable) {
        return new DomainTable(
            jsonObject.id,
            { ...jsonObject.position },
            jsonObject.head,
            jsonObject.tableRows.map(x => DomainTableRow.hydrate(x)),
        );
    }

    mapToVm() {
        return new VmTable(
            { ...this.position },
            this.head,
            this.tableRows.map(x => x.mapToVM()),
            {
                // @ts-ignore
                id: this.id
            },
        );
    }
}