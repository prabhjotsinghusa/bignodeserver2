import { BuyerreportModule } from './buyerreport.module';

describe('BuyerreportModule', () => {
  let buyerreportModule: BuyerreportModule;

  beforeEach(() => {
    buyerreportModule = new BuyerreportModule();
  });

  it('should create an instance', () => {
    expect(buyerreportModule).toBeTruthy();
  });
});
