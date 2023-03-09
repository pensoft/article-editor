import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ServiceShare } from '@app/editor/services/service-share.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'span[matFormioLabel]',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.css']
})
export class LabelComponent implements OnInit {
  @Input() instance:any;
  label
  constructor(private serviceShare:ServiceShare){

  }
  userSectionTitleAsLable = false;
  contaniner:HTMLDivElement
  sectionTreeTitle
  getTextContent(html){
    if(!this.contaniner){
      this.contaniner = document.createElement('div')
    }
    this.contaniner.innerHTML = html;
    this.sectionTreeTitle = html
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
      let labelTemplate = this.instance.root._form.props.sectionLabelTemplate
      let shouldInterpolate = /{{\s*\S*\s*}}|<span(\[innerHTML]="[\S]+"|[^>])+>[^<]*<\/span>/gm.test(labelTemplate);
      let dummyFormGroup = new FormGroup({})

      this.instance.events.addListener('formio.change',(ch,ch2)=>{
        this.instance.root.formIOComponent.isLoading = this.instance.root.loading
        if(shouldInterpolate && ch && ch.data ){
          let vals = JSON.parse(JSON.stringify(ch.data));
          if(this.instance.root){
            let rawVals = this.instance.root.rawVals;
            if(rawVals){
              Object.keys(rawVals).forEach((key)=>{
                vals[key] = rawVals[key];
              })
            }
          }
          this.serviceShare.ProsemirrorEditorsService?.interpolateTemplate(labelTemplate, vals, dummyFormGroup).then((newTitle: string) => {
            this.getTextContent(newTitle)
          })
        }else if(ch&&ch.data){
          let vals = JSON.parse(JSON.stringify(ch.data));
          if(this.instance.root){
            let rawVals = this.instance.root.rawVals;
            if(this.instance.root.rawVals){
              Object.keys(rawVals).forEach((key)=>{
                vals[key] = rawVals[key];
              })
            }
          }
          if(vals.sectionTreeTitle){
            this.getTextContent(vals.sectionTreeTitle)
          }
        }
      })
    }

  }
}
