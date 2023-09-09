import * as monaco from 'monaco-editor';
import { useEffect, useState } from "react";
import ManagerSingleton, { useApplicationState } from '../../ManagerSingleton';
import DomainDraw from '../../model/domain/DomainDraw';


export interface ModelJsonDisplayProps {
    setJsonDisplayModelState: React.Dispatch<React.SetStateAction<boolean>>
}


export default function ModalJsonDisplay({ setJsonDisplayModelState }: ModelJsonDisplayProps) {
    const draw = useApplicationState.getState();
    const [content, setContent] = useState("");

    useEffect(() => {
        const setContentColorization = async (content: string) => {
            const result = await monaco.editor.colorize(content, "json", { tabSize: 4 });
            setContent(result);
        }
        setContentColorization(DomainDraw.init(draw).getJson());
    })


    return (
        <>
            <div className="modal" tabIndex={-1} style={{ display: "block" }}>
                <div className="modal-dialog modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <p className="modal-title">Schema JSON</p>
                            <button type="button" className="btn-close" onClick={() => { setJsonDisplayModelState(false) }} aria-label="Close"></button>
                        </div>
                        <pre className="modal-body colored-code mb-0 p-2" data-lang="json" 
                            dangerouslySetInnerHTML={{ __html: content }}>
                        </pre>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => { setJsonDisplayModelState(false) }}>Close</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show"></div>
        </>
    )
}