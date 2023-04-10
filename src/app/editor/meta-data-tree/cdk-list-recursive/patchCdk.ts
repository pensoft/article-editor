import {coerceElement} from "@angular/cdk/coercion";
import {DragRef, DropListRef} from "@angular/cdk/drag-drop";
import { ClassGetter } from "@angular/compiler/src/output/output_ast";
import {MatCardXlImage} from "@angular/material/card";
import {
  checkCompatibilitySection,
  checkMaxWhenMoovingASectionIn,
  checkMinWhenMoovingASectionOut
} from "@app/editor/utils/articleBasicStructure";
import {articleSection} from "@app/editor/utils/interfaces/articleSection";
import {TreeService} from "../tree-service/tree.service";

// A few lines of code used for debugging (saved to avoid having to re-write them)
// let reflistToString = (list: DropListRef[]) => JSON.stringify(list.map(ref => coerceElement(ref.element).id));

export function installPatch(treeService: TreeService) {
  DropListRef.prototype._getSiblingContainerFromPosition = function (
    item: DragRef,
    x: number,
    y: number
  ): DropListRef | undefined {
    // Possible targets include siblings and 'this'
    if (item?.data?.data?.canDropBool) {
      item.data.data.canDropBool[0] = true;
      item.data.data.canDropBool[1] = '';
    }



    //@ts-ignore
    let targets = [this, ...this._siblings];

    // Only consider targets where the drag postition is within the client rect
    // (this avoids calling enterPredicate on each possible target)
    let matchingTargets = targets.filter(ref => {
      let isInside = isInsideClientRect(ref.element.getBoundingClientRect(), x, y);
      return isInside
    });

    if (!item.data.data) {
      return matchingTargets[0]
    }
    // Stop if no targets match the coordinates
    if (matchingTargets.length == 0) {
      return undefined;
    }

    // Order candidates by DOM hierarchy and z-index
    let smallestindex = orderByHierarchy2(matchingTargets)
    //let orderedMatchingTargets = orderByHierarchy(matchingTargets);

    // The drop target is the last matching target in the list
    let matchingTarget = matchingTargets[smallestindex];
    // Only return matching target if it is a sibling
    if (matchingTarget === this) {
      return undefined;
    }
    canReceive(matchingTarget, item, treeService)
    canMoveOut(matchingTarget, item, treeService)
    canMoveIn(matchingTarget, item, treeService)
    // Can the matching target receive the item?
    /* if (!matchingTarget._canReceive(item, x, y)) {
      return undefined;q
    } */

    // Return matching target
    return matchingTarget;
  };
}

function canMoveOut(target: any, item: any, treeService: TreeService) {
  if (item._initialContainer.data.id) {
    if (item._initialContainer.data.id !== "parentList") {
      // the initial parent of the node , from where we start dragging the node
      let parentNode = treeService.findNodeById(item._initialContainer.data.id)!
      if (parentNode&&parentNode.subsectionValidations) {
        let moovingNode = item.data.data.node
        let canMove = checkMinWhenMoovingASectionOut(moovingNode, parentNode);
        if (!canMove) {
          if (item?.data?.data?.canDropBool) {
            item.data.data.canDropBool[0] = false;
            item.data.data.canDropBool[1] = 'Cannot move more of these type of sections out of this list.'
          }
        }
      }
    }else if(item._initialContainer.data.id == "parentList"){
      let moovingNode = item.data.data.node;
      let canMove = treeService.checkIfCanMoveNodeOutOfParentList(moovingNode)
      if (!canMove) {
        if (item?.data?.data?.canDropBool) {
          item.data.data.canDropBool[0] = false;
          item.data.data.canDropBool[1] = 'Cannot move more of these type of sections out of this list.'
        }
      }
    }
  }
}

function canMoveIn(target: any, item: any, treeService: TreeService) {
  if (target.data.id !== "parentList") {
    // the initial parent of the node , from where we start dragging the node
    let moovingInNode = treeService.findNodeById(target.data.id)!
    if (moovingInNode&&moovingInNode.subsectionValidations) {
      let moovingNode = item.data.data.node
      let canMove = checkMaxWhenMoovingASectionIn(moovingNode, moovingInNode);
      if (!canMove) {
        if (item?.data?.data?.canDropBool) {
          item.data.data.canDropBool[0] = false;
          item.data.data.canDropBool[1] = 'Cannot move in more of these type of section in this list.'
        }
      }
    }
  }else if(target.data.id == "parentList"){
    let moovingNode = item.data.data.node;
    let canMove = treeService.checkIfCanMoveNodeInParentList(moovingNode)
    if (!canMove) {
      if (item?.data?.data?.canDropBool) {
        item.data.data.canDropBool[0] = false;
        item.data.data.canDropBool[1] = 'Cannot move in more of these type of section in this list.'
      }
    }
  }
}

