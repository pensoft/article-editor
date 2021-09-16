import { Component, OnInit } from '@angular/core';
import { WebrtcProvider as OriginalWebRtc, } from 'y-webrtc';
import { map } from 'rxjs/operators';
import { YdocService } from './services/ydoc.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { treeNode } from './utils/interfaces/treeNode';
import { MatDrawer } from '@angular/material/sidenav';
import { ViewChild } from '@angular/core';

import * as Y from 'yjs';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {

  TREE_DATA?: treeNode[]

  ydoc?: Y.Doc;
  provider?: OriginalWebRtc;
  shouldBuild: boolean = false;
  roomName?: string | null;

  active = 'editor';

  @ViewChild(MatDrawer) sidebarDrawer?: MatDrawer;
  sidebar = 'validation';

  constructor(private ydocService: YdocService, private route: ActivatedRoute) {
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
      }
    })
  }

  toggleSidebar(section: string) {
    if (!this.sidebarDrawer?.opened || this.sidebar == section) {
      this.sidebarDrawer?.toggle();
    }
    this.sidebar = section;

    // If it's closed - clear the sidebar value
    if (!this.sidebarDrawer?.opened) {
      this.sidebar = '';
    }
  }

  print() { }

  export() { }

  submit() { }
}
