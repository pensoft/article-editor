import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignPasswordDevicesComponent } from './sign-password-devices.component';

describe('SignPasswordDevicesComponent', () => {
  let component: SignPasswordDevicesComponent;
  let fixture: ComponentFixture<SignPasswordDevicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SignPasswordDevicesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignPasswordDevicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
