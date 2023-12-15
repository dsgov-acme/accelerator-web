import { Injectable } from '@angular/core';
import { CanDeactivate, UrlTree } from '@angular/router';
import { FormBuilderComponent } from '@formio/angular';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CanDeactivateFormBuilder<T extends { formioComponent: FormBuilderComponent | undefined }> implements CanDeactivate<T> {
  public canDeactivate(component: T): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (component.formioComponent?.formio?.dialog) {
      component.formioComponent.formio.dialog.close();
    }

    return true;
  }
}
