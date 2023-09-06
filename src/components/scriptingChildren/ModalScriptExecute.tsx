

export interface ModalScriptExecuteProps {
    isSuccess: boolean
    content: string
    setModalState: React.Dispatch<React.SetStateAction<boolean>>
}

export default function ModalScriptExecute({ content, isSuccess, setModalState }: ModalScriptExecuteProps) {
    return (
        <>
            <div className="modal" tabIndex={-1} style={{ display: "block" }}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <p className="modal-title">
                                {isSuccess ? "Result" : "Error"}
                            </p>
                            <button type="button" className="btn-close" onClick={() => { setModalState(false) }} aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {isSuccess ?
                                <pre dangerouslySetInnerHTML={{__html: content}}></pre> :
                                <p style={{ color: "red" }}>{content}</p>
                            }
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => { setModalState(false) }}>Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show"></div>
        </>
    )
}