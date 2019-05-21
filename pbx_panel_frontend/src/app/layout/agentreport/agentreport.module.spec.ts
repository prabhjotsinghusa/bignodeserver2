import { AgentreportModule } from './agentreport.module';

describe('AgentreportModule', () => {
  let agentreportModule: AgentreportModule;

  beforeEach(() => {
    agentreportModule = new AgentreportModule();
  });

  it('should create an instance', () => {
    expect(agentreportModule).toBeTruthy();
  });
});