function canReceive(target: any, item: any, treeService: TreeService) {
  let dropTargetLevel
  let parentCompatibility: any
  if (target.data.id == 'parentList') {
    dropTargetLevel = 0;
  } else {
    let node = treeService.findNodeById(target.data.id)
    parentCompatibility = node?.compatibility
    dropTargetLevel = treeService.getNodeLevel(node!).nodeLevel + 1;

  }
  let levelsInItem = 0;
  if (item.data.data.node?.type == 'complex') {
    levelsInItem = 1;
    let countInnerLevels = (node: articleSection, level: number) => {
      if (node.type == 'complex') {
        if (levelsInItem < level) {
          levelsInItem = level
        }
        ;
        node.children.forEach((child) => {
          countInnerLevels(child, level + 1);
        })
      }
    }
    countInnerLevels(item.data.data.node, 1);
  }
  if (parentCompatibility && !checkCompatibilitySection(parentCompatibility, item.data.data.node)) {
    if (item?.data?.data?.canDropBool) {
      item.data.data.canDropBool[0] = false;
      item.data.data.canDropBool[1] = 'This section is not allowed in that branch.'
    }

  }
  if (levelsInItem + dropTargetLevel >= 4) {
    if (item?.data?.data?.canDropBool) {
      item.data.data.canDropBool[0] = false;
      item.data.data.canDropBool[1] = 'The Article tree cannot have more than 4 levels.'
    }
  }
  return true
}

// Not possible to improt isInsideClientRect from @angular/cdk/drag-drop/client-rect
function isInsideClientRect(clientRect: any, x: number, y: number) {
  const {top, bottom, left, right} = clientRect;
  return y >= top - 5 && y <= bottom + 5 && x >= left - 5 && x <= right + 5;
}

// Order a list of DropListRef so that for nested pairs, the outer DropListRef
// is preceding the inner DropListRef. Should probably be ammended to also
// sort by Z-level.
function orderByHierarchy2(refs: DropListRef[]) {
  let smallestArea: number;
  let smallestAreaIndex: number;
  refs.forEach((ref, index) => {
    //@ts-ignore
    let elementRect = ref.element.getBoundingClientRect()
    let {width, height} = elementRect;
    let newArea = width * height
    if (index == 0) {
      smallestArea = newArea
      smallestAreaIndex = index;
    } else {
      if (newArea < smallestArea) {
        smallestArea = newArea
        smallestAreaIndex = index;
      }
    }
  });
  //@ts-ignore
  return smallestAreaIndex
}

function orderByHierarchy(refs: DropListRef[]) {
  // Build a map from HTMLElement to DropListRef
  let refsByElement: Map<HTMLElement, DropListRef> = new Map();
  refs.forEach(ref => {
    //@ts-ignore
    refsByElement.set(coerceElement(ref.element), ref);
  });

  // Function to identify the closest ancestor among th DropListRefs
  let findAncestor = (ref: DropListRef) => {
    let ancestor = coerceElement(ref.element).parentElement;

    while (ancestor) {
      if (refsByElement.has(ancestor)) {
        return refsByElement.get(ancestor);
      }
      ancestor = ancestor.parentElement;
    }

    return undefined;
  };

  // Node type for tree structure
  type NodeType = { ref: DropListRef, parent?: NodeType, children: NodeType[] };

  // Add all refs as nodes to the tree
  let tree: Map<DropListRef, NodeType> = new Map();
  refs.forEach(ref => {
    tree.set(ref, {ref: ref, children: []});
  });

  // Build parent-child links in tree
  refs.forEach(ref => {
    let parent = findAncestor(ref);

    if (parent) {
      let node = tree.get(ref);
      let parentNode = tree.get(parent);

      node!.parent = parentNode;
      parentNode!.children.push(node!);
    }
  });

  // Find tree roots
  let roots = Array.from(tree.values()).filter(node => !node.parent);

  // Function to recursively build ordered list from roots and down
  let buildOrderedList = (nodes: NodeType[], list: DropListRef[]) => {
    list.push(...nodes.map(node => node.ref));
    nodes.forEach(node => {
      buildOrderedList(node.children, list);
    });
  };

  // Build and return the ordered list
  let ordered: DropListRef[] = [];
  buildOrderedList(roots, ordered);
  return ordered;
}
