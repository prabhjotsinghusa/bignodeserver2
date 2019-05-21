import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceHoursComponent } from './financehours.component';

describe('FinanceHoursComponent', () => {
  let component: FinanceHoursComponent;
  let fixture: ComponentFixture<FinanceHoursComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinanceHoursComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinanceHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
