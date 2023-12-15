import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormTransactionConfirmationComponent, FormTransactionService } from '@dsg/shared/feature/form-nuv';
import { INuverialBreadCrumb, NuverialBreadcrumbComponent } from '@dsg/shared/ui/nuverial';
import { of, switchMap } from 'rxjs';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormTransactionConfirmationComponent, NuverialBreadcrumbComponent],
  selector: 'dsg-confirmation',
  standalone: true,
  styleUrls: ['./confirmation.component.scss'],
  templateUrl: './confirmation.component.html',
})
export class ConfirmationComponent {
  public breadCrumbs: INuverialBreadCrumb[] = [{ label: 'Dashboard', navigationPath: '/dashboard' }];
  public externalTransactionId$ = this._formTransactionService.transaction$.pipe(
    switchMap(transactionModel => {
      return of(transactionModel.externalId);
    }),
  );

  constructor(private readonly _formTransactionService: FormTransactionService) {}
}
