import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {TreeService} from '@app/editor/meta-data-tree/tree-service/tree.service';
import {articleSection} from '@app/editor/utils/interfaces/articleSection';
import {HttpClient} from "@angular/common/http";
import {material} from "@core/services/custom_sections/material";
import {ServiceShare} from "@app/editor/services/service-share.service";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {EditSectionDialogComponent} from "@app/editor/dialogs/edit-section-dialog/edit-section-dialog.component";
import {FormBuilderService} from "@app/editor/services/form-builder.service";
import Papa from 'papaparse';
import {HelperService} from "@app/editor/section/helpers/helper.service";
import { customSecInterface } from '../funder-section/funder-section.component';
import { Subject } from 'rxjs';
@Component({
  selector: 'app-materials-section',
  templateUrl: './materials-section.component.html',
  styleUrls: ['./materials-section.component.scss']
})
export class MaterialsSectionComponent implements AfterViewInit,customSecInterface {

  @Input() onSubmit!: (data: any) => Promise<any>;
  @Output() onSubmitChange = new EventEmitter<(data: any) => Promise<any>>();

  @Input() section!: articleSection;
  @Input() fGroup!: FormGroup;
  @Output() sectionChange = new EventEmitter<articleSection>();

  @Input() triggerCustomSecSubmit: Subject<any>;
  @Output() triggerCustomSecSubmitChange = new EventEmitter<Subject<any>>();


  importMaterialData!: FormControl
  placeMultiple!: FormControl
  placeMultipleRadio!: FormControl
  init = true;
  render = false;
  isLoading = false;


  constructor(
    private treeService: TreeService,
    public http: HttpClient,
    public serviceShare: ServiceShare,
    public dialogRef: MatDialogRef<MaterialsSectionComponent>,
    public dialog: MatDialog,
    public formBuilderService: FormBuilderService,
    public helperService: HelperService,
  ) {
  }

  ngAfterViewInit(): void {
    this.importMaterialData = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('importMaterialData')?.value);
    // this.placeMultiple = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('placeMultiple')?.value);
    this.placeMultiple = new FormControl(JSON.stringify([
      {
        "typeStatus": "Holotype",
        "eventID": 1231231,
        "samplingProtocol": "UV light trap\", \"mist net\", \"bottom trawl\", \"ad hoc observation\"",
        "earliestEraOrLowestErathem": "Cenozoic",
        "identificationID": 123123123123,
        "identifiedBy": "James L. Patton",
        "type": "StillImage",
        "modified": 23078.921527777777,
        "language": "en",
        "rights": "Content licensed under Creative Commons Attribution 3.0 United States License",
        "dynamicProperties": "tragusLengthInMeters=0.014; weightInGrams=120"
      },
      {
        "typeStatus": "Syntype",
        "eventID": "test",
        "identificationID": 123321,
        "type": "alabala"
      },
      {
        "typeStatus": "Holotype",
        "eventID": 1231231,
        "samplingProtocol": "UV light trap\", \"mist net\", \"bottom trawl\", \"ad hoc observation\"",
        "earliestEraOrLowestErathem": "Cenozoic",
        "identificationID": 123123123123,
        "identifiedBy": "James L. Patton",
        "type": "StillImage",
        "modified": 23078.921527777777,
        "language": "en",
        "rights": "Content licensed under Creative Commons Attribution 3.0 United States License"
      }
    ]));
    this.placeMultipleRadio = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('placeMultipleRadio')?.value);
    this.render = true;

    this.triggerCustomSecSubmit.subscribe(()=>{
      this.triggerSubmit()
    })
  }

  @Output() async triggerSubmit() {
    let data: any = {
      importMaterialData: this.importMaterialData!.value,
      placeMultiple: this.placeMultiple!.value,
      placeMultipleRadio: this.placeMultipleRadio!.value,
    }
    Object.keys(data).forEach(key => {
      if (data[key] === undefined || data[key] === null) {
        delete data[key];
      }
    })
    await this.onSubmit({data});
  }

  addManually() {
    const materialData = JSON.parse(JSON.stringify(material));
    materialData.initialRender = this.serviceShare.YdocService.ydoc.guid
    materialData.active = true;
    materialData.defaultFormIOValues = {};
    materialData.parent = this.section;
    let sectionContent = this.formBuilderService.populateDefaultValues({}, this.section.formIOSchema, this.section.sectionID,this.section);
    this.dialog.open(EditSectionDialogComponent, {
      width: '95%',
      height: '90%',
      data: {node: this.section, form: this.fGroup, sectionContent, component: '[MM] Material'},
      disableClose: false
    }).afterClosed().subscribe(result => {
      if (result && result.data) {
        materialData.defaultFormIOValues = result.data;
        this.serviceShare.TreeService!.addNodeAtPlaceChange(this.section.sectionID, materialData, 'end');
      }
    });
    // this.serviceShare.TreeService!.addNodeAtPlaceChange(this.section.sectionID, material, 'end');
    this.dialogRef.close();
  }

  addJson() {
    this.isLoading = true;
    const convertedData = JSON.parse(this.placeMultiple!.value);
    convertedData.forEach((row: any) => {
      const materialData = JSON.parse(JSON.stringify(material));
      materialData.initialRender = this.serviceShare.YdocService.ydoc.guid
      materialData.parent = this.section;
      materialData.active = true;
      materialData.defaultFormIOValues = row;
      materialData.schema.components.map(item => {
        if (row.hasOwnProperty(item.key))
          item.defaultValue = row[item.key];
      })
      this.serviceShare.TreeService!.addNodeAtPlaceChange(this.section.sectionID, materialData, 'end');
      // this.sec
    })
    this.dialogRef.close();
  }

  async onFileSelected(event: any) {
    this.isLoading = true;


    Papa.parse(event.target.files[0], {
      worker: true,
      delimiter:";",
      complete: (results) => {
        const convertedData = []
        for (let i = 1; i < results.data.length; i++) {
          if(!(results.data[i].length == 0||results.data[i].reduce((prev,curr)=>{return prev+curr},'').length == 0)){
            const data = {};
            results.data[0].map((item, index) => {
              data[item] = results.data[i][index];
            })
            convertedData.push(data);
          }
        }
        // const convertedData = results.data;
        convertedData.forEach((row: any) => {
          const materialData = JSON.parse(JSON.stringify(material));
          materialData.parent = this.section;
          materialData.initialRender = this.serviceShare.YdocService.ydoc.guid
          materialData.active = true;
          materialData.defaultFormIOValues = row;
          materialData.schema.components.map(item => {
            if (row.hasOwnProperty(item.key))
              item.defaultValue = row[item.key];
          })
          this.serviceShare.TreeService!.addNodeAtPlaceChange(this.section.sectionID, materialData, 'end');
          // this.sec
        })
        this.dialogRef.close();
      }
    });
    // const convertedData = await CSVToArray(event.target.files[0], ';');
  }

}
