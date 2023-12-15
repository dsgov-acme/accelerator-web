import { INavigableTab } from '@dsg/shared/ui/nuverial';
import { IDashboardCategory, IDashboardConfiguration } from './dashboard-configuration.model';

export const SubCategoryMock: INavigableTab = {
  key: 'quarterly-tax-wage-report',
  label: 'Quarterly Tax & Wage Report',
  route: '/dashboard/tax-wage-reporting/quarterly-tax-wage-report',
};

export const DashboardCategoryMock: IDashboardCategory = {
  description: 'File quarterly reports, view and print previously-filed reports. tile tax and wage adjustments, elect First Quarter Deferral of taxes',
  icon: 'file_copy',
  name: 'Tax & Wage Reporting',
  route: 'tax-wage-reporting',
  subCategories: [
    { key: 'quarterly-tax-wage-report', label: 'Quarterly Tax & Wage Report', route: '/dashboard/tax-wage-reporting' },
    { key: 'previously-filed-reports', label: 'Previously-Filed Reports', route: '/dashboard/tax-wage-reporting/previously-filed-reports' },
    { key: 'tax-wage-adjustments', label: 'Tax & Wage Adjustments', route: '/dashboard/tax-wage-reporting/tax-wage-adjustments' },
    { key: 'first-quarter-deferral', label: 'First Quarter Deferral', route: '/dashboard/tax-wage-reporting/first-quarter-deferral' },
  ],
};

export const DashboardCategoryWithListMock: IDashboardCategory = {
  description: 'File quarterly reports, view and print previously-filed reports. tile tax and wage adjustments, elect First Quarter Deferral of taxes',
  hasTransactionList: true,
  icon: 'file_copy',
  name: 'Tax & Wage Reporting',
  route: 'tax-wage-reporting',
  subCategories: [
    { key: 'quarterly-tax-wage-report', label: 'Quarterly Tax & Wage Report', route: '/dashboard/tax-wage-reporting' },
    { key: 'previously-filed-reports', label: 'Previously-Filed Reports', route: '/dashboard/tax-wage-reporting/previously-filed-reports' },
    { key: 'tax-wage-adjustments', label: 'Tax & Wage Adjustments', route: '/dashboard/tax-wage-reporting/tax-wage-adjustments' },
    { key: 'first-quarter-deferral', label: 'First Quarter Deferral', route: '/dashboard/tax-wage-reporting/first-quarter-deferral' },
  ],
};

export const DashboardCategoriesMock: IDashboardCategory[] = [DashboardCategoryMock];

export const DashboardConfigurationMock: IDashboardConfiguration = {
  categories: DashboardCategoriesMock,
};
