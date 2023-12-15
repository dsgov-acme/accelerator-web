import { Components } from '@formio/angular';
import { FormioFormListComponent } from './formio-form-list.component';

/**
 * Formio custom component documentation links
 * Angular formio custom components https://github.com/formio/angular/wiki/Custom-Components-with-Angular-Elements#define-the-options
 * FormIO panel component example: https://github.com/formio/formio.js/blob/master/src/components/panel/Panel.js
 * Form builder example json configurations https://formio.github.io/formio.js/app/examples/custombuilder.html
 */

export function registerObjectListComponent() {
  Components.setComponent('nuverialFormList', FormioFormListComponent);
}
