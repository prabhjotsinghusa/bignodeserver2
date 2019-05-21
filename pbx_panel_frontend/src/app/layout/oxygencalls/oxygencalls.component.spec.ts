import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OxygencallsComponent } from './oxygencalls.component';

describe('oxygencallsComponent', () => {
  let component: OxygencallsComponent;
  let fixture: ComponentFixture<OxygencallsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OxygencallsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OxygencallsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
