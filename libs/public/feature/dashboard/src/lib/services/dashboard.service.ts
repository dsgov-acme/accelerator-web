import { Injectable } from '@angular/core';
import { PagingRequestModel, PagingResponseModel } from '@dsg/shared/data-access/http';
import { FormConfigurationModel, ITransactionsPaginationResponse, TransactionModel, WorkApiRoutesService } from '@dsg/shared/data-access/work-api';
import { NuverialSnackBarService } from '@dsg/shared/ui/nuverial';
import { BehaviorSubject, Observable, catchError, concatMap, from, map, of, switchMap, tap, toArray } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly _transactionDefinitionFormModelMap: Map<string, FormConfigurationModel> = new Map();

  private readonly _activeTransactions$ = new BehaviorSubject<ITransactionsPaginationResponse<TransactionModel>>({
    items: [],
    pagingMetadata: new PagingResponseModel(),
  });
  private readonly _pastTransactions$ = new BehaviorSubject<ITransactionsPaginationResponse<TransactionModel>>({
    items: [],
    pagingMetadata: new PagingResponseModel(),
  });

  public activeTransactions$: Observable<ITransactionsPaginationResponse<TransactionModel>> = this._activeTransactions$.asObservable();
  public pastTransactions$: Observable<ITransactionsPaginationResponse<TransactionModel>> = this._pastTransactions$.asObservable();

  private getTransactions$(isCompleted: boolean, pagination: PagingRequestModel): Observable<ITransactionsPaginationResponse<TransactionModel>> {
    return this._workApiRoutesService.getAllTransactionsForUser$([{ field: 'isCompleted', value: isCompleted }], pagination).pipe(
      switchMap(transactionWithPagination =>
        from(transactionWithPagination.items).pipe(
          concatMap(transactionItem => {
            const transactionModel = new TransactionModel(transactionItem);
            if (transactionModel.rejectedDocuments.length > 0 && !this._transactionDefinitionFormModelMap.has(transactionModel.transactionDefinitionKey)) {
              return this.getFormConfigurationById$(transactionModel.id).pipe(
                catchError(_error => of(null)),
                map(formModel => {
                  if (formModel) {
                    this._transactionDefinitionFormModelMap.set(transactionModel.transactionDefinitionKey, formModel);
                    transactionModel.rejectedDocuments = transactionModel.rejectedDocuments.map(rejectedDocumentItem =>
                      formModel?.getComponentLabelByKey(rejectedDocumentItem),
                    );
                  }

                  return transactionModel;
                }),
              );
            } else {
              transactionModel.rejectedDocuments = transactionModel.rejectedDocuments.map(rejectedDocumentItem => {
                const componentLabel = this._transactionDefinitionFormModelMap
                  .get(transactionModel.transactionDefinitionKey)
                  ?.getComponentLabelByKey(rejectedDocumentItem);

                return componentLabel !== undefined ? componentLabel : rejectedDocumentItem;
              });

              return of(transactionModel);
            }
          }),
          toArray(),
          map(items => ({ items, pagingMetadata: transactionWithPagination.pagingMetadata })),
        ),
      ),
      tap(transactionWithPagination => {
        if (isCompleted) {
          this._pastTransactions$.next({
            items: [...this._pastTransactions$.value.items, ...transactionWithPagination.items],
            pagingMetadata: transactionWithPagination.pagingMetadata,
          });
        } else {
          this._activeTransactions$.next({
            items: [...this._activeTransactions$.value.items, ...transactionWithPagination.items],
            pagingMetadata: transactionWithPagination.pagingMetadata,
          });
        }
      }),
      catchError(_error => {
        this._nuverialSnackBarService.notifyApplicationError();

        return of({
          items: [],
          pagingMetadata: new PagingResponseModel({
            nextPage: '',
            pageNumber: 1,
            pageSize: 0,
            totalCount: 0,
          }),
        });
      }),
    );
  }

  /**
   * loads the active form configuration of a given transaction
   * @param transactionId ID of the transaction
   * @returns an observable of the form configuration
   */
  public getFormConfigurationById$(transactionId: string): Observable<FormConfigurationModel> {
    return this._workApiRoutesService.getFormByTransactionId$(transactionId).pipe(map(formModel => formModel.formConfigurationModel));
  }

  constructor(private readonly _workApiRoutesService: WorkApiRoutesService, private readonly _nuverialSnackBarService: NuverialSnackBarService) {}

  public loadActiveTransactions$(pagination: PagingRequestModel): Observable<ITransactionsPaginationResponse<TransactionModel>> {
    return this.getTransactions$(false, pagination);
  }

  public loadPastTransactions$(pagination: PagingRequestModel): Observable<ITransactionsPaginationResponse<TransactionModel>> {
    return this.getTransactions$(true, pagination);
  }

  public cleanUp(): void {
    this._activeTransactions$.next({
      items: [],
      pagingMetadata: new PagingResponseModel(),
    });
    this._pastTransactions$.next({
      items: [],
      pagingMetadata: new PagingResponseModel(),
    });
  }
}
