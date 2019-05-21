import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingtfnsComponent } from './pendingtfns.component';

describe('PendingtfnsComponent', () => {
  let component: PendingtfnsComponent;
  let fixture: ComponentFixture<PendingtfnsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PendingtfnsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingtfnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
