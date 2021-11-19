//@ts-ignore
import * as Y from 'yjs'
import { WebrtcProvider as OriginalWebRtc } from 'y-webrtc';
import { IndexeddbPersistence } from 'y-indexeddb';
import { sectionNode } from './section-node';
import { treeNode } from './treeNode';
import { articleSection } from './articleSection';

export interface ydocData {
    ydoc: Y.Doc;
    provider: OriginalWebRtc | undefined;
    providerIndexedDb: IndexeddbPersistence;
    articleSectionsStructure: articleSection[];
}