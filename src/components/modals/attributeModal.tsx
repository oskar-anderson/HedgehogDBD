import React, { useEffect, useState } from 'react';
import 'react-responsive-modal/styles.css';
import '../../styles/attributeModel.css'
import { AddAttribute, rowData } from '../../pages/Table';
import ReactDom from "react-dom"
import { ArrowUpIcon } from '../icons/arrowUp';
import { useApplicationState } from '../../Store';
import DomainTable from '../../model/domain/DomainTable';

// Attribute is null when creating the attribute, but not null when editing
export type ModalInfoData = { row: rowData, rowIndex: number, attribute: string | null } | null



interface EditAttributeModelProps {
  handleSave: (oldAttribute: string, newAttribute: string, rowIndex: number) => void,
  handleDeleteAttribute: (att: string, rowIndex: number) => void,
  handleRankUp: (attribute: string, rowIndex: number) => void,
  handleRankDown: (attribute: string, rowIndex: number) => void,
  setModalInfo: React.Dispatch<React.SetStateAction<ModalInfoData>>,
  modalInfo: ModalInfoData,
  handleCreateAttribute: (att: string, index: number) => void
  table: DomainTable,
  setRows: React.Dispatch<React.SetStateAction<{
    key: string;
    rowName: string;
    rowDatatype: {
      id: string;
      arguments: {
        value: {
          isIncluded: boolean;
          realValue: string;
        };
        argumentId: string;
      }[];
      isNullable: boolean;
    };
    rowAttributes: string[];
  }[]>>

}


enum PrimaryAttributes {
  Primary_Key = "Primary_Key",
  Foreign_Key = "Foreign_Key"
}

export const AttributeModal = ({ handleCreateAttribute, setRows, table, handleRankUp, handleSave, handleDeleteAttribute, handleRankDown, setModalInfo, modalInfo }: EditAttributeModelProps) => {

  const [attributeText, setAttributeText] = useState<string>(modalInfo?.attribute || "")
  const [selectedPrimaryAttribute, setSelectedPrimaryAttribute] = useState<PrimaryAttributes | null>(null)
  const [selectedTableName, setSelectedTableName] = useState<null | string>(null)
  const tables = useApplicationState(state => state.schemaTables);

  // Reset state - modal was closed and reopened
  useEffect(() => {
    if (modalInfo === null) return;
    setAttributeText(modalInfo.attribute || "")
    setSelectedPrimaryAttribute(null);
    setSelectedTableName(null);
  }, [modalInfo])

  if (modalInfo === null) return null;

  // add attribute logic
  const handlePrimaryAttributeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPrimaryAttribute(e.target.value as PrimaryAttributes)

    if (e.target.value === PrimaryAttributes.Primary_Key) { setAttributeText("PK") }
    if (e.target.value === PrimaryAttributes.Foreign_Key) { setAttributeText(`FK("${selectedTableName ?? '__tablename__'}")`) }
    setSelectedTableName(null);
  }

  const handleTableNameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTableName(e.target.value as PrimaryAttributes)
    setAttributeText(`FK("${e.target.value}")`)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (modalInfo.attribute === null) {
      handleCreateAttribute(attributeText, modalInfo.rowIndex);
    } else {
      handleSave(modalInfo.attribute, attributeText, modalInfo.rowIndex)
    }
    setModalInfo(null);
  }

  
  const rank = modalInfo.attribute === null ? -1 : modalInfo.row.rowAttributes.indexOf(modalInfo.attribute)
  const allAttributes = modalInfo.row.rowAttributes
  const rankUpDisabled = rank < 1 || allAttributes.length < 2;
  const rankDownDisabled = rank > allAttributes.length - 2 || allAttributes.length < 2;
  let header = modalInfo.row.rowName === '' ? 'Attribute' : modalInfo.row.rowName + ' attribute';

  return ReactDom.createPortal(
    <div onClick={() => setModalInfo(null)}
      style={{ position: "fixed", top: "0px", left: "0px", right: "0px", bottom: "0px", backgroundColor: "rgb(0, 0, 0, 0.7)", display: "flex", alignItems: "center", gap: "40px", justifyContent: "center" }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", padding: "16px", gap: "8px", position: "relative", flexDirection: "column", borderRadius: "8px", alignContent: "center", backgroundColor: "white" }} >
        <i style={{ cursor: "pointer", color: "#494a4d", WebkitTextStrokeWidth: "1px", position: "absolute", top: "5px", right: "10px" }}
          onClick={() => setModalInfo(null)}
          className="bi bi-x-lg">
        </i>

        <div className='modelHeader'>
          <h3>{header}</h3>
        </div>



        <form onSubmit={handleSubmit} className="dropdown primaryDropdown">

          {modalInfo.attribute === null && <div className='listCategory'>
            <select onChange={handlePrimaryAttributeChange} className="form-select" aria-label="Select list">
              <option disabled style={{ display: 'none' }}>Choose attribute</option>
              <option value={PrimaryAttributes.Primary_Key}>Primary Key</option>
              <option value={PrimaryAttributes.Foreign_Key}>Foreign Key</option>
            </select>
          </div>
          }

          {modalInfo.attribute === null && selectedPrimaryAttribute === PrimaryAttributes.Foreign_Key &&
            <div className='listCategory' >
              <select onChange={handleTableNameChange} className="form-select" aria-label="Select list">
                <option disabled style={{ display: 'none' }}>Table name</option>
                {tables
                  .filter(item => item.id !== table.id)
                  .map(table => (
                    <option key={table.id} value={table.head}>{table.head}</option>
                  ))
                }
              </select>
            </div>
          }


          <input value={attributeText} onChange={(e) => setAttributeText(e.target.value)} placeholder='Type Attribute...' className="form-control" style={{ display: "inline" }} ></input>
          <button className='btn btn-success modelSaveBtn' type='submit'>{modalInfo.attribute === null ? `Create attribute` : `Save`}</button>
        </form>
      </div>

      {modalInfo.attribute !== null && <div style={{ display: "flex", flexDirection: "column", alignContent: "center", gap: 16 }} >

        <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", backgroundColor: "white", gap: 8, padding: "8px", borderRadius: "8px", alignItems: "center" }} >

          <div onClick={() => handleRankUp(modalInfo.attribute!, modalInfo.rowIndex)} style={{ cursor: rankUpDisabled ? "not-allowed" : "pointer", borderRadius: "3px" }} >
            <ArrowUpIcon stroke={rankUpDisabled ? "#bdbdbd" : "#494a4d"} />
          </div>
          
          <p style={{ fontWeight: 400, display: "inline-block", padding: 0, margin: 0, lineHeight: "16px", textAlign: "center" }} >
            Rank: {rank + 1}
          </p>
          
          <div onClick={() => handleRankDown(modalInfo.attribute!, modalInfo.rowIndex)} style={{ cursor: rankDownDisabled ? "not-allowed" : "pointer", transform: 'rotate(180deg)', stroke: "gray", borderRadius: "8px" }} >
            <ArrowUpIcon stroke={rankDownDisabled ? "#bdbdbd" : "#494a4d"} />
          </div>

        </div>
        <button onClick={(e) => { e.stopPropagation(); modalInfo && handleDeleteAttribute(modalInfo.attribute!, modalInfo.rowIndex); setModalInfo(null) }} className='btn btn-danger'>
          <i className="bi bi-trash"></i>
        </button>

      </div>}
    </div>, document.getElementById("attributeModal") as Element
  );
}
