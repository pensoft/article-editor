import * as Y from 'yjs';
import { WebrtcProvider as OriginalWebRtc } from 'y-webrtc';
import { IndexeddbPersistence } from 'y-indexeddb';
import { sectionNode } from './section-node';
import { treeNode } from './treeNode';

export interface ydocData {
    ydoc: Y.Doc;
    provider: OriginalWebRtc | undefined;
    providerIndexedDb: IndexeddbPersistence;
    TREE_DATA: treeNode[];
}