import React, { useEffect, useState } from 'react';
import 'react-responsive-modal/styles.css';
import Modal  from 'react-responsive-modal';
import '../../styles/attributeModel.css'
import { AddAttribute, rowData } from '../../pages/Table';
import ReactDom from "react-dom"
import { ArrowUpIcon } from '../icons/arrowUp';

export type AttributeBeingEdited  = {row : rowData , rowIndex : number , attribute : string } | null



interface  EditAttributeModelProps {
handleSave : (oldAttribute: string, newAttribute: string, rowIndex: number) => void ,
handleDeleteAttribute : (att: string, rowIndex: number) => void ,
handleRankUp : (attribute: string, rowIndex: number) => void ,
hanldeRankDown :  (attribute: string, rowIndex: number) => void ,
setModalInfo : React.Dispatch<React.SetStateAction<{
attributeBeignEdited?: AttributeBeingEdited | undefined;
  addAttribute?: AddAttribute | undefined;
} | null>> ,
modalInfo : {
  attributeBeignEdited?: AttributeBeingEdited | undefined;
  addAttribute?: AddAttribute | undefined;
} | null
}


export const EditAttributeModel  : React.FC<EditAttributeModelProps> = ({  handleRankUp , handleSave ,  handleDeleteAttribute , hanldeRankDown ,setModalInfo , modalInfo  })=>{

const [attributeText , setAttributeText ] = useState<string>(modalInfo?.attributeBeignEdited?.attribute|| "" )
const attributeBeignEdited = modalInfo?.attributeBeignEdited


const onCloseModal = ()=>{
  setModalInfo(null)
}

useEffect(()=>{
setAttributeText(modalInfo?.attributeBeignEdited?.attribute || "" )
} , [modalInfo?.attributeBeignEdited?.attribute] )


const handleSubmit = (e :  React.FormEvent<HTMLFormElement>)=>{
e.preventDefault()
handleSave(modalInfo?.attributeBeignEdited?.attribute as string  , attributeText , modalInfo?.attributeBeignEdited?.rowIndex as number )
onCloseModal()
}

if(attributeBeignEdited === undefined ) return null
const rank =  attributeBeignEdited?.row.rowAttributes.indexOf(attributeBeignEdited.attribute)
const allAttributes = attributeBeignEdited?.row.rowAttributes
const rankUpDisabled = rank && allAttributes && (rank > allAttributes.length - 2 || rank <0 || allAttributes.length< 2)
const rankDownDisabled = rank && allAttributes &&( (rank < 1) || rank > allAttributes.length -1 || allAttributes.length < 2 )

return ReactDom.createPortal(<div onClick={()=>setModalInfo(null)} style={{position : "fixed" , top : "0px" , left : "0px" , right : "0px" , bottom : "0px" , backgroundColor : "rgb(0 , 0 , 0  , 0.7)"  , display: "flex" , alignItems : "center"  , gap : "40px" , justifyContent : "center" }} >

<div onClick={(e)=>e.stopPropagation()} style={{display : "flex"  , padding : "16px" , gap  : "8px" , position : "relative" , flexDirection : "column" , borderRadius : "8px" , alignContent : "center" , backgroundColor :"white" }} >
<i style={{cursor : "pointer" , color : "#494a4d", WebkitTextStrokeWidth : "1px" , position : "absolute" , top : "5px" , right :"10px" }}  onClick={()=>setModalInfo(null)} className="bi bi-x-lg"></i>
<div className='modelHeader'  >
{<h3>{`Edit ${attributeBeignEdited?.row?.rowName} Attribute`}</h3>}
{/* <h5>Edit Attribute</h5> */}
</div>



<form style={{display : "flex" , flexDirection : "column" , gap : "20px"}} onSubmit={handleSubmit} className="">



<input value={attributeText} onChange={(e)=>setAttributeText(e.target.value)} placeholder='Type Attribute...' className="form-control" style={{ display: "inline" }} ></input>
<button  className='btn btn-success modelSaveBtn '  type='submit' >Done</button>
</form>
</div>




<div style={{display :"flex",  flexDirection : "column" , alignContent :"center"  , gap : 16}} >

<div onClick={(e)=>e.stopPropagation()} style={{display : "flex"  , flexDirection : "column" , backgroundColor : "white"  , gap : 8 , padding : "8px"  , borderRadius : "8px"  , alignItems: "center" }} >

<div onClick={()=> attributeBeignEdited &&  handleRankUp(attributeBeignEdited.attribute , attributeBeignEdited.rowIndex)} style={{ cursor : rankUpDisabled ? "not-allowed" : "pointer" , borderRadius : "3px" }} ><ArrowUpIcon stroke={ rankUpDisabled? "#bdbdbd" : "#494a4d" } /></div>
{ typeof  rank === "number" &&  <p style={{fontWeight : 400 , display : "inline-block" , padding : 0, margin : 0 , lineHeight : "16px" , textAlign : "center" }} >Rank: {rank + 1} </p> }
<div onClick={()=> attributeBeignEdited &&  hanldeRankDown(attributeBeignEdited.attribute , attributeBeignEdited.rowIndex)} style={{ cursor : rankDownDisabled? "not-allowed" : "pointer" , transform: 'rotate(180deg)' , stroke: "gray" , borderRadius : "8px" }} ><ArrowUpIcon  stroke={ rankDownDisabled? "#bdbdbd" : "#494a4d" } /></div>

</div>
<button onClick={(e)=>{e.stopPropagation()  ; attributeBeignEdited && handleDeleteAttribute( attributeBeignEdited.attribute , attributeBeignEdited.rowIndex) ; setModalInfo(null) }} className='btn btn-danger' ><i className="bi bi-trash"></i></button>

</div>


</div>  , document.getElementById("editAttribute") as Element )

}









