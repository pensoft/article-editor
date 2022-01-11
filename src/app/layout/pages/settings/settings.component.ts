import { Component, OnInit } from '@angular/core';
import { IUserDetail } from '@app/core/interfaces/auth.interface';
import { AuthService } from '@app/core/services/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  userName?: IUserDetail[];
  constructor(
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authService.getUserInfo().subscribe(response => {
      const name = response.data.name;
      this.userName = name;
    })
  }

}
