import { ThrowStmt } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CasbinGuard implements CanActivate {

  constructor(
    private router: Router,
    private sharedService: ServiceShare
    ) {
  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (
      route.pathFromRoot.length>0&&
      route.pathFromRoot[2].routeConfig.path == ':id'
      ) {
      return new Promise<boolean>((resolve, reject) => {
        let articleId = route.params.id;
        let articleByIdRequest = this.sharedService.ArticlesService?.getArticleByUuid(articleId).pipe(shareReplay());
        articleByIdRequest.subscribe((res: any) => {
          if(res.status == 404){
            this.router.navigate(['dashboard']);
            resolve(false)
          }else{
            let articleData = res.data;
            resolve(true);
          }
        }, (error) => {
          console.error(error);
          resolve(false)
        })
        this.sharedService.addResolverData('CasbinResolver',articleByIdRequest);

      })
    }
    return Promise.resolve(true);
  }

}
