   
// Extract Service Callout Query Params
var requestresQueryParamsFieldsCollection = context.getVariable('request.queryparams.names') + '';
//Remove square brackets
requestresQueryParamsFieldsCollection = requestresQueryParamsFieldsCollection.substr(1, requestresQueryParamsFieldsCollection.length - 2);
//Split string into an array
var requestressQueryParamsArray = requestresQueryParamsFieldsCollection.split(", ");
var serviceCallOutReqQueryParams = [];
// Loop through Array and get value of query param
for (var i = 0; i < requestressQueryParamsArray.length; i++) {
    var queryParamsObject = {};
    queryParamsObject.name = requestressQueryParamsArray[i];
    queryParamsObject.value = context.getVariable('request.queryparam.' + requestressQueryParamsArray[i]);
    serviceCallOutReqQueryParams.push(queryParamsObject);
}

// Extract Service Callout Headers
var requestHeaderFieldsCollection = context.getVariable('request.headers.names') + '';
//Remove square brackets
requestHeaderFieldsCollection = requestHeaderFieldsCollection.substr(1, requestHeaderFieldsCollection.length - 2);
//Split string into an array
var requestHeadersArray = requestHeaderFieldsCollection.split(", ");
var serviceCallOutReqHeaders = [];
for (var i = 0; i < requestHeadersArray.length; i++) {
    var headerObject = {};
    headerObject.name = requestHeadersArray[i];
    headerObject.value = context.getVariable('request.header.' + requestHeadersArray[i]);
    serviceCallOutReqHeaders.push(headerObject);
}

var rootElement = {};
var request = {};
var response = {};
var statusCode= context.getVariable("raptorGetProfileIdResponse.status.code");
var logType=context.getVariable("logType");

request.headers = serviceCallOutReqHeaders;
request.query_parms = serviceCallOutReqQueryParams;
request.content = context.getVariable('request.content');

response.statusCode=statusCode;
if(logType=="DEBUG"){
	response.content = context.getVariable("raptorGetProfileIdResponse.content");
}

rootElement.timeStamp=getFormattedDate();
rootElement.timeTaken = context.getVariable("apigee.metrics.policy.Callout.GetProfileId.timeTaken");
rootElement.url=context.getVariable("servicecallout.requesturi");
rootElement.verb = context.getVariable("serviceCalloutGetProfileId.verb");
rootElement.request = request;
rootElement.response=response;

context.setVariable("getProfileIdServiceCallout", JSON.stringify(rootElement));
function getFormattedDate() {
    var date = new Date();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var min = date.getMinutes();
    var sec = date.getSeconds();
    var milli = date.getMilliseconds();

    month = (month < 10 ? "0" : "") + month;
    day = (day < 10 ? "0" : "") + day;
    hour = (hour < 10 ? "0" : "") + hour;
    min = (min < 10 ? "0" : "") + min;
    sec = (sec < 10 ? "0" : "") + sec;
    milli = (milli < 100 ) ? ((milli < 10) ? "00" : "0") : "" + milli;
    var formattedTime = date.getFullYear() + "-" + month + "-" + day + "T" +  hour + ":" + min + ":" + sec + "." + milli + "Z";
    return formattedTime;
}
function isNullOrEmpty(value) {
	//check for null
	if (value == null || value == undefined) {
		return true;
	} else if (!isNaN(value)) {
	    return false;
	} else if (typeof value == "string" && value.length == 0) { // Check for String 
		return true;
    } else if (typeof value == "object" && Object.keys(value).length == 0) { // Check for Objects and Arrays
		return true;
	}
    return false;
 }