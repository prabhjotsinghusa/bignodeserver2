import { BuyercappingModule } from './buyercapping.module';

describe('BuyercappingModule', () => {
  let buyercappingModule: BuyercappingModule;

  beforeEach(() => {
    buyercappingModule = new BuyercappingModule();
  });

  it('should create an instance', () => {
    expect(buyercappingModule).toBeTruthy();
  });
});
