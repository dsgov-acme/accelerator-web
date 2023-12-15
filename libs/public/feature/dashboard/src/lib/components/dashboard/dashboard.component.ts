import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { PublicFeatureProfileService } from '@dsg/public/feature/profile';
import { PagingRequestModel } from '@dsg/shared/data-access/http';
import { UserModel } from '@dsg/shared/data-access/user-api';
import { ITransaction, TransactionModel, WorkApiRoutesService } from '@dsg/shared/data-access/work-api';
import {
  INuverialPanel,
  INuverialSelectOption,
  NuverialAccordionComponent,
  NuverialButtonComponent,
  NuverialIconComponent,
  NuverialSelectComponent,
  NuverialSelectorButtonDropdownComponent,
  NuverialSnackBarService,
  NuverialSpinnerComponent,
} from '@dsg/shared/ui/nuverial';
import { BehaviorSubject, EMPTY, Observable, catchError, map, switchMap, tap } from 'rxjs';
import { DashboardService } from '../../services';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    NuverialButtonComponent,
    NuverialSpinnerComponent,
    NuverialIconComponent,
    NuverialSelectComponent,
    NuverialSelectorButtonDropdownComponent,
    NuverialAccordionComponent,
  ],
  selector: 'dsg-dashboard',
  standalone: true,
  styleUrls: ['./dashboard.component.scss'],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnDestroy {
  public pastApplicationPanel: INuverialPanel[] = [{ expanded: true, panelTitle: 'Past Applications' }];
  public profile$: Observable<UserModel | null> = this._profileService.getProfile$();
  private readonly _activeTransactionsPagination = new BehaviorSubject<PagingRequestModel>(
    new PagingRequestModel({
      pageNumber: 0,
      pageSize: 20,
      sortBy: 'lastUpdatedTimestamp',
      sortOrder: 'DESC',
    }),
  );
  private readonly _pastTransactionsPagination = new BehaviorSubject<PagingRequestModel>(
    new PagingRequestModel({
      pageNumber: 0,
      pageSize: 20,
      sortBy: 'lastUpdatedTimestamp',
      sortOrder: 'DESC',
    }),
  );
  public totalActiveTransactions = 0;
  public totalPastTransactions = 0;
  public loadingActiveTransactions = false;
  public loadingPastTransactions = false;

  public activeTransactions$: Observable<TransactionModel[]> = this._activeTransactionsPagination.asObservable().pipe(
    switchMap(pagination => this._dashboardService.loadActiveTransactions$(pagination)),
    switchMap(_ => this._dashboardService.activeTransactions$),
    tap(transactionPaginationResponse => {
      this.totalActiveTransactions = transactionPaginationResponse.pagingMetadata.totalCount;
    }),
    map(transactionPaginationResponse => {
      return transactionPaginationResponse.items;
    }),
    tap(_ => (this.loadingActiveTransactions = false)),
  );
  public pastTransactions$: Observable<TransactionModel[]> = this._pastTransactionsPagination.asObservable().pipe(
    switchMap(pagination => this._dashboardService.loadPastTransactions$(pagination)),
    switchMap(_ => this._dashboardService.pastTransactions$),
    tap(transactionPaginationResponse => {
      this.totalPastTransactions = transactionPaginationResponse.pagingMetadata.totalCount;
    }),
    map(transactionPaginationResponse => {
      return transactionPaginationResponse.items;
    }),
    tap(_ => (this.loadingPastTransactions = false)),
  );

  public selectOption: INuverialSelectOption[] = [
    {
      disabled: false,
      displayTextValue: 'Financial Benefit',
      key: 'FinancialBenefit',
      selected: false,
    },
    {
      disabled: false,
      displayTextValue: 'Unemployment Insurance Proof',
      key: 'UnemploymentInsurance',
      selected: false,
    },
  ];

  constructor(
    private readonly _workApiRoutesService: WorkApiRoutesService,
    private readonly _router: Router,
    private readonly _nuverialSnackBarService: NuverialSnackBarService,
    private readonly _profileService: PublicFeatureProfileService,
    private readonly _dashboardService: DashboardService,
  ) {}

  public ngOnDestroy() {
    this._dashboardService.cleanUp();
  }

  public loadMoreActiveApplications(): void {
    this.loadingActiveTransactions = true;
    const nextTransactionPagination = this._activeTransactionsPagination.value;
    nextTransactionPagination.pageNumber++;
    this._activeTransactionsPagination.next(nextTransactionPagination);
  }

  public loadMorePastApplications(): void {
    this.loadingPastTransactions = true;
    const nextTransactionPagination = this._pastTransactionsPagination.value;
    nextTransactionPagination.pageNumber++;
    this._pastTransactionsPagination.next(nextTransactionPagination);
  }

  public trackByFn(_index: number, item: unknown) {
    return item;
  }

  public createNewTransaction(selectItem: INuverialSelectOption) {
    this._workApiRoutesService
      .createTransaction$(selectItem.key)
      .pipe(
        tap(transaction => this._router.navigate([`/dashboard/transaction/${transaction.id}`])),
        catchError(_error => this._nuverialSnackBarService.notifyApplicationError() && EMPTY),
      )
      .subscribe();
  }

  public hasRejectedDocuments(transaction: ITransaction): boolean {
    if (transaction && transaction.customerProvidedDocuments) {
      return transaction.customerProvidedDocuments.some(doc => doc.reviewStatus === 'REJECTED');
    }

    return false;
  }
}
