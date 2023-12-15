import { ChangeDetectorRef, Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { distinctUntilChanged, ReplaySubject, switchMap, tap } from 'rxjs';
import { FeatureFlagService } from '../feature-flag.service';
import { FeatureKeys } from '../feature-flags.const';

/**
 * This directive provides an easy way to enable/disable features in your application
 * Use it like a *ngIf directive
 * ```html
 *    <a *dsgFeatureFlag="'new-feature'">content</a>
 * ````
 */

@UntilDestroy()
@Directive({
  selector: '[dsgFeatureFlag]',
})
export class FeatureFlagDirective implements OnInit {
  @Input('dsgFeatureFlag')
  public set featureFlag(key: FeatureKeys) {
    this._key$.next(key);
  }

  private readonly _key$ = new ReplaySubject<FeatureKeys>(1);
  private _viewCreated = false;

  constructor(
    private readonly _featureFlagService: FeatureFlagService,
    private readonly _templateRef: TemplateRef<unknown>,
    private readonly _viewContainer: ViewContainerRef,
    private readonly _changeDetectorRef: ChangeDetectorRef,
  ) {}

  public ngOnInit() {
    this._key$
      .pipe(
        distinctUntilChanged(),
        switchMap(key => this._featureFlagService.isFeatureFlagEnabled$(key)),
        tap(isEnabled => this._updateView(isEnabled)),
        untilDestroyed(this),
      )
      .subscribe();
  }

  private _updateView(isEnabled: boolean) {
    if (isEnabled && !this._viewCreated) {
      this._viewCreated = true;
      this._viewContainer.createEmbeddedView(this._templateRef);
    } else if (!isEnabled) {
      this._viewCreated = false;
      this._viewContainer.clear();
    }

    this._changeDetectorRef.markForCheck();
  }
}
