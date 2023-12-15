import { Injectable } from '@angular/core';
import { INavigableTab } from '@dsg/shared/ui/nuverial';
import { BehaviorSubject } from 'rxjs';
import { DashboardConfiguration, IDashboardCategory, IDashboardConfiguration } from '../models/dashboard-configuration.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly dashboardConfiguration: IDashboardConfiguration = DashboardConfiguration;
  private readonly _currentDashboardSubCategories = new BehaviorSubject<INavigableTab[]>([]);

  constructor() {}

  public getDashboardConfiguration(): IDashboardConfiguration {
    return this.dashboardConfiguration;
  }

  public getDashboardCategories(): IDashboardCategory[] {
    return this.dashboardConfiguration.categories;
  }

  public getDashboardCategoryByRoute(route: string): IDashboardCategory | undefined {
    const dashboardCategory = this.dashboardConfiguration.categories.find(category => category.route === route);
    if (dashboardCategory) {
      this._currentDashboardSubCategories.next(dashboardCategory.subCategories);
    }

    return dashboardCategory;
  }

  public getCurrentDashboardSubCategories(): INavigableTab[] {
    return this._currentDashboardSubCategories.getValue();
  }
}
