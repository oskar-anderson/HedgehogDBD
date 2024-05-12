import React, { useEffect, useState } from 'react';
import 'react-responsive-modal/styles.css';
import '../../styles/attributeModel.css'
import { AddAttribute, rowData } from '../../pages/Table';
import ReactDom from "react-dom"
import { ArrowUpIcon } from '../icons/arrowUp';
import { useApplicationState } from '../../Store';
import DomainTable from '../../model/domain/DomainTable';

export type AttributeBeingEdited = {row: rowData, rowIndex: number, attribute: string } | null



interface EditAttributeModelProps {
  handleSave: (oldAttribute: string, newAttribute: string, rowIndex: number) => void,
  handleDeleteAttribute: (att: string, rowIndex: number) => void,
  handleRankUp: (attribute: string, rowIndex: number) => void,
  handleRankDown: (attribute: string, rowIndex: number) => void,
  setModalInfo: React.Dispatch<React.SetStateAction<{
    attributeBeignEdited?: AttributeBeingEdited | undefined;
    addAttribute?: AddAttribute | undefined;
  } | null>>,
  modalInfo: {
    attributeBeignEdited?: AttributeBeingEdited | undefined;
    addAttribute?: AddAttribute | undefined;
  } | null,
  handleSaveAttribute: (att: string, index: number) => void
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

export const AttributeModal = ({ handleSaveAttribute, setRows, table, handleRankUp, handleSave, handleDeleteAttribute, handleRankDown, setModalInfo, modalInfo } : EditAttributeModelProps) => {

  const [attributeText , setAttributeText ] = useState<string>(modalInfo?.attributeBeignEdited?.attribute|| "" )
  const attributeBeignEdited = modalInfo?.attributeBeignEdited
  const [selectedPrimaryAttribute , setSelectedPrimaryAttribute ] = useState<PrimaryAttributes | null>(null)
  const [selectedTableName , setSelectedTableName ] = useState<null | string >(null)
  const tables = useApplicationState(state => state.schemaTables);
  const [AddAttributeText , setAddAttributeText ] = useState("")








  const onCloseModal = ()=>{
    setModalInfo(null)
  }


  // add attribute logic
  const handlePrimaryAttributeChange = (e :React.ChangeEvent<HTMLSelectElement>)=>{
    setSelectedPrimaryAttribute(e.target.value as PrimaryAttributes )
    
    if(e.target.value === PrimaryAttributes.Primary_Key) { setAddAttributeText("PK") }
    if(e.target.value === PrimaryAttributes.Foreign_Key) setAddAttributeText(`FK("${selectedTableName}")`)
  }
  
  
  const handleTableNameChange = (e :React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTableName(e.target.value as PrimaryAttributes )
    setAddAttributeText(`FK("${e.target.value}")`) 
  }
    
  
  const resetModal = () => {
    setAddAttributeText("")
    setSelectedPrimaryAttribute(null)
    setSelectedTableName(null)
    setModalInfo(null)
  }
  const handleAddAttribute = (e: React.FormEvent<HTMLFormElement>)=>{
    if(!modalInfo?.addAttribute) return;
    e.preventDefault();
    typeof modalInfo?.addAttribute.rowIndex === "number" && handleSaveAttribute(AddAttributeText , modalInfo?.addAttribute?.rowIndex)
    setModalInfo(null);
    resetModal();
  }
  


  // edit attribute logic
  useEffect(()=>{
    setAttributeText(modalInfo?.attributeBeignEdited?.attribute || "")
  }, [modalInfo?.attributeBeignEdited?.attribute] )


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault()
    handleSave(modalInfo?.attributeBeignEdited?.attribute as string, attributeText , modalInfo?.attributeBeignEdited?.rowIndex as number )
    onCloseModal()
  }







