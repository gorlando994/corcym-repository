sap.ui.define([
	"sap/ui/core/XMLComposite",
	"sap/ui/model/json/JSONModel"
], function (XMLComposite, JSONModel) {
	return XMLComposite.extend("invoiceapproval_S4Hana.view.ApproversFlow", {
		metadata: {
			properties: {
				// width: "string",
				// height: "string",
				// approversData: {
				// 	type: "array",
				// 	invalidate: true
				// }
			}
		},

		setData: function(approvers){
			var nodes = [];
			var lines = [];
			var approversData = {
				prNumber: approvers[0].PurchaseRequisition,
				nodes: nodes,
				lines: lines
			};
			
			approvers.sort((el,el2)=>(el.Step-el2.Step));
			
			for(var i = 0; i < approvers.length; i++){
				var nodeToModify = nodes.find(function(el){
					return el.key === approvers[i].Step;
				});
				
				if(!nodeToModify){
					nodeToModify = {
						key: approvers[i].Step,
						title: approvers[i].StepName,
						icon: approvers[i].Status ? "sap-icon://accept" : "sap-icon://pending",
						status: approvers[i].Status ? "Success" : "Warning",
						attributes: []
					}
					nodes.push(nodeToModify);
				}
				
				if(approvers[i].Status){
					nodeToModify.icon = "sap-icon://accept";
					nodeToModify.status = "Success";
				}
				
				nodeToModify.attributes.push({
					label: "",
					value: approvers[i].ApprovingDate + ( approvers[i].ApprovingDate ? " - " : "") + approvers[i].Name, //+ " (" + approvers[i].Approver + ")",
					icon: approvers[i].Status ? "sap-icon://accept" : ""
				});
			}
			
			for(i = 1; i < nodes.length; i++){
				lines.push({
					from: nodes[i-1].key,
					to: nodes[i].key,
				});
			}
			
			
			var testModel = new sap.ui.model.json.JSONModel(approversData);
			this.setModel(testModel, "flowModel");
		}

	});
}, true);