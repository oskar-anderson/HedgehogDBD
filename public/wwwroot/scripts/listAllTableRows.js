RESULT_LOG.push('Table;Name;Datatype;Nullability');
for (let table of schema.tables) {
    for (let row of table.tableRows) {
        let optionalDataTypeParenthesis = row.targetDatatype.arguments.length === 0 ? "" : `(${row.targetDatatype.arguments.join(", ")})`
        RESULT_LOG.push(`${table.head};${row.name};${row.targetDatatype.name}${optionalDataTypeParenthesis};${row.targetDatatype.isNullable ? "NULL" : "NOT NULL"}`);
    }
}