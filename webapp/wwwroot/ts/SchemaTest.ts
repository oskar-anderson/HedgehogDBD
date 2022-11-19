import { Environment } from "./Environment";
import { Parser } from "./Parser";

export class SchemaTest {
    
    constructor() {

    }

    static async parseTest1() {
        let text2 = await(await fetch('./../wwwroot/data/SchemaTest1.txt')).text();
        // let text = await(await fetch(Environment.getOrigin() + '/wwwroot/data/SchemaTest1.txt')).text();
        return new Parser().parse(text2);
    }


    static main() {
        this.parseTest1();
    }
}