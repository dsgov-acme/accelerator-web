import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatePipe } from '@angular/common';
import { By } from '@angular/platform-browser';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { TransactionListMock, TransactionListSchemaMock, TransactionPrioritiesMock, WorkApiRoutesService } from '@dsg/shared/data-access/work-api';
import { EnumerationsStateService } from '@dsg/shared/feature/app-state';
import { NuverialSnackBarService } from '@dsg/shared/ui/nuverial';
import { LoggingService } from '@dsg/shared/utils/logging';
import { MockProvider, ngMocks } from 'ng-mocks';
import { of } from 'rxjs';
import { TransactionsDashboardComponent } from './transactions-dashboard.component';

describe('TransactionsDashboardComponent', () => {
  let component: TransactionsDashboardComponent;
  let fixture: ComponentFixture<TransactionsDashboardComponent>;
  let activatedRoute: ActivatedRoute;
  let activatedRouteSpy: { snapshot: any };
  let mockWorkApiRoutesService: Partial<WorkApiRoutesService>;

  beforeAll(() => {
    TestBed.resetTestEnvironment();
    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  beforeEach(async () => {
    activatedRouteSpy = {
      snapshot: {
        queryParams: convertToParamMap({
          pageNumber: 3,
          pageSize: 10,
          sortBy: 'priority',
          sortOrder: 'ASC',
        }),
        url: [{ path: 'tax-wage-requests' }],
      },
    };
    mockWorkApiRoutesService = {
      getAllTransactionsForUser$: jest.fn().mockImplementation(() => of(TransactionListSchemaMock)),
    };

    await TestBed.configureTestingModule({
      imports: [TransactionsDashboardComponent, NoopAnimationsModule],
      providers: [
        MockProvider(LoggingService),
        {
          provide: ActivatedRoute,
          useValue: activatedRouteSpy,
        },
        MockProvider(Router),
        MockProvider(NuverialSnackBarService),
        { provide: WorkApiRoutesService, useValue: mockWorkApiRoutesService },
        MockProvider(EnumerationsStateService, {
          getDataFromEnum$: jest.fn().mockReturnValue(of(TransactionPrioritiesMock.get('MEDIUM'))),
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('_getTransactionsList', () => {
    it('should load the transaction list', async () => {
      fixture.componentInstance.transactionsList$.subscribe(_ => {
        const service = ngMocks.findInstance(WorkApiRoutesService);
        const spy = jest.spyOn(service, 'getAllTransactionsForUser$');
        expect(spy).toBeCalled();
      });
    });

    it('should handle error loading transaction list', async () => {
      const service = ngMocks.findInstance(WorkApiRoutesService);
      const spy = jest.spyOn(service, 'getAllTransactionsForUser$').mockImplementation(() => {
        throw Error();
      });
      const snackBarService = ngMocks.findInstance(NuverialSnackBarService);
      const errorSpy = jest.spyOn(snackBarService, 'notifyApplicationError');

      fixture.componentInstance.transactionsList$.subscribe();
      expect(spy).toBeCalled();
      expect(errorSpy).toBeCalledWith();
    });

    it('should apply date pipes', async () => {
      fixture.componentInstance.transactionsList$.subscribe(_ => {
        const service = ngMocks.findInstance(WorkApiRoutesService);
        const spy = jest.spyOn(service, 'getAllTransactionsForUser$');
        expect(fixture.componentInstance['_applyDatePipes']).toHaveBeenCalled();
        expect(spy).toBeCalled();
      });
    });

    it('should set the paging metadata', async () => {
      fixture.componentInstance.transactionsList$.subscribe(_ => {
        fixture.componentInstance.pagingMetadata = TransactionListSchemaMock.pagingMetadata;
        expect(fixture.componentInstance.pagingMetadata.pageNumber).toEqual(activatedRoute.snapshot.queryParams['page']);
        expect(fixture.componentInstance.pagingMetadata.totalCount).toEqual(200);
      });
    });

    it('should set the paging call the _buildDataSourceTable()', async () => {
      fixture.componentInstance.transactionsList$.subscribe(_ => {
        const methodSpy = jest.spyOn(fixture.componentInstance as any, '_buildDataSourceTable');
        expect(methodSpy).toBeCalled();
      });
    });

    it('should build the table data', async () => {
      fixture.componentInstance.transactionList = TransactionListMock;
      await fixture.componentInstance['_buildDataSourceTable']();
      expect(fixture.componentInstance.dataSourceTable.data.length).toEqual(fixture.componentInstance.transactionList.length);
    });

    it('should not set table data when there is no transaction data', async () => {
      if (!fixture.componentInstance.transactionList) {
        expect(fixture.componentInstance.dataSourceTable.data.length).toEqual(0);
      }
    });

    it('should set the page the user clicked on', async () => {
      fixture.componentInstance.pagingMetadata = TransactionListSchemaMock.pagingMetadata;
      fixture.autoDetectChanges();
      const nextPage = fixture.debugElement.query(By.css('.mat-mdc-paginator-navigation-next'));
      const methodSpy = jest.spyOn(fixture.componentInstance, 'setPage');
      nextPage.nativeElement.click();
      expect(methodSpy).toHaveBeenCalled();
    });

    it('should sort table by date created', () => {
      const sortHeaders = fixture.debugElement.queryAll(By.css('th[mat-header-cell]'));
      fixture.autoDetectChanges();

      const dateCreatedSortHeader = sortHeaders.find(header => header.nativeElement.textContent.trim() === 'Date  Created');
      const methodSpy = jest.spyOn(fixture.componentInstance, 'sortData');
      expect(dateCreatedSortHeader).toBeTruthy();

      dateCreatedSortHeader?.nativeElement.click();
      expect(methodSpy).toHaveBeenCalled();
    });

    it('should apply date pipes in the format of "MM/dd/yyyy"', async () => {
      fixture.componentInstance.transactionList = TransactionListMock;
      const pipe = new DatePipe('en');
      fixture.componentInstance['_applyDatePipes']();
      fixture.componentInstance.transactionList.forEach(item => {
        expect(item.lastUpdatedTimestamp).toBe(pipe.transform(item.lastUpdatedTimestamp, 'MM/dd/yyyy'));
      });
    });

    it('should return raw dates if the datepipe fails', async () => {
      fixture.componentInstance.transactionList = TransactionListMock;
      jest.spyOn(fixture.componentInstance['_datePipe'], 'transform').mockImplementation(() => {
        return null;
      });
      fixture.componentInstance['_applyDatePipes']();
      expect(fixture.componentInstance.transactionList).toBe(TransactionListMock);
    });

    it('should clear the search input', () => {
      component.searchInput.setValue('test');
      fixture.detectChanges();

      const containerDebugElement = fixture.debugElement.query(By.css('nuverial-text-input'));
      expect(containerDebugElement).toBeTruthy();

      const clearIconDebugElement = containerDebugElement.query(By.css('nuverial-button'));
      expect(clearIconDebugElement).toBeTruthy();

      clearIconDebugElement.triggerEventHandler('click', null);
      expect(component.searchInput.value).toEqual('');
    });

    it('should ensure keys are not modified while being displayed', async () => {
      fixture.debugElement.componentInstance.transactionList = TransactionListMock;
      fixture.debugElement.componentInstance['_buildDataSourceTable']();

      const keys = fixture.debugElement.queryAll(By.css('td.cdk-column-key.mat-column-key')).map(elem => elem.nativeElement.innerHTML);
      const transactionDefinitionListKeys = fixture.debugElement.componentInstance.transactionList.map((item: any) => item.key);

      expect(keys.sort()).toEqual(transactionDefinitionListKeys.sort());
    });

    it('should ensure keys are unique', async () => {
      fixture.debugElement.componentInstance.transactionList = TransactionListMock;
      fixture.debugElement.componentInstance['_buildDataSourceTable']();

      const keys = fixture.debugElement.queryAll(By.css('td.cdk-column-key.mat-column-key')).map(elem => elem.nativeElement.innerHTML);
      expect(keys.length).toEqual(new Set(keys).size);
    });

    it('should set the search box icon', () => {
      fixture.detectChanges();

      //get the dom element
      const containerDebugElement = fixture.debugElement.query(By.css('nuverial-text-input'));
      expect(containerDebugElement).toBeTruthy();

      const buttonDebugElement = containerDebugElement.query(By.css('nuverial-button'));
      expect(buttonDebugElement).toBeTruthy();

      const iconDebugElement = buttonDebugElement.query(By.css('nuverial-icon'));
      expect(iconDebugElement).toBeTruthy();

      //assert that when the search box is empty, the icon must be search
      let iconName = iconDebugElement.nativeElement.getAttribute('ng-reflect-icon-name');
      expect(iconName).toBe('search');

      //simulate typing something in the serach box
      component.searchInput.setValue('test');
      containerDebugElement.triggerEventHandler('keyup', {});
      fixture.detectChanges();

      //assert that when the search box is not empty, the icon must be cancel
      iconName = iconDebugElement.nativeElement.getAttribute('ng-reflect-icon-name');
      expect(iconName).toBe('cancel_outline');
    });

    it('should call getAllTransactionsForUser$ with proper filters when searchText has a value', () => {
      const containerDebugElement = fixture.debugElement.query(By.css('nuverial-text-input'));
      expect(containerDebugElement).toBeTruthy();

      const searchText = 'some search text';
      component.searchInput.setValue(searchText);
      containerDebugElement.triggerEventHandler('keyup.enter', {});
      fixture.detectChanges();

      const expectedFilter = { field: 'transactionDefinitionKey', value: searchText.trim() };
      const expectedTransactionFilterList = [expectedFilter];

      expect(mockWorkApiRoutesService.getAllTransactionsForUser$).toHaveBeenCalledWith(expectedTransactionFilterList, component.pagingRequestModel);
    });

    it('should set pageNumber to 0 on search', () => {
      const containerDebugElement = fixture.debugElement.query(By.css('nuverial-text-input'));
      expect(containerDebugElement).toBeTruthy();
      fixture.componentInstance.pagingRequestModel.pageNumber = 1;

      const searchText = 'some search text';
      component.searchInput.setValue(searchText);
      containerDebugElement.triggerEventHandler('keyup.enter', {});
      fixture.detectChanges();

      expect(fixture.componentInstance.pagingRequestModel.pageNumber).toEqual(0);
    });

    it.skip('should call getAllTransactionsForUser$ with proper filters when searchText is empty', () => {
      const containerDebugElement = fixture.debugElement.query(By.css('nuverial-text-input'));
      expect(containerDebugElement).toBeTruthy();

      component.searchInput.setValue('');

      containerDebugElement.triggerEventHandler('keyup.enter', {});
      fixture.detectChanges();

      expect(mockWorkApiRoutesService.getAllTransactionsForUser$).toHaveBeenCalledWith([], component.pagingRequestModel);
    });
  });
});
