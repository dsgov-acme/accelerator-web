import { ISchemaTreeDefinition, ISchemaTreeDefinitionAttributes } from './schema-tree.model';

export const SchemaTreeAttributesMock: ISchemaTreeDefinitionAttributes = {
  constraints: [],
  name: 'attribute1',
  type: 'String',
};

export const SchemaTreeDefinitionMock: ISchemaTreeDefinition = {
  attributes: [
    {
      constraints: [],
      name: 'firstName',
      type: 'String',
    },
    {
      constraints: [],
      entitySchema: 'CommonPersonalInformation',
      name: 'CommonPersonalInformation',
      schema: {
        attributes: [
          {
            constraints: [],
            name: 'address',
            type: 'String',
          },
          {
            constraints: [],
            name: 'city',
            type: 'String',
          },
        ],
        createdBy: 'user1',
        createdTimestamp: '2023-09-19T15:52:16.584283Z',
        description: 'description',
        id: 'id',
        key: 'CommonPersonalInformation',
        lastUpdatedBy: 'user1',
        lastUpdatedTimestamp: '2023-09-19T15:52:16.584283Z',
        name: 'Common Personal Information',
      },
      type: 'DynamicEntity',
    },
    {
      constraints: [],
      name: 'lastName',
      type: 'String',
    },
    {
      constraints: [],
      name: 'id',
      type: 'Document',
    },
    {
      concatenatedContentType: 'Document',
      constraints: [],
      contentType: 'Document',
      name: 'ids',
      type: 'List',
    },
    {
      concatenatedContentType: 'DynamicEntity-SomeSchema',
      constraints: [],
      contentType: 'DynamicEntity',
      entitySchema: 'SomeSchema',
      name: 'schemas',
      type: 'List',
    },
    {
      constraints: [],
      contentType: 'Document',
      name: 'ids2',
      type: 'List',
    },
  ],
  createdBy: 'user1',
  createdTimestamp: '2023-09-19T15:52:16.584283Z',
  description: 'description',
  id: 'id',
  key: 'FinancialBenefit',
  lastUpdatedBy: '',
  lastUpdatedTimestamp: '2023-09-19T15:52:16.584283Z',
  name: 'Financial Benefit',
};
