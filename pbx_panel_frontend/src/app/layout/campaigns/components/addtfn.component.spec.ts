import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { AddtfnComponent } from './addtfn.component'


describe('FormComponent', () => {
  let component: AddtfnComponent
  let fixture: ComponentFixture<AddtfnComponent>

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [
          BrowserAnimationsModule,
          RouterTestingModule,
         ],
      }).compileComponents()
    })
  )

  beforeEach(() => {
    fixture = TestBed.createComponent(AddtfnComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
