import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PagingRequestModel, PagingResponseModel } from '@dsg/shared/data-access/http';
import {
  FormConfigurationModel,
  FormioConfigurationTestMock,
  TransactionMock2,
  TransactionMock3,
  TransactionModel,
  WorkApiRoutesService,
} from '@dsg/shared/data-access/work-api';
import { NuverialSnackBarService } from '@dsg/shared/ui/nuverial';
import { MockProvider, ngMocks } from 'ng-mocks';
import { of, throwError } from 'rxjs';
import { DashboardService } from './dashboard.service';

const formConfigurationModel = new FormConfigurationModel(FormioConfigurationTestMock);

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(WorkApiRoutesService, {
          getAllTransactionsForUser$: jest
            .fn()
            .mockImplementation(() =>
              of({ items: [new TransactionModel(TransactionMock2), new TransactionModel(TransactionMock3), new TransactionModel(TransactionMock3)] }),
            ),
          getFormByTransactionId$: jest.fn().mockImplementation(() => of(formConfigurationModel)),
        }),
        MockProvider(NuverialSnackBarService),
      ],
    });
    service = TestBed.inject(DashboardService);
  });

  it('should load active transactions', fakeAsync(() => {
    let emittedTransactions: TransactionModel[] | undefined;
    const wmService = TestBed.inject(WorkApiRoutesService);
    const spy = jest.spyOn(wmService, 'getAllTransactionsForUser$');
    jest.spyOn(service as any, 'getFormConfigurationById$').mockReturnValue(of(formConfigurationModel));

    const pagination = new PagingRequestModel();
    service.loadActiveTransactions$(pagination).subscribe(result => {
      emittedTransactions = result.items;
    });

    tick();

    expect(spy).toBeCalledWith([{ field: 'isCompleted', value: false }], pagination);
    expect(emittedTransactions).toBeDefined();
    expect(emittedTransactions?.length).toBe(3);
  }));

  it('should load past transactions', fakeAsync(() => {
    let emittedTransactions: TransactionModel[] | undefined;
    const wmService = TestBed.inject(WorkApiRoutesService);
    const spy = jest.spyOn(wmService, 'getAllTransactionsForUser$');
    jest.spyOn(service as any, 'getFormConfigurationById$').mockReturnValue(of(formConfigurationModel));

    const pagination = new PagingRequestModel();
    service.loadPastTransactions$(pagination).subscribe(result => {
      emittedTransactions = result.items;
    });

    tick();

    expect(spy).toBeCalledWith([{ field: 'isCompleted', value: true }], pagination);
    expect(emittedTransactions).toBeDefined();
    expect(emittedTransactions?.length).toBe(3);
  }));

  it('should set the documents labels based on the form configuration', fakeAsync(() => {
    let emittedTransactions: TransactionModel[] | undefined;
    jest.spyOn(service as any, 'getFormConfigurationById$').mockReturnValue(of(formConfigurationModel));

    service.loadActiveTransactions$(new PagingRequestModel()).subscribe(result => {
      emittedTransactions = result.items;
    });

    tick();

    if (emittedTransactions) {
      expect(emittedTransactions[0].rejectedDocuments.length).toBe(0);
      expect(emittedTransactions[1].rejectedDocuments).toEqual(['Proof of Income/Tax']);
      expect(emittedTransactions[2].rejectedDocuments).toEqual(['Proof of Income/Tax']);
    }
  }));

  it('should handle get all transactions error', async () => {
    const wmService = ngMocks.findInstance(WorkApiRoutesService);
    const spy = jest.spyOn(wmService, 'getAllTransactionsForUser$').mockImplementation(() => throwError(() => new Error('an error')));
    service.loadActiveTransactions$(new PagingRequestModel()).subscribe();

    expect(spy).toHaveBeenCalled();
  });

  it('should reset _activeTransactions$ and _pastTransactions$ on cleanUp', () => {
    const activeTransactionsSpy = jest.spyOn(service['_activeTransactions$'], 'next');
    const pastTransactionsSpy = jest.spyOn(service['_pastTransactions$'], 'next');

    service.cleanUp();

    expect(activeTransactionsSpy).toHaveBeenCalledWith({
      items: [],
      pagingMetadata: new PagingResponseModel(),
    });

    expect(pastTransactionsSpy).toHaveBeenCalledWith({
      items: [],
      pagingMetadata: new PagingResponseModel(),
    });
  });
});
