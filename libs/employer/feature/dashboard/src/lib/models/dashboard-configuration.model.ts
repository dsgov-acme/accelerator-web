import { INavigableTab, ITag } from '@dsg/shared/ui/nuverial';

export interface IDashboardCategory {
  description: string;
  icon: string;
  name: string;
  route: string;
  hasTransactionList?: boolean;
  subCategories: INavigableTab[];
  tags?: ITag[];
}

export interface IDashboardConfiguration {
  categories: IDashboardCategory[];
}

export const DashboardConfiguration: IDashboardConfiguration = {
  categories: [
    {
      description: 'File quarterly reports, view and print previously-filed reports. tile tax and wage adjustments, elect First Quarter Deferral of taxes',
      icon: 'file_copy',
      name: 'Tax & Wage Reporting',
      route: 'tax-wage-reporting',
      subCategories: [
        { key: 'quarterly-tax-wage-report', label: 'Quarterly Tax & Wage Report', route: 'quarterly-tax-wage-report' },
        { key: 'wage-report-file-upload', label: 'Wage Report File Upload', route: 'wage-report-file-upload' },
        { key: 'tax-wage-adjustments', label: 'Tax & Wage Report Adjustments', route: 'tax-wage-adjustments' },
        { key: 'previously-filed-reports', label: 'Previously-Filed Reports', route: 'previously-filed-reports' },
        { key: 'first-quarter-deferral', label: 'First Quarter Deferral', route: 'first-quarter-deferral' },
      ],
      tags: [
        {
          label: 'Default Tag',
        },
      ],
    },
    {
      description: 'Description of benefits lorem ipsum dolor sit amet',
      icon: 'assignment',
      name: 'Benefits',
      route: 'benefits',
      subCategories: [
        { key: 'benefits', label: 'Benefits', route: 'benefits' },
        { key: 'taxes', label: 'Taxes', route: 'taxes' },
        { key: 'appeals', label: 'Appeals', route: 'appeals' },
        { key: 'archive', label: 'Archive', route: 'archive' },
      ],
    },
    {
      description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Porro, ea!',
      icon: 'release_alert',
      name: 'Urgent Request for Wages',
      route: 'urgent-requests',
      subCategories: [{ key: 'amet-consectetur', label: 'Amet Consectetur', route: 'amet-consectetur' }],
    },
    {
      description: 'Respond to Tax & Wage Information Requests',
      hasTransactionList: true,
      icon: 'chat',
      name: 'Tax & Wage Requests',
      route: 'tax-wage-requests',
      subCategories: [
        { key: 'details', label: 'Details', route: 'details' },
        { key: 'messages', label: 'Messages', route: 'messages' },
      ],
    },
    {
      description: 'Respond to Benefit Requests',
      hasTransactionList: true,
      icon: 'chat',
      name: 'Benefit Requests',
      route: 'benefit-requests',
      subCategories: [
        { key: 'details', label: 'Details', route: 'details' },
        { key: 'messages', label: 'Messages', route: 'messages' },
      ],
    },
    {
      description: 'View and manage billing details and payment options, accounts, contact information, and debit information. ',
      icon: 'payments',
      name: 'Billing & Payments',
      route: 'billing-payments',
      subCategories: [
        { key: 'billing', label: 'Billing', route: 'billing' },
        { key: 'payments', label: 'Payments', route: 'payments' },
        { key: 'contact-information', label: 'Contact Information', route: 'contact-information' },
        { key: 'debit-nformation', label: 'Debit Information', route: 'debit-information' },
      ],
    },
    {
      description: 'View and update account information and status, and view election information',
      icon: 'shield_person',
      name: 'View & Manage Account',
      route: 'view-manage-account',
      subCategories: [
        { key: 'details', label: 'Details', route: 'details' },
        { key: 'documents', label: 'Documents', route: 'documents' },
        { key: 'election-information', label: 'Election Information', route: 'election-information' },
      ],
    },
    {
      description: 'View and manage account access for Managers and Workers, as well as generate account access key letters',
      icon: 'manage_accounts',
      name: 'Account Access Management',
      route: 'account-access-management',
      subCategories: [
        { key: 'manage-users', label: 'Manage Users', route: 'manage-users' },
        { key: 'activity-log', label: 'Activity Log', route: 'activity-log' },
      ],
      tags: [
        {
          backgroundColor: 'blue',
          label: 'New Requests',
          textColor: 'white',
        },
        {
          backgroundColor: 'red',
          label: 'New Messages',
          textColor: 'white',
        },
      ],
    },
    {
      description: 'Description of other functions lorem ipsum dolor sit amet',
      icon: 'other_admission',
      name: 'Other Functions',
      route: 'other-functions',
      subCategories: [{ key: 'laboriosam-excepturi', label: 'Laboriosam Excepturi', route: 'laboriosam-excepturi' }],
    },
    {
      description: 'Respond to UI Information Requests, Separations, Earnings Verifications, and Determinations and Appeals',
      icon: 'reply',
      name: 'Sides E-Response',
      route: 'sides-e-response',
      subCategories: [{ key: 'praesentium-impedit', label: 'Praesentium Impedit', route: 'praesentium-impedit' }],
    },
  ],
};
