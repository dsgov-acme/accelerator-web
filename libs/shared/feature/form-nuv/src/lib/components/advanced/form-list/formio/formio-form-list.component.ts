import { Components } from '@formio/angular';
import { EditForm } from './formio-form-list.const';

const NestedComponent = Components.components.nested;

export class FormioFormListComponent extends NestedComponent {
  public static editForm = EditForm;
  public static override schema(...extend: []) {
    return NestedComponent.schema(
      {
        components: [],
        customClass: 'nested-component',
        input: false,
        label: 'Form list',
        type: 'nuverialFormList',
      },
      ...extend,
    );
  }

  public static get builderInfo() {
    return {
      group: 'nuverialAdvanced',
      icon: 'list-alt',
      schema: FormioFormListComponent.schema(),
      title: 'Form list',
      weight: 0,
    };
  }
}
