import { Component, Input, OnInit } from '@angular/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'span[matFormioLabel]',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.css']
})
export class LabelComponent implements OnInit {
  @Input() instance:any;
  label
  constructor(){

  }
  contaniner:HTMLDivElement
  getTextContent(html){
    if(!this.contaniner){
      this.contaniner = document.createElement('div')
    }
    this.contaniner.innerHTML = html;
    this.label = this.contaniner.textContent
  }

  ngOnInit(): void {
    if(this.instance && this.instance.path == "sectionTreeTitle"){
      this.getTextContent(this.instance.getValue())
      this.instance.events.addListener('formio.change',(ch,ch2)=>{
        if(ch2&&ch2.changed&&ch2.changed.instance == this.instance){
          this.getTextContent(this.instance.getValue())
        }
      })
    }
  }
}
