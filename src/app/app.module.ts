import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgxProsemirrorModule } from './ngx-prosemirror/ngx-prosemirror.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { HttpClientModule } from '@angular/common/http';
import { provideFirebaseApp, getApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';




@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    provideFirebaseApp(() => initializeApp({
      apiKey: 'AIzaSyA3W87Y6Ph2Evh8E-YPYI3oWSdhAb6Lxus',
      authDomain: 'arte-soft.firebaseapp.com',
      databaseURL: 'https://arte-soft.firebaseio.com',
      projectId: 'arte-soft',
      storageBucket: 'arte-soft.appspot.com',
      messagingSenderId: '776064193529',
      appId: '1:776064193529:web:9fbf7aa008a117fc3a2328',
      measurementId: 'G-G76VN4T29R'
    })),
    provideFirestore(() => getFirestore()),
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    NgxProsemirrorModule,
    BrowserAnimationsModule,
    ServiceWorkerModule.register('editor-service-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stables
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
