import { OxygencallsModule } from './oxygencalls.module';

describe('oxygencallsModule', () => {
  let OxygencallsModule: OxygencallsModule;

  beforeEach(() => {
    OxygencallsModule = new OxygencallsModule();
  });

  it('should create an instance', () => {
    expect(OxygencallsModule).toBeTruthy();
  });
});
