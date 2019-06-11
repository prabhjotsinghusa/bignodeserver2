import { BlacklistModule } from './blacklist.module';

describe('BlacklistModule', () => {
  let agenteodModule: BlacklistModule;

  beforeEach(() => {
    agenteodModule = new BlacklistModule();
  });

  it('should create an instance', () => {
    expect(agenteodModule).toBeTruthy();
  });
});
