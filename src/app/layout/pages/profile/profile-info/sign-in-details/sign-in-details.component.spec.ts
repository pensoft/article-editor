import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignInDetailsComponent } from './sign-in-details.component';

describe('SignInDetailsComponent', () => {
  let component: SignInDetailsComponent;
  let fixture: ComponentFixture<SignInDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SignInDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignInDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
