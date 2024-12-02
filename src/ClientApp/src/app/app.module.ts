import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { AnnotationDemoComponent } from './annotation-demo/annotation-demo';

import { BlockUiDialogContent, BlockUiDialog } from './dialogs/block-ui-dialog';
import { ErrorMessageDialogContent, ErrorMessageDialog } from './dialogs/error-message-dialog';

@NgModule({
  declarations: [
    AppComponent,
    AnnotationDemoComponent,
    BlockUiDialog,
    BlockUiDialogContent,
    ErrorMessageDialog,
    ErrorMessageDialogContent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot([
      { path: '', component: AnnotationDemoComponent, pathMatch: 'full' }
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
