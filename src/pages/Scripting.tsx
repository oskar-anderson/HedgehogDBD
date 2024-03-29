import * as Monaco from 'monaco-editor';
import Layout from "../components/Layout";
import Script from '../model/Script';
import { useState, useRef, useEffect, useCallback } from 'react';
import ModalScriptListItem, { ModalScriptListItemProps } from "../components/scriptingChildren/ModalScriptListItem" 
import DomainDraw from '../model/domain/DomainDraw';
import dayjs from 'dayjs';
import { useApplicationState } from '../Store';
import ModalScriptExecute, { ModalScriptExecuteProps } from '../components/scriptingChildren/ModalScriptExecute';
import ModalSaveScript, { ModalSaveScriptProps } from '../components/scriptingChildren/ModalSaveScript';
import ScriptingDraw from "../model/dto/scripting/ScriptingDraw"
import Giscus from '@giscus/react';
import { Editor } from '@monaco-editor/react';
import ModalJsonDisplay from '../components/scriptingChildren/ModalJsonDisplay';


export async function executeWithLog(value: string, draw: DomainDraw) {
    let resultLog: string[] = [];
    let errorMsg = "";
    let fnBody = `"use strict";\n${value}`;
    let scriptingDraw = ScriptingDraw.init(draw);
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncFunction
    // https://stackoverflow.com/questions/46118496/asyncfunction-is-not-defined-yet-mdn-documents-its-usage
    const AsyncFunction = async function () {}.constructor;
    let fn = AsyncFunction("RESULT_LOG", "schema", "dayjs", fnBody);
    try {
        await fn(resultLog, scriptingDraw, dayjs);
    } catch (error: any) {
        errorMsg = `${error.name}: ${error.message}`;
    }
    return {
        error: errorMsg,
        resultLog: resultLog
    }
}

export async function executeAndReturn(value: string, draw: DomainDraw) {
    let fnBody = `"use strict";\n${value}`;
    let fn = Function("schema", fnBody);
    let scriptingDraw = ScriptingDraw.init(draw);
    return fn(scriptingDraw);
}


export default function Scripting() {
    const tables = useApplicationState(state => state.schemaTables);
    const activeDatabaseId = useApplicationState(state => state.activeDatabaseId);
    const localStorageScripts = useApplicationState(state => state.scripts);
    const setLocalScripts = useApplicationState(state => state.setScripts);
    let [builtinScripts, setBuiltinScripts] = useState<Script[]>([]);
    let [areScriptsLoaded, setAreScriptsLoaded] = useState(false);
    const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor>(null);
    const domainDraw = DomainDraw.init({
        tables, 
        activeDatabaseId
    });

    function handleEditorDidMount(editor: Monaco.editor.IStandaloneCodeEditor, monaco: any) {
        // @ts-ignore
        editorRef.current = editor;
    }

    useEffect(() => {
        const getScripts = async () => {
            const fetchedScripts = [
                {
                    name: "List tables",
                    content: await fetch('/wwwroot/scripts/listAllTables.js', { cache: "no-cache" }).then(x => x.text()),
                    tags: ["builtin"]
                },
                {
                    name: "List tables and rows",
                    content: await fetch('/wwwroot/scripts/listAllTableRows.js', { cache: "no-cache" }).then(x => x.text()),
                    tags: ['builtin', 'CSV']
                },
                {
                    name: "SQL CREATE",
                    content: await fetch('/wwwroot/scripts/createTablesSQL.js', { cache: "no-cache" }).then(x => x.text()),
                    tags: ["builtin", "SQL"]
                }
            ];
            setBuiltinScripts(fetchedScripts);
            setAreScriptsLoaded(true);
        }
        getScripts();
    }, []);

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
        setLocalScripts([...scripts, script])
    }

    const removeScriptFromLocalStorage = useCallback((script: Script) => {
        setLocalScripts([...scripts.filter(x => JSON.stringify(x) !== JSON.stringify(script))])
    }, [])


    const switchToExecuteModel = useCallback((executeModelProps: ModalScriptExecuteProps) => {
        setIsScriptListItemModalVisible(false);
        setExecuteModalProps(executeModelProps);
        setIsExecuteModalVisible(true);
    }, [])

    const onClickScriptListItem = async (script: Script) => {
        // highlighting replaces regular space with nbsp;
        let html = (await Monaco.editor.colorize(script.content, "javascript", {})).replaceAll("\u00a0", " ");
        setMainModalProps({
            script: script,
            highlightedContent: html,
            setExecuteModalState: setIsExecuteModalVisible,
            setScriptModalState: setIsScriptListItemModalVisible,
            switchToExecuteModel: switchToExecuteModel,
            setEditorValue: setEditorValue,
            removeScriptFromLocalStorage: removeScriptFromLocalStorage
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

    const executeEditorCode = async () => {
        const result = await executeWithLog(
            editorRef.current!.getValue(),
            domainDraw
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
            <Layout currentlyLoadedLink={"Scripting"}>
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
                                        <button type="button" onClick={() => displaySaveModal()} className="btn-create btn btn-light">Save</button>
                                        <button type="button" onClick={() => executeEditorCode()} className="execute-btn btn btn-light">Execute</button>
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
                                    repo="oskar-anderson/HedgehogDBD"
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
                        />
                    }
                    {isSaveScriptModalVisible && 
                        <ModalSaveScript
                            {...saveScriptModalProps!}
                        />
                    }
                </div>
            </Layout>
        </>
    );
}