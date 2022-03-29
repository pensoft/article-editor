import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../../../../core/services/profile.service';

@Component({
  selector: 'app-sing-in-details',
  templateUrl: './sing-in-details.component.html',
  styleUrls: ['./sing-in-details.component.scss'],
})
export class SingInDetailsComponent implements OnInit {
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
    this.profileService
      .getOtherEmailsInfo(this.img, this.email)
      // .pipe(untilDestroyed(this))
      .subscribe((response) => {
      });
  }
}
