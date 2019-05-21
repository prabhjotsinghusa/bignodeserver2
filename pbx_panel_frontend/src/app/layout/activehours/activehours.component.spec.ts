import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivehoursComponent } from './activehours.component';

describe('ActivehoursComponent', () => {
  let component: ActivehoursComponent;
  let fixture: ComponentFixture<ActivehoursComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivehoursComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivehoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
