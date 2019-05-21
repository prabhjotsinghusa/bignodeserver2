import { ManagegroupModule } from './managegroup.module';

describe('ManagegroupModule', () => {
  let ManagegroupModule: ManagegroupModule;

  beforeEach(() => {
    ManagegroupModule = new ManagegroupModule();
  });

  it('should create an instance', () => {
    expect(ManagegroupModule).toBeTruthy();
  });
});
