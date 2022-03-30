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

    this.typeChange.subscribe(()=>{
      this.paginator!.pageIndex = 0;
    })

    /* this.articlesService.getAllArticles().subscribe((responseData:any)=>{
      this.data = responseData.data;
    }) */
    merge(this.sort!.sortChange, this.paginator!.page, this.typeChange, this.refreshSubject)
      .pipe(
        startWith({}),
        switchMap(() => {
          let params :any= {page:(this.paginator?.pageIndex!|0)+1,pageSize:7}
          if(this.searchValue&&this.searchValue!=''){
            params['filter[name]']=this.searchValue
          }
          /* if(this.selectedType!=-1){

          } */
          console.log(this.paginator,this.searchValue,this.selectedType);
          this.isLoadingResults = true;
          /* if(this.allArticlesData){
            return of({data:JSON.parse(JSON.stringify(this.allArticlesData))})
          }else { */
            return this.articlesService.getAllArticles(params).pipe(catchError(() => new Observable(undefined)))
          //}
          return 'sd'
        }),
        map((data: any) => {
          this.isLoadingResults = false;
          this.isRateLimitReached = data === null;

          if (data === null) {
            return [];
          }

          return data;
        }),
      )
      .subscribe(data => {
        let dataToDisplay: any = data.data
        /*if(!this.allArticlesData){
          this.allArticlesData = data
        } */
        console.log(data);
        /* if (this.sort!.active) {
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
        } */
        /* if (this.selectedType != -1) {
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
              }
              return inc
            });
            return resultArr.length == valueArr.length;
            return (article.name as string).toLowerCase().includes(this.searchValue!)
          })
        } */
        let pag = data.meta.pagination
        let page = pag.current_page || 0;
        let itemsCount = pag.total;
        /* if (dataToDisplay.length > 7) {
          dataToDisplay = dataToDisplay.slice(page * 7, (page + 1) * 7);
        } */
        this.data = dataToDisplay
        this.resultsLength = itemsCount;
      });
  }

  timer:any
  public search(input: HTMLInputElement) {
    if(this.timer){
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(()=>{
      this.searchValue = input.value/* .toLowerCase(); */
      this.typeChange.next('typechange')
      this.timer = undefined
    },300)
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

  deleteArticle(deleteArticle: any) {
    this.articlesService.deleteArticleById(deleteArticle.id).subscribe((deleteResponse) => {
      if(deleteResponse.status == 204){
        this.allArticlesData = this.allArticlesData.filter((article:any)=>{
          return article.id!==deleteArticle.id
        })
        this.refreshSubject.next(deleteResponse);
      }
    })
  }
}



