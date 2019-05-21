import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CccappingComponent } from './cccapping.component';

describe('CccappingComponent', () => {
  let component: CccappingComponent;
  let fixture: ComponentFixture<CccappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CccappingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CccappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
