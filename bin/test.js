#!/usr/bin/env node

var util = require('util');
var Labeler = require('../index.js');
var settings = require('../settings.js');


var labeler = new Labeler(settings);
// If you want to pay money and create real labels then instead use this:
// WARNING: uncommenting the following will cost you real money!
//var labeler = new Labeler(settings, true);


console.log("Creating fake label");

var address = {
  name: "Hu Man",
  street1: "4799 Shattuck Ave",
  street2: "Back room",
  company: "Counter Culture Labs",
  city: "Oakland",
  state: "California",
  zip: "94609",
  country: "United States",
  phone: "0123456789",
  email: "test@example.com",
  residential: false
};


// dimensions in inches
// weight in oz
// For docs see:
//   https://www.easypost.com/docs/api.html#parcel-object
// For predefined packages see:
//   https://www.easypost.com/docs/api.html#predefined-packages
// NOTE: width, length and height should NOT be specified for predifined_packages
var pkg = {
  mode: "test",
  width: 7,
  length: 4,
  height: 0.5,
  weight: 2
/*
  predefined_package: "FedExEnvelope",
  items: [
    // TODO this must be filled out for international shipments
  ]
*/
}

// where to save the label files
var outDir = '../out/';

var opts = {
  local: true // true if is this is only being shipped within the U.S.
}

labeler.buyLabel(address, pkg, opts, function(err, shipment, filepath) {
  if(err) {
    if(err.message && err.message.errors) {
      console.log(err.message.errors);
    } else {
      console.log(err);
    }
    process.exit(1);
  }

  console.log("Filepath:", filepath);
});
