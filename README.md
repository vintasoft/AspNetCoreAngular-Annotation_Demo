# VintaSoft ASP.NET Core Angular Annotation Demo

This ASP.NET Core with Angular project uses <a href="https://www.vintasoft.com/vsimaging-dotnet-index.html">VintaSoft Imaging .NET SDK</a>.
The client-side of project is written on Angular (TypeScript+HTML+CSS). The server-side of project uses ASP.NET Core API controllers.<br />
<br />
The project demonstrates how to view and annotate images and documents in ASP.NET Core with Angular:
* Open file with annotations (multipage image file or PDF document).
* View images with annotations.
* Annotate images using 25 annotation types: rectangle, ellipse, highlight, image, text, sticky note, free text, stamp, line, polyline, polygon, freehand, freehand polygon, ruler, angle, mark, etc.
* Burn annotations on image.
* Rotate image with annotations.
* Undo/redo actions with annotations.
* Print images with annotations.
* Download annotated file.
* The application can be used in any modern HTML5 web browser.


## Screenshot
<img src="vintasoft_aspnet.core_angular-annotation_demo.png" title="VintaSoft Annotation Demo for ASP.NET Core with Angular"><br />


## Usage
1. Get the 30 day free evaluation license for <a href="https://www.vintasoft.com/vsimaging-dotnet-index.html" target="_blank">VintaSoft Imaging .NET SDK</a> as described here: <a href="https://www.vintasoft.com/docs/vsimaging-dotnet/Licensing-Evaluation.html" target="_blank">https://www.vintasoft.com/docs/vsimaging-dotnet/Licensing-Evaluation.html</a>

2. Update the evaluation license in "src\Program.cs" file:
   ```
   Vintasoft.Imaging.ImagingGlobalSettings.Register("REG_USER", "REG_EMAIL", "EXPIRATION_DATE", "REG_CODE");
   ```

3. Build the project ("AspNetCoreAngularAnnotationDemo.Net8.csproj" file) in Visual Studio or using .NET CLI:
   ```
   dotnet build AspNetCoreAngularAnnotationDemo.Net8.csproj
   ```

4. Run compiled application and try to view and annotate images and documents.


## Documentation
VintaSoft Imaging .NET SDK on-line User Guide and API Reference for Web developer is available here: https://www.vintasoft.com/docs/vsimaging-dotnet-web/


## Support
Please visit our <a href="https://myaccount.vintasoft.com/">online support center</a> if you have any question or problem.
