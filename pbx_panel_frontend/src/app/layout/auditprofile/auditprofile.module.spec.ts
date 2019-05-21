import { AuditprofileModule } from './auditprofile.module';

describe('AuditprofileModule', () => {
  let AuditprofileModule: AuditprofileModule;

  beforeEach(() => {
    AuditprofileModule = new AuditprofileModule();
  });

  it('should create an instance', () => {
    expect(AuditprofileModule).toBeTruthy();
  });
});
