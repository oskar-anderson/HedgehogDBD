import { Manager } from "../../../Manager";
import { SchemaDTO } from "../../../model/dto/SchemaDTO";
import * as monaco from 'monaco-editor';
import { useEffect, useState } from "react";

export interface ModelJsonDisplayProps {
    setJsonDisplayModelState: React.Dispatch<React.SetStateAction<boolean>>
}


export default function ModalJsonDisplay({ setJsonDisplayModelState }: ModelJsonDisplayProps) {
    const [content, setContent] = useState("");

    useEffect(() => {
        const setContentColorization = async (content: string) => {
            const result = await monaco.editor.colorize(content, "json", { tabSize: 4 });
            setContent(result);
        }
        const schemaDTO = SchemaDTO.initJsonDisplayable(Manager.getInstance().draw)
        setContentColorization(JSON.stringify(schemaDTO, null, 4));
    })


    return (
        <div className="modal-content">
            <div className="modal-header">
                <p className="modal-title">Schema JSON</p>
                <button type="button" className="btn-close" onClick={() => { setJsonDisplayModelState(false) }} aria-label="Close"></button>
            </div>
            <div className="modal-body">
                <pre className="colored-code" data-lang="javascript" dangerouslySetInnerHTML={{ __html: content }}></pre>
            </div>
            <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setJsonDisplayModelState(false) }}>Close</button>
            </div>
        </div>
    )
}