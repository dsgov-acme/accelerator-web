import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoggingService } from '@dsg/shared/utils/logging';
import { MockProvider, ngMocks } from 'ng-mocks';
import { AuthenticationService } from '../../services';

import { AuthenticationRedirectComponent } from './authentication-redirect.component';

describe('AuthenticationRedirectComponent', () => {
  let component: AuthenticationRedirectComponent;
  let fixture: ComponentFixture<AuthenticationRedirectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthenticationRedirectComponent],
      providers: [MockProvider(AuthenticationService, {}), MockProvider(LoggingService)],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthenticationRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call signInWithRedirect on ngOnInit', () => {
    jest.spyOn(component, 'signInWithRedirect');

    component.ngOnInit();

    expect(component.signInWithRedirect).toHaveBeenCalled();
  });

  it('should call signInWithRedirect method of AuthenticationService', () => {
    const authenticationService = ngMocks.findInstance(AuthenticationService);

    jest.spyOn(authenticationService, 'signInWithRedirect$');

    component.signInWithRedirect();

    expect(authenticationService.signInWithRedirect$).toHaveBeenCalled();
  });
});
