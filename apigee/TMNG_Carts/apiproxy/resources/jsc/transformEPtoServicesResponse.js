var responseObj = JSON.parse(response.content);

var configurationState = responseObj["configuration-state"];
var serviceItems = responseObj._item;
/**TODO
1. Default values for selected and enabled.
**/
var serviceEnableMap = {};
function createServiceEnableRecommendedMap() 
{
if (!isNullOrEmpty(configurationState)) {

    var constituents = configurationState.constituents;
    if (!isNullOrEmpty(constituents)) {     
        for (var i=0;i<constituents.length; i++) {
            var constituent = constituents[i];
            if (!isNullOrEmpty(constituent)) {
                var prop = {};
                if (!isNullOrEmpty(constituent["sku-code"])) {
                    prop.selected = isNullOrEmpty(constituent.selected) ? true : constituent.selected;
                    prop.enabled = isNullOrEmpty(constituent.enabled) ? true : constituent.enabled;
                    serviceEnableMap[constituent["sku-code"]] = prop;
                }
            }
        }       
    }
}	
}

function createServicesResponse() {
    createServiceEnableRecommendedMap();
    var services = {};
    if (!isNullOrEmpty(serviceItems)) {
        var serviceDetails = [];
        for (var i =0; i<serviceItems.length; i++) {
            var serviceDetail = {};
            var serviceItem = serviceItems[i];
            //Pick only the service item which doesnt have _itemconfiguration
            if (isNullOrEmpty(serviceItem._itemconfiguration)) {
                //Map Code to Sku               
                if (!isNullOrEmpty(serviceItem._code) && !isNullOrEmpty(serviceItem._code[0].code)) {
                    serviceDetail.sku = serviceItem._code[0].code;
                    if (!isNullOrEmpty(serviceEnableMap) && !isNullOrEmpty(serviceEnableMap[serviceDetail.sku])) {
                        serviceDetail.enabled = serviceEnableMap[serviceDetail.sku].enabled;
                        serviceDetail.selected = serviceEnableMap[serviceDetail.sku].selected;
                    }
                }
                var serviceDefinition = serviceItem._definition[0];
                //Map All Definition items
                if (!isNullOrEmpty(serviceDefinition)) {
                    //Map Id
                    serviceDetail.id = getId(serviceDefinition.self.uri);
                    //Map socName
                    if (!isNullOrEmpty(serviceDefinition["display-name"])) {
                        serviceDetail.socName = serviceDefinition["display-name"];
                    }
                    var details = serviceDefinition.details;
                    //Map all detail items
                    if (!isNullOrEmpty(details)) { 
                        //Create Detail Items
                        mapServiceDetailItems(details, serviceDetail);
                    }
                }
                createServicePrices(serviceItem, serviceDetail);                
                serviceDetails.push(serviceDetail);
            }           
        }
    }
    return serviceDetails;  
}

function createServicePrices(serviceItem, serviceDetail) {
    serviceDetail.pricing = {};
    if (!isNullOrEmpty(serviceItem._monthlyprice) && !isNullOrEmpty((serviceItem._monthlyprice[0])["monthly-payment-price"])) {
        serviceDetail.pricing.monthlyPrice = ((serviceItem._monthlyprice[0])["monthly-payment-price"])[0];
    }
    if (!isNullOrEmpty(serviceItem._paynowprice) && !isNullOrEmpty((serviceItem._paynowprice[0])["purchase-price"])) {
        serviceDetail.pricing.payNowPrice = ((serviceItem._paynowprice[0])["purchase-price"])[0];
    }
    if (!isNullOrEmpty(serviceItem._price)) {
        if (!isNullOrEmpty((serviceItem._price[0])["list-price"])) {
            serviceDetail.pricing.listPrice = ((serviceItem._price[0])["list-price"])[0];
        }
        if (!isNullOrEmpty((serviceItem._price[0])["purchase-price"])) {
            serviceDetail.pricing.MRP = ((serviceItem._price[0])["purchase-price"])[0];
        }
    }
}

function mapServiceDetailItems(details, serviceDetail) {    
    for (var j = 0; j < details.length; j++) {
        var detail = details[j];            
        if (!isNullOrEmpty(detail.value)) {             
            if (detail.name == 'SOCs') {
                serviceDetail.soc = detail.value;
            } else if (detail.name == 'ProductType') {              
                serviceDetail.productType = detail.value;
            } else if (detail.name == 'ProductSubType') {
                serviceDetail.productSubType = detail.value;
            } else if (detail.name == 'FamilyId') {
                serviceDetail.familyId = detail.value;
            } else if (detail.name == 'FamilyName') {
                serviceDetail.familyName = detail.value;                                
            } else if (detail.name == 'Description') {
                serviceDetail.description = detail.value;                               
            } else if (detail.name == 'ServiceCat') {
                serviceDetail.category = detail.value;                              
            } else if (detail.name == 'MarketArea') {
                serviceDetail.marketArea = detail.value;                                
            }  else if (detail.name == 'TI') {
                serviceDetail.taxInclusive = detail.value;                                
            }else if (detail.name == 'OfferType') {
                serviceDetail.offerType = detail.value;                             
            } else if (detail.name == 'OfferSubType') {
                serviceDetail.OfferSubType = detail.value;                              
            } else if (detail.name == 'Manufacturer') {
                serviceDetail.manufacturer = detail.value;                              
            } else if (detail.name == 'recommendedFlag') {
                serviceDetail.isRecommended = detail.value;                             
            } 
        }
    }
}

function getId(uri) {
    if (!isNullOrEmpty(uri)) {
        var checkChar = uri.indexOf("?");
        var strArr = "";
        if (checkChar == -1) {
            strArr = uri.split("/");        
        } else {
            var url =uri.substring(0,uri.lastIndexOf("?"));     
            strArr = url.split("/");        
        }   
        return strArr[strArr.length-1];
    } else {
        return "";
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

var serviceInfo = createServicesResponse();
var rootElement = {"status": {},"services":{}};

var status = {
    "code" : 100,
    "message" : "Success"
};

rootElement.status = status;

var link = responseObj._constituentselectorform[0].links.filter(function(d){return d.rel == 'selectconstituentaction'});
if (!isNullOrEmpty(link)){
    var s = link[0].uri.split("/");
    rootElement.services.id =  s[s.length - 1];
}

rootElement.services.details = serviceInfo;
response.content = JSON.stringify(rootElement);