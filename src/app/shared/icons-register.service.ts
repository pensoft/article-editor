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

    iconRegistry.addSvgIcon('addPlus', sanitizer.bypassSecurityTrustResourceUrl('./assets/icons/plus.svg'));
    iconRegistry.addSvgIcon('ProjectCircle', sanitizer.bypassSecurityTrustResourceUrl('./assets/icons/add-new-project-circle.svg'));

    iconRegistry.addSvgIcon('dashboardClock', sanitizer.bypassSecurityTrustResourceUrl('./assets/icons/dashbord-clock-item.svg'));
    iconRegistry.addSvgIcon('dashboardEdit', sanitizer.bypassSecurityTrustResourceUrl('./assets/icons/dashbord-edit-item.svg'));
    iconRegistry.addSvgIcon('dashboardDelete', sanitizer.bypassSecurityTrustResourceUrl('./assets/icons/dashbord-delete-item.svg'));
    iconRegistry.addSvgIcon('dasboardNewProject', sanitizer.bypassSecurityTrustResourceUrl('./assets/icons/dashbordNewProject.svg'));
    iconRegistry.addSvgIcon('timer', sanitizer.bypassSecurityTrustResourceUrl('./assets/icons/timer.svg'));
    iconRegistry.addSvgIcon('settings', sanitizer.bypassSecurityTrustResourceUrl('./assets/icons/settings.svg'));
    iconRegistry.addSvgIcon('userIcon', sanitizer.bypassSecurityTrustResourceUrl('./assets/icons/usericon-grey.svg'));
    iconRegistry.addSvgIcon('lock', sanitizer.bypassSecurityTrustResourceUrl('./assets/icons/lock.svg'));
    iconRegistry.addSvgIcon('iphone', sanitizer.bypassSecurityTrustResourceUrl('./assets/icons/iphone-grey.svg'));
    iconRegistry.addSvgIcon('chevronCircleLeft', sanitizer.bypassSecurityTrustResourceUrl('./assets/icons/chevron-circle-left.svg'));
    iconRegistry.addSvgIcon('modeEdit24px', sanitizer.bypassSecurityTrustResourceUrl('./assets/icons/mode_edit_24px.svg'));
    iconRegistry.addSvgIcon('addCircleGreen', sanitizer.bypassSecurityTrustResourceUrl('./assets/icons/add-circle-green.svg'));
    iconRegistry.addSvgIcon('mail', sanitizer.bypassSecurityTrustResourceUrl('./assets/icons/mail.svg'));
    iconRegistry.addSvgIcon('eyeGreen', sanitizer.bypassSecurityTrustResourceUrl('./assets/icons/eye-green.svg'));
    iconRegistry.addSvgIcon('desktopMac', sanitizer.bypassSecurityTrustResourceUrl('./assets/icons/ic_desktop_mac_24px.svg'));
    iconRegistry.addSvgIcon('checkGreen', sanitizer.bypassSecurityTrustResourceUrl('./assets/icons/check-green.svg'));
    iconRegistry.addSvgIcon('editGreen', sanitizer.bypassSecurityTrustResourceUrl('./assets/icons/edit-green.svg'));
    // iconRegistry.addSvgIconLiteral('thumbs-up', sanitizer.bypassSecurityTrustHtml(THUMBUP_ICON));
  }
}
