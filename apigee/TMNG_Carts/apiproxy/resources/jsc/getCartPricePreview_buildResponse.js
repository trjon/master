var cartNoneCreditResponse = JSON.parse(context.getVariable("ep.noneCreditResponse.content"));
var cartGoodCreditResponse = JSON.parse(context.getVariable("ep.goodCreditResponse.content"));
var cartBuildingCreditResponse = JSON.parse(context.getVariable("ep.buildingCreditResponse.content"));
var responseObj = JSON.parse(context.getVariable("response.content"));

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

function getPricing(respValue)
{
  var retVal ={};

  if (!isNullOrEmpty(respValue)){
    if(!isNullOrEmpty(respValue._monthlyprice[0]) && 
      !isNullOrEmpty(respValue._monthlyprice[0].cost[0])){
      retVal.monthlyprice = respValue._monthlyprice[0].cost[0];
    }
    if(!isNullOrEmpty(respValue._paynowprice[0]) && 
      !isNullOrEmpty(respValue._paynowprice[0].cost[0])){
      retVal.paynowprice = respValue._paynowprice[0].cost[0];
    }
    if(!isNullOrEmpty(respValue["_refundable-deposit"]) && 
      !isNullOrEmpty(respValue["_refundable-deposit"][0]) && 
      !isNullOrEmpty(respValue['_refundable-deposit'][0].cost[0])){
      retVal.refundableDeposit = respValue['_refundable-deposit'][0].cost[0];
    }
  }  
  return retVal;
}

var cartResponse = {
  "status": {
    "code": 100,
    "message": "Success"
  },
  "cart":
  {
    "cartId" : "",
    "orderId" : "",
    "creditClass": {
      "creditClass1":{},
      "creditClass2":{},
      "creditClass3":{} 
    } 
  }
};

cartResponse.cart.cartId = responseObj.cart.cartId;
cartResponse.cart.orderId = responseObj.cart.orderId;

cartResponse.cart.creditClass.creditClass1 = getPricing(cartGoodCreditResponse);
cartResponse.cart.creditClass.creditClass1.creditLevel = "GOOD";
cartResponse.cart.creditClass.creditClass2 = getPricing(cartBuildingCreditResponse);
cartResponse.cart.creditClass.creditClass2.creditLevel = "BUILDING";
cartResponse.cart.creditClass.creditClass3 = getPricing(cartNoneCreditResponse);
cartResponse.cart.creditClass.creditClass3.creditLevel = "NONE";
response.content = JSON.stringify(cartResponse);