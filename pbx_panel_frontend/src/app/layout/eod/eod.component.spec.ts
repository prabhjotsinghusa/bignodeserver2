import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EodComponent } from './eod.component';

describe('EodComponent', () => {
  let component: EodComponent;
  let fixture: ComponentFixture<EodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EodComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
