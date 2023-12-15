import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ActiveTabChangeEvent, INavigableTab } from '../tabs';
import { NuverialNavigableTabsComponent } from './navigable-tabs.component';

describe('NuverialNavigableTabsComponent', () => {
  let component: NuverialNavigableTabsComponent;
  let fixture: ComponentFixture<NuverialNavigableTabsComponent>;
  let router: Router;
  let route: ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NuverialNavigableTabsComponent,
        RouterTestingModule.withRoutes([
          { path: 'tab1', redirectTo: '' },
          { path: 'tab2', redirectTo: '' },
        ]),
        NoopAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NuverialNavigableTabsComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    route = TestBed.inject(ActivatedRoute);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to the correct route when handleActiveTabChange is called', () => {
    const tabs: INavigableTab[] = [
      { key: 'tab1', label: 'Tab 1', route: '/tab1' },
      { key: 'tab2', label: 'Tab 2', route: '/tab2' },
    ];
    component.tabs = tabs;
    const event: ActiveTabChangeEvent = { index: 1, tab: { key: 'tab2', label: 'Tab 2' } };
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.handleActiveTabChange(event);

    expect(navigateSpy).toHaveBeenCalledWith(['/tab2'], { relativeTo: route });
  });

  it('should set activeTabIndex based on the current route on initialization', async () => {
    const urlSpy = jest.spyOn(router, 'url', 'get').mockReturnValue('/tab2');
    const tabs: INavigableTab[] = [
      { key: 'tab1', label: 'Tab 1', route: '/tab1' },
      { key: 'tab2', label: 'Tab 2', route: '/tab2' },
    ];
    component.tabs = tabs;

    component.ngOnInit();
    fixture.detectChanges();

    expect(urlSpy).toBeCalled();
    expect(component.activeTabIndex).toEqual(1);
  });
});
