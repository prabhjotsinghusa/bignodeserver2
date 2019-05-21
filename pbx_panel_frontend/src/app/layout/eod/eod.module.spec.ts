import { EodModule } from './eod.module';

describe('EodModule', () => {
  let eodModule: EodModule;

  beforeEach(() => {
    eodModule = new EodModule();
  });

  it('should create an instance', () => {
    expect(eodModule).toBeTruthy();
  });
});
