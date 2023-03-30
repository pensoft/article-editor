import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { Observable, ReplaySubject } from 'rxjs';
import { first, shareReplay } from 'rxjs/operators';
import { ArticlesService } from '../services/articles.service';

@Injectable({
  providedIn: 'root'
})
export class AnyProjectsGuard implements CanActivate {
  subject = new ReplaySubject<any>(1);

  constructor(
    private sharedService: ServiceShare,
    public router: Router,
  ){

  }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    console.log('--AnyProjectsGuard--');
    return new Promise<boolean>((resolve, reject) => {
      let articleId = route.params.id;
      let articlesGetObservable = this.sharedService.ArticlesService?.getAllArticles({page:1,pageSize:7,sort:'-id'}).pipe(shareReplay());
      articlesGetObservable.subscribe((res: any) => {
        if(res.status == 404){
          this.router.navigate(['create']);
          resolve(false)
        }else{
          let articleData = res.data;
          resolve(true);
        }
      }, (error) => {
        this.router.navigate(['create']);
        console.error(error);
        resolve(false)
      })
      this.sharedService.addResolverData('DasboardResolver',articlesGetObservable);

    })
  }
}
