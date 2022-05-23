import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TreeService } from '@app/editor/meta-data-tree/tree-service/tree.service';
import { articleSection } from '@app/editor/utils/interfaces/articleSection';

@Component({
  selector: 'app-taxon-section',
  templateUrl: './taxon-section.component.html',
  styleUrls: ['./taxon-section.component.scss']
})
export class TaxonSectionComponent implements AfterViewInit {

  @Input()  onSubmit!: (data:any)=>Promise<any>;
  @Output() onSubmitChange = new EventEmitter<(data:any)=>Promise<any>>();

  @Input()  section!: articleSection;
  @Output() sectionChange = new EventEmitter<articleSection>();
  render = false;

  text1Control ?:FormControl
  text2Control  ?:FormControl
  text3Control ?: FormControl

  constructor(
    private treeService: TreeService
  ) { }

  ngAfterViewInit(): void {
    this.text1Control = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('textField')?.value)
    this.text2Control  = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('textField1')?.value)
    this.text3Control = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('textField2')?.value)
    this.render=true;
  }

  async triggerSubmit(){
    let data = {
        textField:this.text1Control!.value,
        textField1:this.text2Control!.value,
      textField2:this.text3Control!.value
    }
    await this.onSubmit({data});
  }

}
