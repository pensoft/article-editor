import { Component, OnInit } from '@angular/core';
import { ISingInEmails } from '@app/core/interfaces/sing-in-emails.interface';
import { ProfileService } from '@app/core/services/profile.service';
import { untilDestroyed } from '@ngneat/until-destroy';

@Component({
  selector: 'app-sign-in-details',
  templateUrl: './sign-in-details.component.html',
  styleUrls: ['./sign-in-details.component.scss'],
})
export class SignInDetailsComponent implements OnInit {
  // public otherEmailInfo: ISingInEmails;

  public img!: string;
  public email!: string;

  public otherEmailInfo: any[] = [
    {
      img: '../../../../assets/img/mail.svg',
      email: 'example@example.com',
    },
    {
      img: '../../../../assets/img/icon-gmail.png',
      email: 'crazimaizy@gmail.com',
    },
  ];

  constructor(public profileService: ProfileService) {}

  ngOnInit(): void {
    // this.profileService
    //   .getOtherEmailsInfo(this.otherEmailInfo.img, this.otherEmailInfo.email)
    //   .pipe(untilDestroyed(this))
    //   .subscribe((response) => {
    //     const { img, email } = response;
    //     this.otherEmailInfo.img = img;
    //     this.otherEmailInfo.email = email;
    //   });
    this.profileService
      .getOtherEmailsInfo(this.img, this.email)
      .pipe(untilDestroyed(this))
      .subscribe((response) => {
      });
  }
}
