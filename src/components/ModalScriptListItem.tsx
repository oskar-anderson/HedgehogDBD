import { SetStateAction, useState } from "react";
import { Manager } from "../Manager";
import { Script } from "../model/LocalStorageData";
import { ScriptingScene } from "../scenes/ScriptingScene";
import { ModalScriptExecuteProps } from "./ModalScriptExecute";

export interface ModalScriptListItemProps {
    script: Script
    highlightedContent: string
    setScriptModalState: React.Dispatch<React.SetStateAction<boolean>>
    switchToExecuteModel: (scriptExecuteModalProps: ModalScriptExecuteProps) => void
    setExecuteModalState: React.Dispatch<React.SetStateAction<boolean>>
    setEditorValue: (content: string) => void
    removeScriptFromLocalStorage: (script: Script) => void
}


export default function modalScriptListItem({
    script,
    highlightedContent,
    setScriptModalState,
    switchToExecuteModel,
    setExecuteModalState,
    setEditorValue,
    removeScriptFromLocalStorage
}: ModalScriptListItemProps) {

    const execute = async (value: string): Promise<ModalScriptExecuteProps> => {
        let executeResult = await ScriptingScene.executeWithLog(value, Manager.getInstance().draw);
        return {
            isSuccess: executeResult.error === "",
            content: executeResult.resultLog.join("\n"),
            setModalState: setExecuteModalState
        };
    }
    const onClickCopyToEditor = () => {
        setEditorValue(script.content)
        setScriptModalState(false);
    }
    const onClickDeleteScript = () => {
        removeScriptFromLocalStorage(script)
        setScriptModalState(false);
    }
    return (
        <div className="modal-content">
            <div className="modal-header">
                <p className="modal-title">{script.name}</p>
                <button type="button" className="btn-close" onClick={() => { setScriptModalState(false) }} aria-label="Close"></button>
            </div>
            <div className="modal-body colored-code" style={{ maxHeight: '76vh', overflow: 'auto' }}>
                <pre dangerouslySetInnerHTML={{__html: highlightedContent}}></pre>
            </div>
            <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setScriptModalState(false) }}>Close</button>
                {!script.tags.includes("builtin") &&
                    <button onClick={() => onClickDeleteScript()} type="button" className="btn btn-danger">Delete</button>
                }

                {!script.tags.includes("readonly") &&
                    <>
                        <button onClick={async () => { switchToExecuteModel(await execute(script.content)) }} type="button" className="btn btn-primary">⚡ Execute</button>
                        <button onClick={() => onClickCopyToEditor()} type="button" className="btn btn-primary">Paste to editor</button>
                    </>
                }
            </div>
        </div>
    );
}