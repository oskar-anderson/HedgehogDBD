import { SetStateAction, useState } from "react";
import Script from "../../model/Script"


export interface ModalSaveScriptProps {
    setModalSaveScriptState: React.Dispatch<React.SetStateAction<boolean>>
    editorValue: string
    addLocalStorageData: (script: Script) => void
}

export default function ModalSaveScript({ setModalSaveScriptState, editorValue, addLocalStorageData }: ModalSaveScriptProps) {

    const [inputValue, setInputValue] = useState("");

    const onClickSaveScript = () => {
        addLocalStorageData({ 
            name: inputValue, 
            content: editorValue, 
            tags: []
        });
        setModalSaveScriptState(false)
    }

    return (
        <>
            <div className="modal" tabIndex={-1} style={{ display: "block" }}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <p className="modal-title">Save script to localstorage</p>
                            <button type="button" className="btn-close" onClick={() => setModalSaveScriptState(false)} aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <label htmlFor="modal-save-text-name">Name:</label>
                            <input id="modal-save-text-name" value={inputValue} onChange={(e) => setInputValue(e.target.value)}></input>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setModalSaveScriptState(false)}>Cancel</button>
                            <button onClick={() => onClickSaveScript()} type="button" className="btn btn-light btn-create">Save</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show"></div>
        </>
    )
}