import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyerdashboardComponent } from './buyerdashboard.component';

describe('BuyerdashboardComponent', () => {
  let component: BuyerdashboardComponent;
  let fixture: ComponentFixture<BuyerdashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuyerdashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuyerdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
