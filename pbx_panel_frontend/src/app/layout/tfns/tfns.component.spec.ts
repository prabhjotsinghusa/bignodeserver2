import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TfnsComponent } from './tfns.component';

describe('TfnsComponent', () => {
  let component: TfnsComponent;
  let fixture: ComponentFixture<TfnsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TfnsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TfnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
