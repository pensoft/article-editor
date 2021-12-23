import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ArticleSectionsService } from '@app/core/services/article-sections.service';
import { ChooseManuscriptDialogComponent } from '@app/editor/dialogs/choose-manuscript-dialog/choose-manuscript-dialog.component';
import { YdocService } from '@app/editor/services/ydoc.service';
import { articleSection } from '@app/editor/utils/interfaces/articleSection';
import { uuidv4 } from 'lib0/random';
import { template } from 'lodash';
import { DialogAddFilesComponent } from './dialog-add-files/dialog-add-files.component';

@Component({
  selector: 'app-create-new-project',
  templateUrl: './create-new-project.component.html',
  styleUrls: ['./create-new-project.component.scss']
})
export class CreateNewProjectComponent implements OnInit {
  // files: File[] = [];
  articleTemplates: any;
  constructor(
    public dialog: MatDialog,
    private router: Router,
    private ydocService: YdocService,
    private articleSectionsService: ArticleSectionsService
  ) { }

  ngOnInit(): void {
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddFilesComponent, {
      width: '100%',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');

    });
  }
  openDialogChoose(): void {
    this.articleSectionsService.getAllTemplates().subscribe((articleTemplates: any) => {
      this.articleTemplates = articleTemplates
      const dialogRef = this.dialog.open(ChooseManuscriptDialogComponent, {
        width: '100%',
        panelClass:'choose-namuscript-dialog',
        data: { templates: articleTemplates }
      });
      dialogRef.afterClosed().subscribe(result => {
        console.log('choise', result);
        let selectedTemplate = (this.articleTemplates.data as Array<any>).find((template: any) => {
          return template.name == result
        })
        let articleStructure: articleSection[] = []
        let filteredSections = selectedTemplate.sections.filter((section: any) => { return section.type == 0 });
        console.log('sectionsData', filteredSections);
        selectedTemplate.sections.forEach((section: any) => {
          let newArticleSection: articleSection = {
            title: { type: 'content', contentData: 'Title233', titleContent: section.name, key: 'titleContent' },  //titleContent -   title that will be displayed on the data tree ||  contentData title that will be displayed in the editor
            sectionID: uuidv4(),
            active: false,
            edit: { bool: true, main: true },
            add: { bool: true, main: false },
            delete: { bool: true, main: false },
            mode: 'documentMode',
            formIOSchema: section.schema[0],
            defaultFormIOValues: undefined,
            prosemirrorHTMLNodesTempl: section.template,
            children: [],
          }
          articleStructure.push(newArticleSection);
        })
        this.ydocService.articleStructureFromBackend = articleStructure
        this.router.navigate([uuidv4()])
      });
    })

  }
  // onSelect(event: { addedFiles: any; }) {
  //   console.log(event);
  //   this.files.push(...event.addedFiles);
  // }

  // onRemove(event: File) {
  //   console.log(event);
  //   this.files.splice(this.files.indexOf(event), 1);
  // }
}
