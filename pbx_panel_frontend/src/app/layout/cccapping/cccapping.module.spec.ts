import { CccappingModule } from './cccapping.module';

describe('CccappingModule', () => {
  let cccappingModule: CccappingModule;

  beforeEach(() => {
    cccappingModule = new CccappingModule();
  });

  it('should create an instance', () => {
    expect(cccappingModule).toBeTruthy();
  });
});
