var scheme =  context.getVariable("client.scheme");
var host =  context.getVariable("request.header.host");
var uri =  context.getVariable("request.uri");
var targetEndpointUrl= scheme + "://" + host + uri;
var serviceCallOutStartTime = context.getVariable("system.timestamp");
var serviceCallOutCallerIp = context.getVariable("proxy.client.ip");
var targetReqContent = context.getVariable('request.content');
var targetReqContentType = context.getVariable('request.header.Content-Type');


// Extract Query Params
var requestresQueryParamsFieldsCollection = context.getVariable('request.queryparams.names') + '';

//Remove square brackets
requestresQueryParamsFieldsCollection = requestresQueryParamsFieldsCollection.substr(1, requestresQueryParamsFieldsCollection.length - 2);

//Split string into an array
var requestressQueryParamsArray = requestresQueryParamsFieldsCollection.split(", ");
var requestQueryParams = [];
// Loop through Array and get value of query param
for (var i = 0; i < requestressQueryParamsArray.length; i++) {
    var queryParamsObject = {};
    queryParamsObject.name = requestressQueryParamsArray[i];
    queryParamsObject.value = context.getVariable('request.queryparam.' + requestressQueryParamsArray[i]);
    requestQueryParams.push(queryParamsObject);
}
 
// Extract Service Callout Headers
var requestHeaderFieldsCollection = context.getVariable('request.headers.names') + '';
//Remove square brackets
requestHeaderFieldsCollection = requestHeaderFieldsCollection.substr(1, requestHeaderFieldsCollection.length - 2);
//Split string into an array
var requestHeadersArray = requestHeaderFieldsCollection.split(", ");
var targetReqHeaders = [];
for (var i = 0; i < requestHeadersArray.length; i++) {
    var headerObject = {};
    headerObject.name = requestHeadersArray[i];
    headerObject.value = context.getVariable('request.header.' + requestHeadersArray[i]);
    targetReqHeaders.push(headerObject);
}
 
var rootElement = {};
var target = {};
var request = {};
var response = {};
var serviceCallout={};
var startTime = context.getVariable("reqTimeStamp");
 
request.headers = targetReqHeaders;
request.query_parms = requestQueryParams;
request.content = targetReqContent;
response.content =  context.getVariable("response.content");
response.statusCode = context.getVariable("response.status.code");

target.url = targetEndpointUrl;
target.verb = context.getVariable("request.verb");
target.flowName = context.getVariable("api.targetFlowName");
target.request = request;
target.response=response;
target.startTime = context.getVariable("target.sent.start.timestamp");
target.endTime = context.getVariable("target.received.end.timestamp");
target.responseTime = target.endTime-target.startTime;

rootElement.target = target;
context.setVariable("targetLog", JSON.stringify(rootElement));