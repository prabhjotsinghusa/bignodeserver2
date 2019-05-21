import { AuditreportModule } from './auditreport.module';

describe('AuditreportModule', () => {
  let auditreportModule: AuditreportModule;

  beforeEach(() => {
    auditreportModule = new AuditreportModule();
  });

  it('should create an instance', () => {
    expect(auditreportModule).toBeTruthy();
  });
});
