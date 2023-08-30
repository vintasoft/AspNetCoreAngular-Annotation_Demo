import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { BlockUiDialog } from '../dialogs/block-ui-dialog';
import { ErrorMessageDialog } from "../dialogs/error-message-dialog";
import { ImageViewerSettingsDialog } from "../dialogs/image-viewer-settings-dialog";
import { OpenFileHelper } from './open-file-helper';
import { SaveAnnotationsAndDownloadFileHelper } from './save-annotations-and-download-file-helper';
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

  // Helps to create UI for image annotating
  _annotationUiHelper: AnnotationUiHelper | null;

  // Dialog that allows to block UI.
  _blockUiDialog: BlockUiDialog | null;



  constructor(public modalService: NgbModal, private httpClient: HttpClient) {
    _annotationDemoComponent = this;

    this._docViewer = null;
    this._openFileHelper = null;
    this._annotationUiHelper = null;
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

      // initialize main menu of document viewer
      this.__initMenu(docViewerSettings);

      // initialize side panel of document viewer
      this.__initSidePanel(docViewerSettings);

      // initialize image viewer panel of document viewer
      this.__initImageViewerPanel(docViewerSettings);

      // create the document viewer
      this._docViewer = new Vintasoft.Imaging.DocumentViewer.WebDocumentViewerJS(docViewerSettings);

      // subscribe to the "warningOccured" event of document viewer
      Vintasoft.Shared.subscribeToEvent(this._docViewer, 'warningOccured', this.__docViewer_warningOccured);
      // subscribe to the asyncOperationStarted event of document viewer
      Vintasoft.Shared.subscribeToEvent(this._docViewer, 'asyncOperationStarted', this.__docViewer_asyncOperationStarted);
      // subscribe to the asyncOperationFinished event of document viewer
      Vintasoft.Shared.subscribeToEvent(this._docViewer, 'asyncOperationFinished', this.__docViewer_asyncOperationFinished);
      // subscribe to the asyncOperationFailed event of document viewer
      Vintasoft.Shared.subscribeToEvent(this._docViewer, 'asyncOperationFailed', this.__docViewer_asyncOperationFailed);

      // initialize visual tools
      this.__initializeVisualTools(this._docViewer);

      let interactionAreaAppearanceManager: Vintasoft.Imaging.Annotation.UI.WebInteractionAreaAppearanceManagerJS
        = this._docViewer.getInteractionAreaAppearanceManager() as Vintasoft.Imaging.Annotation.UI.WebInteractionAreaAppearanceManagerJS;
      let rotationPoint: Vintasoft.Imaging.UI.VisualTools.WebRotationInteractionPointJS
        = interactionAreaAppearanceManager.get_RotationPoint();
      // set the cursor for interaction point that allows to rotate annotation
      rotationPoint.set_Cursor("url('Content/Cursors/Rotate.cur'), auto");

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
      // get the visual tool, which allows to annotate and pan images in image viewer
      let annotationPanTool: Vintasoft.Imaging.UI.VisualTools.WebVisualToolJS
        = this._docViewer.getVisualToolById('AnnotationVisualTool,PanTool');
      this._docViewer.set_MandatoryVisualTool(annotationPanTool);
      this._docViewer.set_CurrentVisualTool(annotationPanTool);

      // copy the default file to the uploaded image files directory and open the file
      this._openFileHelper = new OpenFileHelper(this.modalService, this._docViewer, this.__showErrorMessage);
      this._openFileHelper.openDefaultImageFile('VintasoftAnnotationDemo.tif');
    });
  }



  // === "View" toolbar ===

  /**
   * Creates UI button for showing image viewer settings dialog.
   */
  __createImageViewerSettingsButton() {
    // create the button that allows to show a dialog with image viewer settings
    return new Vintasoft.Imaging.UI.UIElements.WebUiButtonJS({
      cssClass: "vsdv-imageViewerSettingsButton",
      title: "Show Image Viewer Settings",
      localizationId: "imageViewerSettingsButton",
      onClick: _annotationDemoComponent.__imageViewerSettingsButton_clicked
    });
  }

  /**
   * "Show Image Viewer Settings" button is clicked.
   * @param event
   * @param uiElement
   */
  __imageViewerSettingsButton_clicked(event: any, uiElement: Vintasoft.Imaging.UI.UIElements.WebUiElementJS) {
    let docViewer: Vintasoft.Imaging.DocumentViewer.WebDocumentViewerJS = uiElement.get_RootControl() as Vintasoft.Imaging.DocumentViewer.WebDocumentViewerJS;
    if (docViewer != null) {
      let imageViewer: Vintasoft.Imaging.UI.WebImageViewerJS = docViewer.get_ImageViewer();
      if (imageViewer != null) {
        let dlg: ImageViewerSettingsDialog = new ImageViewerSettingsDialog(_annotationDemoComponent.modalService);
        dlg.imageViewer = imageViewer;
        dlg.open();
      }
    }
  }



  // === "Tools" toolbar ===

  /**
   * Creates UI button for activating the visual tool, which allows to annotate and pan images in image viewer.
   */
  __createAnnotationAndPanToolButton() {
    return new Vintasoft.Imaging.DocumentViewer.UIElements.WebUiVisualToolButtonJS({
      cssClass: 'vsui-button vsdv-tools-panButton',
      title: 'Pan',
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
    let imageViewerPanel: Vintasoft.Imaging.DocumentViewer.Panels.WebUiImageViewerPanelJS
      = items.getItemByRegisteredId('imageViewerPanel') as Vintasoft.Imaging.DocumentViewer.Panels.WebUiImageViewerPanelJS;
    // if panel exists
    if (imageViewerPanel != null) {
      if (this._annotationUiHelper == null) {
        this._annotationUiHelper = new AnnotationUiHelper(this.modalService);
      }
      // initialize the annotation context menu
      this._annotationUiHelper.initAnnotationContextMenu(docViewerSettings, imageViewerPanel);
    }
  }



  // === Init UI ===

  /**
   * Registers custom UI elements in "WebUiElementsFactoryJS".
   */
  __registerNewUiElements() {
    let saveAnnotationsAndDownloadFileHelper: SaveAnnotationsAndDownloadFileHelper = new SaveAnnotationsAndDownloadFileHelper(this.__showErrorMessage);

    // override the "Download image" button in web UI elements factory
    Vintasoft.Imaging.UI.UIElements.WebUiElementsFactoryJS.registerElement('downloadImageButton', saveAnnotationsAndDownloadFileHelper.createDownloadFileWithAnnotationsButton);

    // register the "Image viewer settings" button in web UI elements factory
    Vintasoft.Imaging.UI.UIElements.WebUiElementsFactoryJS.registerElement('imageViewerSettingsButton', this.__createImageViewerSettingsButton);

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

    let uploadFileButton: Vintasoft.Imaging.UI.UIElements.WebUiUploadFileButtonJS
      = items.getItemByRegisteredId('uploadFileButton') as Vintasoft.Imaging.UI.UIElements.WebUiUploadFileButtonJS;
    if (uploadFileButton != null)
      uploadFileButton.set_FileExtensionFilter('.bmp, .emf, .gif, .ico, .cur, .jpg, .jpeg, .jls, .pcx, .png, .tif, .tiff, .wmf, .jb2, .jbig2, .jp2, .j2k, .j2c, .jpc, .pdf');

    // get the main menu of document viewer
    let mainMenu: Vintasoft.Imaging.UI.Panels.WebUiPanelContainerJS
      = items.getItemByRegisteredId('mainMenu') as Vintasoft.Imaging.UI.Panels.WebUiPanelContainerJS;
    // if main menu is found
    if (mainMenu != null) {
      // get items of main menu
      let mainMenuItems: Vintasoft.Imaging.UI.UIElements.WebUiElementCollectionJS
        = mainMenu.get_Items();

      // add "Annotation" menu panel
      mainMenuItems.addItem('annotationsMenuPanel');
    }

    if (this._annotationUiHelper == null) {
      this._annotationUiHelper = new AnnotationUiHelper(this.modalService);
    }

    // get the "View" menu panel
    let viewMenuPanel: Vintasoft.Imaging.UI.Panels.WebUiPanelJS
      = items.getItemByRegisteredId('viewMenuPanel') as Vintasoft.Imaging.UI.Panels.WebUiPanelJS;
    // if menu panel is found
    if (viewMenuPanel != null) {
      // get items of menu panel
      let viewMenuPanelItems: Vintasoft.Imaging.UI.UIElements.WebUiElementCollectionJS
        = viewMenuPanel.get_Items();
      // add the "Image viewer settings" button to the menu panel
      viewMenuPanelItems.insertItem(viewMenuPanelItems.get_Count() - 1, 'imageViewerSettingsButton');
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

    let sidePanel: Vintasoft.Imaging.UI.Panels.WebUiSidePanelJS
      = items.getItemByRegisteredId('sidePanel') as Vintasoft.Imaging.UI.Panels.WebUiSidePanelJS;
    if (sidePanel != null) {
      let sidePanelItems: Vintasoft.Imaging.UI.UIElements.WebUiElementCollectionJS = sidePanel.get_PanelsCollection();

      if (this._annotationUiHelper == null) {
        this._annotationUiHelper = new AnnotationUiHelper(this.modalService);
      }
      // initialize the annotation panel
      this._annotationUiHelper.initAnnotationPanel(sidePanelItems);
    }

    // get the thumbnail viewer panel of document viewer
    let thumbnailViewerPanel: Vintasoft.Imaging.DocumentViewer.Panels.WebUiThumbnailViewerPanelJS
      = items.getItemByRegisteredId('thumbnailViewerPanel') as Vintasoft.Imaging.DocumentViewer.Panels.WebUiThumbnailViewerPanelJS;
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
    let zoomTool: Vintasoft.Imaging.UI.VisualTools.WebVisualToolJS
      = docViewer.getVisualToolById('ZoomTool');
    let panTool: Vintasoft.Imaging.UI.VisualTools.WebVisualToolJS
      = docViewer.getVisualToolById('PanTool');
    let magnifierTool: Vintasoft.Imaging.UI.VisualTools.WebVisualToolJS
      = docViewer.getVisualToolById('MagnifierTool');
    let zoomSelectionTool: Vintasoft.Imaging.UI.VisualTools.WebVisualToolJS
      = docViewer.getVisualToolById('ZoomSelectionTool');

    let zoomCursor: string = "url('Content/Cursors/Zoom.cur'), auto";
    let magnifierCursor: string = "url('Content/Cursors/Magnifier.cur'), auto";
    let panCursor: string = "url('Content/Cursors/CloseHand.cur'), auto";

    rectangularSelectionTool.set_DisableContextMenu(true);

    panTool.set_Cursor('pointer');
    panTool.set_ActionCursor(panCursor);

    magnifierTool.set_Cursor(magnifierCursor);
    magnifierTool.set_DisableContextMenu(true);

    zoomTool.set_Cursor(zoomCursor);
    zoomTool.set_ActionCursor(zoomCursor);
    zoomTool.set_DisableContextMenu(true);

    zoomSelectionTool.set_ActionCursor(zoomCursor);
    zoomSelectionTool.set_DisableContextMenu(true);


    if (_annotationDemoComponent._annotationUiHelper != null) {
      // initialize the annotation visual tool
      _annotationDemoComponent._annotationUiHelper.initializeAnnotationVisualTool(docViewer);
    }
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

    // get description of asynchronous operation
    let description: string = data.description;
    // if annotations are saving to the server
    if (description === "Save annotations") {
      // show message about successful saving
      alert("Annotation collection is saved successfully.");
    }
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
