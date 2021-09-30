import { Injectable } from '@angular/core';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class IconsRegisterService {


  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    // Note that we provide the icon here as a string literal here due to a limitation in
    // Stackblitz. If you want to provide the icon from a URL, you can use:
    const s = sanitizer.bypassSecurityTrustResourceUrl('assets/icons/edit1.svg');
    iconRegistry.addSvgIcon('edit1', sanitizer.bypassSecurityTrustResourceUrl('./assets/icons/edit1.svg'));

    iconRegistry.addSvgIcon('library', sanitizer.bypassSecurityTrustResourceUrl('./assets/icons/library.svg'));
    iconRegistry.addSvgIcon('contributors', sanitizer.bypassSecurityTrustResourceUrl('./assets/icons/contributors.svg'));
    iconRegistry.addSvgIcon('comments', sanitizer.bypassSecurityTrustResourceUrl('./assets/icons/comments.svg'));
    iconRegistry.addSvgIcon('reference', sanitizer.bypassSecurityTrustResourceUrl('./assets/icons/reference.svg'));
    iconRegistry.addSvgIcon('validate', sanitizer.bypassSecurityTrustResourceUrl('./assets/icons/validate.svg'));
    iconRegistry.addSvgIcon('dashboard', sanitizer.bypassSecurityTrustResourceUrl('./assets/icons/dashboard.svg'));

    iconRegistry.addSvgIcon('pieChart', sanitizer.bypassSecurityTrustResourceUrl('./assets/icons/chart-pie.svg'));
    iconRegistry.addSvgIcon('linearChart', sanitizer.bypassSecurityTrustResourceUrl('./assets/icons/chart-line.svg'));
    iconRegistry.addSvgIcon('barChart', sanitizer.bypassSecurityTrustResourceUrl('./assets/icons/chart-bar.svg'));
    iconRegistry.addSvgIcon('periodicChart', sanitizer.bypassSecurityTrustResourceUrl('./assets/icons/chart-area.svg'));
    iconRegistry.addSvgIcon('bubbleChart', sanitizer.bypassSecurityTrustResourceUrl('./assets/icons/chart-bubble.svg'));

    iconRegistry.addSvgIcon('openPadlock', sanitizer.bypassSecurityTrustResourceUrl('./assets/img/open-padlock.svg'));


    // iconRegistry.addSvgIconLiteral('thumbs-up', sanitizer.bypassSecurityTrustHtml(THUMBUP_ICON));
  }
}
