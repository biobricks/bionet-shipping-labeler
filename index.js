
var util = require('util');
var Easypost = require('@easypost/api');
var buyShippingLabel = require('./buy_shipping_label.js');

function labeler(settings, reallyPayMoney)  {
  this.settings = settings

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

  this.buyLabel = function(address, pkg, opts, cb) {
    if(typeof opts === 'function') {
      cb = opts;
      opts = {};
    }

    opts.outDir  = opts.outDir || this.settings.outDir;
    opts.customsInfo = opts.customsInfo || this.settings.customsInfo;

    buyShippingLabel(this.easypost, address, pkg, opts.fromAddress || this.settings.fromAddress, opts.outDir, opts, cb);
  };

}

module.exports = labeler;
