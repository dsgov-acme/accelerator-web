import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSort, MatSortModule, Sort, SortDirection } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { IPagingMetadata, PagingRequestModel, SortOrder, pageSizeOptions } from '@dsg/shared/data-access/http';
import { DashboardColumn, DashboardCountModel, EnumMapType, ITransaction, PriorityVisuals, WorkApiRoutesService } from '@dsg/shared/data-access/work-api';
import { EnumerationsStateService, UserStateService } from '@dsg/shared/feature/app-state';
import {
  INuverialTab,
  NuverialIconComponent,
  NuverialSnackBarService,
  NuverialSpinnerComponent,
  NuverialTextInputComponent,
  SplitCamelCasePipe,
} from '@dsg/shared/ui/nuverial';
import { omit } from 'lodash';
import { Observable, catchError, firstValueFrom, map, of, switchMap, take, tap } from 'rxjs';
import { DashboardService } from './dashboard.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    SplitCamelCasePipe,
    MatPaginatorModule,
    MatProgressBarModule,
    NuverialSpinnerComponent,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    NuverialIconComponent,
    NuverialTextInputComponent,
    FormsModule,
  ],
  providers: [DatePipe],
  selector: 'dsg-agency-dashboard',
  standalone: true,
  styleUrls: ['./dashboard.component.scss'],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnDestroy {
  public displayedColumns: DashboardColumn[] = [];
  public displayColumnAttributePaths: string[] = [];
  public priorityVisuals = PriorityVisuals;
  public tabs: INuverialTab[] = [];
  private tabsCopy = '';
  public activeTabIndex = 0;
  public transactionList: ITransaction[] = [];
  public transactionListIsLoading = false;
  public dataSourceTable = new MatTableDataSource<unknown>();
  public pageSizeOptions = pageSizeOptions;
  public pagingMetadata: IPagingMetadata | undefined;
  public sortDirection: SortDirection = 'asc';
  public searchInput = new FormControl();
  public searchBoxIcon = 'search';
  public dashboardCounts: DashboardCountModel[] = [];
  public transactionSetKey = '';
  public dashboardLabel = '';
  public readonly pagingRequestModel: PagingRequestModel = new PagingRequestModel({}, this._router, this._activatedRoute);

  @ViewChild(MatSort) public tableSort!: MatSort;

  public dashboardDetails$ = this._dashboardService.loadDashboard$().pipe(
    switchMap(dashboard => {
      if (!dashboard) {
        this.transactionSetKey = '';
        this.dashboardLabel = '';

        return of({ columns: [], tabs: [] });
      }

      this.transactionSetKey = dashboard.transactionSet;
      this.dashboardLabel = dashboard.dashboardLabel;

      return this.updateTabCounts(this.transactionSetKey).pipe(
        map(counts => {
          this.dashboardCounts = counts;

          const tabs = dashboard.tabs.map(tab => ({
            count: this.getCountByTabLabel(tab.tabLabel),
            filters: new Map(Object.entries(tab.filter || {})),
            key: Object.keys(tab.filter || {}).join(', '),
            label: tab.tabLabel,
            value: Object.values(tab.filter || {}).join(', '),
          }));

          return { columns: dashboard.columns, tabs };
        }),
      );
    }),
    tap(({ columns, tabs }) => {
      this.tabs = tabs;
      this.displayedColumns = columns.map(col => ({ ...col }));
      this.displayColumnAttributePaths = this.displayedColumns.map(col => col.attributePath);

      this.tabsCopy = JSON.stringify(
        this.tabs.map(tab => {
          const tabCopy = omit(tab, 'template'); // Omit the 'template' property
          const mapToObject = (mapSource: Map<string, string>): Record<string, string> =>
            Array.from(mapSource).reduce<Record<string, string>>((obj, [key, value]) => {
              obj[key] = value;

              return obj;
            }, {});
          if (tabCopy.filters instanceof Map) {
            return { ...tabCopy, filters: mapToObject(tabCopy.filters) };
          }

          return tabCopy;
        }),
      );

      this._setActiveTab();
      this.clearSearch();
    }),
    catchError(error => {
      this._nuverialSnackBarService.notifyApplicationError(error);

      return of({ columns: [], tabs: [] });
    }),
  );

  constructor(
    private readonly _workApiRoutesService: WorkApiRoutesService,
    private readonly _userStateService: UserStateService,
    private readonly _cdr: ChangeDetectorRef,
    private readonly _datePipe: DatePipe,
    private readonly _router: Router,
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _nuverialSnackBarService: NuverialSnackBarService,
    private readonly _dashboardService: DashboardService,
    private readonly _enumService: EnumerationsStateService,
  ) {}

  public getTransactionsList() {
    const searchText = this.searchInput.value?.trim().toLowerCase();
    const currentTab = this.tabs[this.activeTabIndex];
    const transactionFilterList = [];

    if (searchText) {
      transactionFilterList.push({ field: 'externalId', value: searchText });
    } else if (this.tabs.length > 0 && currentTab) {
      currentTab.filters?.forEach((value, key) => {
        transactionFilterList.push({ field: key, value });
      });
    }
    this.transactionListIsLoading = true;

    if (this.transactionSetKey) {
      this._workApiRoutesService
        .getTransactionsList$(this.transactionSetKey, transactionFilterList, this.pagingRequestModel)
        .pipe(
          take(1),
          tap(transaction => {
            this.transactionListIsLoading = false;

            this.transactionList = transaction.items;
            this.pagingMetadata = transaction.pagingMetadata;

            const filterToMap = (obj: Record<string, string>): Map<string, string> => {
              return new Map(Object.entries(obj));
            };

            this.tabs = JSON.parse(this.tabsCopy).map((tab: INuverialTab) => {
              if (tab.filters) {
                tab.filters = filterToMap(tab.filters as unknown as Record<string, string>);
              }

              return tab;
            });

            if (searchText) {
              if (this.transactionList.length === 1) {
                this.navigateToTransactionDetails(transaction.items[0].id);

                return;
              }

              this.tabs.forEach(tab => {
                tab.count = 0;
              });
            }

            this._buildDataSourceTable();
            this._cdr.detectChanges();
          }),
          catchError(_ => {
            this.transactionListIsLoading = false;
            this._nuverialSnackBarService.notifyApplicationError();

            return of([]);
          }),
        )
        .subscribe();
    } else {
      this.transactionListIsLoading = false;
    }
  }

  public navigateToTransactionDetails(transactionId: string): void {
    this._router.navigate([`/dashboard/transaction/${transactionId}`]);
  }

  public setPage($event: PageEvent): void {
    this.pagingRequestModel.pageSize = $event.pageSize;
    this.pagingRequestModel.pageNumber = $event.pageIndex;
    this.getTransactionsList();
  }

  public sortData($event: Sort): void {
    this.pagingRequestModel.sortBy = $event.active;
    this.pagingRequestModel.sortOrder = $event.direction.toUpperCase() as SortOrder;
    this.getTransactionsList();
  }

  public setSearchBoxIcon() {
    const searchText = this.searchInput.value ? this.searchInput.value.trim().toLowerCase() : '';
    this.searchBoxIcon = searchText ? 'cancel_outline' : 'search';
  }

  public clearSearch() {
    this.searchInput.setValue('');
    this.setSearchBoxIcon();
    this.getTransactionsList();
  }

  public switchTabs(tab: MatTabChangeEvent): void {
    this.activeTabIndex = tab.index;
    this.transactionListIsLoading = true;
    this.pagingRequestModel.pageNumber = 0;
    this._router?.navigate([], {
      queryParams: { pageNumber: 0, status: tab.tab.textLabel } as Params,
      queryParamsHandling: 'merge',
      relativeTo: this._activatedRoute,
    });
    this.getTransactionsList();
  }

  private async _buildDataSourceTable(): Promise<void> {
    const transactionTableData = [];
    for (const transaction of this.transactionList) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const item: any = { id: transaction.id };

      for (const col of this.displayedColumns) {
        const value = this._getPropertyValueByPath(transaction, col.attributePath);

        switch (col.displayFormat?.toUpperCase()) {
          case 'USERDATA':
            item[col.attributePath] = await firstValueFrom(this._userStateService.getUserDisplayName$(value));
            break;
          case 'DATETIME':
            item[col.attributePath] = this._datePipe.transform(value, 'MM/dd/yyyy') || value;
            break;
          case 'PRIORITY':
            item[col.attributePath] = {
              class: value.toLowerCase(),
              icon: this.priorityVisuals[value.toLowerCase()].icon,
              label: (await firstValueFrom(this._enumService.getDataFromEnum$(EnumMapType.TransactionPriorities, value))).label,
            };
            break;
          default:
            item[col.attributePath] = value;
            break;
        }
      }

      transactionTableData.push(item);
    }

    this.dataSourceTable = new MatTableDataSource<unknown>(transactionTableData);
    this._cdr.detectChanges();
    this.sortDirection = this.pagingRequestModel.sortOrder.toLowerCase() as SortDirection;
  }

  public trackByFn(index: number): number {
    return index;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _getPropertyValueByPath(object: ITransaction, path: string): any {
    const pathArray = path.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = object;

    for (const prop of pathArray) {
      if (value && typeof value === 'object' && prop in value) {
        value = value[prop];
      } else {
        return undefined;
      }
    }

    return value;
  }

  private _setActiveTab() {
    const queryParams = this._activatedRoute.snapshot.queryParams;
    const activeTab = this.tabs.find(tab => queryParams[tab.key] === tab.value);

    if (activeTab) {
      this.activeTabIndex = this.tabs.indexOf(activeTab);
    }
  }

  public updateTabCounts(key: string): Observable<DashboardCountModel[]> {
    return this._dashboardService.getDashboardTabCount$(key).pipe(
      tap((counts: DashboardCountModel[]) => {
        this.dashboardCounts = counts;
      }),
      catchError(() => {
        this._nuverialSnackBarService.notifyApplicationError();

        return of([]);
      }),
    );
  }

  public getCountByTabLabel(tabLabel: string): number {
    const dashboardCount = this.dashboardCounts.find(count => count.tabLabel === tabLabel);

    return dashboardCount ? dashboardCount.count : 0;
  }

  public handleSearch() {
    this.pagingRequestModel.pageNumber = 0;
    this.getTransactionsList();
  }

  public ngOnDestroy(): void {
    this._dashboardService.cleanUp();
  }
}
