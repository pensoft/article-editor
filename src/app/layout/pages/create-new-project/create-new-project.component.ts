import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ArticleSectionsService } from '@app/core/services/article-sections.service';
import { ArticlesService } from '@app/core/services/articles.service';
import { ProsemirrorEditorsService } from '@app/editor/services/prosemirror-editors.service';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { YdocService } from '@app/editor/services/ydoc.service';
import { articleSection } from '@app/editor/utils/interfaces/articleSection';
import { uuidv4 } from 'lib0/random';
import { DialogAddFilesComponent } from './dialog-add-files/dialog-add-files.component';

@Component({
  selector: 'app-create-new-project',
  templateUrl: './create-new-project.component.html',
  styleUrls: ['./create-new-project.component.scss']
})
export class CreateNewProjectComponent implements OnInit {
  // files: File[] = [];
  constructor(
    public dialog: MatDialog,
    private router: Router,
    private ydocService: YdocService,
    private articleSectionsService: ArticleSectionsService,
    private articlesService:ArticlesService,
    private prosemirrorEditorsService:ProsemirrorEditorsService,
    private serviceShare:ServiceShare,
  ) { }

  ngOnInit(): void {
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddFilesComponent, {
      //width: '100%',
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }
  openDialogChoose(): void {
    this.serviceShare.createNewArticle();
  }
  // onSelect(event: { addedFiles: any; }) {
  //   this.files.push(...event.addedFiles);
  // }

  // onRemove(event: File) {
  //   this.files.splice(this.files.indexOf(event), 1);
  // }
}
