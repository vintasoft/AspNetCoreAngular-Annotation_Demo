import { Component } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'annotation-settings-dialog-content',
  templateUrl: './annotation-settings-dialog.html'
})
export class AnnotationSettingsDialogContent {

  public annotation: Vintasoft.Imaging.Annotation.UI.WebAnnotationViewJS | null;


  constructor(public activeModal: NgbActiveModal) {
    this.annotation = null;
  }


  /**
   OnInit event occurs.
   */
  ngOnInit() {
    if (this.annotation == null)
      return;

    // create WebPropertyGridJS object
    let propertyGrid: Vintasoft.Shared.WebPropertyGridJS = new Vintasoft.Shared.WebPropertyGridJS(this.annotation);

    // create PropertyGridControlJS
    let propertyGridControl: PropertyGridControlJS
      = new PropertyGridControlJS(propertyGrid, "annotationPropertyGrid", { hideNestedElements: false, showReadOnlyElements: false });
    propertyGridControl.createMarkup();
  }

  /**
   Closes the dialog.
   */
  public closeDialog() {
    this.activeModal.close();
  }

}


@Component({
  selector: 'annotation-settings-dialog',
  templateUrl: './annotation-settings-dialog.html'
})
export class AnnotationSettingsDialog {

  public annotation: Vintasoft.Imaging.Annotation.UI.WebAnnotationViewJS | null;
  private _modalReference: NgbModalRef | null;


  constructor(private modalService: NgbModal) {
    this.annotation = null;
    this._modalReference = null;
  }


  public open() {
    this._modalReference = this.modalService.open(AnnotationSettingsDialogContent);
    this._modalReference.componentInstance.annotation = this.annotation;
  }

  /**
   Closes the dialog.
  */
  public closeDialog() {
    if (this._modalReference != null)
      this._modalReference.componentInstance.closeDialog();
  }

}
