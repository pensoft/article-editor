import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationSpinnerComponent } from 'src/app/editor/validation-section/validation-spinner/validation-spinner.component';

describe('ValidaitonSpinnerComponent', () => {
  let component: ValidationSpinnerComponent;
  let fixture: ComponentFixture<ValidationSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ValidationSpinnerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidationSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
