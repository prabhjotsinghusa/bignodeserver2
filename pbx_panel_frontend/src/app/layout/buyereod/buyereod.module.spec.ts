import { BuyereodModule } from './buyereod.module';

describe('BuyereodModule', () => {
  let buyereodModule: EodModule;

  beforeEach(() => {
    buyereodModule = new EodModule();
  });

  it('should create an instance', () => {
    expect(buyereodModule).toBeTruthy();
  });
});
