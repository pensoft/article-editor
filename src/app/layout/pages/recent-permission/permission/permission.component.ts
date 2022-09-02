import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { IPermission } from '@app/core/interfaces/permission.interface';
import { ProfileService } from '../../../../core/services/profile.service';

@Component({
  selector: 'app-permission',
  templateUrl: './permission.component.html',
  styleUrls: ['./permission.component.scss'],
})
export class PermissionComponent implements OnInit {
  model: IPermission = {
    record: false,
    automaticCreation: false,
    institutionalMembership: false,
    marketableProfile: false,
    email: 'example',
    searchableProfile: false,
  };
  public permissionForm!: FormGroup;
  public email!: string;
  public otherEmailInfo: any[] = [
    {
      email: 'example@example.com',
    },
    {
      email: 'crazimaizy@gmail.com',
    },
  ];

  constructor(
    private formBuilder: FormBuilder,
    public profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit() {
    this.buildFormPermission();
    this.profileService
      .getOnlyOtherEmails(this.email)
      // .pipe(untilDestroyed(this))
      .subscribe((response) => {
      });
  }

  private buildFormPermission() {
    this.permissionForm = this.formBuilder.group({
      record: '',
      automaticCreation: '',
      institutionalMembership: '',
      marketableProfile: '',
      email: '',
      searchableProfile: '',
    });
  }

  submitPermissionForm() {
    if (this.permissionForm.valid) {
      this.profileService.submitPermissionForm(this.model);

      this.permissionForm.reset();
    }
  }
  setDeleteAccount() {
    this.profileService.deleteAccount();
    this.router.navigate(['/']);
  }

}
