import { Manager } from "../../Manager";
import { LocalStorageData, Script } from "../../model/LocalStorageData";
import * as Monaco from 'monaco-editor';
import { ScriptingScene } from "../../scenes/ScriptingScene";
import ModalScriptListItem, { ModalScriptListItemProps } from "./scriptingChildren/ModalScriptListItem";
import { SetStateAction, useCallback, useEffect, useReducer, useRef, useState } from "react";
import ModalScriptExecute, { ModalScriptExecuteProps } from "./scriptingChildren/ModalScriptExecute";
import ModalJsonDisplay, { ModelJsonDisplayProps } from "./scriptingChildren/ModalJsonDisplay";
import ModalSaveScript, { ModalSaveScriptProps } from "./scriptingChildren/ModalSaveScript";
import Editor from '@monaco-editor/react';
import Giscus from '@giscus/react';
import { AppState } from "../MainContent";
import { useAppStateManagement } from "../../Store";
import EnvGlobals from "../../../EnvGlobals";


export default function Scripting() {
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
        const result = await ScriptingScene.executeWithLog(
            editorRef.current!.getValue(),
            Manager.getInstance().draw
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
                <div className="giscus" style={{ margin: "1em 0", display: "flex", justifyContent: "center" }}>
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
            {isScriptListItemModalVisible && <div className="modal" tabIndex={-1} style={{ display: "block" }}>
                <div className="modal-dialog">
                    <ModalScriptListItem
                        script={mainModalProps!.script}
                        highlightedContent={mainModalProps!.highlightedContent}
                        switchToExecuteModel={switchToExecuteModel}
                        setScriptModalState={setIsScriptListItemModalVisible}
                        setExecuteModalState={setIsExecuteModalVisible}
                        setEditorValue={setEditorValue}
                        removeScriptFromLocalStorage={removeScriptFromLocalStorage}
                    ></ModalScriptListItem>
                </div>
            </div>}
            {isExecuteModalVisible && <div className="modal" tabIndex={-1} style={{ display: "block" }}>
                <div className="modal-dialog">
                    <ModalScriptExecute
                        isSuccess={executeModalProps!.isSuccess}
                        content={executeModalProps!.content}
                        setModalState={executeModalProps!.setModalState}
                    />
                </div>
            </div>}
            {isJsonDisplayModalVisible && <div className="modal" tabIndex={-1} style={{ display: "block" }}>
                <div className="modal-dialog">
                    <ModalJsonDisplay
                        setJsonDisplayModelState={setIsJsonDisplayModalVisible}
                    />
                </div>
            </div>}
            {isSaveScriptModalVisible && <div className="modal" tabIndex={-1} style={{ display: "block" }}>
                <div className="modal-dialog">
                    <ModalSaveScript
                        {...saveScriptModalProps!}
                    />
                </div>
            </div>}
        </>
    );
}