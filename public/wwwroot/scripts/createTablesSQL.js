let databaseName = `database_${dayjs().format('YYYYMMDDHHmm')}`;
RESULT_LOG.push(`CREATE SCHEMA IF NOT EXISTS ${databaseName};`)
for (let table of schema.tables) {
    let rows = [];
    for (let row of table.tableRows) {
        let optionalDataTypeParenthesis = row.targetDatatype.arguments.length === 0 ? "" : `(${row.targetDatatype.arguments.join(", ")})`
        rows.push(`${row.name} ${row.targetDatatype.name}${optionalDataTypeParenthesis} ${row.targetDatatype.isNullable ? "NULL" : "NOT NULL"}`);
    }
    for (let row of table.tableRows) {
        if (row.attributes.includes("PK")) {
            rows.push(`CONSTRAINT PK_${table.head}__${row.name} PRIMARY KEY (${row.name})`);
        }
    }
    for (let row of table.tableRows) {
        let matches = [...row.attributes.join('').matchAll(/FK\("(\w+)"\)/g)];
        if (matches.length !== 1 || matches[0].length !== 2) {
            continue;
        }
        let fkTableName = matches[0][1];
        let fkPkField = schema.tables.find(table => table.head === fkTableName).tableRows.find(row => row.attributes.includes('PK')).name;
        rows.push(`CONSTRAINT FK_${table.head}__${row.name}__${fkTableName}__${fkPkField} FOREIGN KEY (${row.name}) REFERENCES ${fkTableName}(${fkPkField})`);
    }
    RESULT_LOG.push(
`CREATE TABLE IF NOT EXISTS ${databaseName}.${table.head} (
    ${rows.map((row) => { return row }).join(",\n    ")}
)
ENGINE = InnoDB
DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_bin;
`
    );
}