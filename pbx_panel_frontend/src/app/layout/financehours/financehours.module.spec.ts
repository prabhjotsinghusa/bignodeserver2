import { FinanceHoursModule } from './financehours.module';

describe('FinanceHoursModule', () => {
  let financehoursModule: FinanceHoursModule;

  beforeEach(() => {
    financehoursModule = new FinanceHoursModule();
  });

  it('should create an instance', () => {
    expect(financehoursModule).toBeTruthy();
  });
});
