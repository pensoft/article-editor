import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ArticlesService } from '@app/core/services/articles.service';
import { merge, Observable, of, Subject } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, SortDirection } from '@angular/material/sort';
import { HttpClient } from '@angular/common/http';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { ArticleSectionsService } from '@app/core/services/article-sections.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { YdocService } from '../services/ydoc.service';
import { articleSection } from '../utils/interfaces/articleSection';
import { uuidv4 } from 'lib0/random';
import { ProsemirrorEditorsService } from '../services/prosemirror-editors.service';
import { ServiceShare } from '../services/service-share.service';
import { CDK_DRAG_HANDLE } from '@angular/cdk/drag-drop';
import { leadingComment } from '@angular/compiler';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements AfterViewInit {

  displayedColumns: string[] = ['id', 'title', 'date', 'lastupdated', 'layout-type', 'template-type', 'autor', 'buttons'];
  data: any[] = [];
  realData: any[] = [];


  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;
  articleTemplates2: any
  allArticlesData:any;
  searchValue?: string;
  articleLayouts: any;
  typeChange: Subject<any> = new Subject();
  selectedType = -1;
  refreshSubject = new Subject();

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private ydocService: YdocService,
    private _httpClient: HttpClient,
    private articlesService: ArticlesService,
    private articleSectionsService: ArticleSectionsService,
    private prosemirrorEditorsService: ProsemirrorEditorsService,
    private serviceShare: ServiceShare,
  ) { }
  ngAfterViewInit() {
    this.articleSectionsService.getAllLayouts().subscribe((articleLayouts: any) => {
      this.articleLayouts = [...articleLayouts.data, { name: 'none', id: -1 }]
    })
    // If the user changes the sort order, reset back to the first page.
    this.sort!.sortChange.subscribe(() => {
      this.paginator!.pageIndex = 0;
    });

    /* this.articlesService.getAllArticles().subscribe((responseData:any)=>{
      this.data = responseData.data;
    }) */
    merge(this.sort!.sortChange, this.paginator!.page, this.typeChange, this.refreshSubject)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          if(this.allArticlesData){
            return of({data:JSON.parse(JSON.stringify(this.allArticlesData))})
          }else {
            return this.articlesService.getAllArticles().pipe(catchError(() => new Observable(undefined)))
          }
        }),
        map((data: any) => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.isRateLimitReached = data === null;

          if (data === null) {
            return [];
          }

          // Only refresh the result length if there is new data. In case of rate
          // limit errors, we do not want to reset the paginator to zero, as that
          // would prevent users from re-triggering requests.

          return data.data;
        }),
      )
      .subscribe(data => {
        let dataToDisplay: any = data
        if(!this.allArticlesData){
          this.allArticlesData = data
        }

        if (this.sort!.active) {
          dataToDisplay = dataToDisplay.sort((a: any, b: any) => {
            let sb = this.sort!.active;
            //@ts-ignore
            let direction = this.sort!._direction;
            if (sb == "id") {
              if (direction != 'desc') {
                return a[sb] - b[sb];
              }
              return b[sb] - a[sb];
            } else if (sb == 'title') {
              if (direction != 'desc') {
                return (a.name as string).localeCompare(b.name)
              }
              return b.name.localeCompare(a.name)
            } else if (sb == "date") {
              if (direction != 'desc') {
                return (a.created_at as string).localeCompare(b.created_at);
              }
              return (b.created_at as string).localeCompare(a.created_at);
            }else{
              return b["id"] - a["id"];
            }

          })
        }
        if (this.selectedType != -1) {
          dataToDisplay = dataToDisplay.filter((article: any) => { return article.layout.id == this.selectedType })
        }

        if (this.searchValue) {
          dataToDisplay = dataToDisplay.filter((article: any) => {
            let articleName = article.name;
            let nameCharArr: string[] = (articleName as string).toLocaleLowerCase().split('').filter((s: string) => { return (/\S/gm).test(s) })
            let valueArr: string[] = this.searchValue!.toLocaleLowerCase().split('').filter((s: string) => { return (/\S/gm).test(s) })
            let found : string[] = []
            let resultArr = valueArr.filter((el) => {
              let inc = false
              let nOfEl = valueArr.filter(el1=>el1==el).length
              let nOfElFound = found.filter(el1=>el1==el).length
              let nOfElInitioal = nameCharArr.filter(el1=>el1==el).length
              if(nameCharArr.includes(el)&&nOfElFound<nOfEl&&nOfElFound <nOfElInitioal ){

                found.push(el);
                inc = true;
                //console.log(nOfEl,nOfElFound);
              }
              return inc
            });
            if(resultArr.length == valueArr.length){
              console.log(found,valueArr);
            }
            return resultArr.length == valueArr.length;
            return (article.name as string).toLowerCase().includes(this.searchValue!)
          })
        }
        let page = this.paginator!.pageIndex || 0;
        let itemsCount = dataToDisplay.length;
        if (dataToDisplay.length > 7) {
          dataToDisplay = dataToDisplay.slice(page * 7, (page + 1) * 7);
        }
        this.data = dataToDisplay
        this.resultsLength = itemsCount;
      });
  }
  public search(value: string) {
    this.searchValue = value.toLowerCase();
    this.typeChange.next('typechange')
  }
  filterByType(selectValue: any) {
    this.selectedType = selectValue;
    this.typeChange.next('typechange')
  }
  openchooseDialog() {
    this.serviceShare.createNewArticle();
  }

  editArticle(articleData: any) {
    this.serviceShare.resetServicesData();
    this.ydocService.setArticleData(articleData);
    this.router.navigate([articleData.uuid])
  }

  deleteArticle(articleData: any) {
    this.articlesService.deleteArticleById(articleData.id).subscribe((deleteResponse) => {
      this.refreshSubject.next(deleteResponse);
    })
  }
}



