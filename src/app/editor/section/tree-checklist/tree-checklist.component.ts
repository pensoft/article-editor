import {SelectionModel} from '@angular/cdk/collections';
import {FlatTreeControl} from '@angular/cdk/tree';
import {Component, Injectable, OnInit} from '@angular/core';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient} from "@angular/common/http";
import {FormControl, NG_VALUE_ACCESSOR} from "@angular/forms";
import {journalTree} from "@core/services/journalTreeConstants";
import {map, startWith} from "rxjs/operators";

/**
 * Node for to-do item
 */
export class TodoItemNode {
  children: TodoItemNode[] | undefined;
  item: string | undefined;
}

/** Flat to-do item node with expandable and level information */
export class TodoItemFlatNode {
  item: string | undefined;
  level: number | undefined;
  expandable: boolean | undefined;
}

/**
 * The Json object for to-do list data.
 */

/*const TREE_DATA = {
  Groceries: {
    'Almond Meal flour': null,
    'Organic eggs': null,
    'Protein Powder': null,
    Fruits: {
      Apple: null,
      Berries: ['Blueberry', 'Raspberry'],
      Orange: null
    }
  },
  Reminders: [
    'Cook dinner',
    'Read the Material Design spec',
    'Upgrade Application to Angular'
  ]
};*/

/**
 * Checklist database, it can build a tree structured Json object.
 * Each node in Json object represents a to-do item or a category.
 * If a node is a category, it has children items and new items can be added under the category.
 */
@Injectable()
export class ChecklistDatabase {

  dataChange = new BehaviorSubject<TodoItemNode[]>([]);

  get data(): TodoItemNode[] {
    return this.dataChange.value;
  }

  constructor(public http: HttpClient) {
    this.initialize();
  }

  initialize() {
    // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
    //     file node as children.
    this.http.get(`https://something/journaltree`).subscribe(res => {
      this.buildNestedJson(res);
    })
    // const data = this.buildFileTree(TREE_DATA, 0);

    // Notify the change.
    // this.dataChange.next(data);
  }

  /**
   * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
   * The return value is the list of `TodoItemNode`.
   */

  /*buildFileTree(obj: {[key: string]: any}, level: number): TodoItemNode[] {
    return Object.keys(obj).reduce<TodoItemNode[]>((accumulator, key) => {
      const value = obj[key];
      const node = new TodoItemNode();
      node.item = key;

      if (value != null) {
        if (typeof value === 'object') {
          node.children = this.buildFileTree(value, level + 1);
        } else {
          node.item = value;
        }
      }

      return accumulator.concat(node);
    }, []);
  }*/
  buildNestedJson(res: any) {
    const TREE_DATA = {};
    res.forEach((node: any) => {
      let strL = node.pos.length;
      let positions = []
      for(let i = 0 ; i < strL-1;i+=2){
        let char = node.pos[i];
        let char2 = node.pos[i+1];
        positions.push(char+char2)
      }
      positions.reduce((next: any, current: any, index: any) => {
        if (!next[current]) {
          if (positions.length - 1 === index) {
            next[current] = node;
          } else {
            next[current] = {};
          }
        }
        if (positions.length - 1 === index) {
          next[current] = {...next[current], ...node};
        }
        return next[current];
      }, TREE_DATA)
    });
    const data = this.buildFileTree(TREE_DATA, 0);
    this.dataChange.next(data);

  }

  buildFileTree(obj: { [key: string]: any }, level: number): any[] {
    // @ts-ignore
    return Object.keys(obj).filter(s => {
      return !['id', 'name', 'journal_ids', 'rootnode', 'pos', 'nomenclaturalCode', 'parents'].includes(s)
    }).sort(
      // @ts-ignore
      (a: any, b: any) => {
        if (obj[a].name < obj[b].name) {
          return -1;
        }
        if (obj[a].name > obj[b].name) {
          return 1;
        }
        return 0;
      }).reduce<any[]>((accumulator, key) => {
      const value = obj[key];
      const node: any = {};
      // const node = new TodoItemNode();
      const {id, name, journal_ids, rootnode, pos, nomenclaturalCode, parents} = value;
      node.item = {id, name, journal_ids, rootnode, pos, nomenclaturalCode, parents};
      // node.item = key;

      if (value != null) {
        if (typeof value === 'object' && Object.keys(obj).filter(s => {
          return !['id', 'name', 'journal_ids', 'rootnode', 'pos', 'nomenclaturalCode', 'parents'].includes(s)
        }).length) {
          node.children = this.buildFileTree(value, level + 1);
        } else {
          node.item = value;
        }
      }

      return accumulator.concat(node);
    }, []);
  }

  /** Add an item to to-do list */
  insertItem(parent: TodoItemNode, name: string) {
    if (parent.children) {
      parent.children.push({item: name} as TodoItemNode);
      this.dataChange.next(this.data);
    }
  }

  updateItem(node: TodoItemNode, name: string) {
    node.item = name;
    this.dataChange.next(this.data);
  }
}

/**
 * @title Tree with checkboxes
 */
