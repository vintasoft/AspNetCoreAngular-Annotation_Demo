import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { BlockUiDialog } from '../dialogs/block-ui-dialog';
import { ErrorMessageDialog } from "../dialogs/error-message-dialog";
import { OpenFileHelper } from './open-file-helper';
import { AnnotationUiHelper } from './annotation-UI-helper';


let _annotationDemoComponent: AnnotationDemoComponent;


@Component({
  selector: 'annotation-demo',
  templateUrl: './annotation-demo.html',
})
export class AnnotationDemoComponent {

  // Document viewer.
  _docViewer: Vintasoft.Imaging.DocumentViewer.WebDocumentViewerJS | null;

  // Helps to open files.
  _openFileHelper: OpenFileHelper | null;

  // Dialog that allows to block UI.
  _blockUiDialog: BlockUiDialog | null;



  constructor(public modalService: NgbModal, private httpClient: HttpClient) {
    _annotationDemoComponent = this;

    this._docViewer = null;
    this._openFileHelper = null;
    this._blockUiDialog = null;
  }



  /**
   * Component is initializing.
   */
  ngOnInit() {
    // get identifier of current HTTP session
    this.httpClient.get<any>('api/Session/GetSessionId').subscribe(data => {
      // set the session identifier
      Vintasoft.Shared.WebImagingEnviromentJS.set_SessionId(data.sessionId);

      // specify web services, which should be used by Vintasoft Web Document Viewer
      Vintasoft.Shared.WebServiceJS.defaultFileService = new Vintasoft.Shared.WebServiceControllerJS('vintasoft/api/MyVintasoftFileApi');
      Vintasoft.Shared.WebServiceJS.defaultImageCollectionService = new Vintasoft.Shared.WebServiceControllerJS('vintasoft/api/MyVintasoftImageCollectionApi');
      Vintasoft.Shared.WebServiceJS.defaultImageService = new Vintasoft.Shared.WebServiceControllerJS('vintasoft/api/MyVintasoftImageApi');
      Vintasoft.Shared.WebServiceJS.defaultAnnotationService = new Vintasoft.Shared.WebServiceControllerJS('vintasoft/api/MyVintasoftAnnotationCollectionApi');

      // register new UI elements
      this.__registerNewUiElements();

      // create the document viewer settings
      let docViewerSettings: Vintasoft.Imaging.DocumentViewer.WebDocumentViewerSettingsJS = new Vintasoft.Imaging.DocumentViewer.WebDocumentViewerSettingsJS("documentViewerContainer", "documentViewer", true);
      // specify that the meain menu should contain the annotation menu
      docViewerSettings.set_ShowAnnotationMenuInMainMenu(true);
      // specify that the side panel should contain the annotation list panel
      docViewerSettings.set_ShowAnnotationListPanelInSidePanel(true);
      // specify that the side panel should contain the annotation comment list panel
      docViewerSettings.set_ShowAnnotationCommentListPanelInSidePanel(true);
      // specify that document viewer should show "Export and download file" button instead of "Download file" button
      docViewerSettings.set_CanExportAndDownloadFile(true);
      docViewerSettings.set_CanDownloadFile(false);
      docViewerSettings.set_CanAddFile(true);
      docViewerSettings.set_CanClearSessionCache(true);

      // initialize main menu of document viewer
      this.__initMenu(docViewerSettings);

      // initialize side panel of document viewer
      this.__initSidePanel(docViewerSettings);

      // initialize image viewer panel of document viewer
      this.__initImageViewerPanel(docViewerSettings);

      // create the document viewer
      this._docViewer = new Vintasoft.Imaging.DocumentViewer.WebDocumentViewerJS(docViewerSettings);

      this._docViewer.set_CurrentUser("Guest");

      // subscribe to the "warningOccured" event of document viewer
      Vintasoft.Shared.subscribeToEvent(this._docViewer, 'warningOccured', this.__docViewer_warningOccured);
      // subscribe to the asyncOperationStarted event of document viewer
      Vintasoft.Shared.subscribeToEvent(this._docViewer, 'asyncOperationStarted', this.__docViewer_asyncOperationStarted);
      // subscribe to the asyncOperationFinished event of document viewer
      Vintasoft.Shared.subscribeToEvent(this._docViewer, 'asyncOperationFinished', this.__docViewer_asyncOperationFinished);
      // subscribe to the asyncOperationFailed event of document viewer
      Vintasoft.Shared.subscribeToEvent(this._docViewer, 'asyncOperationFailed', this.__docViewer_asyncOperationFailed);

      // subscribe to the events of the annotation comment list panel
      this.__subscribeToAnnotationCommentListPanelEvents();

      // initialize visual tools
      this.__initializeVisualTools(this._docViewer);

      // get the thumbnail viewer of document viewer
      let thumbnailViewer1: Vintasoft.Imaging.UI.WebThumbnailViewerJS = this._docViewer.get_ThumbnailViewer();
      thumbnailViewer1.set_CanDragThumbnails(true);

      // get the image viewer of document viewer
      let imageViewer1: Vintasoft.Imaging.UI.WebImageViewerJS = this._docViewer.get_ImageViewer();
      // specify that image viewer must show images in the single continuous column mode
      imageViewer1.set_DisplayMode(new Vintasoft.Imaging.WebImageViewerDisplayModeEnumJS('SingleContinuousColumn'));
      // specify that image viewer must show images in the fit width mode
      imageViewer1.set_ImageSizeMode(new Vintasoft.Imaging.WebImageSizeModeEnumJS('FitToWidth'));

      // create the progress image
      let progressImage: HTMLImageElement = new Image();
      progressImage.src = window.location + 'Images/fileUploadProgress.gif';
      // specify that the image viewer must use the progress image for indicating the image loading progress
      imageViewer1.set_ProgressImage(progressImage);

      // get the visual tool, which allows to annotate, pan and zoom images in image viewer
      let annotationPanTool: Vintasoft.Imaging.UI.VisualTools.WebVisualToolJS
        = this._docViewer.getVisualToolById('AnnotationVisualTool,PanTool,ZoomTool');
      this._docViewer.set_MandatoryVisualTool(annotationPanTool);
      this._docViewer.set_CurrentVisualTool(annotationPanTool);

      // copy the default file to the uploaded image files directory and open the file
      this._openFileHelper = new OpenFileHelper(this.modalService, this._docViewer, this.__showErrorMessage);
      this._openFileHelper.openDefaultImageFile('VintasoftAnnotationDemo.tif');
    });
  }



