import { Component, OnInit } from '@angular/core';
import { environment } from '@env';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  version = environment.VERSION;
  build_number = environment.BUILD_NUMBER;

  constructor() { }

  ngOnInit(): void {
  }

  goToRegister() {
    window.location.href = `${environment.authServer}/register?return_uri=${encodeURIComponent(window.location.href)}`
  }
}
