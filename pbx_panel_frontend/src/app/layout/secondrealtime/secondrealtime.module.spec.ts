import { SecondrealtimeModule } from './secondrealtime.module';

describe('SecondrealtimeModule', () => {
  let secondrealtimeModule: SecondrealtimeModule;

  beforeEach(() => {
    secondrealtimeModule = new SecondrealtimeModule();
  });

  it('should create an instance', () => {
    expect(secondrealtimeModule).toBeTruthy();
  });
});
