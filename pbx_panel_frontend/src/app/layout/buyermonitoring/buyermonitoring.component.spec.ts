import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyermonitoringComponent } from './buyermonitoring.component';

describe('BuyermonitoringComponent', () => {
  let component: BuyermonitoringComponent;
  let fixture: ComponentFixture<BuyermonitoringComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuyermonitoringComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuyermonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
