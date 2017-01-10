var responseObj;

if (context.getVariable("redirect") == "true")
    responseObj = JSON.parse(context.getVariable("ep.response.content"));
else
    responseObj = JSON.parse(response.content);

//Create Plan

var plans = {};
var rootElement = {"status" : {
    "code": 100,
    "message": "Success"
}};

var a = responseObj.self.uri;
var s = a.split("?")
var planConfigID = s[0].substr(s[0].lastIndexOf("/")+1);

plans.planConfigurationID = planConfigID;

//Get Lines
if (!isNullOrEmpty(responseObj.lines)) {
    var lines = [];
    for (var j = 0; j < responseObj.lines.length; j++) {
        var line = {};
        var lineChild = responseObj.lines[j];
        line.lineNumber = lineChild["line-number"];
        line.lineId = lineChild["line-selector-id"];
        line.lineType = lineChild["line-type"];

        var planOptions = [];
        var monthlyPrice = {};

        for (var i = 0; i < lineChild["plan-options"].length; i++) {
            if ((!isNullOrEmpty(lineChild)) && (!isNullOrEmpty(lineChild["plan-options"][i]))) {
                var linePlanOptions = lineChild["plan-options"][i];
                var planOption = {};
                createPlanOptions(planOption, linePlanOptions);
                planOptions.push(planOption);
                line.planOptions = planOptions;
            }
        }
        if ((!isNullOrEmpty(lineChild)) && (!isNullOrEmpty(lineChild["selected-plan"]))) {
            line.selectedPlan = lineChild["selected-plan"];
        }
        if ((!isNullOrEmpty(lineChild)) && (!isNullOrEmpty(lineChild["monthly-payment-amount"]))) {
            monthlyPrice.price = lineChild["monthly-payment-amount"];
            monthlyPrice.displayValue = '$' + lineChild["monthly-payment-amount"];
        }

        if (!isNullOrEmpty(monthlyPrice)) {
            line.monthlyPrice = monthlyPrice;
        }
		if (!isNullOrEmpty(line)){
			lines.push(line);
		}
	}
 if (!isNullOrEmpty(lines)) {
    plans.lines = lines;
	}
}
if(!isNullOrEmpty(responseObj.messages[0])){
var messages=[];
var message = {};
  var detail={};
 if(!isNullOrEmpty(responseObj.messages[0].label)){
  detail.code=responseObj.messages[0].label;
  }
if(!isNullOrEmpty(responseObj.messages[0].level)){
detail.message=responseObj.messages[0].level;
}
message.details=detail;
plans.messages = message;
}
function createPlanOptions(planOption, linePlanOptions) {
    if (!isNullOrEmpty(linePlanOptions["plan-option-selector-id"])) {
        planOption.planOptionSelectorId = linePlanOptions["plan-option-selector-id"];
    }
    if (!isNullOrEmpty(linePlanOptions["plan-option-description"])) {
        planOption.label = linePlanOptions["plan-option-description"].label;
        if (!isNullOrEmpty(linePlanOptions["plan-option-description"].tags[0])) {
            if(isNullOrEmpty(planOption.tags)){
                planOption.tags = [];
            }
            planOption.tags.push(linePlanOptions["plan-option-description"].tags[0].tag);
        }
        var monthlyPrice1 = {};
        if (!isNullOrEmpty(linePlanOptions["plan-option-description"]["monthly-payment-amount"])) {
            monthlyPrice1.price = linePlanOptions["plan-option-description"]["monthly-payment-amount"];
            monthlyPrice1.displayValue = '$' + linePlanOptions["plan-option-description"]["monthly-payment-amount"];
            planOption.monthlyPrice = monthlyPrice1;
        }
    }
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

if (!isNullOrEmpty(responseObj["monthly-payment-amount"])){
    var monthlyPrice = {};
    monthlyPrice.price = responseObj["monthly-payment-amount"];
    monthlyPrice.displayValue = '$' + responseObj["monthly-payment-amount"];
    monthlyPrice.currency = "USD";
    plans.monthlyPrice = monthlyPrice;
}

rootElement.plans = plans;
response.content = JSON.stringify(rootElement);