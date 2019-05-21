import { BuyerdashboardModule } from './buyerdashboard.module';

describe('BuyerdashboardModule', () => {
  let buyerdashboardModule: BuyerdashboardModule;

  beforeEach(() => {
    buyerdashboardModule = new BuyerdashboardModule();
  });

  it('should create an instance', () => {
    expect(buyerdashboardModule).toBeTruthy();
  });
});
