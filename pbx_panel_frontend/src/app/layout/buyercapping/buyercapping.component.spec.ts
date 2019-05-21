import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyercappingComponent } from './buyercapping.component';

describe('BuyercappingComponent', () => {
  let component: BuyercappingComponent;
  let fixture: ComponentFixture<BuyercappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuyercappingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuyercappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
