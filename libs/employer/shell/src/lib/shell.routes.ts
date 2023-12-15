import { canActivate, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/compat/auth-guard';
import { ActivatedRouteSnapshot, Route, RouterStateSnapshot } from '@angular/router';
import { UserHasDataGuard } from '@dsg/shared/feature/app-state';

const redirectAuthenticatedToPreviousPage = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  let redirectUrl = '/';
  try {
    const redirectToUrl = new URL(state.url, location.origin);
    const params = new URLSearchParams(redirectToUrl.search);
    redirectUrl = params.get('returnUrl') || '/main/dashboard';
  } catch (err) {
    // invalid URL
  }

  return redirectLoggedInTo(redirectUrl);
};

const redirectUnauthorizedToLogin = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  return redirectUnauthorizedTo(`/login?returnUrl=${state.url}`);
};

export const employerShellRoutes: Route[] = [
  {
    children: [
      {
        ...canActivate(redirectUnauthorizedToLogin),
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'dashboard',
          },
          {
            canActivate: [UserHasDataGuard],
            loadChildren: () => import('@dsg/employer/feature/dashboard').then(module => module.EmployerFeatureDashboardModule),
            path: 'dashboard',
          },
          {
            loadChildren: () => import('@dsg/employer/feature/profile').then(module => module.EmployerFeatureProfileModule),
            path: 'profile',
          },
        ],
        path: '',
      },
      {
        ...canActivate(redirectAuthenticatedToPreviousPage),
        loadChildren: () => import('@dsg/shared/feature/authentication').then(module => module.SharedFeatureAuthenticationModule),
        path: 'login',
      },
    ],
    loadComponent: () => import('./components/shell/shell.component').then(module => module.ShellComponent),
    path: '',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
