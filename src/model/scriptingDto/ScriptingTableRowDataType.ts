export class ScriptingTableRowDataType {
    name: string;
    arguments: number[];
    isNullable: boolean;

    constructor(
        name: string,
        _arguments: number[],
        nullable: boolean
    ) {
        this.name = name;
        this.arguments = _arguments;
        this.isNullable = nullable;
    }
}