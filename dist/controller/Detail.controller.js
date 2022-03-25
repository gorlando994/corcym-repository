jQuery.sap.require("invoiceapproval_S4Hana.view.ApproversFlow");sap.ui.define(["./BaseController","sap/ui/model/json/JSONModel","../model/formatter","sap/m/library","sap/m/MessageToast"],function(e,t,s,i,o){"use strict";var a=i.URLHelper;var r="";var n=[];return e.extend("invoiceapproval_S4Hana.controller.Detail",{formatter:s,onInit:function(){var e=new t({busy:false,delay:0,lineItemListTitle:this.getResourceBundle().getText("detailLineItemTableHeading")});this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched,this);this.setModel(e,"detailView");this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));this.createDeviceModel()},onDownloadItem:function(){var e=this.byId("uploadCollection");var t=e.getSelectedItems();if(t){for(var s=0;s<t.length;s++){var i=t[0].mProperties.url;window.open(i,"toolbar=yes,scrollbars=yes,resizable=yes,top=100,left=500,width=800,height=400")}}else{o.show("Select an item to download")}},updateCountPosition:function(){var e=this.getView().byId("TablePosition").getItems().length;var t={countPosition:e};var s=new sap.ui.model.json.JSONModel(t);this.getView().setModel(s,"tabFilterModel")},onVendorLaunchTask:function(e){var t=this.getView().getModel("extendedJsonModel").getData().VendorCode;var s=this.getOwnerComponent().getModel("RDAPROCESSING");s.setDefaultCountMode(false);s.setSizeLimit(9999);this.getOwnerComponent().setModel(s,"PrExtendedModel");this.getView().getModel().setSizeLimit(9999);sap.ui.core.BusyIndicator.show();s.read("/VendorInformationsSet(VendorCode='"+t+"')",{success:function(e){sap.ui.core.BusyIndicator.hide();var t=new sap.ui.model.json.JSONModel(e);this.getView().setModel(t,"VendorInformationsModel");if(!this.byId("ExtNewLblVendorDetailsDialog")){sap.ui.core.Fragment.load({id:this.getView().getId(),name:"invoiceapproval_S4Hana.view.VendorDetails",controller:this}).then(function(e){this.getView().addDependent(e);e.open()}.bind(this))}else{this.getView().byId("ExtNewLblVendorDetailsDialog").open()}}.bind(this),error:function(e){sap.ui.core.BusyIndicator.hide();alert("404: Comunication Failed")}})},createDeviceModel:function(){var e=sap.ui.Device;var t=new sap.ui.model.json.JSONModel(e);this.getView().setModel(t,"deviceModel")},onPressShowMore:function(e){var t=e.getSource().getParent().getParent().getParent().getBindingContextPath();var s=this.getView().getModel("extendedJsonModel").getProperty(t);s.showAllRows=!s.showAllRows;this.getView().getModel("extendedJsonModel").refresh(true)},checkBlocksRelease:function(e){if(!sap.ui.getCore().this._oDialog){sap.ui.getCore().this._oDialog=sap.ui.xmlfragment("invoiceapproval_S4Hana.view.DecisionStep",this);sap.ui.getCore().this.getView().addDependent(sap.ui.getCore().this._oDialog)}sap.ui.getCore().this._oDialog.open();var t={selection:this.getResourceBundle().getText("fragmentchoiceRelease")};var s=new sap.ui.model.json.JSONModel(t);sap.ui.getCore().this.getView().setModel(s,"DialogModel")},handleCancel:function(e){sap.ui.getCore().this._oDialog.close()},handleSubmit:function(e){sap.ui.getCore().this._oDialog.close();var t=sap.ui.getCore().byId("FragmentNote").getValue();var s=this.getOwnerComponent().getModel("TASKPROCESSING");var i=sap.ui.getCore().InstanceId;var a="LOCAL_TGW";var r={};r.SAP__Origin=a;r.InstanceID=i;if(sap.ui.getCore().byId("choice").getText()=="Release"||sap.ui.getCore().byId("choice").getText()=="Rilascia"){r.DecisionKey="0001"}else{r.DecisionKey="0002"}r.Comments=t;sap.ui.core.BusyIndicator.show();sap.ui.getCore().this=this;s.callFunction("/Decision",{method:"POST",urlParameters:r,success:function(e,t){sap.ui.core.BusyIndicator.hide();sap.ui.getCore().byId("FragmentNote").setValue("");o.show(sap.ui.getCore().this.getResourceBundle().getText("SuccessSubmit"));sap.ui.getCore().oEventBus.publish("Detail","selectFirstItemAfter")},error:function(e){sap.ui.core.BusyIndicator.hide();sap.ui.getCore().byId("FragmentNote").setValue("");o.show(sap.ui.getCore().this.getResourceBundle().getText("ErrorSubmit"))}})},checkBlocksReject:function(e){if(!sap.ui.getCore().this._oDialog){sap.ui.getCore().this._oDialog=sap.ui.xmlfragment("invoiceapproval_S4Hana.view.DecisionStep",sap.ui.getCore().this);sap.ui.getCore().this.getView().addDependent(sap.ui.getCore().this._oDialog)}sap.ui.getCore().this._oDialog.open();var t={selection:sap.ui.getCore().this.getResourceBundle().getText("fragmentchoiceReject")};var s=new sap.ui.model.json.JSONModel(t);sap.ui.getCore().this.getView().setModel(s,"DialogModel")},onSendEmailPress:function(){var e=this.getModel("detailView");a.triggerEmail(null,e.getProperty("/shareSendEmailSubject"),e.getProperty("/shareSendEmailMessage"))},onListUpdateFinished:function(e){var t,s=e.getParameter("total"),i=this.getModel("detailView");if(this.byId("lineItemsList").getBinding("items").isLengthFinal()){if(s){t=this.getResourceBundle().getText("detailLineItemTableHeadingCount",[s])}else{t=this.getResourceBundle().getText("detailLineItemTableHeading")}i.setProperty("/lineItemListTitle",t)}},_onObjectMatched:function(e){var t=e.getParameter("arguments").objectId;var s=e.getParameter("arguments").instanceId;sap.ui.getCore().oEventBus=this.getOwnerComponent().getEventBus();this.getModel("appView").setProperty("/layout","TwoColumnsMidExpanded");sap.ui.core.BusyIndicator.show();this.getModel().metadataLoaded().then(function(){var e=this.getModel().createKey("ExtendedPropertiesInvoiceSet",{SAP__Origin:"LOCAL_TGW",InstanceID:s,TaskDefinitionID:t,DocId:""});this._bindView("/"+e)}.bind(this));sap.ui.getCore().TaskDefinition=t;sap.ui.getCore().InstanceId=s;this.ReadApproverSetModel(t,s);this.ReadInvoiceAttachment(t,s)},ReadInvoiceAttachment:function(e,t){var s=this.getOwnerComponent().getModel("TASKPROCESSING");var i=t;var o=e;var a="LOCAL_TGW";n=[];var r=new sap.ui.model.Filter("SAP__Origin",sap.ui.model.FilterOperator.EQ,a);n.push(r);var l=new sap.ui.model.Filter("InstanceID",sap.ui.model.FilterOperator.EQ,i);n.push(l);sap.ui.getCore().this=this;s.read("/TaskCollection(SAP__Origin='%2FIWPGW%2FBWF',InstanceID='"+i+"')/Attachments",{success:function(e){sap.ui.core.BusyIndicator.hide();var t=0;for(t=0;e.results.length>t;t++){var s=e.results[t].__metadata.media_src;var i=s.split("44300/");var o=sap.ui.getCore().this.getOwnerComponent().getManifestObject();e.results[t].__metadata.media_src=o._oBaseUri._string+i[1]}var a={Attachments:e.results,AttachmentsCount:e.results.length};var r=new sap.ui.model.json.JSONModel(a);sap.ui.getCore().this.getOwnerComponent().setModel(r,"detail")},error:function(e){sap.ui.core.BusyIndicator.hide();alert("Errore di comunicazione con il database.")}})},ReadApproverSetModel:function(e,t){var s=t;var i=e;var o="LOCAL_TGW";var a=new sap.ui.model.Filter("SAP__Origin",sap.ui.model.FilterOperator.EQ,o);n.push(a);var r=new sap.ui.model.Filter("InstanceID",sap.ui.model.FilterOperator.EQ,s);n.push(r);var l=new sap.ui.model.Filter("TaskDefinitionID",sap.ui.model.FilterOperator.EQ,i);n.push(l);var u=this.getOwnerComponent().getModel();u.read("/ExtendedPropertiesInvoiceSet",{urlParameters:{$expand:"Positions,Approvers,Attachments"},filters:[n],success:function(e){sap.ui.core.BusyIndicator.hide();var t=e.results.length-1;var s=function(e){var t=e.split("\\n");return t.join("\n")};if(e.results[t].HeaderNote!=undefined){e.results[t].HeaderNote=s(e.results[t].HeaderNote)}if(e.results[t].ApprRejNote!=undefined){e.results[t].ApprRejNote=s(e.results[t].ApprRejNote)}for(var i=0;e.results[t].Positions.results.length>i;i++){if(e.results[t].Positions.results[i].LongText!=undefined){e.results[t].Positions.results[i].LongText=e.results[t].Positions.results[i].LongText.replace(/\\n/g,"\n")}}e.results[t].HasPurchaseRequest=false;e.results[t].noDiscrepancyItems=true;e.results[t].showAllRowsDiscrepancy=false;for(var o=0;o<e.results[t].Positions.results.length;o++){e.results[t].Positions.results[o].showAllRows=false;if(e.results[t].PriceDiscrepancy==="X"&&e.results[t].Positions.results[o].Position!==e.results[t].DiscrepancyRow){e.results[t].Positions.results[o].noDiscrepancy=true;e.results[t].noDiscrepancyItems=false;if(e.results[t].Positions.results[o].Type==="1WT_DIS"){e.results[t].Positions.results[o].Type="2NO_DIS"}}else{e.results[t].Positions.results[o].noDiscrepancy=false}}var a=[];for(var r=0;e.results[t].Attachments.results.length>r;r++){var n=e.results[t].Attachments.results[r].__metadata.uri.split("44301/");var l=sap.ui.getCore().this.getOwnerComponent().getManifestObject();URL=l._oBaseUri._string+n[1];URL.replace("AttachmentSet","ActualAttachmentSet");var u=URL.split("AttachmentSet");n=[];n=URL.split("(");n=n[1].split(",");URL=u[0]+"ActualAttachmentSet("+n[3]+","+n[4]+"/$value";e.results[t].Attachments.results[r].__metadata.uri=URL}var d=new sap.ui.model.json.JSONModel({Attachments:e.results[t].Attachments.results,AttachmentsCount:e.results[t].Attachments.results.length});this.getView().setModel(d,"detail");this.extendedJsonModel=new sap.ui.model.json.JSONModel(e.results[t]);this.getView().setModel(this.extendedJsonModel,"extendedJsonModel");this.flowGenerator(e.results[t].Approvers.results)}.bind(this),error:function(e){sap.ui.core.BusyIndicator.hide();alert("Errore di comunicazione con il database.")}})},flowGenerator:function(e){var t=this.getView().byId("approvingStepsArea");t.destroyItems();while(e.length){var s=e.filter(function(t){return e[0].PurchaseRequisition===t.PurchaseRequisition});var e=e.filter(function(e){return s[0].PurchaseRequisition!==e.PurchaseRequisition});var i=new invoiceapproval_S4Hana.view.ApproversFlow({});t.addItem(i);i.setData(s)}},_bindView:function(e){var t=this.getModel("detailView");t.setProperty("/busy",false);this.getView().bindElement({path:e,events:{change:this._onBindingChange.bind(this),dataRequested:function(){t.setProperty("/busy",true)},dataReceived:function(){t.setProperty("/busy",false)}}})},_onBindingChange:function(){var e=this.getView(),t=e.getElementBinding();if(!t.getBoundContext()){this.getRouter().getTargets().display("detailObjectNotFound");this.getOwnerComponent().oListSelector.clearMasterListSelection();return}var s=t.getPath(),i=this.getResourceBundle();this.getOwnerComponent().oListSelector.selectAListItem(s)},_onMetadataLoaded:function(){var e=this.getView().getBusyIndicatorDelay(),t=this.getModel("detailView"),s=this.byId("TablePosition"),i=s.getBusyIndicatorDelay();t.setProperty("/delay",0);t.setProperty("/lineItemTableDelay",0);s.attachEventOnce("updateFinished",function(){t.setProperty("/lineItemTableDelay",i)});t.setProperty("/busy",true);t.setProperty("/delay",e)},onCloseDetailPress:function(){this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen",false);this.getOwnerComponent().oListSelector.clearMasterListSelection();this.getRouter().navTo("master")},toggleFullScreen:function(){var e=this.getModel("appView").getProperty("/actionButtonsInfo/midColumn/fullScreen");this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen",!e);if(!e){this.getModel("appView").setProperty("/previousLayout",this.getModel("appView").getProperty("/layout"));this.getModel("appView").setProperty("/layout","MidColumnFullScreen")}else{this.getModel("appView").setProperty("/layout",this.getModel("appView").getProperty("/previousLayout"))}}})});