sap.ui.define(["sap/ui/core/XMLComposite","sap/ui/model/json/JSONModel"],function(e,t){return e.extend("invoiceapproval_S4Hana.view.ApproversFlow",{metadata:{properties:{}},setData:function(e){var t=[];var a=[];var s={prNumber:e[0].PurchaseRequisition,nodes:t,lines:a};e.sort((e,t)=>e.Step-t.Step);for(var o=0;o<e.length;o++){var i=t.find(function(t){return t.key===e[o].Step});if(!i){i={key:e[o].Step,title:e[o].StepName,icon:e[o].Status?"sap-icon://accept":"sap-icon://pending",status:e[o].Status?"Success":"Warning",attributes:[]};t.push(i)}if(e[o].Status){i.icon="sap-icon://accept";i.status="Success"}i.attributes.push({label:"",value:e[o].ApprovingDate+(e[o].ApprovingDate?" - ":"")+e[o].Name,icon:e[o].Status?"sap-icon://accept":""})}for(o=1;o<t.length;o++){a.push({from:t[o-1].key,to:t[o].key})}var n=new sap.ui.model.json.JSONModel(s);this.setModel(n,"flowModel")}})},true);