import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommoncallsComponent } from './commoncalls.component';

describe('CommoncallsComponent', () => {
  let component: CommoncallsComponent;
  let fixture: ComponentFixture<CommoncallsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommoncallsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommoncallsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
