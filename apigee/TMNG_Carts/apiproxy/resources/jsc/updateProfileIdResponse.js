 //var diff = require('deep-diff').diff;
//var jsonFormat = require('json-format');


var responseJson = context.getVariable('raptorGetProfileIdResponse.header.location');

var profileId=null;
var URLArr = null;

try {
   URLArr = responseJson.split("/");
   profileId = URLArr[URLArr.length-1].split("?")[0];
   URLArr = null;
   
} catch(e) {
                
}
context.setVariable('profileId',profileId);


