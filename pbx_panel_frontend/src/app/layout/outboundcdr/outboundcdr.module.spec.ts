import { OutboundcdrModule } from './outboundcdr.module';

describe('OutboundcdrModule', () => {
  let outboundcdrModule: OutboundcdrModule;

  beforeEach(() => {
    outboundcdrModule = new OutboundcdrModule();
  });

  it('should create an instance', () => {
    expect(outboundcdrModule).toBeTruthy();
  });
});
