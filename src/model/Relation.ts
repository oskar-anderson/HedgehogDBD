import { Tab } from "bootstrap";
import Table from "./Table";
import TableRow from "./TableRow";


export default class Relation {

    constructor(
        public target: Table,
        public targetRow: TableRow,
        public source: Table,
        public sourceRow: TableRow
    ) {
         
    }
}