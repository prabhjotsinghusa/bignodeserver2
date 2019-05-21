import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SecondrealtimeComponent } from './secondrealtime.component';

describe('SecondrealtimeComponent', () => {
  let component: SecondrealtimeComponent;
  let fixture: ComponentFixture<SecondrealtimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SecondrealtimeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SecondrealtimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
