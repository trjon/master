var rootElement = {};
var request = {};
var errResponse = {};
var proxy={};

request.headers=context.getVariable("reqHeaders");
if(!isNullOrEmpty(context.getVariable("reqContent"))){
	request.content=context.getVariable("reqContent");
}
request.queryParms=context.getVariable("reqQueryParams");
request.contentType=context.getVariable("reqContentType");

if(!isNullOrEmpty(context.getVariable("statusMessage"))){
	errResponse.message=context.getVariable("statusMessage");
}
if(!isNullOrEmpty(context.getVariable("statusCode"))){
	errResponse.statusCode=context.getVariable("statusCode");
}
if(!isNullOrEmpty(context.getVariable("errorResponse"))){
	errResponse.errorDetail=JSON.parse(context.getVariable("errorResponse"));
}
proxy.verb = context.getVariable("reqVerb");
proxy.url = context.getVariable("reqURL");
proxy.callerIp = context.getVariable("callerIp");
proxy.request = request;

rootElement.timeStamp = getFormattedDate();
rootElement.organization = context.getVariable("organization.name");
rootElement.apiProxy = context.getVariable("apiproxy.name");
rootElement.flowName=context.getVariable("api.proxyFlowName");
rootElement.system = context.getVariable("api.envcfg.system");
rootElement.component = context.getVariable("api.envcfg.component");
rootElement.environment =  context.getVariable("environment.name");
rootElement.serviceTransId =  context.getVariable("messageid");
rootElement.interactionId =  context.getVariable("messageid");
rootElement.logType = context.getVariable("api.envcfg.logType");
rootElement.partnerId = context.getVariable("api.envcfg.partnerId");

rootElement.proxy = proxy;
rootElement.errResponse = errResponse;

context.setVariable("logToSplunk", JSON.stringify(rootElement));
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