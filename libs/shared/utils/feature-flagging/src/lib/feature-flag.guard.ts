import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { map } from 'rxjs';
import { FeatureFlagService } from './feature-flag.service';
import { FeatureKeys } from './feature-flags.const';

@Injectable()
export class FeatureFlagGuard implements CanActivate {
  constructor(private readonly _router: Router, private readonly _featureFlagService: FeatureFlagService) {}

  public canActivate(route: ActivatedRouteSnapshot) {
    const featureKey = route.data['featureKey'] as FeatureKeys;
    const redirectUrl = route.data['redirectUrl'] || '/';

    return this._featureFlagService.isFeatureFlagEnabled$(featureKey).pipe(map(enabled => (enabled ? true : this._router.parseUrl(redirectUrl))));
  }
}
