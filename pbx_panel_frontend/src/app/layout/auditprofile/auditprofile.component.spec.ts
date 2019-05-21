import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditprofileComponent } from './auditprofile.component';

describe('AuditprofileComponent', () => {
  let component: AuditprofileComponent;
  let fixture: ComponentFixture<AuditprofileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuditprofileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuditprofileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
