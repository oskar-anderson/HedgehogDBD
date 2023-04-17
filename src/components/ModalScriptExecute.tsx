

export interface ModalScriptExecuteProps {
    isSuccess: boolean
    content: string
    setModalState: React.Dispatch<React.SetStateAction<boolean>>
}

export default function modalScriptExecute({ content, isSuccess, setModalState }: ModalScriptExecuteProps) {
    return (
        <div className="modal-content">
            <div className="modal-header">
                <p className="modal-title">
                    {isSuccess ? "Result" : "Error"}
                </p>
                <button type="button" className="btn-close" onClick={() => { setModalState(false) }} aria-label="Close"></button>
            </div>
            <div className="modal-body">
                {isSuccess ?
                    <pre>{content}</pre> :
                    <p style={{ color: "red" }}>{content}</p>
                }
            </div>
            <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setModalState(false) }}>Cancel</button>
            </div>
        </div>
    )
}