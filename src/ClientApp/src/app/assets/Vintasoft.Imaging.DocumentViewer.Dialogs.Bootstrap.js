﻿// Copyright 2014-2025 VintaSoft LLC. All rights reserved.
// This software is protected by International copyright laws.
// Any copying, duplication, deployment, redistribution, modification or other
// disposition hereof is STRICTLY PROHIBITED without an express written license
// granted by VintaSoft LLC. This notice may not be removed or otherwise
// altered under any circumstances.
// This code may NOT be used apart of the VintaSoft product.
var Vintasoft;
(function(b){function a(a,b,h){a=f[a];for(var c="",k=b;k<b+h;k++)c+=String.fromCharCode(a[k]^4095);return c}if(void 0==b||void 0==b.Shared)throw Error("Vintasoft.Shared is not found.");if("4.4.0.1"!==b.version)throw Error("Wrong version of Vintasoft.Shared script.");if(void 0==b.Imaging)throw Error("Vintasoft.Imaging is not found.");if("14.0.7.1"!==b.Imaging.version)throw Error("Wrong version of Vintasoft.Imaging script.");if(void 0==b.Imaging.DocumentViewer)throw Error("Vintasoft.Imaging.DocumentViewer is not found.");if("14.0.7.1"!==
b.Imaging.DocumentViewer.version)throw Error("Wrong version of Vintasoft.Imaging.DocumentViewer script.");var f=[];f.push([3977,3980,3995,3977,4050,3979,3976,3998,3990,3985,4027,3994,3977,3990,3996,3994,4028,3998,3983,3998,3997,3990,3987,3990,3979,3990,3994,3980,4027,3990,3998,3987,3984,3992,4050,3979,3990,3979,3987,3994,3996,3998,3985,3996,3994,3987,4029,3978,3979,3979,3984,3985,4016,4020,3997,3979,3985,4063,3997,3979,3985,4050,3995,3994,3993,3998,3978,3987,3979,3977,3980,3978,3990,4050,3995,3990,
3998,3987,3984,3992,4063,3979,3976,3998,3990,3985,4027,3994,3977,3990,3996,3994,4028,3998,3983,3998,3997,3990,3987,3990,3979,3990,3994,3980,3977,3980,3978,3990,4050,3995,3990,3998,3987,3984,3992,4063,3980,3994,3987,3994,3996,3979,4011,3976,3998,3990,3985,4027,3994,3977,3990,3996,3994,4028,3998,3985,3996,3994,3987,3984,3988,4029,3978,3979,3979,3984,3985,3997,3979,3985,4063,3997,3979,3985,4050,3983,3981,3990,3986,3998,3981,3974,3979,3976,3998,3990,3985,4027,3994,3977,3990,3996,3994,4028,3998,3983,3998,
3997,3990,3987,3990,3979,3990,3994,3980,4027,3990,3998,3987,3984,3992,3980,3994,3987,3994,3996,3979,4011,3976,3998,3990,3985,4027,3994,3977,3990,3996,3994,4027,3990,3998,3987,3984,3992,3986,3984,3995,3998,3987,4050,3979,3990,3979,3987,3994,4011,4008,4030,4022,4017,4063,3995,3994,3977,3990,3996,3994,4063,3996,3998,3983,3998,3997,3990,3987,3990,3979,3990,3994,3980,3006,3998,3985,3996,3994,3987,4029,3978,3979,3979,3984,3985,3984,3988,4029,3978,3979,3979,3984,3985,4028,3987,3990,3996,3988,3994,3995,3976,
3991,3990,3979,3994,4012,3994,3987,3994,3996,3979,4063,4011,4008,4030,4022,4017,4063,3995,3994,3977,3990,3996,3994,3977,3980,3995,3977,4050,3995,3990,3998,3987,3984,3992,4050,3984,3988,4029,3978,3979,3979,3984,3985,3996,3998,3985,3996,3994,3987,4029,3978,3979,3979,3984,3985,4028,3987,3990,3996,3988,3994,3995,3977,3980,3995,3977,4050,3979,3976,3998,3990,3985,4027,3994,3977,3990,3996,3994,4012,3994,3987,3994,3996,3979,3990,3984,3985,4027,3990,3998,3987,3984,3992,4050,3979,3990,3979,3987,3994,3977,3980,
3978,3990,4050,3995,3990,3998,3987,3984,3992,4028,3984,3985,3979,3994,3985,3979,3977,3980,3995,3977,4050,3995,3990,3998,3987,3984,3992,4050,3996,3998,3985,3996,3994,3987,4029,3978,3979,3979,3984,3985]);b.Imaging=b.Imaging;(function(e){e.DocumentViewer=e.DocumentViewer;(function(e){e.Dialogs={};(function(h){var c=b.Shared,k=e.Panels,f=b.Imaging.UI,p=f.Dialogs,l=f.UIElements;if(b.Twain){var m=function(b){var e=m.superclass,d=m.prototype;d.okButtonClicked=function(a,b){};d.cancelButtonClicked=function(a){};
c.VintasoftLocalizationJS.setStringConstant(a(0,340,37),a(0,282,19));c.VintasoftLocalizationJS.setStringConstant(a(0,301,20),a(0,52,2));c.VintasoftLocalizationJS.setStringConstant(a(0,395,24),a(0,133,6));this._15759=b=new k.WebUiTwainSelectDevicePanelJS({cssClass:a(0,377,18)},b);var g=this,f=new l.WebUiLabelElementJS({text:c.VintasoftLocalizationJS.getStringConstant(a(0,340,37)),cssClass:a(0,214,11)});f.set_HeaderIndex(5);delete d.okButtonClicked;delete d.cancelButtonClicked;var h=new l.WebUiButtonInputJS({cssClass:a(0,
147,15),value:c.VintasoftLocalizationJS.getStringConstant(a(0,301,20)),localizationId:a(0,139,8),onClick:{callback:function(){g.hide();var b=g._15759,c=b.get_SelectedDevice(),d=b.get_ShowUI(),b=b.get_ChangeDeviceCapabilities();g._1977(a(0,262,15),{showUI:d,changeDeviceCapabilities:b,device:c})}}}),n=new l.WebUiButtonInputJS({cssClass:a(0,54,15),value:c.VintasoftLocalizationJS.getStringConstant(a(0,395,24)),localizationId:a(0,250,12),onClick:{callback:function(){g.hide();g._1977(a(0,321,19))}}}),q=
{cssClass:a(0,104,29),localizationId:a(0,191,23)};e.constructor.call(this,[f],[b],[h,n],q);d.get_ShowUI=function(){return this._15759.get_ShowUI()};d.get_ChangeDeviceCapabilities=function(){return this._15759.get_ChangeDeviceCapabilities()};d.get_SelectedDevice=function(){return this._15759.get_SelectedDevice()}};c.extend(m,p.WebUiDialogJS);var n=function(b){var e=n.superclass,d=n.prototype;d.okButtonClicked=function(a){};d.cancelButtonClicked=function(a){};c.VintasoftLocalizationJS.setStringConstant(a(0,
0,40),a(0,225,25));c.VintasoftLocalizationJS.setStringConstant(a(0,301,20),a(0,52,2));c.VintasoftLocalizationJS.setStringConstant(a(0,395,24),a(0,133,6));this._32365=b=new k.WebUiTwainDeviceCapabilitiesPanelJS({cssClass:a(0,377,18),css:{backgroud:a(0,277,5)}},b);var g=this,f=new l.WebUiLabelElementJS({text:c.VintasoftLocalizationJS.getStringConstant(a(0,0,40)),cssClass:a(0,214,11)});f.set_HeaderIndex(5);delete d.okButtonClicked;delete d.cancelButtonClicked;var d=new l.WebUiButtonInputJS({cssClass:a(0,
147,15),value:c.VintasoftLocalizationJS.getStringConstant(a(0,301,20)),localizationId:a(0,139,8),onClick:{callback:function(){g.hide();g._1977(a(0,262,15))}}}),h=new l.WebUiButtonInputJS({cssClass:a(0,54,15),value:c.VintasoftLocalizationJS.getStringConstant(a(0,395,24)),localizationId:a(0,40,12),onClick:{callback:function(){g.hide();g._1977(a(0,321,19))}}}),m={cssClass:a(0,69,35),localizationId:a(0,162,29)};e.constructor.call(this,[f],[b],[d,h],m)};c.extend(n,p.WebUiDialogJS);h.WebTwainDeviceSelectionDialogJS=
m;h.WebTwainDeviceCapabilitiesDialogJS=n}})(e.Dialogs)})(e.DocumentViewer)})(b.Imaging)})(Vintasoft);