  // === "Tools" toolbar ===

  /**
   * Creates UI button for activating the visual tool, which allows to annotate, pan and zoom images in image viewer.
   */
  __createAnnotationAndPanAndZoomToolButton() {
    return new Vintasoft.Imaging.UI.UIElements.WebUiVisualToolButtonJS({
      cssClass: 'vsdv-tools-panAndZoomButton',
      title: 'Annotation, Pan, Zoom',
      localizationId: "panAndZoomToolButton"
    }, 'AnnotationVisualTool,PanTool,ZoomTool');
  }

  /**
   * Creates UI button for activating the visual tool, which allows to annotate and pan images in image viewer.
   */
  __createAnnotationAndPanToolButton() {
    return new Vintasoft.Imaging.UI.UIElements.WebUiVisualToolButtonJS({
      cssClass: 'vsdv-tools-panButton',
      title: 'Annotation, Pan',
      localizationId: "panToolButton"
    }, 'AnnotationVisualTool,PanTool');
  }



  // === "Annotations" toolbar ===

  /**
   * Initializes image viewer panel of document viewer.
   * @param docViewerSettings Settings of document viewer.
   */
  __initImageViewerPanel(docViewerSettings: Vintasoft.Imaging.DocumentViewer.WebDocumentViewerSettingsJS) {
    // get items of document viewer
    let items: Vintasoft.Imaging.UI.UIElements.WebUiElementCollectionJS
      = docViewerSettings.get_Items();

    // get the image viewer panel
    let imageViewerPanel: Vintasoft.Imaging.UI.Panels.WebUiImageViewerPanelJS
      = items.getItemByRegisteredId('imageViewerPanel') as Vintasoft.Imaging.UI.Panels.WebUiImageViewerPanelJS;
    // if panel exists
    if (imageViewerPanel != null) {
      // enable ability to set custom image rotation
      imageViewerPanel.set_CanSetCustomViewRotationUsingContextMenu(true);
      // initialize the annotation context menu
      AnnotationUiHelper.initAnnotationViewerContextMenu(imageViewerPanel);
    }
  }



  // === Init UI ===

  /**
   * Registers custom UI elements in "WebUiElementsFactoryJS".
   */
  __registerNewUiElements() {
    // register the "Pan and zoom" button in web UI elements factory
    Vintasoft.Imaging.UI.UIElements.WebUiElementsFactoryJS.registerElement('panAndZoomToolButton', this.__createAnnotationAndPanAndZoomToolButton);
    // register the "Pan" button in web UI elements factory
    Vintasoft.Imaging.UI.UIElements.WebUiElementsFactoryJS.registerElement('panToolButton', this.__createAnnotationAndPanToolButton);
  }

