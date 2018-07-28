
var util = require('util');
var Easypost = require('@easypost/api');
var buyShippingLabel = require('./buy_shipping_label.js');

function isHouseNumber(str) {
    if(str.match(/^\d+[\s\.,]*\w?$/)) {
        return true;
    }
    return false;
}

function labeler(settings, reallyPayMoney)  {



  if(reallyPayMoney) {
    if(!settings.easypost.apiKey) {
      throw new Error("You must set settings.easypost.apiKey");
    }
    this.easypost = new Easypost(settings.easypost.apiKey);

  } else {
    if(!settings.easypost.apiKeyTesting) {
      throw new Error("You must set settings.easypost.apiKeyTesting");
    }  
    this.easypost = new Easypost(settings.easypost.apiKeyTesting);
  }

  // verify address using easypost API
  this.verifyAddress = function(address, callback) {
    if(!this.easypost) return callback(new Error("easypost API not initialized"));

    var address = new this.easypost.Address(address);

    address.save().then(function(addr) {
      callback(null, addr);
    }).catch(callback);
  }

  this.buyLabel = function(address, pkg, cb) {
    buyShippingLabel(this.easypost, address, pkg, settings.fromAddress, settings.outDir, {local: true}, cb);
  };

}

module.exports = labeler;
