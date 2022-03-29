import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-profile-info',
  templateUrl: './profile-info.component.html',
  styleUrls: ['./profile-info.component.scss'],
})
export class ProfileInfoComponent implements OnInit {
  constructor(private location: Location) {}

  ngOnInit(): void {}

  backClicked() {
    this.location.back();
  }
}