  /**
   * Initializes main menu of document viewer.
   * @param docViewerSettings Settings of document viewer.
   */
  __initMenu(docViewerSettings: Vintasoft.Imaging.DocumentViewer.WebDocumentViewerSettingsJS) {
    // get items of document viewer
    let items: Vintasoft.Imaging.UI.UIElements.WebUiElementCollectionJS
      = docViewerSettings.get_Items();

    let uploadAndOpenFileButton: Vintasoft.Imaging.UI.UIElements.WebUiUploadFileButtonJS = items.getItemByRegisteredId("uploadAndOpenFileButton") as Vintasoft.Imaging.UI.UIElements.WebUiUploadFileButtonJS;
    if (uploadAndOpenFileButton != null)
      uploadAndOpenFileButton.set_FileExtensionFilter(".bmp, .cur, .gif, .ico, .j2c, .j2k, .jb2, .jbig2, .jp2, .jpc, .jpeg, .jpg, .jls, .pbm, .pcx, .pdf, .png, .tga, .tif, .tiff");

    let uploadAndAddFileButton: Vintasoft.Imaging.UI.UIElements.WebUiUploadFileButtonJS = items.getItemByRegisteredId("uploadAndAddFileButton") as Vintasoft.Imaging.UI.UIElements.WebUiUploadFileButtonJS;
    if (uploadAndAddFileButton != null)
      uploadAndAddFileButton.set_FileExtensionFilter(".bmp, .cur, .gif, .ico, .j2c, .j2k, .jb2, .jbig2, .jp2, .jpc, .jpeg, .jpg, .jls, .pbm, .pcx, .pdf, .png, .tga, .tif, .tiff");

    // get the "Tools" menu panel
    let toolsMenuPanel: Vintasoft.Imaging.UI.Panels.WebUiVisualToolsToolbarPanelJS
      = items.getItemByRegisteredId("visualToolsToolbarPanel") as Vintasoft.Imaging.UI.Panels.WebUiVisualToolsToolbarPanelJS;
    // if menu panel is found
    if (toolsMenuPanel != null) {
      // get items of file menu panel
      let toolsMenuPanelItems: Vintasoft.Imaging.UI.UIElements.WebUiElementCollectionJS = toolsMenuPanel.get_Items();

      let rectangularSelectionToolButton: Vintasoft.Imaging.UI.UIElements.WebUiVisualToolButtonJS
        = toolsMenuPanelItems.getItemByRegisteredId("rectangularSelectionToolButton") as Vintasoft.Imaging.UI.UIElements.WebUiVisualToolButtonJS;
      if (rectangularSelectionToolButton != null)
        // remove the "Rectangular Selection Tool" button from the menu panel
        toolsMenuPanelItems.removeItem(rectangularSelectionToolButton);
    }
  }

  /**
   * Initializes the side panel.
   * @param docViewerSettings
   */
  __initSidePanel(docViewerSettings: Vintasoft.Imaging.DocumentViewer.WebDocumentViewerSettingsJS) {
    // get items of document viewer
    let items: Vintasoft.Imaging.UI.UIElements.WebUiElementCollectionJS
      = docViewerSettings.get_Items();

    // get the thumbnail viewer panel of document viewer
    let thumbnailViewerPanel: Vintasoft.Imaging.UI.Panels.WebUiThumbnailViewerPanelJS
      = items.getItemByRegisteredId('thumbnailViewerPanel') as Vintasoft.Imaging.UI.Panels.WebUiThumbnailViewerPanelJS;
    // if panel is found
    if (thumbnailViewerPanel != null)
      // subscribe to the "actived" event of the thumbnail viewer panel of document viewer
      Vintasoft.Shared.subscribeToEvent(thumbnailViewerPanel, 'activated', this.__thumbnailsPanelActivated);
  }

