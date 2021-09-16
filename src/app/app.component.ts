import { ArrayDataSource } from '@angular/cdk/collections';
import { NestedTreeControl } from '@angular/cdk/tree';
import { Component } from '@angular/core';

interface sectionNode {
  name: string;
  children?: sectionNode[];
  active?: boolean;
}
const TREE_DATA: sectionNode[] = [
  {
    name: 'Article metadata',
    children: [
      { name: 'Title', active: true },
      { name: 'Abstract & Keywords', active: false },
      { name: 'Classifications', active: false },
      { name: 'Funder', active: false },
    ]
  }, { name: 'Introduction', active: true },
  { name: 'General description', active: false },
  { name: 'Project description', active: false },
  { name: 'Sampling methods', active: false },
  { name: 'Geographic coverage', active: true },
  { name: 'Taxonomic coverage', active: false },
  { name: 'Traits coverage', active: false },
  { name: 'Temporal coverage', active: true },
  { name: 'Collection data', active: false },
  { name: 'Usage rights', active: false },
  { name: 'Data resources', active: false },
  { name: 'Additional information', active: false },
  { name: 'Acknowledgements', active: false },
  { name: 'Author contributions', active: false },
];
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public content: Object = {
    "type": "doc",
    "content": []
};
  hasChild = (_: number, node: sectionNode) => !!node.children && node.children.length > 0;
  treeControl = new NestedTreeControl<sectionNode>(node => node.children);
  dataSource = new ArrayDataSource(TREE_DATA);
  constructor() {
    navigator.serviceWorker.ready.then(function(registration) {
      return registration.sync.register('sendFormData')
    }).then(function () {
     }).catch(function() {
       // system was unable to register for a sync,
       // this could be an OS-level restriction
       console.log('sync registration failed')
     });
  }
  ngOnInit(): void {
  }

}
