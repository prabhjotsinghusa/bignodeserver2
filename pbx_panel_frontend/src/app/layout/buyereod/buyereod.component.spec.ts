import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyereodComponent } from './buyereod.component';

describe('BuyereodComponent', () => {
  let component: BuyereodComponent;
  let fixture: ComponentFixture<BuyereodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuyereodComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuyereodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
