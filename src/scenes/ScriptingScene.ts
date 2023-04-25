import { Container } from "pixi.js";
import * as PIXI from "pixi.js";
import { IScene } from "../Manager";
import { Draw } from "../model/Draw";
import dayjs from "dayjs";  // used in scripts
import { SchemaDTO } from "../model/SchemaDTO";
import { AppState } from "../components/MainContent";


export class ScriptingScene extends Container implements IScene {

    constructor() {
        super();
    }

    getState(): AppState {
        return AppState.ScriptingScene
    }

    static async executeWithLog(value: string, draw: Draw) {
        let resultLog: string[] = [];
        let errorMsg = "";
        let SHARED = await fetch('src/wwwroot/scripts/_SHARED.js', {cache: "no-cache"}).then(x => x.text());
        let fnBody = `"use strict";\n${SHARED}\n${value}`;
        let schemaDTO = SchemaDTO.init(draw);
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncFunction
        // https://stackoverflow.com/questions/46118496/asyncfunction-is-not-defined-yet-mdn-documents-its-usage
        const AsyncFunction = async function () {}.constructor;
        let fn = AsyncFunction("RESULT_LOG", "schema", "dayjs", "PIXI", fnBody);
        try {
            await fn(resultLog, schemaDTO, dayjs, PIXI);
        } catch (error: any) {
            errorMsg = `${error.name}: ${error.message}`;
        }
        return {
            error: errorMsg,
            resultLog: resultLog
        }
    }

    static async executeAndReturn(value: string, draw: Draw) {
        let SHARED = await fetch('src/wwwroot/scripts/_SHARED.js',  {cache: "no-cache"}).then(x => x.text());
        let fnBody = `"use strict";\n${SHARED}\n${value}`;
        let fn = Function("schema", fnBody);
        let schemaDTO = SchemaDTO.init(draw);
        return fn(schemaDTO);
    }
}