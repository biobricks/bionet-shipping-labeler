var fs = require('fs');
var path = require('path');
var util = require('util');
var clone = require('clone');
var https = require('https');
var countryData = require('country-data');

// turn a string into a valid filename
function filenameize(str) {
  return str.replace(/[^\w\d\s\.]+/g, '').replace(/\s+/g, '_').replace(/\.+/g, '.').toLowerCase();
}

function countryNameToCode(name) {

  if(name.length == 2) { // probably already a country code
    return name;
  }

  name = name.replace(/\s+/g, ' ').toLowerCase();
  var key, country;
  for(key in countryData.countries.all) {
    country = countryData.countries.all[key];
    if(country.name.toLowerCase() == name) {
      return country.alpha2;
    }
  }
  return null;
}

function reallyBuyShippingLabel(shipment, output_dir, callback) {

  var rate = shipment.lowestRate(['USPS'], ['First'])

  // Sometimes errors are returned in this odd way
  if(shipment.messages && shipment.messages.length) {
    var i;
    for(i=0; i < shipment.messages.length; i++) {
      if(shipment.messages[i].type.match('error')) {
        return callback(new Error(shipment.messages[i].message))
      }
    }
  }

  shipment.buy(rate).then(function(shipment) {

    var filename = filenameize(shipment.to_address.name)+'-'+shipment.tracking_code+'.png';
    var filepath = path.join(output_dir, filename);
    var f = fs.createWriteStream(filepath);

    https.get(shipment.postage_label.label_url, function(resp) {
      if(resp.statusCode != 200) {
        return callback(new Error("Error: HTTP response code " + resp.statusCode));
      }
      resp.pipe(f);

      f.on('close', function() {
        callback(null, shipment, filename);
      });
    })
  }).catch(callback)
}


function buyShippingLabel(easypost, address, pack, fromAddress, output_dir, opts, callback) {
  if(typeof opts === 'function') {
    callback = opts;
    opts = {};
  }

  if(!pack) {
    return callback(new Error("No package defined"));
  }

  if(!pack.length || !pack.width || !pack.height || !pack.weight) {
    return callback(new Error("Package must have the fields: length, width, height and weight"));
  }

  var country_code = countryNameToCode(address.country);
  if(!country_code) {
    return callback(new Error("Could not find country code for country: " + address.country));
  }


  if(pack.items) {
    var i, item;
    for(i=0; i < pack.items.length; i++) {
      item = pack.items[i];

      if(!item.description || !item.hs_tariff_number || !item.origin_country || !item.value || !item.weight) {
        if(!opts.local) {
          return callback(new Error("Internationally shipped items must have the following fields: description, hs_tariff_number, origin_country, value and weight"));
        }
      }

      if(!item.quantity) {
        item.quantity = 1;
      }
      item.value = item.quantity * item.value;
      item.weight = item.quantity * item.weight;
    }
  }

  var parcel = {
    length: pack.length,
    width: pack.width,
    height: pack.height,
    weight: pack.weight
  };

  var customsInfo;

  if(opts.customsInfo) {
    customsInfo = clone(opts.customsInfo);
    customsInfo.customs_items = pack.items;
  }

  var shipOpts = {}

  new easypost.Address(address).save().then(function(toAddress) {
    shipOpts.to_address = toAddress;
    new easypost.Address(fromAddress).save().then(function(fromAddress) {
      shipOpts.from_address = fromAddress;
      new easypost.Parcel(parcel).save().then(function(parcel) {
        shipOpts.parcel = parcel;
        
        var shipment;

        if(!customsInfo) {
          shipment = new easypost.Shipment(shipOpts)
          shipment.save().then(function(shp) {
            reallyBuyShippingLabel(shp, output_dir, callback);
          }).catch(callback);
          return;
        }

        new easypost.CustomsInfo(customsInfo).save().then(function(customsInfo) {
          shipOpts.customs_info = customsInfo;
          shipment = new easypost.Shipment(shipOpts)
          shipment.save().then(function(shp) {
            reallyBuyShippingLabel(shp, output_dir, callback);
          }).catch(callback);
        });

      }).catch(callback);
    }).catch(callback);
  }).catch(callback);

}


module.exports = buyShippingLabel;
