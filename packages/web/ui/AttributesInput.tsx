import React, { useEffect, useState } from 'react';

import styled from '@emotion/styled';

import TextInput from '../ui/TextInput';

const AttributeInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const AttributeInputRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

type Attribute = {
  key: string;
  value: string;
};

type AttributesInputProps = {
  onChange?: (attributes: object) => void;
};

export const AttributesInput: React.FC<AttributesInputProps> = ({
  onChange
}: AttributesInputProps) => {
  const getEmptyAttr = (): Attribute => ({
    key: '',
    value: ''
  });

  const [attributes, setAttributes] = useState<Attribute[]>([getEmptyAttr()]);

  const capitalise = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  useEffect(() => {
    const attrs = attributes.filter(
      (item) =>
        item.key && item.key.length > 0 && item.value && item.value.length > 0
    );

    const object = {};

    attrs.forEach((attr: Attribute) => {
      object[attr.key] = attr.value;
    });

    onChange ? onChange(object) : null;
  }, [attributes]);

  const addAttr = () => {
    setAttributes([...attributes, getEmptyAttr()]);
  };

  const removeLastAttrIfShould = (value: string, index: number) => {
    if (value.length < 1) {
      const lastIndex = attributes.length - 1;
      if (index < lastIndex && attributes[lastIndex].key.length < 1) {
        attributes.pop();
      }
      setAttributes([...attributes]);
    }
  };

  return (
    <AttributeInputContainer>
      {attributes.map((attr: Attribute, index: number) => (
        <AttributeInputRow key={index}>
          <TextInput
            placeholder="Colour, rarity, etc."
            value={attr.key}
            onChange={(e) => {
              const value = e.target.value;

              attributes[index].key = capitalise(value);
              setAttributes([...attributes]);

              removeLastAttrIfShould(value, index);
            }}
          />
          <TextInput
            placeholder="Value"
            value={attr.value}
            onChange={(e) => {
              const value = e.target.value;

              attributes[index].value = capitalise(value);
              setAttributes([...attributes]);

              if (value.length > 0) {
                if (attr.key.length > 0 && index == attributes.length - 1) {
                  addAttr();
                }
              } else {
                removeLastAttrIfShould(value, index);
              }
            }}
          />
        </AttributeInputRow>
      ))}
    </AttributeInputContainer>
  );
};

export default AttributesInput;
