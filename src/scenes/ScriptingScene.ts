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
        try {
            let fn = Function("RESULT_LOG", "schema", "dayjs", "PIXI", fnBody);
            fn(resultLog, schemaDTO, dayjs, PIXI);
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
        let schemaDTO = SchemaDTO.init(draw);
        let fn = Function("schema", fnBody);
        return fn(schemaDTO);
    }
}