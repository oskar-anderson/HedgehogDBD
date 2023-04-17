export class TableRow {
    name: string;
    datatype: string;
    attributes: string[]

    //* This constuctor exists for cloning, you probably want to use TableRow.init() */
    private constructor(tableRow: { name: string, datatype: string, attributes: string[] }) {
        this.name = tableRow.name;
        this.datatype = tableRow.datatype;
        this.attributes = tableRow.attributes;
    }

    static init(name: string, datatype: string, attributes: string[]) {
        return new TableRow({
            name: name,
            datatype: datatype,
            attributes: [...attributes],
        });
    }

    static initClone(tableRow: TableRow): TableRow {
        let copy = new TableRow(
            {
                name: tableRow.name,
                datatype: tableRow.datatype,
                attributes: tableRow.attributes
            }
        );
        return copy;
    }
}