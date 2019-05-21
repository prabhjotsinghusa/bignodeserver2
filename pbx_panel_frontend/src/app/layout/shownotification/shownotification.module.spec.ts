import { ShownotificationModule } from './shownotification.module';

describe('ShownotificationModule', () => {
  let shownotificationModule: ShownotificationModule;

  beforeEach(() => {
    shownotificationModule = new ShownotificationModule();
  });

  it('should create an instance', () => {
    expect(shownotificationModule).toBeTruthy();
  });
});
