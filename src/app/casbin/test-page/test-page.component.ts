import { AfterViewChecked, AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { AuthService } from '@app/core/services/auth.service';
import { of } from 'rxjs';
import { EnforcerService } from '../services/enforcer.service';

@Component({
  selector: 'app-test-page',
  templateUrl: './test-page.component.html',
  styleUrls: ['./test-page.component.scss']
})
export class TestPageComponent implements AfterViewInit {

  view = false
  output:string;
  title = "CodeSandbox";

  constructor(public enforcer: EnforcerService) {}

  ngAfterViewInit(): void {
  }

  testEnforce(sub:string,obj:string,act:string){
    this.enforcer.enforceAsync(obj,act).subscribe((access)=>{
      this.output = `obj:{${obj}}  --  act:{${act}}  --  access:{${access}}`
    })
  }
}
