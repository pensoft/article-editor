import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { FormioAppConfig } from '@formio/angular';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { WebrtcProvider as OriginalWebRtc, } from 'y-webrtc';

import * as Y from 'yjs';
import { EditorSidebarComponent } from '../layout/widgets/editor-sidebar/editor-sidebar.component';
import { TreeService } from './meta-data-tree/tree-service/tree.service';
import { ProsemirrorEditorsService } from './services/prosemirror-editors.service';
import { YdocService } from './services/ydoc.service';
import { CommentsService } from './utils/commentsService/comments.service';
import { articleSection } from './utils/interfaces/articleSection';
import { treeNode } from './utils/interfaces/treeNode';
import { TrackChangesService } from './utils/trachChangesService/track-changes.service';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: [ './editor.component.scss' ]
})
export class EditorComponent implements OnInit, AfterViewInit {

  articleSectionsStructure?: articleSection[];

  ydoc?: Y.Doc;
  provider?: OriginalWebRtc;
  shouldBuild: boolean = false;
  roomName?: string | null;
  showTrachChanges?: boolean = false;
  active = 'editor';

  @ViewChild('trachChangesOnOffBtn', { read: ElementRef }) trachChangesOnOffBtn?: ElementRef;
  changesOnOffSubject: Subject<boolean>;
  showChangesSubject: Subject<boolean>;

  @ViewChild(MatDrawer) sidebarDrawer?: MatDrawer;
  sidebar = '';

  @ViewChild('metaDataTreeDrawer') metaDataTreeDrawer?: MatDrawer;

  innerWidth: any;

  constructor(
    private ydocService: YdocService,
    private route: ActivatedRoute,
    private commentService: CommentsService,
    private _bottomSheet: MatBottomSheet,
    private prosemirrorEditorServie: ProsemirrorEditorsService,
    private trackChanges: TrackChangesService,
    private treeService: TreeService,
    public config: FormioAppConfig
  ) {

    treeService.toggleTreeDrawer.subscribe((data) => {
      if (this.innerWidth <= 600) {
        this.metaDataTreeDrawer?.toggle();
      }
    });

    this.changesOnOffSubject = prosemirrorEditorServie.changesOnOffSubject;
    this.showChangesSubject = trackChanges.showChangesSubject;
    this.commentService.addCommentSubject.subscribe((data) => {
      if (data.type == 'commentData') {
        if (this.innerWidth > 600) {
          if (!this.sidebarDrawer?.opened) {
            this.sidebarDrawer?.toggle();
          }
          if (this.sidebar !== 'comments') {
            this.sidebar = 'comments';
          }
        } else {
          setTimeout(() => {
            this.sidebar = 'comments';
            this._bottomSheet.open(
              EditorSidebarComponent,
              { disableClose: true, hasBackdrop: false, data: { sidebar: this.sidebar }, panelClass: 'sidebar-bottom-sheet' }
            );
            this._bottomSheet._openedBottomSheetRef?.afterDismissed().subscribe(data => {
              this.sidebar = '';
            });
          }, 20);
        }
      }
    });
    this.treeService.treeVisibilityChange.subscribe((data) => {
      if (data.action == 'editNode') {
        if (this.innerWidth <= 600) {
          this.metaDataTreeDrawer?.toggle();
        }
      }
    });
  }

  showTreeContainer() {
    this.metaDataTreeDrawer?.toggle();
  }

  ngOnInit(): void {

    this.route.paramMap
      .pipe(map((params: ParamMap) => params.get('id')))
      .subscribe(roomName => {
        this.roomName = roomName;
        this.ydocService.init(roomName!);
      });

    this.ydocService.ydocStateObservable.subscribe((event) => {
      if (event == 'docIsBuild') {
        let data = this.ydocService.getData();
        this.ydoc = data.ydoc;
        this.provider = data.provider;
        this.articleSectionsStructure = data.articleSectionsStructure;
        this.shouldBuild = true;
        this.prosemirrorEditorServie.init();
      }
    });

    this.innerWidth = window.innerWidth;

    this.prosemirrorEditorServie.mobileVersionSubject.next(this.innerWidth <= 600)  // set prosemirror editors to not be editable while in movile mod

  }

  ngAfterViewInit() {
    let buttonElement = this.trachChangesOnOffBtn?.nativeElement;
    /* if(this.showTrachChanges){
      buttonElement.style.color = '#19d928'
    }else{
      buttonElement.style.color = '#f37b4a'
    } */
  }

  showHideChanges(bool: boolean) {
    this.showChangesSubject.next(bool);
  }

  turnOnOffTrachChanges(bool?: boolean) {
    if (bool) {
      this.showTrachChanges = bool;
      this.changesOnOffSubject.next(bool);
    } else {
      this.showTrachChanges = !this.showTrachChanges;
      this.changesOnOffSubject.next(this.showTrachChanges);
    }

    /* let buttonElement = this.trachChangesOnOffBtn?.nativeElement as HTMLButtonElement
    if(bool){
      buttonElement.style.color = '#19d928'
    }else{
      buttonElement.style.color = '#f37b4a'
    } */
  }

  toggleSidebar(section: string) {
    if (this.innerWidth > 600) {
      if (!this.sidebarDrawer?.opened || this.sidebar == section) {
        this.sidebarDrawer?.toggle();
      }
      this.sidebar = section;

      // If it's closed - clear the sidebar value
      if (!this.sidebarDrawer?.opened) {
        this.sidebar = '';
      }
    } else {
      this.sidebar = section;
      this._bottomSheet.open(
        EditorSidebarComponent,
        { disableClose: true, hasBackdrop: false, data: { sidebar: this.sidebar }, panelClass: 'sidebar-bottom-sheet' }
      );
      this._bottomSheet._openedBottomSheetRef?.afterDismissed().subscribe(data => {
        this.sidebar = '';
      });
    }
  }

  @HostListener('window:resize', [ '$event' ])
  onResize(event: any) {
    this.innerWidth = window.innerWidth;
    this.prosemirrorEditorServie.mobileVersionSubject.next(this.innerWidth <= 600) // pass isMobile ot isNotMobile to prosemirror editors
  }

  print() {
  }

  export() {
  }

  submit() {
  }
}
