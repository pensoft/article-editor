import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'html' })
export class htmlPipe implements PipeTransform {
  transform(html: string): string {
    function process(str: string) {

      var div = document.createElement('div');
      div.innerHTML = str.trim();

      return format(div, 0).innerHTML;
    }

    function format(node: any, level: any) {

      var indentBefore = new Array(level++ + 1).join('  '),
        indentAfter = new Array(level - 1).join('  '),
        textNode;

      for (var i = 0; i < node.children.length; i++) {

        textNode = document.createTextNode('\n' + indentBefore);
        node.insertBefore(textNode, node.children[i]);

        format(node.children[i], level);

        if (node.lastElementChild == node.children[i]) {
          textNode = document.createTextNode('\n' + indentAfter);
          node.appendChild(textNode);
        }
      }
      if (node.children.length == 0){
        node.innerHTML = ""
        //node.appendChild(document.createTextNode('\n' + indentAfter+'\n' + indentAfter));
      }

      return node;
    }
    return process(html);
  }
}
