import { DataBaseSelector } from "./DataBaseSelector";
import IDatabaseType from "./IDatabaseType";

export default interface Database {
    select: DataBaseSelector;
    types: IDatabaseType;
}