import { Injectable } from "@angular/core";
import { ySyncPluginKey } from 'y-prosemirror'
import { EditorView } from 'prosemirror-view'
import { YArray } from 'yjs/dist/src/internals'
import { Doc } from 'yjs';

import * as Y from 'yjs'

@Injectable({
    providedIn: 'root'
})
export class VersionsService {

    versions: Version[] = [];

    addVersion(doc: Doc) {
        let versions: YArray<Version> = doc.getArray('versions');
        let prevVersion = versions.length === 0 ? null : versions.get(versions.length - 1);
        let prevSnapshot = prevVersion === null ? Y.emptySnapshot : Y.decodeSnapshot(prevVersion.snapshot)
        let snapshot = Y.snapshot(doc)
        if (prevVersion !== null && prevSnapshot.sv.get(prevVersion.clientID) !== undefined) {
            prevSnapshot.sv.set(prevVersion.clientID, prevSnapshot.sv.get(prevVersion.clientID)! + 1);
        }
        if (!Y.equalSnapshots(prevSnapshot, snapshot)) {
            versions.push([{
                date: new Date().getTime(),
                snapshot: Y.encodeSnapshot(snapshot),
                clientID: doc.clientID
            }])
        }
    }

    renderVersion(editorview: EditorView, version: Version) {
        editorview.dispatch(editorview.state.tr.setMeta(ySyncPluginKey,
            {
                snapshot: Y.decodeSnapshot(version.snapshot),
                prevSnapshot: Y.decodeSnapshot(version.snapshot)
            }));
        this.unrenderVersionBinding(editorview);
    }

    unrenderVersionBinding(editorview: EditorView) {
        const binding = ySyncPluginKey.getState(editorview.state).binding
        if (binding) {
            binding.unrenderSnapshot()
        }
    }

    getVersionList(doc: Y.Doc) {
        const versions: YArray<Version> = doc.getArray('versions');
        return versions;
    }
}

export class Version {
    date: number;
    snapshot: Uint8Array;
    clientID: number;

    constructor(date: number, snapshot: Uint8Array, clientID: number) {
        this.date = date;
        this.snapshot = snapshot;
        this.clientID = clientID;
    }
}