  /**
   * Thumbnail viewer panel of document viewer is actived.
   */
  __thumbnailsPanelActivated(event: any, eventArgs: any) {
    let uiElement: Vintasoft.Imaging.UI.UIElements.WebUiElementJS = event.target;
    let docViewer: Vintasoft.Imaging.DocumentViewer.WebDocumentViewerJS = uiElement.get_RootControl() as Vintasoft.Imaging.DocumentViewer.WebDocumentViewerJS;
    let thumbnailViewer: Vintasoft.Imaging.UI.WebThumbnailViewerJS = docViewer.get_ThumbnailViewer();
    if (thumbnailViewer != null) {
      // create the progress image
      let progressImage: HTMLImageElement = new Image();
      progressImage.src = window.location + 'Images/fileUploadProgress.gif';
      // specify that the thumbnail viewer must use the progress image for indicating the thumbnail loading progress
      thumbnailViewer.set_ProgressImage(progressImage);

      // additional bottom space for text with page number under thumbnail
      let textCaptionHeight: number = 18;
      let padding: any = thumbnailViewer.get_ThumbnailPadding();
      padding[2] += textCaptionHeight;
      thumbnailViewer.set_ThumbnailPadding(padding);
      thumbnailViewer.set_DisplayThumbnailCaption(true);
    }
  }



  // === Visual Tools ===

  /**
   * Initializes visual tools.
   * @param docViewer The document viewer.
   */
  __initializeVisualTools(docViewer: Vintasoft.Imaging.DocumentViewer.WebDocumentViewerJS) {
    let rectangularSelectionTool: Vintasoft.Imaging.UI.VisualTools.WebVisualToolJS
      = docViewer.getVisualToolById('RectangularSelectionTool');
    rectangularSelectionTool.set_DisableContextMenu(true);

    let magnifierTool: Vintasoft.Imaging.UI.VisualTools.WebVisualToolJS = docViewer.getVisualToolById('MagnifierTool');
    magnifierTool.set_DisableContextMenu(true);

    let zoomTool: Vintasoft.Imaging.UI.VisualTools.WebVisualToolJS = docViewer.getVisualToolById('ZoomTool');
    zoomTool.set_DisableContextMenu(true);

    let zoomSelectionTool: Vintasoft.Imaging.UI.VisualTools.WebVisualToolJS = docViewer.getVisualToolById('ZoomSelectionTool');
    zoomSelectionTool.set_DisableContextMenu(true);

    // initialize the annotation visual tool
    AnnotationUiHelper.initializeAnnotationVisualTool(docViewer);
  }



  // === Document viewer events ===

  /**
   * Warning is occured in document viewer.
   * @param event
   * @param message
   */
  __docViewer_warningOccured(event: any, eventArgs: any) {
    _annotationDemoComponent.__showErrorMessage(eventArgs.message);
  }

  /**
   * Asynchronous operation is started in document viewer.
   * @param event
   * @param data
   */
  __docViewer_asyncOperationStarted(event: any, data: any) {
    // get description of asynchronous operation
    let description: string = data.description;

    // if image is prepared for printing
    if (description === "Image prepared to print") {
      // do not block UI when images are preparing for printing
    }
    else {
      _annotationDemoComponent.__blockUI(data.description);
    }
  }

  /**
   * Asynchronous operation is finished in document viewer.
   * @param event
   * @param data
   */
  __docViewer_asyncOperationFinished(event: any, data: any) {
    // unblock UI
    _annotationDemoComponent.__unblockUI();
  }

  /**
   * Asynchronous operation is failed in document viewer.
   * @param event
   * @param data
   */
  __docViewer_asyncOperationFailed(event: any, data: any) {
    // unblock UI
    _annotationDemoComponent.__unblockUI();

    // get description of asynchronous operation
    let description: string = data.description;
    // get additional information about asynchronous operation
    let additionalInfo: any = data.data;
    // if additional information exists
    if (additionalInfo != null) {
      // show error message
      _annotationDemoComponent.__showErrorMessage(additionalInfo);
    }
    // if additional information does NOT exist
    else {
      // show error message
      _annotationDemoComponent.__showErrorMessage(description + ": unknown error.");
    }
  }



  // === Annotation comment list panel events ===

