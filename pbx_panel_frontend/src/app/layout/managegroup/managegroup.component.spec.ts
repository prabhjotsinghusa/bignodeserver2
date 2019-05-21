import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagegroupComponent } from './managegroup.component';

describe('ManagegroupComponent', () => {
  let component: ManagegroupComponent;
  let fixture: ComponentFixture<ManagegroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManagegroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagegroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
