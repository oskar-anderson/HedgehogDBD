import { useState } from 'react';
import { useApplicationState } from '../../Store';
import { UiTableRowDatatype } from './TableRow';
import { useParams } from 'react-router-dom';

type Row = {
  rowName: string;
  rowDatatype: UiTableRowDatatype;
  rowAttributes: string;
}

type AttributeSelectProps = {
  row: Row,
  handleChange: (newValue: string) => void
}

export default function AttributeSelect({
  row,
  handleChange
}: AttributeSelectProps) {
  const { id } = useParams();
  const tables = useApplicationState(state => (
    state.schemaTables.filter(table => table.id !== id)
  ));

  const attributeTypes: string[] = ['PK', 'FK'];

  const [
    selectedAttributeType,
    setSelectedAttributeType
  ] = useState<string>(row?.rowAttributes ? row.rowAttributes.slice(0, 2) : '');

  const getTableName = () => {
    return row.rowAttributes.split('"')[1]
  };

  const [
    FKTableName,
    setFKTableName
  ] = useState<string>(row?.rowAttributes?.slice(0, 2) === 'FK' ? getTableName() : '');

  const generateAttributeValue = (tableName?: string): string => {
    return `FK("${tableName}")`;
  };

  const changeAttributeType = (newType: string): void => {
    setSelectedAttributeType(newType);
    if (newType === 'PK') {
      handleChange(newType);
    } else if (newType === 'FK') {
      handleChange(generateAttributeValue());
    } else {
      handleChange('');
    }
  };

  function changeFKTableName(selectedTable: string): void {
    setFKTableName(selectedTable)
    handleChange(generateAttributeValue(selectedTable));
  }

  function checkIfDisabled(): boolean {
    return row?.rowAttributes?.slice(0, 2) !== 'FK'
  }

  return (
    <div className="input-group mb-3" style={{ flexWrap: 'nowrap' }}>
      <input
        className="form-control w-25"
        style={{ display: "inline", width: "10%" }}
        value={selectedAttributeType}
        list="type-suggestions"
        type="search"
        onChange={(event) => {
          changeAttributeType((event.target as HTMLInputElement).value as string)
        }}
      />

      <datalist id="type-suggestions">
        { attributeTypes.map(type => (
          <option
            key={type}
            value={type}
          >
            {type}
          </option>
        ))}
      </datalist>

      <datalist id="table-suggestions">
        { tables.map(table => (
          <option value={table.head} key={table.id} />
        ))}
      </datalist>

      <input
        disabled={checkIfDisabled()}
        className="form-control"
        style={{ display: "inline", width: "80%" }}
        list="table-suggestions"
        type="search"
        value={selectedAttributeType === "FK"
          ? FKTableName
          : ''}
        placeholder={selectedAttributeType === "FK" ? 'Select table' : ''}
        onChange={(event) => {
          changeFKTableName((event.target as HTMLInputElement).value)
        }}
      />
    </div>
  );
}