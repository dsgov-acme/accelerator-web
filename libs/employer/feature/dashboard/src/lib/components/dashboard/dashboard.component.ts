import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NuverialDashboardCardComponent, NuverialDashboardCardsGroupComponent } from '@dsg/shared/ui/nuverial';
import { Observable, of } from 'rxjs';
import { IDashboardCategory } from '../../models/dashboard-configuration.model';
import { DashboardService } from '../../services';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NuverialDashboardCardComponent, NuverialDashboardCardsGroupComponent, CommonModule],
  selector: 'dsg-dashboard',
  standalone: true,
  styleUrls: ['./dashboard.component.scss'],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  public readonly cards$: Observable<IDashboardCategory[]> = of(this._dashboardService.getDashboardCategories());

  constructor(private readonly _dashboardService: DashboardService) {}

  public trackByFn(index: number): number {
    return index;
  }
}
