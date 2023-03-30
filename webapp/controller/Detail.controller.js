//jQuery.sap.require("invoiceapproval_S4Hana.view.ApproversFlow");
sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    // "sap/m/library",
    'sap/m/MessageToast',
    "../view/ApproversFlow"
    //], function (BaseController, JSONModel, formatter, mobileLibrary, MessageToast, ApproversFlow) {
], function (BaseController, JSONModel, formatter, MessageToast, ApproversFlow) {
    "use strict";

    // shortcut for sap.m.URLHelper
    //  var URLHelper = mobileLibrary.URLHelper;
    var string_filter = "";
    var filters = [];


    return BaseController.extend("invoiceapproval_S4Hana.controller.Detail", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        onInit: function () {
            // Model used to manipulate control states. The chosen values make sure,
            // detail page is busy indication immediately so there is no break in
            // between the busy indication for loading the view's meta data
            var oViewModel = new JSONModel({
                busy: false,
                delay: 0,
                lineItemListTitle: this.getResourceBundle().getText("detailLineItemTableHeading")
            });

            this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

            this.setModel(oViewModel, "detailView");

            this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));

            //SETTING UP DEVICE MODEL TYPE
            this.createDeviceModel();
        },


        onDownloadItem: function () {
            var oUploadCollection = this.byId("uploadCollection");
            var aSelectedItems = oUploadCollection.getSelectedItems();
            if (aSelectedItems) {
                for (var i = 0; i < aSelectedItems.length; i++) {
                    var sUrlVar = aSelectedItems[0].mProperties.url;
                    //var URL = aSelectedItems[0].mProperties.url + "/$value";
                    //var myArr = URL.split("8443/");
                    //var manObj = this.getOwnerComponent().getManifestObject();
                    //URL = manObj._oBaseUri._string + myArr[1];
                    //URL.replace("AttachmentSet", "ActualAttachmentSet");
                    //var myArr2 = URL.split("AttachmentSet"); 
                    //myArr = [];
                    //myArr = URL.split("(");
                    //myArr = myArr[1].split(",");
                    //URL = myArr2[0] + "ActualAttachmentSet(" + myArr[3] + "," +  myArr[4] + "/$value"; 


                    window.open(sUrlVar, "toolbar=yes,scrollbars=yes,resizable=yes,top=100,left=500,width=800,height=400");

                    //oUploadCollection.downloadItem(aSelectedItems[i], true);
                }
            } else {
                MessageToast.show("Select an item to download");
            }
        },

        updateCountPosition: function () {

            var TablePositionNumItem = this.getView().byId("TablePosition").getItems().length;
            var Jsonmodel = {

                countPosition: TablePositionNumItem
            };
            var oModel = new sap.ui.model.json.JSONModel(Jsonmodel);
            this.getView().setModel(oModel, "tabFilterModel");

        },

        onVendorLaunchTask: function (event) {
            var FixedVendorCode = this.getView().getModel("extendedJsonModel").getData().VendorCode;

            /* var prModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/zmy_inbox_rda_srv", {
                metadataUrlParams: {
                    "sap-language": "en"
                }
            }); */

            var prModel = this.getOwnerComponent().getModel("RDAPROCESSING");

            prModel.setDefaultCountMode(false);
            prModel.setSizeLimit(9999);
            this.getOwnerComponent().setModel(prModel, "PrExtendedModel");

            this.getView().getModel().setSizeLimit(9999);

            sap.ui.core.BusyIndicator.show();
            prModel.read("/VendorInformationsSet(VendorCode='" + FixedVendorCode + "')", {
                success: function (result) {
                    sap.ui.core.BusyIndicator.hide();

                    var VendorInformationsModel = new sap.ui.model.json.JSONModel(result);
                    this.getView().setModel(VendorInformationsModel, "VendorInformationsModel");

                    if (!this.byId("ExtNewLblVendorDetailsDialog")) {
                        sap.ui.core.Fragment.load({
                            id: this.getView().getId(),
                            name: "invoiceapproval_S4Hana.view.VendorDetails",
                            controller: this
                        }).then(function (oDialog) {
                            this.getView().addDependent(oDialog);
                            oDialog.open();
                        }.bind(this));
                    } else {
                        this.getView().byId("ExtNewLblVendorDetailsDialog").open();
                    }
                }.bind(this),
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    alert("404: Comunication Failed");
                }.bind(this)
            });
        },

        createDeviceModel: function () {
            var device = sap.ui.Device;
            var oModel = new sap.ui.model.json.JSONModel(device);
            this.getView().setModel(oModel, "deviceModel");
        },

        onPressShowMore: function (oEvent) {
            var path = oEvent.getSource().getParent().getParent().getParent().getBindingContextPath();

            //var path = oEvent.getSource().getBindingContext().getPath();
            var position = this.getView().getModel("extendedJsonModel").getProperty(path);
            position.showAllRows = !position.showAllRows;
            this.getView().getModel("extendedJsonModel").refresh(true);

            //var position = this.getView().getModel().getProperty(path);
            //position.showAllRows = !position.showAllRows;
            //this.getView().getModel().refresh(true);
        },

        checkBlocksRelease: function (successCallback) {
            //var purchaseRequisition = sap.ui.getCore().PurchaseRequisition;
            //sap.ui.core.BusyIndicator.show();
            //var extendedModel = this.getOwnerComponent().getModel();
            //extendedModel.read("/CheckBlocksSet(PurchaseRequisition='" + purchaseRequisition + "')", {
            //success: function (result) {
            // sap.ui.core.BusyIndicator.hide();


            if (!this._oDialog) {
                this._oDialog = sap.ui.xmlfragment("invoiceapproval_S4Hana.view.DecisionStep", this);
                this.getView().addDependent(this._oDialog);
            }

            this._oDialog.open();


            var Jsonmodel = {
                selection: this.getResourceBundle().getText("fragmentchoiceRelease")
            };
            var oModel = new sap.ui.model.json.JSONModel(Jsonmodel);
            this.getView().setModel(oModel, "DialogModel");


            //}.bind(this),
            //error: function (e) {
            //   sap.ui.core.BusyIndicator.hide();
            //  var message = JSON.parse(e.responseText).error.message.value;
            //  sap.m.MessageBox.error(message);
            // }
            // });
        },

        handleCancel: function (oEvent) {
            this._oDialog.close();

        },

        handleSubmit: function (oEvent) {

          

            //Get reference of text typed by User in Note TextArea
            var Note = sap.ui.getCore().byId("FragmentNote").getValue();

            //VARIABLES DEFINITION
            var oModel = this.getOwnerComponent().getModel("TASKPROCESSING");
            var InstanceID = this.InstanceId;
            var SAP__Origin = 'LOCAL_TGW';
            var obj = {};

            obj.SAP__Origin = SAP__Origin;
            obj.InstanceID = InstanceID;
            if (sap.ui.getCore().byId("choice").getText() == "Release" || sap.ui.getCore().byId("choice").getText() == "Rilascia") {
                obj.DecisionKey = '0001';

            } else {

                obj.DecisionKey = '0002';
                if (!Note) {
                    sap.m.MessageBox.warning(this.getResourceBundle().getText("ErrorNoteObb"));
                    return;
                }

            }

  //CLOSE INSTANCE OF POPUP OBJECT
  this._oDialog.close();
            obj.Comments = Note;


            sap.ui.core.BusyIndicator.show();


            oModel.callFunction("/Decision", {// function import name
                method: "POST", // http method
                urlParameters: obj, // function import parameters
                success: function (oData, response) {
                    sap.ui.core.BusyIndicator.hide();
                    sap.ui.getCore().byId("FragmentNote").setValue('');
                    //sap.ui.commons.MessageBox.show("Salvataggio dati Effettuato correttamente");
                    MessageToast.show(this.getResourceBundle().getText("SuccessSubmit"));

                    this.oEventBus.publish("Detail", "selectFirstItemAfter");

                }.bind(this), // callback function for success
                error: function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    sap.ui.getCore().byId("FragmentNote").setValue('');
                    //sap.ui.commons.MessageBox.show("Errore nel salvataggio dei dati");
                    MessageToast.show(this.getResourceBundle().getText("ErrorSubmit"));

                }.bind(this)
            }); // callback function for error






        },

        checkBlocksReject: function (successCallback) {
            //var purchaseRequisition = sap.ui.getCore().PurchaseRequisition;
            //sap.ui.core.BusyIndicator.show();
            //var extendedModel = this.getOwnerComponent().getModel();
            // extendedModel.read("/CheckBlocksSet(PurchaseRequisition='" + purchaseRequisition + "')", {
            //  success: function (result) {
            //  sap.ui.core.BusyIndicator.hide();

            if (!this._oDialog) {
                this._oDialog = sap.ui.xmlfragment("invoiceapproval_S4Hana.view.DecisionStep", this);
                this.getView().addDependent(this._oDialog);
            }

            this._oDialog.open();


            var Jsonmodel = {
                selection: this.getResourceBundle().getText("fragmentchoiceReject")
            };
            var oModel = new sap.ui.model.json.JSONModel(Jsonmodel);
            this.getView().setModel(oModel, "DialogModel");


            //},
            //error: function (e) {
            //    sap.ui.core.BusyIndicator.hide();
            //    var message = JSON.parse(e.responseText).error.message.value;
            //   sap.m.MessageBox.error(message);
            //}
            //});
        },

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */

        /**
         * Event handler when the share by E-Mail button has been clicked
         * @public
         */
        /*    onSendEmailPress: function () {
                var oViewModel = this.getModel("detailView");
    
                URLHelper.triggerEmail(
                    null,
                    oViewModel.getProperty("/shareSendEmailSubject"),
                    oViewModel.getProperty("/shareSendEmailMessage")
                );
            },*/


        /**
         * Updates the item count within the line item table's header
         * @param {object} oEvent an event containing the total number of items in the list
         * @private
         */
        onListUpdateFinished: function (oEvent) {
            var sTitle,
                iTotalItems = oEvent.getParameter("total"),
                oViewModel = this.getModel("detailView");

            // only update the counter if the length is final
            if (this.byId("lineItemsList").getBinding("items").isLengthFinal()) {
                if (iTotalItems) {
                    sTitle = this.getResourceBundle().getText("detailLineItemTableHeadingCount", [iTotalItems]);
                } else {
                    //Display 'Line Items' instead of 'Line items (0)'
                    sTitle = this.getResourceBundle().getText("detailLineItemTableHeading");
                }
                oViewModel.setProperty("/lineItemListTitle", sTitle);
            }
        },

        /* =========================================================== */
        /* begin: internal methods                                     */
        /* =========================================================== */

        /**
         * Binds the view to the object path and expands the aggregated line items.
         * @function
         * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
         * @private
         */
        _onObjectMatched: function (oEvent) {

            //LOCAL VARIABLES DEFINITION
            var TaskDefinition = oEvent.getParameter("arguments").objectId;
            var sinstanceId = oEvent.getParameter("arguments").instanceId;
            this.oEventBus = this.getOwnerComponent().getEventBus();

            this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
            sap.ui.core.BusyIndicator.show();
            this.getModel().metadataLoaded().then(function () {
                var sObjectPath = this.getModel().createKey("ExtendedPropertiesInvoiceSet", {
                    SAP__Origin: 'LOCAL_TGW',
                    InstanceID: sinstanceId,
                    TaskDefinitionID: TaskDefinition,
                    DocId: ''

                });
                this._bindView("/" + sObjectPath);
            }.bind(this));

            //sap.ui.getCore().PurchaseRequisition = sObjectId;
            this.TaskDefinition = TaskDefinition;
            this.InstanceId = sinstanceId;

            this.ReadApproverSetModel(TaskDefinition, sinstanceId);
            this.ReadInvoiceAttachment(TaskDefinition, sinstanceId);
        },

        ReadInvoiceAttachment: function (TaskDefinition, sinstanceId) {

            //VARIABLES DEFINITION
            var oModel = this.getOwnerComponent().getModel("TASKPROCESSING");
            var InstanceID = sinstanceId;
            var TaskDefinitionID = TaskDefinition;
            var SAP__Origin = 'LOCAL_TGW';

            //CLEARING FILTER VARIABLES
            filters = [];

            var InstanceFilter = new sap.ui.model.Filter("SAP__Origin", sap.ui.model.FilterOperator.EQ, SAP__Origin);
            filters.push(InstanceFilter);

            var InstanceFilter2 = new sap.ui.model.Filter("InstanceID", sap.ui.model.FilterOperator.EQ, InstanceID);
            filters.push(InstanceFilter2);

            //var InstanceFilter3 = new sap.ui.model.Filter("TaskDefinitionID", sap.ui.model.FilterOperator.EQ, TaskDefinitionID);
            //filters.push(InstanceFilter3);


            oModel.read("/TaskCollection(SAP__Origin='%2FIWPGW%2FBWF',InstanceID='" + InstanceID + "')/Attachments", {
                success: function (result) {
                    sap.ui.core.BusyIndicator.hide();

                    var i = 0;
                    for (i = 0; result.results.length > i; i++) {
                        var str = result.results[i].__metadata.media_src;
                        //var myArr = str.split("8443/");
                        var myArr = str.split("44300/");
                        var manObj = this.getOwnerComponent().getManifestObject();
                        result.results[i].__metadata.media_src = manObj._oBaseUri._string + myArr[1];
                    }

                    var json = {
                        Attachments: result.results,
                        AttachmentsCount: result.results.length
                    };
                    var jsonModel = new sap.ui.model.json.JSONModel(json);
                    this.getOwnerComponent().setModel(jsonModel, "detail");

                }.bind(this),
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    alert("Errore di comunicazione con il database.");
                }.bind(this)
            });



        },





        ReadApproverSetModel: function (TaskDefinition, sinstanceId) {

            //VARIABLES DEFINITION
            //var PurchaseRequisition = sObjectId;
            var InstanceID = sinstanceId;
            var TaskDefinitionID = TaskDefinition;
            var SAP__Origin = 'LOCAL_TGW';

            var InstanceFilter = new sap.ui.model.Filter("SAP__Origin", sap.ui.model.FilterOperator.EQ, SAP__Origin);
            filters.push(InstanceFilter);

            var InstanceFilter2 = new sap.ui.model.Filter("InstanceID", sap.ui.model.FilterOperator.EQ, InstanceID);
            filters.push(InstanceFilter2);

            var InstanceFilter3 = new sap.ui.model.Filter("TaskDefinitionID", sap.ui.model.FilterOperator.EQ, TaskDefinitionID);
            filters.push(InstanceFilter3);

            //var InstanceFilter4 = new sap.ui.model.Filter("PurchaseRequisition", sap.ui.model.FilterOperator.EQ, PurchaseRequisition);
            //filters.push(InstanceFilter4);

            var extendedModel = this.getOwnerComponent().getModel();
            extendedModel.read("/ExtendedPropertiesInvoiceSet", {
                urlParameters: {
                    $expand: "Positions,Approvers,Attachments"
                },
                filters: [filters],
                success: function (result) {
                    sap.ui.core.BusyIndicator.hide();
                    var numOcc = result.results.length - 1;
                    var replaceBackslashes = function (string) {
                        var stringArray = string.split("\\n");
                        return stringArray.join("\n");
                    };

                    if (result.results[numOcc].HeaderNote != undefined) {
                        result.results[numOcc].HeaderNote = replaceBackslashes(result.results[numOcc].HeaderNote);
                    }

                    if (result.results[numOcc].ApprRejNote != undefined) {
                        result.results[numOcc].ApprRejNote = replaceBackslashes(result.results[numOcc].ApprRejNote);
                    }

                    for (var c = 0; result.results[numOcc].Positions.results.length > c; c++) {
                        if (result.results[numOcc].Positions.results[c].LongText != undefined) {
                            result.results[numOcc].Positions.results[c].LongText = result.results[numOcc].Positions.results[c].LongText.replace(/\\n/g, "\u000a");
                        }
                    }

                    result.results[numOcc].HasPurchaseRequest = false;
                    result.results[numOcc].noDiscrepancyItems = true;
                    result.results[numOcc].showAllRowsDiscrepancy = false;

                    for (var i = 0; i < result.results[numOcc].Positions.results.length; i++) {
                        // format the itemText
                        //result.results[numOcc].Positions.results[i].ItemText = replaceBackslashes(result.results[numOcc].Positions.results[i].ItemText);

                        // by default we wont show all the rows
                        result.results[numOcc].Positions.results[i].showAllRows = false;


                        // i need to show the non price discrepancyies (or the discrepancy not in question) only if it's not a non price discrepancy invoice
                        if (result.results[numOcc].PriceDiscrepancy === "X" && result.results[numOcc].Positions.results[i].Position !== result.results[numOcc].DiscrepancyRow) {
                            result.results[numOcc].Positions.results[i].noDiscrepancy = true;
                            result.results[numOcc].noDiscrepancyItems = false;

                            //  the records with  discrepancy not in exam will be represented as not discrepancy
                            if (result.results[numOcc].Positions.results[i].Type === "1WT_DIS") {
                                result.results[numOcc].Positions.results[i].Type = "2NO_DIS";
                            }
                        } else {
                            result.results[numOcc].Positions.results[i].noDiscrepancy = false;
                        }

                    }

                    var attachment = [];
                    for (var d = 0; result.results[numOcc].Attachments.results.length > d; d++) {
                        //var myArr = result.results[numOcc].Attachments.results[d].__metadata.uri.split("8443/");
                        var myArr = result.results[numOcc].Attachments.results[d].__metadata.uri.split("44301/");
                        var manObj = this.getOwnerComponent().getManifestObject();
                        var sUrlVar = manObj._oBaseUri._string + myArr[1];
                        sUrlVar.replace("AttachmentSet", "ActualAttachmentSet");
                        var myArr2 = sUrlVar.split("AttachmentSet");
                        myArr = [];
                        myArr = sUrlVar.split("(");
                        myArr = myArr[1].split(",");
                        sUrlVar = myArr2[0] + "ActualAttachmentSet(" + myArr[3] + "," + myArr[4] + "/$value";
                        result.results[numOcc].Attachments.results[d].__metadata.uri = sUrlVar;
                    }


                    var extendedJsonModelAtt = new sap.ui.model.json.JSONModel({
                        "Attachments": result.results[numOcc].Attachments.results,
                        "AttachmentsCount": result.results[numOcc].Attachments.results.length
                    });
                    this.getView().setModel(extendedJsonModelAtt, "detail");

                    this.extendedJsonModel = new sap.ui.model.json.JSONModel(result.results[numOcc]);
                    this.getView().setModel(this.extendedJsonModel, "extendedJsonModel");

                    this.flowGenerator(result.results[numOcc].Approvers.results);

                    // this.flowGenerator(result.results[numOcc].ApprovingSteps.results);
                }.bind(this),
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    alert("Errore di comunicazione con il database.");
                }.bind(this)
            });




        },

        flowGenerator: function (approvers) {
            var vbox = this.getView().byId("approvingStepsArea");
            vbox.destroyItems();

            while (approvers.length) {
                var approversPrN = approvers.filter(function (el) {
                    return approvers[0].PurchaseRequisition === el.PurchaseRequisition;
                });
                var approvers = approvers.filter(function (el) {
                    return approversPrN[0].PurchaseRequisition !== el.PurchaseRequisition;
                });

                var newControl = new ApproversFlow({
                    // width: "100%",
                    // height: "100%",
                    // approversData: approvers
                });
                vbox.addItem(newControl);
                newControl.setData(approversPrN);


            }


        },

        /**
         * Binds the view to the object path. Makes sure that detail view displays
         * a busy indicator while data for the corresponding element binding is loaded.
         * @function
         * @param {string} sObjectPath path to the object to be bound to the view.
         * @private
         */
        _bindView: function (sObjectPath) {
            // Set busy indicator during view binding
            var oViewModel = this.getModel("detailView");

            // If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
            oViewModel.setProperty("/busy", false);

            this.getView().bindElement({
                path: sObjectPath,
                events: {
                    change: this._onBindingChange.bind(this),
                    dataRequested: function () {
                        oViewModel.setProperty("/busy", true);
                    },
                    dataReceived: function () {
                        oViewModel.setProperty("/busy", false);
                    }
                }
            });
        },

        _onBindingChange: function () {
            var oView = this.getView(),
                oElementBinding = oView.getElementBinding();

            // No data for the binding
            if (!oElementBinding.getBoundContext()) {
                this.getRouter().getTargets().display("detailObjectNotFound");
                // if object could not be found, the selection in the master list
                // does not make sense anymore.
                this.getOwnerComponent().oListSelector.clearMasterListSelection();
                return;
            }

            var sPath = oElementBinding.getPath(),
                oResourceBundle = this.getResourceBundle();
            //oObject = oView.getModel().getObject(sPath),
            //sObjectId = oObject.PurchaseRequisition,
            //sObjectName = oObject.PurchaseRequisition,
            //oViewModel = this.getModel("detailView");

            this.getOwnerComponent().oListSelector.selectAListItem(sPath);

            //oViewModel.setProperty("/shareSendEmailSubject",
            //  oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
            //oViewModel.setProperty("/shareSendEmailMessage",
            //  oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
        },

        _onMetadataLoaded: function () {
            // Store original busy indicator delay for the detail view
            var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
                oViewModel = this.getModel("detailView"),
                oLineItemTable = this.byId("TablePosition"),
                iOriginalLineItemTableBusyDelay = oLineItemTable.getBusyIndicatorDelay();

            // Make sure busy indicator is displayed immediately when
            // detail view is displayed for the first time
            oViewModel.setProperty("/delay", 0);
            oViewModel.setProperty("/lineItemTableDelay", 0);

            oLineItemTable.attachEventOnce("updateFinished", function () {
                // Restore original busy indicator delay for line item table
                oViewModel.setProperty("/lineItemTableDelay", iOriginalLineItemTableBusyDelay);
            });

            // Binding the view will set it to not busy - so the view is always busy if it is not bound
            oViewModel.setProperty("/busy", true);
            // Restore original busy indicator delay for the detail view
            oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
        },

        /**
         * Set the full screen mode to false and navigate to master page
         */
        onCloseDetailPress: function () {
            this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
            // No item should be selected on master after detail page is closed
            this.getOwnerComponent().oListSelector.clearMasterListSelection();
            this.getRouter().navTo("master");
        },

        /**
         * Toggle between full and non full screen mode.
         */
        toggleFullScreen: function () {
            var bFullScreen = this.getModel("appView").getProperty("/actionButtonsInfo/midColumn/fullScreen");
            this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", !bFullScreen);
            if (!bFullScreen) {
                // store current layout and go full screen
                this.getModel("appView").setProperty("/previousLayout", this.getModel("appView").getProperty("/layout"));
                this.getModel("appView").setProperty("/layout", "MidColumnFullScreen");
            } else {
                // reset to previous layout
                this.getModel("appView").setProperty("/layout", this.getModel("appView").getProperty("/previousLayout"));
            }
        }
    });

});