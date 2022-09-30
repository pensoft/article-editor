import { ThrowStmt } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { from, Observable } from 'rxjs';
import { delayWhen, shareReplay, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CasbinGuard implements CanActivate {

  constructor(
    private router: Router,
    private sharedService: ServiceShare,
    private _snackBar: MatSnackBar
    ) {
  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (
      route.pathFromRoot.length>0&&
      route.pathFromRoot[2].routeConfig.path == ':id'
      ) {
      return from(new Promise<boolean>((resolve, reject) => {
        let articleId = route.params.id;
        let userData
        this.sharedService.AuthService.getUserInfo().subscribe({next:(data)=>{
          userData = data
          let articleByIdRequest = this.sharedService.ArticlesService?.getArticleByUuid(articleId).pipe(shareReplay());
          articleByIdRequest.subscribe((res: any) => {
            if(res.status == 404){
              this.router.navigate(['dashboard']);
              resolve(false)
            }else{
              this.sharedService.EnforcerService.enforceAsync('is-admin','admin-can-do-anything',undefined).subscribe((admin)=>{
                if(admin){
                  resolve(true);
                }else{
                  let currUserId = userData.data.id;
                  let collaborators:{user_id:string,type:string}[] = res.data.collaborators;
                  if(collaborators.some((user)=>user.user_id == currUserId)){
                    resolve(true);
                  }else{
                    resolve(false);
                  }
                }
              })
            }
          }, (error) => {
            console.error(error);
            resolve(false)
          })
          this.sharedService.addResolverData('CasbinResolver',articleByIdRequest);
        },error:(err)=>{
          resolve(false);
        }})
      })).pipe(tap((x)=>{if(!x){
        this._snackBar.open("You don't have permission and cannot access this information or do this action.",'Ok');
      }}))
    }
    return Promise.resolve(true);
  }

}
