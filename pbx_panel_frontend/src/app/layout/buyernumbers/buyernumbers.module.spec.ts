import { BuyernumbersModule } from './buyernumbers.module';

describe('BuyernumbersModule', () => {
  let buyernumbersModule: BuyernumbersModule;

  beforeEach(() => {
    buyernumbersModule = new BuyernumbersModule();
  });

  it('should create an instance', () => {
    expect(buyernumbersModule).toBeTruthy();
  });
});