@Component({
  selector: 'app-tree-checklist',
  templateUrl: './tree-checklist.component.html',
  styleUrls: ['./tree-checklist.component.scss'],
  providers: [ChecklistDatabase,
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: TreeChecklistComponent
    }]
})
export class TreeChecklistComponent implements OnInit{

  myControl = new FormControl();
  options: any = journalTree.map((el: any) => el.name);
  filteredOptions: Observable<string[]> | undefined;

  updateMySelection(event: any) {
    this.writeValue(event.option.value);
  }

  ngOnInit() {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value)),
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter((option: string) => option.toLowerCase().includes(filterValue)).filter((i: any, index: any) => {
      return index < 11;
    });
  }
  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<TodoItemNode, TodoItemFlatNode>();

  /** A selected parent node to be inserted */
  selectedParent: TodoItemFlatNode | null = null;

  /** The new item's name */
  newItemName = '';

  treeControl: FlatTreeControl<TodoItemFlatNode>;

  treeFlattener: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;

  dataSource: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;

  /** The selection for checklist */
  checklistSelection = new SelectionModel<TodoItemFlatNode>(false /* multiple */);

  onChange = (selection: any) => {
  };

  onTouched = () => {
  };

  touched = false;

  disabled = false;

  selectedNode: any = null;

  constructor(private _database: ChecklistDatabase) {
    // @ts-ignore
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
      this.isExpandable, this.getChildren);
    // @ts-ignore
    this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    _database.dataChange.subscribe(data => {
      this.dataSource.data = data;
    });
    // setTimeout(() => {
    //   this.treeControl.expandAll();
    // })
    // .getDescendants(node)
    // .filter(descendant => descendant.selected)
    // .map(descendant => descendant.name))
  }

  writeValue(value: any) {
    this.selectedNode = value;
    let result: any = null;
    for (const [key, value] of this.flatNodeMap) {
      // @ts-ignore
      if (value.item.name == this.selectedNode) {
        result = key;
      }
      // value?.children?.forEach((child: any) => {
      //     // @ts-ignore
      //     if (child.item.name == this.selectedNode) {
      //       result = key;
      //     }
      // })
    }
    if (result) {
      this.todoItemSelectionToggle(result);
      result.item.parents.forEach((id: any) => {
        for (const [k, val] of this.flatNodeMap) {
          // @ts-ignore
          if (val.item.id == id) {
            this.treeControl.expand(k);
          }
        }
      })
    }
    this.treeControl.expand(result);

    // [0].value.item
  }

  registerOnChange(onChange: any) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: any) {
    this.onTouched = onTouched;
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  setDisabledState(disabled: boolean) {
    this.disabled = disabled;
  }

  getLevel = (node: TodoItemFlatNode) => node.level;

  isExpandable = (node: TodoItemFlatNode) => node.expandable;

  getChildren = (node: TodoItemNode): TodoItemNode[] | undefined => node.children;

  hasChild = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.item === '';

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: TodoItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.item === node.item
      ? existingNode
      : new TodoItemFlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.expandable = !!node.children?.length;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  /** Whether all the descendants of the node are selected. */
  descendantsAllSelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.length > 0 && descendants.every(child => {
      return this.checklistSelection.isSelected(child);
    });
    return descAllSelected;
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: TodoItemFlatNode): void {
    this.checklistSelection.toggle(node);
    // @ts-ignore
    this.selectedNode = node.item.name;
    this.onChange(this.selectedNode);
    this.myControl.setValue(this.selectedNode);
    // const descendants = this.treeControl.getDescendants(node);
    // this.checklistSelection.isSelected(node)
    //   ? this.checklistSelection.select(...descendants)
    //   : this.checklistSelection.deselect(...descendants);
    //
    // // Force update for the parent
    // descendants.forEach(child => this.checklistSelection.isSelected(child));
    // this.checkAllParentsSelection(node);
  }

  /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
  todoLeafItemSelectionToggle(node: any): void {
    this.selectedNode = node.item.name;
    this.checklistSelection.toggle(node);
    this.onChange(this.selectedNode);
    this.myControl.setValue(this.selectedNode);

    // this.checkAllParentsSelection(node);
  }

  /* Checks all the parents when a leaf node is selected/unselected */
  checkAllParentsSelection(node: TodoItemFlatNode): void {
    let parent: TodoItemFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  /** Check root node checked state and change it accordingly */
  checkRootNodeSelection(node: TodoItemFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.length > 0 && descendants.every(child => {
      return this.checklistSelection.isSelected(child);
    });
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }

  /* Get the parent node of a node */
  getParentNode(node: TodoItemFlatNode): TodoItemFlatNode | null {
    const currentLevel = this.getLevel(node);

    // @ts-ignore
    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      // @ts-ignore
      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  /** Select the category so we can insert the new item. */
  addNewItem(node: TodoItemFlatNode) {
    const parentNode = this.flatNodeMap.get(node);
    this._database.insertItem(parentNode!, '');
    this.treeControl.expand(node);
  }

  /** Save the node to database */
  saveNode(node: TodoItemFlatNode, itemValue: string) {
    const nestedNode = this.flatNodeMap.get(node);
    this._database.updateItem(nestedNode!, itemValue);
  }
}
