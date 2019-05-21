import { AudioModule } from './audio.module';

describe('AudioModule', () => {
  let audioModule: AudioModule;

  beforeEach(() => {
    audioModule = new AudioModule();
  });

  it('should create an instance', () => {
    expect(audioModule).toBeTruthy();
  });
});
