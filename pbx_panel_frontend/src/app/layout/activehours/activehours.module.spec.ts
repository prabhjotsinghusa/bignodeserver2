import { ActivehoursModule } from './activehours.module';

describe('ActivehoursModule', () => {
  let activehoursModule: ActivehoursModule;

  beforeEach(() => {
    activehoursModule = new ActivehoursModule();
  });

  it('should create an instance', () => {
    expect(activehoursModule).toBeTruthy();
  });
});
