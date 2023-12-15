import { Injector } from '@angular/core';
import { FormioCustomComponentInfo, registerCustomFormioComponent } from '@formio/angular';
import {
  DEFAULT_COMPONENT_OPTIONS,
  defaultCompleteConditionalPanelConfiguration,
  defaultConditionalPanelDocumentationLink,
  defaultDisplayBasicConfiguration,
  defaultDisplayPanelConfiguration,
  defaultFieldLabelConfiguration,
  defaultFieldWidthConfiguration,
  defaultHideConditionalConfiguration,
  defaultPanelTabsConfiguration,
} from '../../../base';
import { FormioFileUploadComponent } from './formio-file-upload.component';

/**
 * Formio custom component documentation links
 * Angular formio custom components https://github.com/formio/angular/wiki/Custom-Components-with-Angular-Elements#define-the-options
 * Form builder https://help.form.io/developers/form-builder#overriding-behavior
 * Form builder example json configurations https://formio.github.io/formio.js/app/examples/custombuilder.html
 */

const selector = 'nuverial-file-upload-wc';

const schema = {
  className: 'flex-full',
  key: 'documents',
  props: {
    label: 'Documents',
  },
};

const COMPONENT_OPTIONS: FormioCustomComponentInfo = {
  ...DEFAULT_COMPONENT_OPTIONS,
  editForm, // Optional: define the editForm of the field. Default: the editForm of a textfield
  group: 'nuverialAdvanced', // Build Group
  icon: 'file', // Icon
  schema,
  selector, // custom selector. Angular Elements will create a custom html tag with this selector
  title: 'File Upload', // Title of the component
  type: 'nuverialFileUpload', // custom type. Formio will identify the field with this type.
  weight: 0, // Optional: define the weight in the builder group
};

export function registerFileUploadComponent(injector: Injector) {
  if (!customElements.get(selector)) {
    registerCustomFormioComponent(COMPONENT_OPTIONS, FormioFileUploadComponent, injector);
  }
}

function editForm() {
  return {
    components: [
      {
        // tabs
        ...defaultPanelTabsConfiguration,
        components: [
          {
            // Display Panel
            ...defaultDisplayPanelConfiguration,
            components: [
              {
                ...defaultDisplayBasicConfiguration,
                components: [
                  { ...ContentAreaDisplayConfiguration },
                  { ...defaultFieldLabelConfiguration },
                  { ...defaultFieldWidthConfiguration },
                  { ...multipleFileUploadCheckboxConfiguration },
                  { ...fileUploadFieldsConfiguration },
                ],
              },
            ],
          },
          {
            // Conditional Panel
            ...conditionalPanel,
          },
        ],
      },
    ],
  };
}

const ContentAreaDisplayConfiguration = {
  input: true,
  key: 'props.content',
  label: 'Content',
  tooltip: 'The HTML template for the result data items.',
  type: 'textarea',
  weight: 0,
  wysiwyg: {
    sanitize: true,
    toolbar: {
      items: [
        'undo',
        'redo',
        '|',
        'heading',
        '|',
        'fontfamily',
        'fontsize',
        'fontColor',
        // 'fontBackgroundColor',
        '|',
        'bold',
        'italic',
        '|',
        'link',
        'uploadImage',
        'blockQuote',
        'codeBlock',
        // '|',
        // 'alignment',
        '|',
        'bulletedList',
        'numberedList',
        'todoList',
        'outdent',
        'indent',
      ],
    },
  },
};

const multipleFileUploadCheckboxConfiguration = {
  input: true,
  key: 'props.multiple',
  label: 'Multi-file Mode',
  tableView: false,
  tooltip: 'Enables uploading multiple files at once. When enabled, the component is restricted to one document entry that receives multiple files.',
  type: 'checkbox',
  weight: 0,
};

const fileUploadFieldsConfiguration = {
  components: [
    {
      allowCalculateOverride: true,
      calculateValue: {
        cat: [
          {
            var: 'data.key',
          },
          '.',
          {
            ['_camelCase']: [{ var: 'row.props.label' }],
          },
        ],
      },
      disabled: false,
      input: true,
      key: 'key',
      label: 'Key',
      props: {
        allowedSchemaTypes: ['Document', 'List<Document>'],
        buttonLabel: 'Select Key',
      },
      type: 'nuverialSchemaKeySelector',
    },
    {
      disabled: false,
      input: true,
      key: 'props.label',
      label: 'Document Title',
      type: 'textfield',
    },
    {
      disabled: false,
      input: true,
      key: 'props.maxFileSize',
      label: 'Max Size (MB)',
      type: 'textfield',
    },
    {
      disabled: false,
      input: true,
      key: 'props.required',
      label: 'Required',
      type: 'checkbox',
    },
    {
      defaultValue: true,
      disabled: true,
      input: true,
      key: 'input',
      type: 'hidden',
    },
  ],
  disableAddingRemovingRows: false,
  input: true,
  key: 'components',
  label: 'Documents',
  reorder: false,
  type: 'datagrid',
  validate: {
    custom: 'valid = data.props.multiple ? input.length === 1 : true;',
    customMessage: 'Only one document entry is allowed in multi-file mode',
  },
  weight: 0,
};

const conditionalPanel = {
  ...defaultCompleteConditionalPanelConfiguration,
  components: [
    {
      ...defaultConditionalPanelDocumentationLink,
    },
    {
      ...defaultHideConditionalConfiguration,
    },
  ],
};
