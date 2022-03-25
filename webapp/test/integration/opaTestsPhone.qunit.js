/* global QUnit */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function() {
	"use strict";

	sap.ui.require([
		"invoiceapproval_S4Hana/test/integration/PhoneJourneys"
	], function() {
		QUnit.start();
	});
});