  /// add attribute modal
  if(modalInfo?.addAttribute) {
    return ReactDom.createPortal(
    <div onClick={() => setModalInfo(null)} 
      style={{position: "fixed", top: "0px", left: "0px", right: "0px", bottom: "0px", backgroundColor: "rgb(0, 0, 0, 0.7)", display: "flex", alignItems: "center", gap: "40px", justifyContent: "center" }} 
    >
      <div onClick={(e) => e.stopPropagation()} style={{display: "flex", padding: "16px", gap: "8px", position: "relative" , flexDirection: "column", borderRadius: "8px", alignContent: "center", backgroundColor: "white" }} >
        <i style={{cursor: "pointer", color: "#494a4d", WebkitTextStrokeWidth: "1px", position: "absolute", top: "5px" , right:"10px" }} 
          onClick={()=>setModalInfo(null)} 
          className="bi bi-x-lg">
        </i>

        <div className='modelHeader'>
          {<h3>{`${modalInfo.addAttribute.rowData?.rowName} Attribute`}</h3>}
        </div>



        <form onSubmit={handleAddAttribute} className="dropdown primaryDropdown">

          <div className='listCategory'>
            <select onChange={handlePrimaryAttributeChange} className="form-select" aria-label="Select list">
            { selectedPrimaryAttribute === null && <option className='hiddenOption' selected>Choose attribute</option> }
              <option value={PrimaryAttributes.Primary_Key}>Primary Key</option>
              <option value={PrimaryAttributes.Foreign_Key}>Foreign Key</option>
            </select>
          </div>

          { selectedPrimaryAttribute === PrimaryAttributes.Foreign_Key &&
          <div className='listCategory' >
            <select onChange={handleTableNameChange} className="form-select" aria-label="Select list">
            { selectedTableName === null && <option className='hiddenOption' selected>Table Name</option> }
            { tables
              .filter(item => item.id !== table.id)
              .map(table => (
                <option key={table.id} selected={selectedTableName === table.head} value={table.head}>{table.head}</option>
              ))
            }
            </select>
          </div>
          }


          <input value={AddAttributeText} onChange={(e)=>setAddAttributeText(e.target.value)} placeholder='Type Attribute...' className="form-control" style={{ display: "inline" }} ></input>
          <button className='btn btn-success modelSaveBtn' type='submit'>Add Attribute</button>
        </form>
      </div>
    </div>, document.getElementById("attributeModal") as Element)
  }

  if (modalInfo?.attributeBeignEdited) {
    const rank = attributeBeignEdited?.row.rowAttributes.indexOf(attributeBeignEdited.attribute)
    const allAttributes = attributeBeignEdited?.row.rowAttributes
    const rankUpDisabled = rank && allAttributes && (rank > allAttributes.length - 2 || rank <0 || allAttributes.length< 2)
    const rankDownDisabled = rank && allAttributes &&( (rank < 1) || rank > allAttributes.length -1 || allAttributes.length < 2 )

    return ReactDom.createPortal(
    <div onClick={() => setModalInfo(null)} 
      style={{position: "fixed", top: "0px", left: "0px", right: "0px", bottom: "0px", backgroundColor: "rgb(0,0,0,0.7)", display: "flex", alignItems: "center", gap: "40px", justifyContent: "center" }} >

      <div onClick={(e) => e.stopPropagation()} style={{display: "flex", padding: "16px", gap: "8px", position: "relative", flexDirection: "column", borderRadius: "8px", alignContent: "center", backgroundColor:"white" }} >
        <i style={{cursor: "pointer", color: "#494a4d", WebkitTextStrokeWidth: "1px", position: "absolute", top: "5px", right :"10px" }} onClick={() => setModalInfo(null)} className="bi bi-x-lg"></i>
        <div className='modelHeader'>
          {<h3>{`Edit ${attributeBeignEdited?.row?.rowName} Attribute`}</h3>}
        </div>


        <form style={{display: "flex", flexDirection: "column", gap: "20px"}} onSubmit={handleSubmit}>
          <input value={attributeText} onChange={(e) => setAttributeText(e.target.value)} placeholder='Type Attribute...' className="form-control" style={{ display: "inline" }} ></input>
          <button className='btn btn-success modelSaveBtn ' type='submit' >Done</button>
        </form>
      </div>




      <div style={{display:"flex", flexDirection: "column", alignContent:"center", gap: 16}} >

        <div onClick={(e) => e.stopPropagation()} style={{display: "flex", flexDirection: "column", backgroundColor: "white", gap: 8, padding: "8px", borderRadius: "8px", alignItems: "center" }} >

          <div onClick={()=> attributeBeignEdited && handleRankUp(attributeBeignEdited.attribute , attributeBeignEdited.rowIndex)} style={{ cursor : rankUpDisabled ? "not-allowed" : "pointer" , borderRadius : "3px" }} >
            <ArrowUpIcon stroke={ rankUpDisabled? "#bdbdbd" : "#494a4d" } />
          </div>
          { typeof rank === "number" && 
          <p style={{fontWeight: 400, display: "inline-block", padding: 0, margin: 0, lineHeight: "16px", textAlign: "center" }} >
            Rank: {rank + 1}
          </p>
          }
          <div onClick={() => attributeBeignEdited && handleRankDown(attributeBeignEdited.attribute, attributeBeignEdited.rowIndex)} style={{ cursor: rankDownDisabled? "not-allowed": "pointer", transform: 'rotate(180deg)', stroke: "gray", borderRadius: "8px" }} >
            <ArrowUpIcon stroke={ rankDownDisabled? "#bdbdbd": "#494a4d" } />
          </div>

        </div>
        <button onClick={(e) => {e.stopPropagation(); attributeBeignEdited && handleDeleteAttribute( attributeBeignEdited.attribute , attributeBeignEdited.rowIndex) ; setModalInfo(null) }} className='btn btn-danger'>
          <i className="bi bi-trash"></i>
        </button>

      </div>


    </div>, document.getElementById("attributeModal") as Element)
  }

  return null;
}
