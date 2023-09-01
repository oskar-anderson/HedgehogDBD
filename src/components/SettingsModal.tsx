import { Modal } from "react-bootstrap"
import Databases from "../model/DataTypes/Databases"
import DataType from "../model/DataTypes/DataType"
import TableRowDataTypeArguments from "../model/TableRowDataTypeArguments"
import { History } from "../commands/History";
import { Draw } from "../model/Draw"

export interface SettingsModalProps {
    draw: Draw
    setIsSettingsModalVisible: React.Dispatch<React.SetStateAction<boolean>>
    isSettingsModalVisible: boolean
}


export default function SettingsModal(
    { draw, setIsSettingsModalVisible, isSettingsModalVisible }: SettingsModalProps) {

    const handleActiveDatabaseChange = (databaseId: string) => {
        const newActiveDatabase = Databases.getAll().find(x => x.id === databaseId);
        if (newActiveDatabase === undefined) { throw Error(`Unknown database with id: ${newActiveDatabase}`)}
        
        draw.schema.getTables().forEach(table => {
            table.tableRows.forEach(tableRow => {
                tableRow.datatype.arguments = tableRow.datatype.arguments
                    .filter(x => x.argument.databases.includes(newActiveDatabase))  // remove type arguments new database does not need
                    .concat(                                                        // add type arguements new database needs that are marked readonly
                        DataType.getTypeById(tableRow.datatype.dataTypeId).getAllArguments()
                            .filter(x => x.isReadonly && x.databases.includes(newActiveDatabase))
                            .map(argument => {
                                return new TableRowDataTypeArguments(argument.defaultValue, argument)
                            })
                    )
                    .sort((a, b) => a.argument.position - b.argument.position) // sort ascending just in case
            })
        })
        draw.activeDatabase = newActiveDatabase;
        draw.history = new History();  // since the tablerow arguments were modified the history has to be reset
    }

    return (
        <Modal show={isSettingsModalVisible} onHide={() => setIsSettingsModalVisible(false)}
            dialogClassName="modal-w660px"
        >
        <Modal.Header closeButton>
            <Modal.Title>Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <div style={{ display: "flex" }}>
                <div className="fs-5" style={{ flexBasis: "33.33%" }}>
                    Schema properties
                </div>
                <div style={{ flexBasis: "66.67%" }}>
                    <div className="semi-bold">
                        Database
                    </div>
                    <select className="form-select" defaultValue={draw.activeDatabase.id} onChange={(e) => handleActiveDatabaseChange((e.target as HTMLSelectElement).value)}>
                        { 
                            Databases.getAll().map(x => {
                                return <option key={x.id} value={x.id}>{x.select}</option> 
                            })
                        }
                    </select>
                </div>
            </div>
        </Modal.Body>
    </Modal>
    )
}