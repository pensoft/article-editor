import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ArticlesService } from '@app/core/services/articles.service';
import { merge, Observable, Subject} from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, SortDirection } from '@angular/material/sort';
import { HttpClient } from '@angular/common/http';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { ArticleSectionsService } from '@app/core/services/article-sections.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { YdocService } from '../services/ydoc.service';
import { ChooseManuscriptDialogComponent } from '../dialogs/choose-manuscript-dialog/choose-manuscript-dialog.component';
import { articleSection } from '../utils/interfaces/articleSection';
import { uuidv4 } from 'lib0/random';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements AfterViewInit {

  displayedColumns: string[] = ['id','title','date','lastupdated', 'type','autor' ,'buttons'];
  data: any[] = [];
  realData:any[] = [];


  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;
  articleTemplates2:any

  searchValue ?: string ;
  articleTemplates :any;
  typeChange : Subject<any> = new Subject();
  selectedType = -1;

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private ydocService: YdocService,
    private _httpClient: HttpClient,
    private articlesService:ArticlesService,
    private articleSectionsService:ArticleSectionsService
    ) {}
  ngAfterViewInit() {
    this.articleSectionsService.getAllTemplates().subscribe((articleTemplates: any) => {
      this.articleTemplates = [...articleTemplates.data,{name:'none',id:-1}]
    })
    // If the user changes the sort order, reset back to the first page.
    this.sort!.sortChange.subscribe(() => {
      this.data = this.data.sort((a,b)=>{
        let sb = this.sort!.active;
        //@ts-ignore
        let direction = this.sort!._direction;
        if(sb == "id"||sb == "date"){
          if(direction == 'desc'){
            return a[sb]-b[sb];
          }
          return b[sb]-a[sb];
        }else if(sb == 'title'){
          if(direction == 'desc'){
            return (a.name as string).localeCompare(b.name)
          }
          return b.name.localeCompare(a.name)
        }
      })
      this.paginator!.pageIndex = 0;
    });

    this.articlesService.getAllArticles().subscribe((responseData:any)=>{
      this.data = responseData.data;
    })
    merge(this.sort!.sortChange, this.paginator!.page,this.typeChange)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.articlesService.getAllArticles().pipe(catchError(() => new Observable(undefined)));
        }),
        map((data:any) => {
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
        let dataToDisplay:any = data
        if(this.sort!.active){
          dataToDisplay = dataToDisplay.sort((a:any,b:any)=>{
            let sb = this.sort!.active;
            //@ts-ignore
            let direction = this.sort!._direction;
            if(sb == "id"){
              if(direction != 'desc'){
                return a[sb]-b[sb];
              }
              return b[sb]-a[sb];
            }else if(sb == 'title'){
              if(direction != 'desc'){
                return (a.name as string).localeCompare(b.name)
              }
              return b.name.localeCompare(a.name)
            }else if(sb == "date"){
              if(direction != 'desc'){
                return (a.created_at as string).localeCompare(b.created_at);
              }
              return (b.created_at as string).localeCompare(a.created_at);
            }

          })
        }
        if(this.selectedType!=-1){
          dataToDisplay = dataToDisplay.filter((article:any)=>{return article.template.id == this.selectedType})
        }

        if(this.searchValue){
          dataToDisplay = dataToDisplay.filter((article:any)=>{return (article.name as string).includes(this.searchValue!)})
        }
        let page = this.paginator!.pageIndex||0;
        let itemsCount = dataToDisplay.length;
        if(dataToDisplay.length>7){
          dataToDisplay = dataToDisplay.slice(page*7,(page+1)*7);
        }
        this.data = dataToDisplay
        this.resultsLength = itemsCount;
        console.log(this.paginator!);
      });
  }
  public search(value: any) {
    this.searchValue = value
    this.typeChange.next('typechange')
  }
  filterByType(selectValue:any){
    this.selectedType = selectValue;
    this.typeChange.next('typechange')
  }
  openchooseDialog(){
    this.articleSectionsService.getAllTemplates().subscribe((articleTemplates: any) => {
      this.articleTemplates2 = articleTemplates
      const dialogRef = this.dialog.open(ChooseManuscriptDialogComponent, {
        width: '100%',
        panelClass:'choose-namuscript-dialog',
        data: { templates: articleTemplates }
      });
      dialogRef.afterClosed().subscribe(result => {
        let selectedTemplate = (this.articleTemplates2.data as Array<any>).find((template: any) => {
          return template.id == result
        })
        let articleStructure: articleSection[] = []
        let filteredSections = selectedTemplate.sections.filter((section: any) => { return section.type == 0 });
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
        this.ydocService.articleStructureFromBackend = articleStructure;
        this.articlesService.createArticle('Untitled',+result).subscribe((createArticleRes:any)=>{
          this.ydocService.resetYdoc();
          this.ydocService.setArticleData(createArticleRes.data)
          this.router.navigate([createArticleRes.data.uuid])
        })
      });
    })
  }

  editArticle(articleData:any){
    this.ydocService.resetYdoc();
    this.ydocService.setArticleData(articleData);
    this.router.navigate([articleData.uuid])
  }
}



