import { DataBaseSelector } from "./DataBaseSelector";
import IDatabaseType from "./IDatabaseType";

export default interface Database {
    id: string,
    select: DataBaseSelector;
    types: IDatabaseType;
}