import { Component, OnInit } from '@angular/core';
import { WebrtcProvider as OriginalWebRtc, } from 'y-webrtc';
import { map } from 'rxjs/operators';
import { sectionNode } from './utils/interfaces/section-node'
import { YdocService } from './services/ydoc.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { shereDialog } from './utils/menuItems';

import * as Y from 'yjs';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {

  TREE_DATA?: sectionNode[]

  ydoc?: Y.Doc;
  provider?: OriginalWebRtc;
  sidebar = 'comments'
  shouldBuild: boolean = false;
  roomName?: string | null;

  constructor(private ydocService: YdocService, public dialog: MatDialog, private route: ActivatedRoute) {
    shereDialog(dialog);
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(map((params: ParamMap) => params.get('id')))
      .subscribe(roomName => { this.roomName = roomName; this.ydocService.init(roomName!); });

    this.ydocService.ydocStateObservable.subscribe((event) => {
      
      if (event == 'docIsBuild') {
        let data = this.ydocService.getData();
        this.ydoc = data.ydoc
        this.provider = data.provider
        this.TREE_DATA = data.TREE_DATA
        this.shouldBuild = true
        console.log(this.ydoc);
      }
    })
  }
  
}
