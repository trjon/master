var rootElement = {};
var serviceCallout={};

var contentResponse=context.getVariable("response.content");
var proxyResponse={};
if(contentResponse.length!=0){
	proxyResponse=JSON.parse(contentResponse);
}
var targetContent=JSON.parse(context.getVariable("targetLog"));
var targetLog={};
if(!isNullOrEmpty(targetContent)){
	targetLog=targetContent.target;
}

rootElement.timeStamp = context.getVariable("reqTimeStamp");
rootElement.organization = context.getVariable("organization");
rootElement.apiProxy = context.getVariable("apiProxy");
rootElement.flowName = context.getVariable("api.proxyFlowName");
rootElement.proxyURL=context.getVariable("reqURL");
rootElement.system = context.getVariable("system");
rootElement.component = context.getVariable("component");
rootElement.environment = context.getVariable("environment");
rootElement.serviceTransId = context.getVariable("serviceTransId");
rootElement.interactionId = context.getVariable("interactionId");
rootElement.logType = context.getVariable("logType");
rootElement.partnerId = context.getVariable("partnerId");
rootElement.callerIp = context.getVariable("callerIp");

// Extract response Headers
var responsetHeaderFieldsCollection = context.getVariable('response.headers.names') + '';
//Remove square brackets
responsetHeaderFieldsCollection = responsetHeaderFieldsCollection.substr(1, responsetHeaderFieldsCollection.length - 2);
//Split string into an array
var responseHeadersArray = responsetHeaderFieldsCollection.split(", ");
var resHeaders = [];
for (var i = 0; i < responseHeadersArray.length; i++) {
    var headerObject = {};
    headerObject.name = responseHeadersArray[i];
    headerObject.value = context.getVariable('response.header.' + responseHeadersArray[i]);
    resHeaders.push(headerObject);
}
var proxy={};
var request={};
var response={};

request.headers=context.getVariable("reqHeaders");
request.query_parms=context.getVariable("requestQueryParams");
request["content-type"]=context.getVariable("reqContentType");
request.content=context.getVariable("reqContent");
response.headers=resHeaders;
if(!isNullOrEmpty(context.getVariable("response.status.code"))){
	response.status=context.getVariable("response.status.code");
}
if(!isNullOrEmpty(proxyResponse)){
	response.content=proxyResponse;
}
proxy.url=context.getVariable("reqURL");
proxy.verb=context.getVariable("reqVerb");
proxy.request=request;
proxy.response=response;

if(!isNullOrEmpty(context.getVariable("defaultCartCallLog"))){
	serviceCallout.defaultCartCallLog=JSON.parse(context.getVariable("defaultCartCallLog"));
}
if(!isNullOrEmpty(context.getVariable("addLineCallLog"))){
	serviceCallout.addLineCallLog=JSON.parse(context.getVariable("addLineCallLog"));
}
if(!isNullOrEmpty(context.getVariable("createPlanCallLog"))){
	serviceCallout.createPlanCallLog=JSON.parse(context.getVariable("createPlanCallLog"));
}
if(!isNullOrEmpty(context.getVariable("updateCartCallLog"))){
	serviceCallout.updateCartCallLog=JSON.parse(context.getVariable("updateCartCallLog"));
}
if(!isNullOrEmpty(context.getVariable("noneCreditCallLog"))){
	serviceCallout.noneCreditCallLog=JSON.parse(context.getVariable("noneCreditCallLog"));
}
if(!isNullOrEmpty(context.getVariable("buildingCreditCallLog"))){
	serviceCallout.buildingCreditCallLog=JSON.parse(context.getVariable("buildingCreditCallLog"));
}
if(!isNullOrEmpty(context.getVariable("goodCreditCallLog"))){
	serviceCallout.goodCreditCallLog=JSON.parse(context.getVariable("goodCreditCallLog"));
}
if(!isNullOrEmpty(context.getVariable("getProfileAddressesServiceCallout"))){
	serviceCallout.getProfileAddressesServiceCallout=JSON.parse(context.getVariable("getProfileAddressesServiceCallout"));
}
if(!isNullOrEmpty(context.getVariable("getProfileIdServiceCallout"))){
	serviceCallout.getProfileIdServiceCallout=JSON.parse(context.getVariable("getProfileIdServiceCallout"));
}
if(!isNullOrEmpty(context.getVariable("addItemServiceCallout"))){
	serviceCallout.addItemServiceCallout=JSON.parse(context.getVariable("addItemServiceCallout"));
}
if(!isNullOrEmpty(context.getVariable("lookUpItemServiceCallout"))){
	serviceCallout.lookUpItemServiceCallout=JSON.parse(context.getVariable("lookUpItemServiceCallout"));
}
if(!isNullOrEmpty(context.getVariable("addAccessoryServiceCallout"))){
	serviceCallout.addAccessoryServiceCallout=JSON.parse(context.getVariable("addAccessoryServiceCallout"));
}
if(!isNullOrEmpty(context.getVariable("updateAccessoryServiceCallout"))){
	serviceCallout.updateAccessoryServiceCallout=JSON.parse(context.getVariable("updateAccessoryServiceCallout"));
}
if(!isNullOrEmpty(context.getVariable("getAuditRecordsServiceCallout"))){
	serviceCallout.getAuditRecordsServiceCallout=JSON.parse(context.getVariable("getAuditRecordsServiceCallout"));
}
if(!isNullOrEmpty(context.getVariable("createAuditServiceCallout"))){
	serviceCallout.createAuditServiceCallout=JSON.parse(context.getVariable("createAuditServiceCallout"));
}

rootElement.proxy=proxy;
if(!isNullOrEmpty(targetLog)){
	rootElement.target=targetLog;
}

if(!isNullOrEmpty(serviceCallout)){
	rootElement.serviceCallout=serviceCallout;
}
context.setVariable("logToSplunk", JSON.stringify(rootElement));

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