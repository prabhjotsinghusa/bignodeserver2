import { UsagereportModule } from './usagereport.module';

describe('UsagereportModule', () => {
  let usagereportModule: UsagereportModule;

  beforeEach(() => {
    usagereportModule = new UsagereportModule();
  });

  it('should create an instance', () => {
    expect(usagereportModule).toBeTruthy();
  });
});
