var systemMessage = context.getVariable("error.content");
var errState = context.getVariable("error.state");
var faultName = context.getVariable("fault.name");
var statusMessage = "Internal Server Error - UnAnticipated";
var statusDetail = "Service Error - The server encountered an error while attempting to fulfill the request.";
var statusCode = "500";
var errorCode = "GEN-9999";

// Servicecallout error response from target
if ((errState=="TARGET_RESP_FLOW") || (errState=="TARGET_REQ_FLOW")){
  // target side error handling
  if (faultName=="ErrorResponseCode"){
    statusMessage = context.getVariable("response.status.message");
    statusCode = context.getVariable("response.status.code");
    statusDetail = context.getVariable("response.content");
    errorCode = "SVC-0201"; 
  } else if (faultName=="ExecutionFailed"){
    var servicecalloutDetails =[{
      "policyName" : "cf_cortexTargetCalloutWithZoom",
      "requestMsg" : "cortexRequest",
      "responseMsg" : "ep.response",
      "errorCode" : "SVC-0104"
    }];

    var failedPolicy = servicecalloutDetails.find(function(s){
      var a = "servicecallout." + s.policyName + ".failed"
      return  (context.getVariable(a) === true);
    });

    if (failedPolicy !== undefined){
      statusMessage = context.getVariable(failedPolicy.responseMsg + ".status.message");
      statusCode = context.getVariable(failedPolicy.responseMsg + ".status.code");
      statusDetail = context.getVariable(failedPolicy.responseMsg + ".content");
      errorCode = failedPolicy.errorCode;
    } else {
      statusMessage = "Service Callout Failed";
      statusDetail = "Service Error - Remote System could not be reached";
      statusCode = "502";
      errorCode = "SVC-0199";
    }
  }

} else if (faultName=="ExecutionFailed")
{
  // proxy side error handling
  var uri = context.getVariable("servicecallout.requesturi","unknown");

  var servicecalloutDetails =[{
    "policyName" : "addAccessory_CalloutAddAccessory",
    "requestMsg" : "cortexRequest",
    "responseMsg" : "ep.response",
    "errorCode" : "SVC-0100"
  },{
    "policyName" : "cf_cortexTargetCallout",
    "requestMsg" : "cortexRequest",
    "responseMsg" : "ep.response",
    "errorCode" : "SVC-0101"
  },{
    "policyName" : "cf_cortexTargetCalloutAddItem",
    "requestMsg" : "cortexRequest",
    "responseMsg" : "ep.response",
    "errorCode" : "SVC-0102"
  },{
    "policyName" : "cf_cortexTargetCalloutLookupItemForSKU",
    "requestMsg" : "cortexRequest",
    "responseMsg" : "ep.response",
    "errorCode" : "SVC-0103"
  },{
    "policyName" : "cf_cortexTargetCalloutWithZoom",
    "requestMsg" : "cortexRequest",
    "responseMsg" : "ep.response",
    "errorCode" : "SVC-0104"
  },{
    "policyName" : "getCartPricePreview_cartPriceForGoodCredit",
    "requestMsg" : "cortexRequest",
    "responseMsg" : "ep.goodCreditResponse",
    "errorCode" : "SVC-0105"
  },{
    "policyName" : "getCartPricePreview_cartPriceForNoneCredit",
    "requestMsg" : "cortexRequest",
    "responseMsg" : "ep.noneCreditResponse",
    "errorCode" : "SVC-0106"
  },{
    "policyName" : "updateAccessory_CalloutAddAccessory",
    "requestMsg" : "cortexRequest",
    "responseMsg" : "ep.response",
    "errorCode" : "SVC-0107"
  },{
    "policyName" : "createAudit_serviceCallout",
    "requestMsg" : "cortexRequest",
    "responseMsg" : "ep.response",
    "errorCode" : "SVC-0108"
  }];

  var failedPolicy = servicecalloutDetails.find(function(s){
    var a = "servicecallout." + s.policyName + ".failed"
    return  (context.getVariable(a) === true);
  });

  if (failedPolicy !== undefined){
    statusMessage = context.getVariable(failedPolicy.responseMsg + ".status.message");
    statusCode = context.getVariable(failedPolicy.responseMsg + ".status.code");
    statusDetail = context.getVariable(failedPolicy.responseMsg + ".content");
    errorCode = failedPolicy.errorCode;
  } else {
    statusMessage = "Service Callout Failed";
    statusDetail = "Service Error - Remote System could not be reached";
    statusCode = "502";
    errorCode = "SVC-0199";
  }
} else if (faultName == "FailedToResolveAPIKey"){
  statusMessage = "Bad or Missing API Key";
  statusDetail = "Apikey verification failed - Invalid ApiKey";
  statusCode = "401";
  errorCode = "POL-0001";
} else if (faultName == "InvalidAPICallAsNoApiProductMatchFound"){
  statusMessage = "Unauthorized";
  statusDetail = "Privacy verification failed - Invalid App Details";
  statusCode = "401";
  errorCode = "POL-0002";
} else if (faultName == "invalid_access_token"){
  statusMessage = "Unauthorized";
  statusDetail = "Privacy verification failed - Invalid Access Token";
  statusCode = "403";
  errorCode = "POL-0003";
} else if (faultName == "access_token_expired"){
  statusMessage = "Unauthorized";
  statusDetail = "Privacy verification failed - Access Token Expired";
  statusCode = "403";
  errorCode = "POL-0004";
} else if (faultName == "SpikeArrestViolation"){
  statusMessage = "Server Busy";
  statusDetail = "Service Error - System Has Exceeded Maximum Number of Permitted Requests";
  statusCode = "503";
  errorCode = "SVC-0002";
} else if (faultName == "QuotaViolation"){
  statusMessage = "Server Busy";
  statusDetail = "Service Error - The client app has exceeded maximum number of permitted requests";
  statusCode = "503";
  errorCode = "SVC-0003";
} else if (faultName == "JsonPathParsingFailure"){
    statusMessage = "Bad Request";
    statusDetail = "Invalid Input Value - Payload";
    statusCode = "400";
    errorCode = "SVC-0004";
}

if (statusMessage === null) 
  statusMessage = "Internal Server Error - UnAnticipated";

if (statusCode === null) 
  statusCode = 500;

if (statusDetail === null)
  statusDetail = "Service Error - The server encountered an error while attempting to fulfill the request.";

if (errorCode === null)
  errorCode = "GEN-9999";

// Create response
var errorResponse = {
  "status":{
      "code" : 102,
      "message" : statusDetail
    },
  "errors":[{
    "code": errorCode,
    "userMessage" : statusDetail,
    "systemMessage" : systemMessage
  }]
};

context.setVariable("errorResponse",JSON.stringify(errorResponse));
context.setVariable("statusMessage", statusMessage);
context.setVariable("statusCode", statusCode);
