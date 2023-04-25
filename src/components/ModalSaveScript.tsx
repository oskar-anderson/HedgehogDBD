import { useState } from "react";
import { LocalStorageData, Script } from "../model/LocalStorageData";


export interface ModalSaveScriptProps {
    setModalSaveScriptState: React.Dispatch<React.SetStateAction<boolean>>
    editorValue: string
    localStorageData: LocalStorageData
}

export default function modalSaveScript({setModalSaveScriptState, editorValue, localStorageData} : ModalSaveScriptProps) {
    
    const [inputValue, setInputValue] = useState("");
    
    const onClickSaveScript = () => {
        localStorageData.addScript(new Script(inputValue, editorValue, []));
        setModalSaveScriptState(false)
    }
    
    return (
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
                <button id="modal-save-btn" onClick={() => onClickSaveScript() } type="button" className="btn btn-primary">Save</button>
            </div>
        </div>
    )
}