  /**
   Subscribes to the events of annotation comment list panel.
  */
  __subscribeToAnnotationCommentListPanelEvents() {
    if (this._docViewer == null)
      return;

    let items: Vintasoft.Imaging.UI.UIElements.WebUiElementCollectionJS = this._docViewer.get_Items();

    let annotationCommentListPanel: Vintasoft.Imaging.Annotation.UI.Panels.WebUiAnnotationCommentListPanelJS
      = items.getItemByRegisteredId("annotationCommentListPanel") as Vintasoft.Imaging.Annotation.UI.Panels.WebUiAnnotationCommentListPanelJS;

    // subscribe to the "commentAdded" event of annotation comment list panel
    Vintasoft.Shared.subscribeToEvent(annotationCommentListPanel, "commentAdded", this.__annotationCommentListPanel_commentAdded);
    // subscribe to the "commentReplyAdded" event of annotation comment list panel
    Vintasoft.Shared.subscribeToEvent(annotationCommentListPanel, "commentReplyAdded", this.__annotationCommentListPanel_commentReplyAdded);
    // subscribe to the "stateCommentAdded" event of annotation comment list panel
    Vintasoft.Shared.subscribeToEvent(annotationCommentListPanel, "stateCommentAdded", this.__annotationCommentListPanel_stateCommentAdded);
    // subscribe to the "dialogShown" event of annotation comment list panel
    Vintasoft.Shared.subscribeToEvent(annotationCommentListPanel, "commentSettingsDialogShown", this.__annotationCommentListPanel_commentSettingsDialogShown);
  }

  /**
   The annotation comment is added.
  */
  __annotationCommentListPanel_commentAdded(event: any, eventArgs: any) {
    // get panel
    let annotationCommentListPanel = event.target;
    // get comment
    let comment = eventArgs.comment;

    // if user is guest
    if (comment.get_UserName() == "Guest") {
      // change comment color
      comment.set_Color("rgba(200,200,200,0.5)");
      // update panel
      annotationCommentListPanel.update();
    }
  }

  /**
   The reply is added to the annotation comment.
  */
  __annotationCommentListPanel_commentReplyAdded(event: any, eventArgs: any) {
    // get panel
    let annotationCommentListPanel = event.target;
    // get comment reply
    let commentReply = eventArgs.commentReply;

    // if user is guest
    if (commentReply.get_UserName() == "Guest") {
      // change comment color
      commentReply.set_Color("rgba(200,200,200,0.5)");
      // update panel
      annotationCommentListPanel.update();
    }
  }

  /**
   The state comment is added to the annotation comment.
  */
  __annotationCommentListPanel_stateCommentAdded(event: any, eventArgs: any) {
    // get panel
    let annotationCommentListPanel = event.target;
    // get comment
    let comment = eventArgs.comment;
    // get state comment
    let stateComment = eventArgs.stateComment;

    // get the parent comment state
    let stateCommentParentState = stateComment.get_ParentState();

    let color;
    // check the state
    switch (stateCommentParentState) {
      case "None":
        color = "rgba(200,200,200,0.5)";
        break;

      case "Accepted":
        color = "rgba(200,255,200,0.5)";
        break;

      case "Completed":
        color = "rgba(200,255,200,1)";
        break;

      case "Rejected":
        color = "rgba(255,200,200,1)";
        break;

      case "Cancelled":
        color = "rgba(160,160,160,0.7)";
        break;

      default:
        color = null;
    }

    // if supported state is found
    if (color != null) {
      // set comment color
      comment.set_Color(color);
      // set state comment color
      stateComment.set_Color(color);
      // update panel
      annotationCommentListPanel.update();
    }
  }

  /**
   The annotation comment settings dialog is shown.
  */
  __annotationCommentListPanel_commentSettingsDialogShown(event: any, eventArgs: any) {
    // get panel
    let annotationCommentListPanel = event.target;
    // get document viewer
    let documentViewer = annotationCommentListPanel.get_RootControl();

    // get comment
    let comment = eventArgs.comment;
    // get dialog
    let dialog = eventArgs.dialog;

    // if comment user name and current user name are different
    if (comment.get_UserName() != documentViewer.get_CurrentUser()) {
      // hide the dialog
      dialog.hide();

      // show the error message
      _annotationDemoComponent.__showErrorMessage("Wrong user name.");
    }
  }



  // === Utils ===

  /**
   * Blocks the UI. 
   * @param text Message that describes why UI is blocked.
   */
  __blockUI(text: string) {
    _annotationDemoComponent._blockUiDialog = new BlockUiDialog(_annotationDemoComponent.modalService);
    _annotationDemoComponent._blockUiDialog.message = text;
    _annotationDemoComponent._blockUiDialog.open();
  }

  /**
   Unblocks the UI.
  */
  __unblockUI() {
    if (_annotationDemoComponent._blockUiDialog !== null)
      _annotationDemoComponent._blockUiDialog.close();
  }

  /**
   * Shows an error message.
   * @param data Information about error.
   */
  __showErrorMessage(data: any) {
    _annotationDemoComponent.__unblockUI();

    let dlg: ErrorMessageDialog = new ErrorMessageDialog(_annotationDemoComponent.modalService);
    dlg.errorData = data;
    dlg.open();
  }

}
