import React, { useState } from 'react';
import 'react-responsive-modal/styles.css';
import Modal  from 'react-responsive-modal';
import '../../styles/attributeModel.css'
import { useApplicationState } from '../../Store';
import VmTable from '../../model/viewModel/VmTable';
import DomainTable from '../../model/domain/DomainTable';
import { cn } from '../../utils/conditionalClassNames';
import { rowData } from '../../pages/Table';


const modelStyle = {
  content: {
    top: '50%',
    left: '50%',
    width : "500px" , 
    height : "500px" , 
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};



interface CreateTableProps   {
  handleSaveAttribute :   (att: string, index: number) => void
  addRowAttributeModal : {   row: rowData | null; rowIndex : number | null}
       setAddRowAttributeModal : React.Dispatch<React.SetStateAction<{
        row: rowData | null
        rowIndex : number | null
    }>>
       table : DomainTable
       setRows : React.Dispatch<React.SetStateAction<{
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
  Primary_Key = "Primary_Key" ,
  Foreign_Key = "Foreign_Key"
}
enum Lists {
  primaryList = "Primary_List" ,
  tableNames = "Table_Names"
}

export const CreateAttributeModel  : React.FC<CreateTableProps> = ({addRowAttributeModal , handleSaveAttribute , setAddRowAttributeModal , table , setRows })=>{
  const onCloseModal = () => setAddRowAttributeModal({row : null , rowIndex : null });
  const [openedLists , setOpenedLists ] = useState<Lists[]>([])
  const [selectedPrimaryAttribute , setSelectedPrimaryAttribute ] = useState<PrimaryAttributes | null>(null)
  const [selectedTableName , setSelectedTableName ] = useState<null | string >(null)
  const tables = useApplicationState(state => state.schemaTables);
const [attributeText , setAttributeText ] = useState("")

const toggleList = (list: Lists)=>{
  openedLists.includes(list) ? setOpenedLists(val=>val.filter(item=>item !== list)) : setOpenedLists(val=>[...val , list])
}



const handlePrimaryAttributeChange = (e :React.ChangeEvent<HTMLSelectElement>)=>{
setSelectedPrimaryAttribute(e.target.value as PrimaryAttributes )

if(e.target.value === PrimaryAttributes.Primary_Key) {   setAttributeText("PK") }
if(e.target.value === PrimaryAttributes.Foreign_Key) setAttributeText(`FK("${selectedTableName}")`)
}


const handleTableNameChange = (e :React.ChangeEvent<HTMLSelectElement>)=>{
  setSelectedTableName(e.target.value as PrimaryAttributes )
  setAttributeText(`FK("${e.target.value}")`) 
  }
  

const resetModal = ()=>{
  setAttributeText("")
  setSelectedPrimaryAttribute(null)
  setSelectedTableName(null)
  setAddRowAttributeModal({row : null , rowIndex : null})
}  
const handleSubmit = (e: React.FormEvent<HTMLFormElement>)=>{
  e.preventDefault()
  handleSaveAttribute(attributeText , addRowAttributeModal.rowIndex as number)
  resetModal()
}

    return        <Modal   classNames={{ closeButton : "modalCloseBtn" ,   modal : "createAttributeModal card" , modalContainer : "createAttributeModalContainer" }}   open={addRowAttributeModal.row !== null && Boolean(addRowAttributeModal.row )} onClose={onCloseModal} center>


<div className='modelHeader' >
{<h3  >{`${addRowAttributeModal.row?.rowName} Attribute`}</h3>}
{/* <h5>Select an attribute to add</h5> */}
</div>



<form onSubmit={handleSubmit} className="dropdown primaryDropdown">

<div className='listCategory ' >  


<select onChange={handlePrimaryAttributeChange} className="form-select" aria-label="Select list">
 { selectedPrimaryAttribute === null && <option className='hiddenOption' selected>PK / FK</option> }
  <option  value={PrimaryAttributes.Primary_Key}>Primary Key</option>
  <option value={PrimaryAttributes.Foreign_Key}>Foreign Key</option>
</select>



  </div>

{ selectedPrimaryAttribute === PrimaryAttributes.Foreign_Key && <div className='listCategory' >  
 <select   onChange={handleTableNameChange} className="form-select" aria-label="Select list">
 { selectedTableName === null && <option className='hiddenOption' selected>Table Name</option> }
{ tables.filter(item => item.id !== table.id).map(table => (
     <option key={table.id} selected={selectedTableName === table.head} value={table.head} className='btn btn-light dropdownListItem' >{table.head}</option>
))}



</select>    </div>

}


<input value={attributeText} onChange={(e)=>setAttributeText(e.target.value)} placeholder='Type Attribute...' className="form-control" style={{ display: "inline" }} ></input>
<button className='btn btn-success modelSaveBtn '  type='submit' >Add Attribute</button>
</form>



    </Modal>

  
}










