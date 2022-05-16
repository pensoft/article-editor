import {Component, Input, OnInit} from '@angular/core';
import { IGravatarEmail, IUserAvatar } from '../../../core/interfaces/avatar.interface';
import { AvatarService } from '../../../editor/services/avatar.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],

})
export class AvatarComponent implements OnInit {
  public userAvatarInfo: IUserAvatar = {
    id: 'userAvatarInfo',
    name: '',
    email: 'crazymaizi@abv.bg',
  };
  @Input() set user(value: any) {
    if(value) {
      this.userAvatarInfo = value;
    }
    this.avatarService.getInfoByUser(this.userAvatarInfo.id, this.userAvatarInfo.email)
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        const { id, email} = response;
        this.userAvatarInfo.id = id;
        this.userAvatarInfo.email = email;
      });
  }

  public gravatarEmail: IGravatarEmail = {
    gravatarId: '8512a2394b7c7916e9bbe28dcadc8a03',
    email: 'crazymaizi@abv.bg'
  }

  public email!: string;
  public gravatarId!: string;

  constructor(
    public avatarService: AvatarService
  ) { }

  ngOnInit(): void {
    // this.avatarService.getInfoByUser(this.userAvatarInfo.id, this.userAvatarInfo.email)
    //   .pipe(untilDestroyed(this))
    //   .subscribe(response => {
    //     const { id, email} = response;
    //     this.userAvatarInfo.id = id;
    //     this.userAvatarInfo.email = email;
    //   });

    // if (this.userAvatarInfo.email === 'email') {
    //   this.userAvatarInfo.email = this.email;
    // } else {
    //   this.gravatarEmail.gravatarId = this.gravatarId;
    // }
  }
}
