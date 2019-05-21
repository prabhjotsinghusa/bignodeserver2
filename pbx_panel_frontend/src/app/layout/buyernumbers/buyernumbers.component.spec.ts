import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyernumbersComponent } from './buyernumbers.component';

describe('BuyernumbersComponent', () => {
  let component: BuyernumbersComponent;
  let fixture: ComponentFixture<BuyernumbersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuyernumbersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuyernumbersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
