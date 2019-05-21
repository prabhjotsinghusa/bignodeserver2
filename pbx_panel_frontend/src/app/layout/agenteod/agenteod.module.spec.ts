import { AgentModule } from './agenteod.module';

describe('AgentModule', () => {
  let agenteodModule: AgentModule;

  beforeEach(() => {
    agenteodModule = new AgentModule();
  });

  it('should create an instance', () => {
    expect(agenteodModule).toBeTruthy();
  });
});
