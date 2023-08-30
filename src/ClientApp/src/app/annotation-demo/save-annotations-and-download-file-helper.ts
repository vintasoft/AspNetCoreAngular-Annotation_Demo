let _saveAnnotationsAndDownloadFileHelper: SaveAnnotationsAndDownloadFileHelper;

declare global {
  interface Navigator {
    msSaveBlob: (blob: Blob, fileName: string) => boolean
  }
}

/**
 A helper that helps to download file with annotations.
*/
export class SaveAnnotationsAndDownloadFileHelper {

  _docViewer: Vintasoft.Imaging.DocumentViewer.WebDocumentViewerJS | null;
  _showErrorMessageFunc: Function;
  _downloadImageCount: number;
  _downloadedImageCount: number;



  constructor(showErrorMessageFunc: Function) {
    _saveAnnotationsAndDownloadFileHelper = this;

    this._docViewer = null;
    this._showErrorMessageFunc = showErrorMessageFunc;
    this._downloadImageCount = 0;
    this._downloadedImageCount = 0;
  }



  /**
   * Creates UI button that allows to download an image file with annotations.
   */
  createDownloadFileWithAnnotationsButton() {
    var that = _saveAnnotationsAndDownloadFileHelper;


    /**
     * "Download image file" button is clicked.
     * @param event
     * @param uiElement
     */
    function __downloadImageButton_clicked(event: object, uiElement: Vintasoft.Imaging.UI.UIElements.WebUiElementJS) {
      that._docViewer = uiElement.get_RootControl() as Vintasoft.Imaging.DocumentViewer.WebDocumentViewerJS;
      // get image viewer
      let viewer: Vintasoft.Imaging.Annotation.UI.WebAnnotationViewerJS = that._docViewer.get_ImageViewer() as Vintasoft.Imaging.Annotation.UI.WebAnnotationViewerJS;
      // get images of image viewer
      let images: Vintasoft.Shared.WebImageCollectionJS = viewer.get_Images();

      that._downloadedImageCount = 0;
      // get image count
      that._downloadImageCount = images.get_Count();
      if (that._downloadImageCount > 0) {
        // get annotation controller
        let controller: Vintasoft.Imaging.Annotation.WebAnnotationViewControllerJS = viewer.get_AnnotationController();
        // start the asynchronous saving of annotation collections
        controller.saveAnnotationCollections(__saveAnnotationCollections_success, __downloadFile_error);

        // start the asynchronous operation in document viewer
        that._docViewer.startAsyncOperation("Download file");
      }
    }

    /**
     * Request for saving annotation collections in image file is executed successfully.
     */
    function __saveAnnotationCollections_success(data: any) {
      if (that._docViewer == null)
        return;

      // get image viewer
      let imageViewer: Vintasoft.Imaging.UI.WebImageViewerJS = that._docViewer.get_ImageViewer();
      // get images of image viewer
      let images: Vintasoft.Shared.WebImageCollectionJS = imageViewer.get_Images();

      that._downloadedImageCount++;
      if (that._downloadedImageCount === that._downloadImageCount) {
        let image: Vintasoft.Shared.WebImageJS = images.getImage(0);
        let source: Vintasoft.Shared.WebImageSourceJS = image.get_Source();
        Vintasoft.Imaging.VintasoftFileAPI.downloadImageFile(source, __onDownloadFile_success, __downloadFile_error);
      }
    }

    /**
     * Saves blob to a file.
     * @param blob Blob.
     * @param filename File name.
     */
    function __saveBlobToFile(blob: any, filename: string): any {
      // if blob is defined
      if (blob != null) {
        // if web browser can save blobs
        if (navigator.msSaveBlob != null) {
          // save the blob using web browser functionality
          return navigator.msSaveBlob(blob, filename);
        }
        // if web browser CANNOT save blobs
        else {
          // create an object URL
          let url: string = window.URL.createObjectURL(blob);
          // if object URL is created
          if (url != null) {
            // create an "A" element
            let a: HTMLAnchorElement = document.createElement("a");
            a.style.display = "none";
            // if "A" element supports the "download" attribute
            if ("download" in a) {
              // create "A" element with "download" attribute for saving a file in browser
              a.setAttribute("href", url);
              a.setAttribute("download", filename);

              let bodyElement: HTMLElement | null = document.getElementById('body');
              if (bodyElement != null) {
                bodyElement.appendChild(a);
              }

              setTimeout(function () {
                a.click();
                a.remove();
                setTimeout(function () { window.URL.revokeObjectURL(url); }, 250);
              }, 66);
            }
            // if "A" element does NOT support the "download" attribute
            else {
              // create iframe for saving a file in browser
              let frame: any = document.createElement("iframe");

              let bodyElement: HTMLElement | null = document.getElementById('body');
              if (bodyElement != null) {
                bodyElement.appendChild(a);
                frame[0].src = url;
                setTimeout(function () { frame.remove(); }, 333);
              }
            }
          }
          // if object URL is NOT created
          else {
            // show the alert if warning occured
            that._showErrorMessageFunc("Error: Object URL is not created.");
          }
        }
      }
      // if blob is NOT created
      else {
        // show the alert if warning occured
        that._showErrorMessageFunc("Error: Blob is not created.");
      }
    }

    /**
     * The request for downloading image file from server is executed successfully.
     */
    function __onDownloadFile_success(data: any) {
      if (that._docViewer == null)
        return;

      // get a blob, which contains data of downloading file
      let blob: any = data.blob;
      // get name of downloading file
      let filename: string = data.filename;
      __saveBlobToFile(blob, filename);

      // stop the asynchronous operation in document viewer
      that._docViewer.finishAsyncOperation("Download file", data);
    }

    /**
     * Download file request is failed.
     */
    function __downloadFile_error(data: any) {
      if (that._docViewer == null)
        return;

      that._docViewer.failAsyncOperation("Download file", data);
    }


    // create button that allows to download image file with annotations
    let element: Vintasoft.Imaging.UI.UIElements.WebUiButtonJS = new Vintasoft.Imaging.UI.UIElements.WebUiButtonJS({
      cssClass: "vsui-downloadImageFileButton",
      title: "Download image file",
      localizationId: "downloadImageButton",
      onClick: __downloadImageButton_clicked
    });
    return element;
  }

}
