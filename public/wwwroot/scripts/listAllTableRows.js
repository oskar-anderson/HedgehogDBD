RESULT_LOG.push('Table;Name;Datatype;Nullability');
for (let table of schema.tables) {
    for (let row of table.tableRows) {
        let optionalDataTypeParenthesis = row.datatype.arguments.lenght === 0 ? "" : `(${row.datatype.arguments.join(", ")})`
        RESULT_LOG.push(`${table.head};${row.name};${row.datatype.name}${optionalDataTypeParenthesis};${row.datatype.isNullable ? "NULL" : "NOT NULL"}`);
    }
}