sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/Sorter",
    "sap/ui/model/FilterOperator",
    "sap/m/GroupHeaderListItem",
    "sap/ui/Device",
    "sap/ui/core/Fragment",
    "../model/formatter"
], function (BaseController, JSONModel, Filter, Sorter, FilterOperator, GroupHeaderListItem, Device, Fragment, formatter) {
    "use strict";


    var string_filter = "";
    var filters = [];

    return BaseController.extend("invoiceapproval_S4Hana.controller.Master", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the master list controller is instantiated. It sets up the event handling for the master/detail communication and other lifecycle tasks.
         * @public
         */
        onInit: function () {
            // Control state model
            var oList = this.byId("list"),
                oViewModel = this._createViewModel(),
                // Put down master list's original value for busy indicator delay,
                // so it can be restored later on. Busy handling on the master list is
                // taken care of by the master list itself.
                iOriginalBusyDelay = oList.getBusyIndicatorDelay();

            oList.setBusy(true);
            var that = this;

            Promise.all([this.getTaskProcessing()]).then(that.getInvoiceProperties.bind(that));

            this._oList = oList;
            // keeps the filter and search state
            this._oListFilterState = {
                aFilter: [],
                aSearch: []
            };

            this.setModel(oViewModel, "masterView");
            // Make sure, busy indication is showing immediately so there is no
            // break after the busy indication for loading the view's meta data is
            // ended (see promise 'oWhenMetadataIsLoaded' in AppController)
            oList.attachEventOnce("updateFinished", function () {
                // Restore original busy indicator delay for the list
                oViewModel.setProperty("/delay", iOriginalBusyDelay);
            });

            this.getView().addEventDelegate({
                onBeforeFirstShow: function () {
                    this.getOwnerComponent().oListSelector.setBoundMasterList(oList);
                }.bind(this)
            });

            this.getRouter().getRoute("master").attachPatternMatched(this._onMasterMatched, this);
            this.getRouter().attachBypassed(this.onBypassed, this);

            var oEventBus = this.getOwnerComponent().getEventBus();
            oEventBus.subscribe("Detail", "selectFirstItemAfter", this.selectFirstItemAfter, this);

        },

        displayFirst: function (oEvent) {
            var oList = this.getView().byId("list").getItems();
            var item = "";

            if (oList) {
                item = oList[0];

                if (item != undefined) {
                    // get the list item, either from the listItem parameter or from the event's source itself (will depend on the device-dependent mode).
                    this._showDetail(item);
                }
            }


        },

        selectFirstItemAfter: function () {

            var bReplace = !Device.system.phone;
            var that = this;

            Promise.all([this.getTaskProcessing()]).then(that.getInvoiceProperties.bind(that));
            //this.getRouter().navTo("detailObjectNotFound", {  }, bReplace);
            this.getRouter().getTargets().display("detailObjectNotFound");

        },

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */

        /**
         * After list data is available, this handler method updates the
         * master list counter
         * @param {sap.ui.base.Event} oEvent the update finished event
         * @public
         */

        refreshData: function () {

            oList.setBusy(true);
            var that = this;

            Promise.all([this.getTaskProcessing()]).then(that.getInvoiceProperties.bind(that));


        },
        getInvoiceProperties: function (oEvent) {

            var oModelRdaProcessing = this.getOwnerComponent().getModel();
            oModelRdaProcessing.read("/ExtendedPropertiesInvoiceSet", {
                filters: [filters],
                success: function _OnSuccess(oData, response) {

                    var i = 0,
                        a = 0,
                        dataArray = [],
                        data = {};


                    dataArray = [];

                    for (i = 0; i < oData.results.length; i++) {

                        for (a = 0; a < this.TaskProcessingResult.length; a++) {

                            if (oData.results[i].InstanceID == this.TaskProcessingResult[a].InstanceID) {

                                data = {}
                                data.DocTypeDesc = oData.results[i].DocTypeDesc;
                                data.InstanceID = oData.results[i].InstanceID;
                                data.VendorName = oData.results[i].VendorName;
                                data.InvoiceNumber = oData.results[i].InvoiceNumber;
                                data.Date = oData.results[i].Date;
                                data.NetAmount = oData.results[i].NetAmount;
                                data.ToBeApproved = oData.results[i].ToBeApproved;
                                data.Currency = oData.results[i].Currency;
                                data.TaskDefinitionID = this.TaskProcessingResult[a].TaskDefinitionID;
                                data.CreatedBy = this.TaskProcessingResult[a].CreatedBy;
                                data.Priority = this.TaskProcessingResult[a].Priority;
                                data.Title = this.TaskProcessingResult[a].Title;
                                data.DueOn = this.TaskProcessingResult[a].DueOn;
                                data.CreatedOn = this.TaskProcessingResult[a].CreatedOn;
                                data.Status = this.TaskProcessingResult[a].Status;
                                data.Reservation = this.TaskProcessingResult[a].Reservation;
                                data.Type = this.TaskProcessingResult[a].Type;

                                dataArray.push(data);

                            }

                        }

                    }

                    //sap.ui.getCore().this.getView().setModel(oData.results, "modelMaster");
                    var json = { Task: dataArray };
                    var jsonModel = new sap.ui.model.json.JSONModel(json);

                    sap.ui.core.BusyIndicator.hide();
                    this.getOwnerComponent().setModel(jsonModel, "modelMaster");
                    //alert('ok');

                    var generalModel = new JSONModel({
                        isFilterBarVisible: false,
                        filterBarLabel: "",
                        delay: 0,
                        title: this.getResourceBundle().getText("masterTitleCount", [oData.results.length]),
                        noDataText: this.getResourceBundle().getText("masterListNoDataText"),
                        sortBy: "PurchaseRequisition",
                        groupBy: "None"
                    });
                    this.getView().setModel(generalModel, "masterView");
                    if (this.getView().byId("list") != undefined) {
                        this.getView().byId("list").setBusy(false);
                        this.displayFirst();
                    }
                    this.getView().byId("list").setBusy(false);

                }.bind(this), error: function _OnError(oError) {

                    var generalModel = new JSONModel({
                        isFilterBarVisible: false,
                        filterBarLabel: "",
                        delay: 0,
                        title: this.getResourceBundle().getText("masterTitleCount", [0]),
                        noDataText: this.getResourceBundle().getText("masterListNoDataText"),
                        sortBy: "PurchaseRequisition",
                        groupBy: "None"
                    });
                    sap.ui.core.BusyIndicator.hide();
                    this.getView().setModel(generalModel, "masterView");
                    this.getView().byId("list").setBusy(false);



                }.bind(this)
            });


        },

        getTaskProcessing: function (oEvent) {

            var TaskInstanceId = {};
            var i = 0;
            var c = 0;

            //var oModel = this.getView().getModel();

            var oModelTaskProcessing = this.getOwnerComponent().getModel("TASKPROCESSING");
            oModelTaskProcessing.refresh();

            filters = [];
            sap.ui.core.BusyIndicator.show();


            return new Promise(
                function (resolve, reject) {

                    oModelTaskProcessing.read("/TaskCollection?$skip=0&$top=9999&$orderby=CreatedOn%20asc&$filter=TaskDefinitionID eq 'TS90000087_WS00275253_0000000071' and (Status eq 'READY' or Status eq 'RESERVED' or Status eq 'IN_PROGRESS' or Status eq 'EXECUTED')", {
                        success: function _OnSuccess(oData, response) {

                            var results = oData.results;
                            this.TaskProcessingResult = [];
                            for (i = 0; i < results.length; i++) {

                                if ((results[i].TaskDefinitionID == "TS90000090_WS00275264_0000000182" ||
                                    results[i].TaskDefinitionID == "TS90000087_WS00275253_0000000071" ||
                                    results[i].TaskDefinitionID == "TS00008267_WS00275253_0000000083" ||
                                    results[i].TaskDefinitionID == "TS00275278" || 
                                    //results[i].TaskDefinitionID == "TS00275265"  
                                    //results[i].TaskDefinitionID == "TS00008267_WS90000007_0000000361" ||

                                    results[i].TaskDefinitionID == "TS00008267_WS00275264_0000000213"

                                ) && (results[i].Status == "READY" || results[i].Status == "RESERVED" || results[i].Status == "IN_PROGRESS" || results[i].Status == "EXECUTED")) {

                                    var InstanceFilter = new sap.ui.model.Filter("InstanceID", sap.ui.model.FilterOperator.EQ, results[i].InstanceID);

                                    filters.push(InstanceFilter);
                                    this.TaskProcessingResult.push(results[i]);

                                }

                            }




                            resolve(oData);
                            sap.ui.core.BusyIndicator.hide();



                        }.bind(this),
                        error: function _OnError(oError) {

                            sap.ui.core.BusyIndicator.hide();
                            reject(oError);

                        }.bind(this)
                    });


                }.bind(this));

        },

        onUpdateFinished: function (oEvent) {
            // update the master list object counter after new data is loaded
            this._updateListItemCount(oEvent.getParameter("total"));
        },

        /**
         * Event handler for the master search field. Applies current
         * filter value and triggers a new search. If the search field's
         * 'refresh' button has been pressed, no new search is triggered
         * and the list binding is refresh instead.
         * @param {sap.ui.base.Event} oEvent the search event
         * @public
         */
        onSearch: function (oEvent) {
            if (oEvent.getParameters().refreshButtonPressed) {
                // Search field's 'refresh' button has been pressed.
                // This is visible if you select any master list item.
                // In this case no new search is triggered, we only
                // refresh the list binding.
                this.refreshData();
                return;
            }

            var sQuery = oEvent.getParameter("query");

            if (sQuery) {
                this._oListFilterState.aSearch = new Filter({
                    filters: [new Filter("PurchaseRequisition", FilterOperator.Contains, sQuery),
                    new Filter("TipoDocumentoDesc", FilterOperator.Contains, sQuery),
                    new Filter("RequesterDesc", FilterOperator.Contains, sQuery),
                    new Filter("TotalValue", FilterOperator.Contains, sQuery),
                    new Filter("Currency", FilterOperator.Contains, sQuery)],
                    and: false
                });




            } else {
                this._oListFilterState.aSearch = [];
            }
            //this._applyFilterSearch();


            var aFilters = this._oListFilterState.aSearch,
                oViewModel = this.getModel("masterView");
            this._oList.getBinding("items").filter(aFilters, "Application");
            // changes the noDataText of the list in case there are no filter results
            if (aFilters.length !== 0) {
                oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataWithFilterOrSearchText"));
            } else if (this._oListFilterState.aSearch.length > 0) {
                // only reset the no data text to default when no new search was triggered
                oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataText"));
            }

        },

        /**
         * Event handler for refresh event. Keeps filter, sort
         * and group settings and refreshes the list binding.
         * @public
         */
        onRefresh: function () {
            this._oList.getBinding("items").refresh();
        },



        /**
         * Event handler for the filter, sort and group buttons to open the ViewSettingsDialog.
         * @param {sap.ui.base.Event} oEvent the button press event
         * @public
         */
        onOpenViewSettings: function (oEvent) {
            var sDialogTab = "filter";
            if (oEvent.getSource() instanceof sap.m.Button) {
                var sButtonId = oEvent.getSource().getId();
                if (sButtonId.match("sort")) {
                    sDialogTab = "sort";
                } else if (sButtonId.match("group")) {
                    sDialogTab = "group";
                }
            }
            // load asynchronous XML fragment
            if (!this.byId("viewSettingsDialog")) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "invoiceapproval_S4Hana.view.ViewSettingsDialog",
                    controller: this
                }).then(function (oDialog) {
                    // connect dialog to the root view of this component (models, lifecycle)
                    this.getView().addDependent(oDialog);
                    oDialog.addStyleClass(this.getOwnerComponent().getContentDensityClass());
                    oDialog.open(sDialogTab);
                }.bind(this));
            } else {
                this.byId("viewSettingsDialog").open(sDialogTab);
            }
        },

        onOpenViewFilter: function (oEvent) {
            var sDialogTab = "filter";

            // load asynchronous XML fragment
            if (!this.byId("viewFilterDialog")) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "invoiceapproval_S4Hana.view.FilterDialog",
                    controller: this
                }).then(function (oDialog) {
                    // connect dialog to the root view of this component (models, lifecycle)
                    this.getView().addDependent(oDialog);
                    oDialog.addStyleClass(this.getOwnerComponent().getContentDensityClass());
                    oDialog.open(sDialogTab);
                }.bind(this));
            } else {
                this.byId("viewFilterDialog").open(sDialogTab);
            }
        },


        onOpenGroupFilter: function (oEvent) {
            var sDialogTab = "Group";

            // load asynchronous XML fragment
            if (!this.byId("viewGroupDialog")) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "invoiceapproval_S4Hana.view.GroupFilter",
                    controller: this
                }).then(function (oDialog) {
                    // connect dialog to the root view of this component (models, lifecycle)
                    this.getView().addDependent(oDialog);
                    oDialog.addStyleClass(this.getOwnerComponent().getContentDensityClass());
                    oDialog.open(sDialogTab);
                }.bind(this));
            } else {
                this.byId("viewGroupDialog").open(sDialogTab);
            }
        },

        /**
         * Event handler called when ViewSettingsDialog has been confirmed, i.e.
         * has been closed with 'OK'. In the case, the currently chosen filters, sorters or groupers
         * are applied to the master list, which can also mean that they
         * are removed from the master list, in case they are
         * removed in the ViewSettingsDialog.
         * @param {sap.ui.base.Event} oEvent the confirm event
         * @public
         */
        onConfirmViewSettingsDialog: function (oEvent) {

            this._applySortGroup(oEvent);
        },

        /**
         * Apply the chosen sorter and grouper to the master list
         * @param {sap.ui.base.Event} oEvent the confirm event
         * @private
         */
        _applySortGroup: function (oEvent) {
            var mParams = oEvent.getParameters(),
                sPath,
                bDescending,
                aSorters = [];
            sPath = mParams.sortItem.getKey();
            bDescending = mParams.sortDescending;
            aSorters.push(new Sorter(sPath, bDescending));
            this._oList.getBinding("items").sort(aSorters);
        },

        /**
         * Event handler for the list selection event
         * @param {sap.ui.base.Event} oEvent the list selectionChange event
         * @public
         */
        onSelectionChange: function (oEvent) {
            var oList = oEvent.getSource(),
                bSelected = oEvent.getParameter("selected");

            // skip navigation when deselecting an item in multi selection mode
            if (!(oList.getMode() === "MultiSelect" && !bSelected)) {
                // get the list item, either from the listItem parameter or from the event's source itself (will depend on the device-dependent mode).
                this._showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
            }
        },

        /**
         * Event handler for the bypassed event, which is fired when no routing pattern matched.
         * If there was an object selected in the master list, that selection is removed.
         * @public
         */
        onBypassed: function () {
            this._oList.removeSelections(true);
        },

        /**
         * Used to create GroupHeaders with non-capitalized caption.
         * These headers are inserted into the master list to
         * group the master list's items.
         * @param {Object} oGroup group whose text is to be displayed
         * @public
         * @returns {sap.m.GroupHeaderListItem} group header with non-capitalized caption.
         */
        createGroupHeader: function (oGroup) {
            return new GroupHeaderListItem({
                title: oGroup.text,
                upperCase: false
            });
        },

        /**
         * Event handler for navigating back.
         * We navigate back in the browser historz
         * @public
         */
        onNavBack: function () {
            // eslint-disable-next-line sap-no-history-manipulation
            history.go(-1);
        },

        /* =========================================================== */
        /* begin: internal methods                                     */
        /* =========================================================== */


        _createViewModel: function () {
            return new JSONModel({
                isFilterBarVisible: false,
                filterBarLabel: "",
                delay: 0,
                title: this.getResourceBundle().getText("masterTitleCount", [0]),
                noDataText: this.getResourceBundle().getText("masterListNoDataText"),
                sortBy: "PurchaseRequisition",
                groupBy: "None"
            });
        },

        _onMasterMatched: function () {
            //Set the layout property of the FCL control to 'OneColumn'
            this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
        },

        /**
         * Shows the selected item on the detail page
         * On phones a additional history entry is created
         * @param {sap.m.ObjectListItem} oItem selected Item
         * @private
         */
        _showDetail: function (oItem) {
            var bReplace = !Device.system.phone;
            // set the layout property of FCL control to show two columns
            this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
            //sap.ui.core.BusyIndicator.show();
            this.getRouter().navTo("object", {
                //objectId : oItem.getBindingContext().getProperty("PurchaseRequisition")
                objectId: oItem.getContent()[0].getItems()[0].getItems()[3].getText(),
                instanceId: oItem.getContent()[0].getItems()[0].getItems()[2].getText()
            }, bReplace);
        },

        /**
         * Sets the item count on the master list header
         * @param {integer} iTotalItems the total number of items in the list
         * @private
         */
        _updateListItemCount: function (iTotalItems) {
            var sTitle;
            // only update the counter if the length is final
            if (this._oList.getBinding("items").isLengthFinal()) {
                sTitle = this.getResourceBundle().getText("masterTitleCount", [iTotalItems]);
                this.getModel("masterView").setProperty("/title", sTitle);
            }
        },

        /**
         * Internal helper method to apply both filter and search state together on the list binding
         * @private
         */
        _applyFilterSearch: function () {
            var aFilters = this._oListFilterState.aSearch.concat(this._oListFilterState.aFilter),
                oViewModel = this.getModel("masterView");
            this._oList.getBinding("items").filter(aFilters, "Application");
            // changes the noDataText of the list in case there are no filter results
            if (aFilters.length !== 0) {
                oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataWithFilterOrSearchText"));
            } else if (this._oListFilterState.aSearch.length > 0) {
                // only reset the no data text to default when no new search was triggered
                oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataText"));
            }
        },

        /**
         * Internal helper method that sets the filter bar visibility property and the label's caption to be shown
         * @param {string} sFilterBarText the selected filter value
         * @private
         */
        _updateFilterBar: function (sFilterBarText) {
            var oViewModel = this.getModel("masterView");
            oViewModel.setProperty("/isFilterBarVisible", (this._oListFilterState.aFilter.length > 0));
            oViewModel.setProperty("/filterBarLabel", this.getResourceBundle().getText("masterFilterBarText", [sFilterBarText]));
        }

    });

});