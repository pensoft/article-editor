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
  userSectionTitleAsLable = false;
  contaniner:HTMLDivElement
  sectionTreeTitle
  getTextContent(html){
    if(!this.contaniner){
      this.contaniner = document.createElement('div')
    }
    this.contaniner.innerHTML = html;
    this.sectionTreeTitle = this.contaniner.textContent
  }
  ngOnInit(): void {
    if(
      this.instance.originalComponent &&
      this.instance.originalComponent.properties &&
      this.instance.originalComponent.properties.useSectionTitleAsLabel&&
      this.instance.root._form.props.isSectionPopup
      ){
      this.userSectionTitleAsLable = true;
      this.sectionTreeTitle = this.instance.root._form.props.initialSectionTitle
      console.log(this.instance.root);
      this.instance.events.addListener('formio.change',(ch,ch2)=>{
        if(ch2&&ch2.changed&&ch2.changed.instance.path == "sectionTreeTitle"){
          this.getTextContent(ch2.changed.instance.getValue())
        }
      })
    }

  }
}
