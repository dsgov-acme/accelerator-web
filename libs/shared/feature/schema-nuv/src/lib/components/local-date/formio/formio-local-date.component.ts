import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NuverialIconComponent } from '@dsg/shared/ui/nuverial';
import { FormioBaseCustomComponent } from '../../base';
import { AttributeBaseProperties } from '../../base/formio/formio-attribute-base.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NuverialIconComponent],
  selector: 'dsg-formio-local-date',
  standalone: true,
  styleUrls: ['./formio-local-date.component.scss'],
  templateUrl: '../../base/formio/formio-attribute-base.component.html',
})
export class FormioLocalDateComponent extends FormioBaseCustomComponent<string, AttributeBaseProperties> {}
