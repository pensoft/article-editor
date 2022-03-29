import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService } from '@app/core/services/profile.service';

@Component({
  selector: 'app-password-setup',
  templateUrl: './password-setup.component.html',
  styleUrls: ['./password-setup.component.scss'],
})
export class PasswordSetupComponent implements OnInit {
  public changePasswordForm!: FormGroup;

  constructor(
    private fromBuilder: FormBuilder,
    public profileService: ProfileService
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  private buildForm(): void {
    this.changePasswordForm = this.fromBuilder.group(
      {
        setPassword: ['', [Validators.minLength(8), Validators.maxLength(15)]],
        confirmPassword: [
          '',
          [Validators.minLength(8), Validators.maxLength(15)],
        ],
      },
      {
        validator: this.checkIfMatchingPasswords(
          'setPassword',
          'confirmPassword'
        ),
      }
    );
  }

  checkIfMatchingPasswords(
    passwordKey: string,
    passwordConfirmationKey: string
  ) {
    return (group: FormGroup) => {
      let passwordInput = group.controls[passwordKey],
        passwordConfirmationInput = group.controls[passwordConfirmationKey];
      if (passwordInput.value !== passwordConfirmationInput.value) {
        return passwordConfirmationInput.setErrors({ notEquivalent: true });
      } else {
        return passwordConfirmationInput.setErrors(null);
      }
    };
  }

  public submitChangePassword() {
    const { setPassword, confirmPassword } = this.changePasswordForm.value;
    this.profileService
      .changePassword(setPassword, confirmPassword)
      .subscribe((data) => {
      });
  }
}
