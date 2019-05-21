import { TfnsModule } from './tfns.module';

describe('TfnsModule', () => {
  let tfnsModule: TfnsModule;

  beforeEach(() => {
    tfnsModule = new TfnsModule();
  });

  it('should create an instance', () => {
    expect(tfnsModule).toBeTruthy();
  });
});
