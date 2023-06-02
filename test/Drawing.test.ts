
import { Point, Rectangle } from "pixi.js";
import { DrawScene } from "../src/scenes/DrawScene"
import EnvGlobals from "../EnvGlobals"
import {describe, expect, test} from '@jest/globals';
import { Table } from "../src/model/Table";
// This is some strange jest thing - https://stackoverflow.com/questions/48828759/unit-test-raises-error-because-of-getcontext-is-not-implemented
import 'jest-canvas-mock';


console.log("process.env.BASE_URL")
console.log(EnvGlobals.BASE_URL)


test("paintWorld9PatchSafe2 is functinal", () => {

    const table = new Rectangle(0, 0, 7, 3);
    const result = DrawScene.paintWorld9PatchSafe2(table)
    console.log(result.map(x => x.join("")).join("\n"))
    expect(result[0][0]).toBe("+");
    expect(result[0][1]).toBe("-");
    expect(result[0][2]).toBe("-");
    expect(result[0][3]).toBe("-");
    expect(result[0][4]).toBe("-");
    expect(result[0][5]).toBe("-");
    expect(result[0][6]).toBe("+");
    expect(result[1][0]).toBe("|");
    expect(result[1][1]).toBe(" ");
    expect(result[1][2]).toBe(" ");
    expect(result[1][3]).toBe(" ");
    expect(result[1][4]).toBe(" ");
    expect(result[1][5]).toBe(" ");
    expect(result[1][6]).toBe("|");
    expect(result[2][0]).toBe("+");
    expect(result[2][1]).toBe("-");
    expect(result[2][2]).toBe("-");
    expect(result[2][3]).toBe("-");
    expect(result[2][4]).toBe("-");
    expect(result[2][5]).toBe("-");
    expect(result[2][6]).toBe("+");
})

test("setWorldTable2 with table at (0,0)", () => {


    const result = DrawScene.setWorldTable2(new Table(new Point(0, 0), "product", [
        { name: "id", datatype: "uuid", attributes: ["PK"] },
        { name: "name", datatype: "VARCHAR", attributes: []},
        { name: "unit_price", datatype: "float", attributes: []},
        { name: "amount", datatype: "VARCHAR", attributes: [] },
        { name: "description", datatype: "VARCHAR", attributes: [] }
    ]));

    let string2D = result.map(x => x.join("")).join("\n");
    let stringRows = string2D.split("\n")
    expect(stringRows[0]).toBe("+----------------------------+")
    expect(stringRows[1]).toBe("| product                    |")
    expect(stringRows[2]).toBe("+-------------+---------+----+")
    expect(stringRows[3]).toBe("| id          | uuid    | PK |")
    expect(stringRows[4]).toBe("| name        | VARCHAR |    |")
    expect(stringRows[5]).toBe("| unit_price  | float   |    |")
    expect(stringRows[6]).toBe("| amount      | VARCHAR |    |")
    expect(stringRows[7]).toBe("| description | VARCHAR |    |")
    expect(stringRows[8]).toBe("+-------------+---------+----+")
    console.log(string2D)
})

test("setWorldTable2 with table offset at (5,5)", () => {


    const result = DrawScene.setWorldTable2(new Table(new Point(0, 0), "product", [
        { name: "id", datatype: "uuid", attributes: ["PK"] },
        { name: "name", datatype: "VARCHAR", attributes: []},
        { name: "unit_price", datatype: "float", attributes: []},
        { name: "amount", datatype: "VARCHAR", attributes: [] },
        { name: "description", datatype: "VARCHAR", attributes: [] }
    ]));

    let string2D = result.map(x => x.join("")).join("\n");
    let stringRows = string2D.split("\n")
    expect(stringRows[0]).toBe("+----------------------------+")
    expect(stringRows[1]).toBe("| product                    |")
    expect(stringRows[2]).toBe("+-------------+---------+----+")
    expect(stringRows[3]).toBe("| id          | uuid    | PK |")
    expect(stringRows[4]).toBe("| name        | VARCHAR |    |")
    expect(stringRows[5]).toBe("| unit_price  | float   |    |")
    expect(stringRows[6]).toBe("| amount      | VARCHAR |    |")
    expect(stringRows[7]).toBe("| description | VARCHAR |    |")
    expect(stringRows[8]).toBe("+-------------+---------+----+")
    console.log(string2D)
})