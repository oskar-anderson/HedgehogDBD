import React, { useState } from 'react';
import 'react-responsive-modal/styles.css';
import Modal  from 'react-responsive-modal';
import '../../styles/attributeModel.css'
import { useApplicationState } from '../../Store';
import VmTable from '../../model/viewModel/VmTable';
import DomainTable from '../../model/domain/DomainTable';
import { cn } from '../../utils/conditionalClassNames';


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
       open : boolean 
       setOpen : React.Dispatch<React.SetStateAction<boolean>>
       table : DomainTable
}




enum PrimaryAttributes {
  Primary_Key = "Primary_Key" ,
  Foreign_Key = "Foreign_Key"
}
enum Lists {
  primaryList = "Primary_List" ,
  tableNames = "Table_Names"
}

export const CreateAttributeModel  : React.FC<CreateTableProps> = ({open , setOpen , table  })=>{
  const onOpenModal = () => setOpen(true) ;
  const onCloseModal = () => setOpen(false);
  const [openedLists , setOpenedLists ] = useState<Lists[]>([])
  const [selectedPrimaryAttribute , setSelectedPrimaryAttribute ] = useState<PrimaryAttributes | null>(null)
  const [selectedTableName , setSelectedTableName ] = useState<null | string >(null)
  const tables = useApplicationState(state => state.schemaTables);


const toggleList = (list: Lists)=>{
  openedLists.includes(list) ? setOpenedLists(val=>val.filter(item=>item !== list)) : setOpenedLists(val=>[...val , list])
}


    return        <Modal  classNames={{modal : "createAttributeModal card" , modalContainer : "createAttributeModalContainer" }}   open={open} onClose={onCloseModal} center>


<div className='modelHeader' >
<h3>Add Attribute</h3>
<h5>Select attributes to add</h5>
</div>



<div className="dropdown primaryDropdown">

<div className='listCategory' >  


<select onChange={e=>setSelectedPrimaryAttribute(e.target.value as PrimaryAttributes)} className="form-select" aria-label="Select list">
 { selectedPrimaryAttribute === null && <option className='hiddenOption' selected>PK / FK</option> }
  <option value={PrimaryAttributes.Primary_Key}>Primary Attribute</option>
  <option value={PrimaryAttributes.Foreign_Key}>Foreign Key</option>
</select>



  </div>
<div className='listCategory' >  

{ selectedPrimaryAttribute === PrimaryAttributes.Foreign_Key &&  <select   onChange={e=>setSelectedTableName(e.target.value)} className="form-select" aria-label="Select list">
 { selectedTableName === null && <option className='hiddenOption' selected>Table Name</option> }
{ tables.filter(item => item.id !== table.id).map(table => (
     <option key={table.id} selected={selectedTableName === table.head} value={table.head} className='btn btn-light dropdownListItem' >{table.head}</option>
))}



</select>
}


  {/* {
      selectedPrimaryAttribute === PrimaryAttributes.Foreign_Key && <>
  <button onClick={()=>toggleList(Lists.tableNames) } className="btn btn-dark primaryAttDropdownButton " type="button"  >
<span>  Table Names</span>
    <i style={{transform : openedLists.includes(Lists.tableNames) ?   'rotate(180deg)'  : undefined }} className="bi mx-2 bi-caret-down-fill"></i>
  </button>

{ openedLists.includes(Lists.tableNames)  && tables.filter(item => item.id !== table.id).map(table => (
     <button key={table.id} className='btn btn-light dropdownListItem' >{table.head}</button>
))

}


      </>
    }
     */}
    
    </div>
<input placeholder='Type Attribute...' className="form-control" style={{ display: "inline" }} ></input>
<button className='btn btn-success modelSaveBtn' >Add Attribute</button>
</div>



    </Modal>

  
}










