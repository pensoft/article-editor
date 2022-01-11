import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, ReplaySubject } from 'rxjs';
import { first } from 'rxjs/operators';
import { ArticlesService } from '../services/articles.service';

@Injectable({
  providedIn: 'root'
})
export class AnyProjectsGuard implements CanActivate {
  subject = new ReplaySubject<any>(1);

  constructor(
    private articlesService:ArticlesService,
    public router: Router,
  ){

  }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const isLogged = this.articlesService.getAllArticles().subscribe((res:any)=>{
      if(!(res.data&&res.data.length>0)){
        this.router.navigate(['create'])
      }

      this.subject.next(true);
    })
    return this.subject.pipe(first());
  }
}
