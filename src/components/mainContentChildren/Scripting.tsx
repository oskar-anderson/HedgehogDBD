import { Manager } from "../../Manager";
import { LocalStorageData, Script } from "../../model/LocalStorageData";
import * as monaco from 'monaco-editor';
import { ScriptingScene } from "../../scenes/ScriptingScene";
import ScriptModal, { ModalScriptListItemProps } from "../ModalScriptListItem";
import { SetStateAction, useCallback, useEffect, useReducer, useRef, useState } from "react";
import ScriptExecuteModal, { ModalScriptExecuteProps } from "../ModalScriptExecute";
import JsonDisplayModal, { ModelJsonDisplayProps } from "../ModalJsonDisplay";
import ModalSaveScript, { ModalSaveScriptProps } from "../ModalSaveScript";


export default function scripting() {

    let [builtinScripts, setBuiltinScripts] = useState<Script[]>([]);

    useEffect(() => {
        const getScripts = async () => {
            const fetchedScripts = [
                new Script(
                    "List tables", 
                    await fetch('src/wwwroot/scripts/listAllTables.js', {cache: "no-cache"}).then(x => x.text()), 
                    ["builtin"]
                ),
                new Script(
                    "List tables and rows",
                    await fetch('src/wwwroot/scripts/listAllTableRows.js', {cache: "no-cache"}).then(x => x.text()),
                    ['builtin', 'CSV']
                ),
                new Script(
                    "SQL CREATE",
                    await fetch('src/wwwroot/scripts/createTablesSQL.js', {cache: "no-cache"}).then(x => x.text()),
                    ["builtin", "SQL"]
                ),
                new Script(
                    "Export TXT",
                    await fetch('src/wwwroot/scripts/saveAsTxt.js', {cache: "no-cache"}).then(x => x.text()),
                    ["builtin"]
                ),
                new Script(
                    "Export clipboard",
                    await fetch('src/wwwroot/scripts/saveToClipboard.js', {cache: "no-cache"}).then(x => x.text()),
                    ["builtin"]
                ),
                new Script(
                    "Export PNG",
                    await fetch('src/wwwroot/scripts/takeScreenshot.js', {cache: "no-cache"}).then(x => x.text()),
                    ["builtin", "async"]
                ),
                new Script(
                    "Shared scripts lib",
                    await fetch('src/wwwroot/scripts/_SHARED.js', {cache: "no-cache"}).then(x => x.text()),
                    ["builtin", "readonly"]
                )
            ];
            setBuiltinScripts(fetchedScripts)
        }
        getScripts();
    }, []);

    const localStorageData = LocalStorageData.getStorage();
    const scripts = localStorageData.scripts.concat(builtinScripts);  // TODO! useReducer

    const [isScriptListItemModalVisible, setIsScriptListItemModalVisible] = useState(false);
    const [mainModalProps, setMainModalProps] = useState<ModalScriptListItemProps | null>(null);

    const [isExecuteModalVisible, setIsExecuteModalVisible] = useState(false);
    const [executeModalProps, setExecuteModalProps] = useState<ModalScriptExecuteProps | null>(null);

    const [isJsonDisplayModalVisible, setIsJsonDisplayModalVisible] = useState(false);
    // const [jsonDisplayModelProps, setJsonDisplayModelProps] = useState<JsonDisplayModelProps | null>(null);

    const [isSaveScriptModalVisible, setIsSaveScriptModalVisible] = useState(false);
    const [saveScriptModalProps, setSaveScriptModalProps] = useState<ModalSaveScriptProps | null>(null);


    const removeScriptFromLocalStorage = useCallback((script: Script) => {
        localStorageData.removeScript(script)
    }, [])


    const switchToExecuteModel = useCallback((executeModelProps: ModalScriptExecuteProps) => {
        setIsScriptListItemModalVisible(false);
        setExecuteModalProps(executeModelProps);
        setIsExecuteModalVisible(true);
    }, [])

    const onClickScriptListItem = async (script: Script) => {
        // highlighting replaces regular space with nbsp;
        let html = (await monaco.editor.colorize(script.content, "javascript", {})).replaceAll("\u00a0", " ");
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
    let editor: monaco.editor.IStandaloneCodeEditor | null = null;
    const setEditorValue = useCallback((content: string) => {
        editor?.setValue(content);
    }, [])

    useEffect(() => {
        editor = monaco.editor.create(document.querySelector('.editor')!, {
            value: "",
            language: 'javascript',
        });
        window.addEventListener("resize", () => {
            editor!.layout({ width: window.innerWidth - 20, height: 400 })
        });
    }, [])

    const displaySaveModal = () => {
        setSaveScriptModalProps({
            setModalSaveScriptState: setIsSaveScriptModalVisible,
            editorValue: editor!.getValue(),
            localStorageData: localStorageData
        })
        setIsSaveScriptModalVisible(true);
    }

    const executeEditorCode = async () => {
        const result = await ScriptingScene.executeWithLog(
            editor!.getValue(), 
            Manager.getInstance().draw
        );
        setExecuteModalProps({
            isSuccess: result.error === "",
            content: result.resultLog.join("\n"),
            setModalState: setIsExecuteModalVisible
        });
        setIsExecuteModalVisible(true);
    }

    return (
        <>
            <div className="scripting-container">
                <div>
                    <div className="mt-4 mx-2">
                        <div className="h4">Scripts</div>
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-sm-12">
                                    <ul className="list-group">
                                        {
                                            scripts.map((script, i) => (
                                                <li key={i} onClick={() => onClickScriptListItem(script)} className="script-modal list-group-item d-flex justify-content-between" data-content="{{ builtinScriptsJson[loop.index0] }}">
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
                                        }
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 mx-2">
                        <div className="h4">Editor</div>
                        <div>
                            <button type="button" onClick={() => displaySaveModal()} className="save-btn btn btn-light">Save</button>
                            <button type="button" onClick={() => executeEditorCode()} className="execute-btn btn btn-light">Execute</button>
                            <button type="button" onClick={() => setIsJsonDisplayModalVisible(true)} className="show-json btn btn-light">Show JSON</button>
                        </div>

                        <div className="editor">
                            { /* editor will be added here */}
                        </div>
                    </div>
                </div>

                <div id="basic-modal" className="modal" tabIndex={-1}>
                    <div className="modal-dialog">
                        {isScriptListItemModalVisible && <ScriptModal
                            script={mainModalProps!.script}
                            highlightedContent={mainModalProps!.highlightedContent}
                            switchToExecuteModel={switchToExecuteModel}
                            setScriptModalState={setIsScriptListItemModalVisible}
                            setExecuteModalState={setIsExecuteModalVisible}
                            setEditorValue={setEditorValue}
                            removeScriptFromLocalStorage={removeScriptFromLocalStorage}
                        ></ScriptModal>}
                        {isExecuteModalVisible && <ScriptExecuteModal
                            isSuccess={executeModalProps!.isSuccess}
                            content={executeModalProps!.content}
                            setModalState={executeModalProps!.setModalState}
                        />}
                        {isJsonDisplayModalVisible && <JsonDisplayModal
                            setJsonDisplayModelState={setIsJsonDisplayModalVisible}
                        />}
                        {isSaveScriptModalVisible && <ModalSaveScript 
                            { ...saveScriptModalProps!}
                        />}
                    </div>
                </div>
            </div>
            <div className="comment-container">
                <script src="https://giscus.app/client.js"
                    data-repo="oskar-anderson/RasterModeler"
                    data-repo-id="R_kgDOISKZkQ"
                    data-category-id="DIC_kwDOISKZkc4CTY-q"
                    data-mapping="specific"
                    data-term="Comments - Scripting"
                    data-strict="0"
                    data-reactions-enabled="0"
                    data-emit-metadata="0"
                    data-input-position="top"
                    data-theme="preferred_color_scheme"
                    data-lang="en"
                    crossOrigin="anonymous"
                    async>
                </script>
            </div>
        </>
    );
}