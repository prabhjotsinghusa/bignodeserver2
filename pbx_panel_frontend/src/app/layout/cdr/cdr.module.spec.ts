import { CdrModule } from './cdr.module';

describe('CdrModule', () => {
  let cdrModule: CdrModule;

  beforeEach(() => {
    cdrModule = new CdrModule();
  });

  it('should create an instance', () => {
    expect(cdrModule).toBeTruthy();
  });
});
