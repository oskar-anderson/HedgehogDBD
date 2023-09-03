import { Tab } from "bootstrap";
import Table from "./Table";


export default class Relation {

    constructor(
        public target: Table,
        public source: Table,
        public isDirty: boolean,
    ) {
         
    }
}