import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public content?: string;
  constructor() {

  }
  ngOnInit(): void {
    this.content = `
# This is just a test
## This is a subtitle
This is normal content
* this is a bullet point
* another bullet point
`;
  }
}
