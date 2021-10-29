import { Component, OnInit } from '@angular/core';
import {uuidv4} from "lib0/random";


@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  uuid = uuidv4();
  constructor() { }

  ngOnInit(): void {
  }

}
