import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'email'
})
export class EmailPipe implements PipeTransform {

  constructor(private sanitize: DomSanitizer) {}

  transform(value: any, type?: string): any {
    return this.textToEmails(value);
  }

  textToEmails(value: string): SafeHtml {
    const email = /[\w-\.]+@([\w-]+\.)+[\w-]{2,4}/gm;
    return this.sanitize
      .bypassSecurityTrustHtml(value.replace(email, (m, $1) => `<a href="mailto:${m}">${m}</a>`));
  }

}
