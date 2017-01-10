var reqTimeStamp = getFormattedDate();
var apiProxy = context.getVariable('apiproxy.name');
var serviceTransId = context.getVariable("messageid");
var interactionId = context.getVariable("messageid");
var logType = context.getVariable('api.envcfg.logType');
var reqVerb = context.getVariable("request.verb");
var scheme =  context.getVariable("client.scheme");
var host =  context.getVariable("request.header.host");
var uri =  context.getVariable("request.uri");
var reqURL = scheme + "://" + host + uri;
var callerIp = context.getVariable("proxy.client.ip");
var reqContent = context.getVariable('request.content');
var reqContentType = context.getVariable('request.header.Content-Type');
var reqStartTime = context.getVariable("system.timestamp");
var system = context.getVariable("api.envcfg.system");
var component = context.getVariable("api.envcfg.component");
var partnerId = context.getVariable("api.envcfg.partnerId");
var flowNm= context.getVariable("api.flow.name");

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

// Extract Headers
var requestHeaderFieldsCollection = context.getVariable('request.headers.names') + '';
//Remove square brackets
requestHeaderFieldsCollection = requestHeaderFieldsCollection.substr(1, requestHeaderFieldsCollection.length - 2);
//Split string into an array
var requestHeadersArray = requestHeaderFieldsCollection.split(", ");
var reqHeaders = [];
for (var i = 0; i < requestHeadersArray.length; i++) {
    var headerObject = {};
    headerObject.name = requestHeadersArray[i];
    headerObject.value = context.getVariable('request.header.' + requestHeadersArray[i]);
    reqHeaders.push(headerObject);
}

context.setVariable("reqTimeStamp",reqTimeStamp);
context.setVariable("apiProxy",apiProxy);
context.setVariable("system",system);
context.setVariable("component",component);
context.setVariable("serviceTransId",serviceTransId);
context.setVariable("interactionId",interactionId);
context.setVariable("logType",logType);
context.setVariable("partnerId",partnerId);
context.setVariable("reqVerb",reqVerb);
context.setVariable("reqURL",reqURL);
context.setVariable("callerIp",callerIp);
context.setVariable("partnerId",partnerId);
context.setVariable("reqHeaders",reqHeaders);
context.setVariable("requestQueryParams",requestQueryParams);
context.setVariable("reqContentType",reqContentType);
context.setVariable("reqContent",reqContent);
context.setVariable("reqStartTime",reqStartTime);

var rootElement = {};
var proxy = {};
var request = {};

request.headers = reqHeaders;
request.query_parms = requestQueryParams;
request.content = reqContent;
request.content_type = reqContentType;
request.startTime = reqStartTime;
proxy.verb = reqVerb;
proxy.url = reqURL;
proxy.callerIp = callerIp;
proxy.request = request;

rootElement.timeStamp = reqTimeStamp;
rootElement.apiProxy = apiProxy;
rootElement.system = system;
rootElement.component = component;
rootElement.serviceTransId = serviceTransId;
rootElement.interactionId = interactionId;
rootElement.logType = logType;
rootElement.partnerId = partnerId;
rootElement.proxy = proxy;

context.setVariable("initializeLog", JSON.stringify(rootElement));
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