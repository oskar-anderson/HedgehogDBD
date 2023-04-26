RESULT_LOG.push('Table;Name;Datatype;Nullability');
for (let table of schema.tables) {
    for (let row of table.tableRows) {
        let isNullable = row.datatype.slice(-1) === "?";
        let datatype = isNullable ? row.datatype.slice(0, -1) : row.datatype;
        RESULT_LOG.push(`${table.head};${row.name};${datatype};${isNullable ? "NULL" : "NOT NULL"}`);
    }
}