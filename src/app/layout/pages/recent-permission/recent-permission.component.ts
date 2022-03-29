import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
@Component({
  selector: 'app-recent-permission',
  templateUrl: './recent-permission.component.html',
  styleUrls: ['./recent-permission.component.scss'],
})
export class RecentPermissionComponent implements OnInit {
  constructor(private location: Location) {}

  ngOnInit(): void {}

  backClicked() {
    this.location.back();
  }
}
