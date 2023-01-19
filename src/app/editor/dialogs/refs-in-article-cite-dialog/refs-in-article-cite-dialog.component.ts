import { Component, OnInit } from '@angular/core';
import { YdocService } from '@app/editor/services/ydoc.service';

interface refsObj{
  [key:string]:articleRef
}

interface articleRef{
  ref
}

@Component({
  selector: 'app-refs-in-article-cite-dialog',
  templateUrl: './refs-in-article-cite-dialog.component.html',
  styleUrls: ['./refs-in-article-cite-dialog.component.scss']
})

export class RefsInArticleCiteDialogComponent implements OnInit {
  refsAddedToArticle
  constructor(ydocService:YdocService) {
    this.refsAddedToArticle = ydocService.referenceCitationsMap.get('refsAddedToArticle');

  }

  ngOnInit(): void {

  }

}
