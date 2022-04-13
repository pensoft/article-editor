import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ArticleSectionsService } from '@app/core/services/article-sections.service';
import { ArticlesService } from '@app/core/services/articles.service';
import { AuthService } from '@app/core/services/auth.service';
import { ReferencePluginService } from '@app/layout/pages/library/lib-service/reference-plugin.service';
import { RefsApiService } from '@app/layout/pages/library/lib-service/refs-api.service';
import { FormioAppConfig } from '@formio/angular';
import { uuidv4 } from 'lib0/random';
import { Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  pairwise,
} from 'rxjs/operators';
//import { WebrtcProvider as OriginalWebRtc, } from 'y-webrtc';

//@ts-ignore
import * as Y from 'yjs';
import { EditorSidebarComponent } from '../layout/widgets/editor-sidebar/editor-sidebar.component';
import { AddContributorsDialogComponent } from './dialogs/add-contributors-dialog/add-contributors-dialog.component';
import { ExportOptionsComponent } from './dialogs/export-options/export-options.component';
import { FiguresDialogComponent } from './dialogs/figures-dialog/figures-dialog.component';
import { TreeService } from './meta-data-tree/tree-service/tree.service';
import { ProsemirrorEditorsService } from './services/prosemirror-editors.service';
import { ServiceShare } from './services/service-share.service';
import { WorkerService } from './services/worker.service';
import { YdocService } from './services/ydoc.service';
import { CommentsService } from './utils/commentsService/comments.service';
import { articleSection } from './utils/interfaces/articleSection';
import { treeNode } from './utils/interfaces/treeNode';
import { TrackChangesService } from './utils/trachChangesService/track-changes.service';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements OnInit, AfterViewInit {
  articleSectionsStructure?: articleSection[];

  ydoc?: Y.Doc;
  //provider?: OriginalWebRtc;
  shouldBuild: boolean = false;
  roomName?: string | null;
  shouldTrackChanges?: boolean;
  active = 'editor';

  titleControl = new FormControl();

  @ViewChild('trachChangesOnOffBtn', { read: ElementRef })
  trachChangesOnOffBtn?: ElementRef;
  OnOffTrackingChangesShowTrackingSubject: Subject<{
    trackTransactions: boolean;
  }>;

  @ViewChild(MatDrawer) sidebarDrawer?: MatDrawer;
  sidebar = '';

  @ViewChild('metaDataTreeDrawer') metaDataTreeDrawer?: MatDrawer;

  innerWidth: any;
  trackChangesData?: any;
  constructor(
    private ydocService: YdocService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private commentService: CommentsService,
    private _bottomSheet: MatBottomSheet,
    private prosemirrorEditorServie: ProsemirrorEditorsService,
    private trackChanges: TrackChangesService,
    private treeService: TreeService,
    private serviceShare:ServiceShare,
    public config: FormioAppConfig,
    private authService: AuthService,
    private articleSectionsService: ArticleSectionsService,
    private articlesService: ArticlesService,
    private workerService:WorkerService,
    private refsAPI:RefsApiService,
    private referencePluginService:ReferencePluginService
  ) {
    this.titleControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        pairwise() // gets a pair of old and new value
      )
      .subscribe(([oldValue, newName]) => {
        if (oldValue !== newName) {
          this.articlesService
            .putArticleById(
              this.ydocService.articleData.id,
              newName,
              this.ydocService.articleData!
            )
            .subscribe((data) => {});
        }
      });

    treeService.toggleTreeDrawer.subscribe((data) => {
      if (this.innerWidth <= 600) {
        this.metaDataTreeDrawer?.toggle();
      }
    });

    this.OnOffTrackingChangesShowTrackingSubject =
      prosemirrorEditorServie.OnOffTrackingChangesShowTrackingSubject;

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
            this._bottomSheet.open(EditorSidebarComponent, {
              disableClose: true,
              hasBackdrop: false,
              data: { sidebar: this.sidebar },
              panelClass: 'sidebar-bottom-sheet',
            });
            this._bottomSheet._openedBottomSheetRef
              ?.afterDismissed()
              .subscribe((data) => {
                this.sidebar = '';
              });
          }, 20);
        }
      }
    });

    let initArtcleStructureMap = () => {
      let hideshowDataInit = this.ydocService.trackChangesMetadata!.get(
        'trackChangesMetadata'
      );
      this.trackChangesData = hideshowDataInit;

      this.ydocService.trackChangesMetadata!.observe((ymap) => {
        let hideshowData = this.ydocService.trackChangesMetadata!.get(
          'trackChangesMetadata'
        );
        if (
          hideshowData.lastUpdateFromUser !==
          this.ydocService.articleStructure!.doc?.guid
        ) {
        }
        this.shouldTrackChanges = hideshowData.trackTransactions;
        this.trackChangesData = hideshowData;
      });
    };
    if (this.ydocService.editorIsBuild) {
      initArtcleStructureMap();
    } else {
      this.ydocService.ydocStateObservable.subscribe((event) => {
        if (event == 'docIsBuild') {
          initArtcleStructureMap();
        }
      });
    }

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

  clickEditorTab(){
    if(this.active=='library'){
      this.active='editor';
      this.serviceShare.CslService?.checkReferencesInAllEditors(this.prosemirrorEditorServie.editorContainers);
    }else{
      this.active='editor';
    }
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(map((params: ParamMap) => params.get('id')))
      .subscribe((roomName) => {
        this.authService.getUserInfo().subscribe((userInfo) => {
          this.roomName = roomName;
          this.ydocService.init(roomName!, userInfo);
        });
      });

    this.ydocService.ydocStateObservable.subscribe((event) => {
      if (event == 'docIsBuild') {
        let data = this.ydocService.getData();
        this.ydoc = data.ydoc;
        let trachChangesMetadata = this.ydocService.trackChangesMetadata!.get(
          'trackChangesMetadata'
        );
        this.shouldTrackChanges = trachChangesMetadata.trackTransactions;

        this.ydocService.trackChangesMetadata?.observe((ymap) => {
          let trackChangesMetadata = this.ydocService.trackChangesMetadata?.get(
            'trackChangesMetadata'
          );
          if (trackChangesMetadata.lastUpdateFromUser !== this.ydoc?.guid) {
            this.shouldTrackChanges = trackChangesMetadata.trackTransactions;
          }
        });
        //this.provider = data.provider;
        this.articleSectionsStructure = data.articleSectionsStructure;
        this.shouldBuild = true;
        this.prosemirrorEditorServie.init();
        if (!this.ydocService.articleData) {
          this.articlesService
            .getArticleByUuid(this.roomName!)
            .subscribe((data: any) => {
              this.ydocService.setArticleData(data.data);
              this.titleControl.setValue(this.ydocService.articleData.name);
            });
        } else {
          this.titleControl.setValue(this.ydocService.articleData.name);
        }
      }
    });

    this.innerWidth = window.innerWidth;

    this.prosemirrorEditorServie.mobileVersionSubject.next(
      this.innerWidth <= 600
    ); // set prosemirror editors to not be editable while in movile mod
  }

  ngAfterViewInit() {}

  turnOnOffTrachChanges(bool?: boolean) {
    if (bool) {
      this.shouldTrackChanges = bool;
      this.trackChangesData!.trackTransactions = bool;
      this.OnOffTrackingChangesShowTrackingSubject.next(this.trackChangesData!);
    } else {
      this.shouldTrackChanges = !this.shouldTrackChanges;
      this.trackChangesData!.trackTransactions =
        !this.trackChangesData!.trackTransactions;
      this.OnOffTrackingChangesShowTrackingSubject.next(this.trackChangesData!);
    }

    let buttonElement = this.trachChangesOnOffBtn
      ?.nativeElement as HTMLButtonElement;
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
      this._bottomSheet.open(EditorSidebarComponent, {
        disableClose: true,
        hasBackdrop: false,
        data: { sidebar: this.sidebar },
        panelClass: 'sidebar-bottom-sheet',
      });
      this._bottomSheet._openedBottomSheetRef
        ?.afterDismissed()
        .subscribe((data) => {
          this.sidebar = '';
        });
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.innerWidth = window.innerWidth;
    this.prosemirrorEditorServie.mobileVersionSubject.next(
      this.innerWidth <= 600
    ); // pass isMobile ot isNotMobile to prosemirror editors
  }
  openDialog(): void {
    const dialogRef = this.dialog.open(AddContributorsDialogComponent, {
      width: '665px',
     // height: '531px',
      panelClass: 'add-contributer-dialog',
      data: {},
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
    });
  }

  print() {}

  export() {
    this.dialog
      .open(ExportOptionsComponent, {
        width: '465px',
        height: '531px',
        data: {},
        disableClose: false,
      })
      .afterClosed()
      .subscribe((result) => {});
  }

  submit() {}
}
