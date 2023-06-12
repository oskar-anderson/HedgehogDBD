import { IDataTypeArgument } from "./DataType";

export interface IDataType {
    getSelectListName(): string;
    getId(): string;
    getAllArguments(): IDataTypeArgument[];
}