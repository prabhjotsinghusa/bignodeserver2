import { BuyermonitoringModule } from './buyermonitoring.module';

describe('BuyermonitoringModule', () => {
  let buyermonitoringModule: BuyermonitoringModule;

  beforeEach(() => {
    buyermonitoringModule = new BuyermonitoringModule();
  });

  it('should create an instance', () => {
    expect(buyermonitoringModule).toBeTruthy();
  });
});
