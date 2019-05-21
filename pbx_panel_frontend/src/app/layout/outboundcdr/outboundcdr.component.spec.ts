import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutboundcdrComponent } from './outboundcdr.component';

describe('OutboundcdrComponent', () => {
  let component: OutboundcdrComponent;
  let fixture: ComponentFixture<OutboundcdrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundcdrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundcdrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
