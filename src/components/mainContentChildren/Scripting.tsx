import { LocalStorageData, Script } from "../../model/LocalStorageData";
import * as Monaco from 'monaco-editor';
import ModalScriptListItem, { ModalScriptListItemProps } from "./scriptingChildren/ModalScriptListItem";
import { SetStateAction, useCallback, useEffect, useReducer, useRef, useState } from "react";
import ModalScriptExecute, { ModalScriptExecuteProps } from "./scriptingChildren/ModalScriptExecute";
import ModalJsonDisplay, { ModelJsonDisplayProps } from "./scriptingChildren/ModalJsonDisplay";
import ModalSaveScript, { ModalSaveScriptProps } from "./scriptingChildren/ModalSaveScript";
import Editor from '@monaco-editor/react';
import Giscus from '@giscus/react';
import EnvGlobals from "../../../EnvGlobals";
import TopToolbarAction from "../TopToolbarAction";
import { AppState } from "../MainContent";
import { Draw } from "../../model/Draw";
import dayjs from "dayjs";
import { SchemaDTO } from "../../model/dto/SchemaDTO";
import { ScriptingSchema } from "../../model/scriptingDto/ScriptingSchema";


type ScriptingProps = {
    draw: Draw
}

export default function Scripting({ draw } : ScriptingProps) {
    console.log("scripting")

    let [builtinScripts, setBuiltinScripts] = useState<Script[]>([]);
    let [areScriptsLoaded, setAreScriptsLoaded] = useState(false);
    const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor>(null);

    function handleEditorDidMount(editor: Monaco.editor.IStandaloneCodeEditor, monaco: any) {
        console.log("handleEditorDidMount")
        // @ts-ignore
        editorRef.current = editor;
    }

    useEffect(() => {
        const getScripts = async () => {
            const fetchedScripts = [
                new Script(
                    "List tables",
                    await fetch(EnvGlobals.BASE_URL + '/wwwroot/scripts/listAllTables.js', { cache: "no-cache" }).then(x => x.text()),
                    ["builtin"]
                ),
                new Script(
                    "List tables and rows",
                    await fetch(EnvGlobals.BASE_URL + '/wwwroot/scripts/listAllTableRows.js', { cache: "no-cache" }).then(x => x.text()),
                    ['builtin', 'CSV']
                ),
                new Script(
                    "SQL CREATE",
                    await fetch(EnvGlobals.BASE_URL + '/wwwroot/scripts/createTablesSQL.js', { cache: "no-cache" }).then(x => x.text()),
                    ["builtin", "SQL"]
                )
            ];
            setBuiltinScripts(fetchedScripts);
            setAreScriptsLoaded(true);
        }
        getScripts();
    }, []);

    const [localStorageScripts, setLocalStorageScripts] = useState(LocalStorageData.getStorage().scripts);
    const scripts = localStorageScripts.concat(builtinScripts)

    const [isScriptListItemModalVisible, setIsScriptListItemModalVisible] = useState(false);
    const [mainModalProps, setMainModalProps] = useState<ModalScriptListItemProps | null>(null);

    const [isExecuteModalVisible, setIsExecuteModalVisible] = useState(false);
    const [executeModalProps, setExecuteModalProps] = useState<ModalScriptExecuteProps | null>(null);

    const [isJsonDisplayModalVisible, setIsJsonDisplayModalVisible] = useState(false);
    // const [jsonDisplayModelProps, setJsonDisplayModelProps] = useState<JsonDisplayModelProps | null>(null);

    const [isSaveScriptModalVisible, setIsSaveScriptModalVisible] = useState(false);
    const [saveScriptModalProps, setSaveScriptModalProps] = useState<ModalSaveScriptProps | null>(null);


    const addScriptFromLocalStorage = (script: Script) => {
        LocalStorageData.getStorage().addScript(script)
        setLocalStorageScripts([...LocalStorageData.getStorage().scripts])
    }

    const removeScriptFromLocalStorage = useCallback((script: Script) => {
        LocalStorageData.getStorage().removeScript(script)
        setLocalStorageScripts([...LocalStorageData.getStorage().scripts])
    }, [])

    const executeWithLogAsync = async (value: string, draw: Draw) => {
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

    const executeAndReturn = async (value: string, draw: Draw) => {
        let SHARED = await fetch(EnvGlobals.BASE_URL + '/wwwroot/scripts/SHARED.js',  {cache: "no-cache"}).then(x => x.text());
        let fnBody = `"use strict";\n${SHARED}\n${value}`;
        let fn = Function("schema", fnBody);
        let schemaDTO = ScriptingSchema.init(SchemaDTO.init(draw));
        return fn(schemaDTO);
    }


    const switchToExecuteModel = useCallback((executeModelProps: ModalScriptExecuteProps) => {
        setIsScriptListItemModalVisible(false);
        setExecuteModalProps(executeModelProps);
        setIsExecuteModalVisible(true);
    }, [])

    const onClickScriptListItem = async (script: Script) => {
        // highlighting replaces regular space with nbsp;
        let html = (await Monaco.editor.colorize(script.content, "javascript", {})).replaceAll("\u00a0", " ");
        setMainModalProps({
            script,
            highlightedContent: html,
            setExecuteModalState: setIsExecuteModalVisible,
            setScriptModalState: setIsScriptListItemModalVisible,
            switchToExecuteModel,
            setEditorValue,
            removeScriptFromLocalStorage,
            executeWithLogAsync,
            draw
        });
        setIsScriptListItemModalVisible(true);
    }

    const setEditorValue = useCallback((content: string) => {
        editorRef.current?.setValue(content);
    }, [])

    const displaySaveModal = () => {
        setSaveScriptModalProps({
            setModalSaveScriptState: setIsSaveScriptModalVisible,
            editorValue: editorRef.current!.getValue(),
            addLocalStorageData: addScriptFromLocalStorage
        })
        setIsSaveScriptModalVisible(true);
    }

    const executeEditorCodeAsync = async () => {
        const result = await executeWithLogAsync(
            editorRef.current!.getValue(),
            draw
        );
        setExecuteModalProps({
            isSuccess: result.error === "",
            content: result.error === "" ? result.resultLog.join("\n") : result.error,
            setModalState: setIsExecuteModalVisible
        });
        setIsExecuteModalVisible(true);
    }

    return (
        <>
            <div className="bg-grey">
                <div className="scripting-container">
                    <div>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <div className="mt-4" style={{ width: "90%" }}>
                                <div className="h4">Scripts</div>
                                <ul className="list-group" style={{ maxHeight: "calc(41px * 6)", overflowY: "scroll" }}>
                                    {
                                        areScriptsLoaded ?
                                            scripts.map((script, i) => (
                                                <li key={i} onClick={() => onClickScriptListItem(script)} className="script-modal list-group-item d-flex justify-content-between">
                                                    <span>{script.name}</span>
                                                    <div>
                                                        {
                                                            script.tags.map((tag, j) => (
                                                                <span key={j} className="badge bg-info rounded-pill">{tag}</span>
                                                            ))
                                                        }
                                                    </div>
                                                </li>
                                            ))
                                            : (() => {
                                                const placeholderElements = [];
                                                for (let i = 0; i < 6; i++) {
                                                    placeholderElements.push(
                                                        <li key={i} className="script-modal list-group-item d-flex justify-content-between">
                                                            <span>Loading ...</span>
                                                            <div></div>
                                                        </li>
                                                    );
                                                }
                                                return placeholderElements;
                                            })()
                                    }
                                </ul>
                            </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <div className="mt-4" style={{ width: "90%" }}>
                                <div className="h4">Editor</div>
                                <div>
                                    <button type="button" onClick={() => displaySaveModal()} className="save-btn btn btn-light">Save</button>
                                    <button type="button" onClick={() => executeEditorCodeAsync()} className="execute-btn btn btn-light">Execute</button>
                                    <button type="button" onClick={() => setIsJsonDisplayModalVisible(true)} className="show-json btn btn-light">Show JSON</button>
                                </div>

                                <div>
                                    <Editor
                                        height={"400px"}
                                        defaultLanguage="javascript"
                                        defaultValue=""
                                        onMount={handleEditorDidMount}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="comment-container">
                    <div className="giscus" style={{ padding: "1em 0", display: "flex", justifyContent: "center" }}>
                        <div style={{ width: "90%" }}>
                            <Giscus
                                repo="oskar-anderson/RasterModeler"
                                repoId="R_kgDOISKZkQ="
                                categoryId="DIC_kwDOISKZkc4CTY-q"
                                mapping="specific"
                                term="Comments - Scripting"
                                strict="0"
                                reactionsEnabled="0"
                                emitMetadata="0"
                                inputPosition="top"
                                theme="preferred_color_scheme"
                                lang="en"
                            />
                        </div>
                    </div>
                </div>
                {isScriptListItemModalVisible && 
                    <ModalScriptListItem
                        script={mainModalProps!.script}
                        highlightedContent={mainModalProps!.highlightedContent}
                        switchToExecuteModel={switchToExecuteModel}
                        setScriptModalState={setIsScriptListItemModalVisible}
                        setExecuteModalState={setIsExecuteModalVisible}
                        setEditorValue={setEditorValue}
                        removeScriptFromLocalStorage={removeScriptFromLocalStorage}
                        executeWithLogAsync={executeWithLogAsync}
                        draw={draw}
                    ></ModalScriptListItem>
                }
                {isExecuteModalVisible && 
                    <ModalScriptExecute
                        isSuccess={executeModalProps!.isSuccess}
                        content={executeModalProps!.content}
                        setModalState={executeModalProps!.setModalState}
                    />
                }
                {isJsonDisplayModalVisible && 
                    <ModalJsonDisplay
                        setJsonDisplayModelState={setIsJsonDisplayModalVisible}
                        draw={draw}
                    />
                }
                {isSaveScriptModalVisible && 
                    <ModalSaveScript
                        {...saveScriptModalProps!}
                    />
                }
            </div>
        </>
    );
}