#!/usr/bin/env node

var util = require('util');
var Labeler = require('../index.js');
var settings = require('../settings.js');


console.log("Creating fake label");

var address = {
  name: "Marc Juul",
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
//  predefined_package: "FedExEnvelope"
}

var labeler = new Labeler(settings);

labeler.buyLabel(address, pkg, function(err, shipment, filepath) {
  if(err) {
    if(err.message && err.message.errors) {
      console.log(err.message.errors);
    } else {
      console.log(err);
    }
    process.exit(1);
  }

  console.log("Shipment:", shipment);

  console.log("Filepath:", filepath);
});
