import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NuverialSpinnerComponent } from '@dsg/shared/ui/nuverial';
import { AuthenticationBaseDirective } from '../../common';
import { AuthenticationProviderActions } from '../../models';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NuverialSpinnerComponent],
  selector: 'dsg-choose-flow',
  standalone: true,
  styleUrls: ['./authentication-redirect.component.scss'],
  templateUrl: './authentication-redirect.component.html',
})
export class AuthenticationRedirectComponent extends AuthenticationBaseDirective implements OnInit {
  public providerActions = AuthenticationProviderActions;

  public ngOnInit(): void {
    this.signInWithRedirect();
  }

  public signInWithRedirect() {
    this._authenticationService.signInWithRedirect$();
  }
}
