import React from 'react';
import { Button, Input, Select, Collapse, Typography } from 'antd';
import { useForm } from 'react-hook-form';

const { Panel } = Collapse;
const { Text } = Typography;


type FieldType = 'String' | 'Number' | 'Nested';

interface Field {
  key: string;
  type: FieldType;
  fields?: Field[];
}


const emptyField: Field = {
  key: '',
  type: 'String',
  fields: [],
};


function updateField(fields: Field[], path: number[], prop: string, value: any): Field[] {
  if (path.length === 0) return fields;
  const [first, ...rest] = path;
  return fields.map((f, idx) => {
    if (idx !== first) return f;
    if (rest.length === 0) {
      return { ...f, [prop]: value };
    }
    return { ...f, fields: updateField(f.fields || [], rest, prop, value) };
  });
}


function addField(fields: Field[], path: number[]): Field[] {
  if (path.length === 0) return [...fields, { ...emptyField }];
  const [first, ...rest] = path;
  return fields.map((f, idx) => {
    if (idx !== first) return f;
    return { ...f, fields: addField(f.fields || [], rest) };
  });
}


function removeField(fields: Field[], path: number[]): Field[] {
  if (path.length === 1) {
    return fields.filter((_, idx) => idx !== path[0]);
  }
  const [first, ...rest] = path;
  return fields.map((f, idx) => {
    if (idx !== first) return f;
    return { ...f, fields: removeField(f.fields || [], rest) };
  });
}

const JsonSchemaBuilder: React.FC = () => {
  const { handleSubmit, watch, setValue } = useForm<{ fields: Field[] }>({
    defaultValues: { fields: [] },
  });

  const fields = watch('fields');

  
  const addTopField = () => {
    setValue('fields', [...(fields || []), { ...emptyField }]);
  };


  const changeField = (path: number[], prop: string, value: any) => {
    setValue('fields', updateField(fields || [], path, prop, value));
  };

  
  const addNested = (path: number[]) => {
    setValue('fields', addField(fields || [], path));
  };

  
  const deleteField = (path: number[]) => {
    setValue('fields', removeField(fields || [], path));
  };


  const showFields = (list: Field[], path: number[] = []) =>
    list.map((f, idx) => {
      const current = [...path, idx];
      return (
        <Panel header={f.key || 'New Field'} key={current.join('-')}>
          <Input
            placeholder="Field Name"
            value={f.key}
            onChange={e => changeField(current, 'key', e.target.value)}
            style={{ marginBottom: 8 }}
          />
          <Select
            value={f.type}
            onChange={val => changeField(current, 'type', val)}
            style={{ width: '100%', marginBottom: 8 }}
          >
            <Select.Option value="String">String</Select.Option>
            <Select.Option value="Number">Number</Select.Option>
            <Select.Option value="Nested">Nested</Select.Option>
          </Select>
          {f.type === 'Nested' && (
            <>
              <Button
                type="dashed"
                onClick={() => addNested(current)}
                style={{ marginBottom: 8 }}
              >
                Add Nested Field
              </Button>
              <Collapse>
                {showFields(f.fields || [], current)}
              </Collapse>
            </>
          )}
          <Button
            danger
            onClick={() => deleteField(current)}
            style={{ marginTop: 8 }}
          >
            Delete Field
          </Button>
        </Panel>
      );
    });

  const onSubmit = () => {
    console.log(fields);
  };

  return (
    <div style={{ display: 'flex', padding: 20, gap: 32, alignItems: 'flex-start' }}>
      <div style={{ flex: 3 }}>
        <Button type="primary" onClick={addTopField}>
          Add Field
        </Button>
        <Collapse style={{ marginTop: 20 }}>
          {showFields(fields || [])}
        </Collapse>
        <Button type="primary" onClick={handleSubmit(onSubmit)} style={{ marginTop: 20 }}>
          Submit
        </Button>
      </div>
      <div style={{
        flex: 2,
        background: '#fafafa',
        border: '1px solid #eee',
        borderRadius: 8,
        padding: 16,
        minWidth: 300,
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <Text strong style={{ marginBottom: 12, display: 'block' }}>
          JSON Preview:
        </Text>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0 }}>
          {JSON.stringify(fields, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default JsonSchemaBuilder;