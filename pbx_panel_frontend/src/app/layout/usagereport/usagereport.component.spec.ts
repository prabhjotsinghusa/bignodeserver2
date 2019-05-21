import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsagereportComponent } from './usagereport.component';

describe('UsagereportComponent', () => {
  let component: UsagereportComponent;
  let fixture: ComponentFixture<UsagereportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsagereportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsagereportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
