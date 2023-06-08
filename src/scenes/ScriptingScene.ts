import { Container } from "pixi.js";
import { IScene } from "../Manager";
import { Draw } from "../model/Draw";
import dayjs from "dayjs";  // used in scripts
import { SchemaDTO } from "../model/dto/SchemaDTO";
import { AppState } from "../components/MainContent";
import EnvGlobals from "../../EnvGlobals";
import { ScriptingSchema } from "../model/scriptingDto/ScriptingSchema";


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
        let SHARED = await fetch(EnvGlobals.BASE_URL + '/wwwroot/scripts/SHARED.js', {cache: "no-cache"}).then(x => x.text());
        let fnBody = `"use strict";\n${SHARED}\n${value}`;
        let schemaDTO = ScriptingSchema.init(SchemaDTO.init(draw));
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncFunction
        // https://stackoverflow.com/questions/46118496/asyncfunction-is-not-defined-yet-mdn-documents-its-usage
        const AsyncFunction = async function () {}.constructor;
        let fn = AsyncFunction("RESULT_LOG", "schema", "dayjs", "BASE_URL", fnBody);
        try {
            await fn(resultLog, schemaDTO, dayjs, EnvGlobals.BASE_URL);
        } catch (error: any) {
            errorMsg = `${error.name}: ${error.message}`;
        }
        return {
            error: errorMsg,
            resultLog: resultLog
        }
    }

    static async executeAndReturn(value: string, draw: Draw) {
        let SHARED = await fetch(EnvGlobals.BASE_URL + '/wwwroot/scripts/SHARED.js',  {cache: "no-cache"}).then(x => x.text());
        let fnBody = `"use strict";\n${SHARED}\n${value}`;
        let fn = Function("schema", fnBody);
        let schemaDTO = ScriptingSchema.init(SchemaDTO.init(draw));
        return fn(schemaDTO);
    }
}