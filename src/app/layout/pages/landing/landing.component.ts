import { Component, Inject, OnInit } from '@angular/core';
import Packages from '../../../../../package.json';
import { APP_CONFIG, AppConfig } from '@core/services/app-config';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  version = `${Packages.version}`;

  constructor(@Inject(APP_CONFIG) private config: AppConfig,) { }

  ngOnInit(): void {
  }

  goToRegister() {
    window.location.href = `${this.config.authService}/register?return_uri=${encodeURIComponent(window.location.href)}`
  }
}
