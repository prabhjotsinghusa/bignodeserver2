import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditreportComponent } from './auditreport.component';

describe('AuditreportComponent', () => {
  let component: AuditreportComponent;
  let fixture: ComponentFixture<AuditreportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuditreportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuditreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
