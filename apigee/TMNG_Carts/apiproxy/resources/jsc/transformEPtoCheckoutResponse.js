var responseObj;

if (context.getVariable("redirect") == "true")
    responseObj = JSON.parse(context.getVariable("ep.response.content"));
else
    responseObj = JSON.parse(response.content);

var responseJson = JSON.parse(context.getVariable("raptorGetProfileAddressesResponse.content"));

//Create Accessories
var lineItems;
var creditLevel = context.getVariable("api.request.creditLevel");	

if (!isNullOrEmpty(responseObj._lineitems))
    lineItems = responseObj._lineitems;

var cart = {};
var rootElement = {};
var accessories = [];
var lineOfServices = [];

var profile = {};

// uncomment for testing cart.responseObj = responseObj;

cart.cartId = getId(responseObj.self.uri);
var link = responseObj.links.filter(function(d){return d.rel == 'order'});
if (!isNullOrEmpty(link)) {
    cart.orderId = link[0].uri.split("/")[3];
}
if (!isNullOrEmpty(responseObj._accessoriestotal)) {
    var accessoriesTotal = [];
    var accessoryTotal = {};
    var accessoriestotal = {};
    accessoriestotal = responseObj._accessoriestotal;
    if (!isNullOrEmpty(accessoriestotal[0]["monthly-price"]))

    {
        var accmonthlypaymentprice = ((accessoriestotal[0])["monthly-price"])[0];
        accessoryTotal.monthlyPrice = createPrice(accmonthlypaymentprice);
    }
    if (!isNullOrEmpty(accessoriestotal[0]["paynow-price"])) {
        var accpaynowprice = ((accessoriestotal[0])["paynow-price"])[0];
        accessoryTotal.payNowPrice = createPrice(accpaynowprice);
    }
    accessoriesTotal.push(accessoryTotal);


}
if ((!isNullOrEmpty(responseObj._eipeligible)) && !isNullOrEmpty((responseObj._eipeligible[0])["eip-eligible"])) {
                                        cart.accessoriesEipEligible = (responseObj._eipeligible[0])["eip-eligible"];
                                    }
cart.accessoriesTotal = accessoriesTotal;

if (!isNullOrEmpty(responseObj._order)) {
    createProfile(profile, responseObj, responseJson);
    cart.profile = profile;
}

//Get Element array
if (!isNullOrEmpty(lineItems)) {
    var elementLineItem = lineItems[0]._element;
    for (var count = 0; count < elementLineItem.length; count++) {
        var elementChild = elementLineItem[count];
        var availability = null;
        var quantity = null;
		var priceType =null;
        if (!isNullOrEmpty(elementChild._availability) && !isNullOrEmpty(elementChild._availability[0].state)) {
            availability = elementChild._availability[0].state;
		}
		if (!isNullOrEmpty(elementChild._pricetypes) && !isNullOrEmpty(elementChild._pricetypes[0].pricetypes)) {
			priceType = elementChild._pricetypes[0].pricetypes;
		}
        if (!isNullOrEmpty(elementChild.quantity)) {
            quantity = elementChild.quantity;
        }

        for (var j = 0; j < elementChild._item.length; j++) {
            var elemChildItemChild = elementChild._item[j];
            for (var k = 0; k < elemChildItemChild._definition.length; k++) {
                var itemDefinition = elemChildItemChild._definition[k];
                for (var l = 0; l < itemDefinition.details.length; l++) {
                    var lineOfService = {};
                    var service = [];
                    var aggregatingPricing = [];
                    var itemDetail = itemDefinition.details[l];
                    if (itemDetail.name == 'ProductType') {
                        if (itemDetail.value == 'ACCESSORY') {
							var accessory = createAccessory(priceType,elemChildItemChild, availability, itemDefinition, quantity,creditLevel,elementChild);	
                            if (!isNullOrEmpty(elementChild._total) && !isNullOrEmpty(elementChild._total[0].cost[0])) {
                                if (isNullOrEmpty(accessory.pricing)) {
                                    accessory.pricing = {};
                                }
                                accessory.pricing.total = elementChild._total[0].cost[0];
                            }

                            if (!isNullOrEmpty(itemDefinition["display-name"])) {
                                accessory.skuName = itemDefinition["display-name"];
                            }
                            //accessory.id = getId(itemDefinition.self.uri);
                            accessory.id = getId(elementChild.self.uri);
                            accessories.push(accessory);
                        } else if ((itemDefinition)["display-name"] == 'Line') {
                            //Check line for device(handset and simcard), plan, service                                                                                                                                
                            if (!isNullOrEmpty(elementChild._line)) {
                                lineOfService.id = getId(elementChild.self.uri);
                                var line = elementChild._line[0];
								if (!isNullOrEmpty(line._renamelineform) && !isNullOrEmpty(line._renamelineform[0])
										&& !isNullOrEmpty((line._renamelineform[0])["line-name"])) {
                                    lineOfService.lineNo = (line._renamelineform[0])["line-name"];
                                }
								if (!isNullOrEmpty(line)&&(line._linetype)&&(line._linetype[0])&&(line._linetype[0].linetype)){
									lineOfService.lineType=line._linetype[0].linetype;
								}
                                if (!isNullOrEmpty(line._device)) {
                                    



                                    var device = {};
                                    for (var i = 0; i < line._device.length; i++) {
                                        //Create Device
                                        if (!isNullOrEmpty(line._device[i]._selected)) {
                                            var deviceSelected = line._device[i]._selected[0];
                                            device.id = getId(deviceSelected.self.uri);
										    createDevice(device, deviceSelected,creditLevel,line);			
                                        }
                                    }
                                    if (!isNullOrEmpty(device)) {
                                        lineOfService.device = device;
                                    }
                                }

                                if (!isNullOrEmpty(line._plan) && !isNullOrEmpty(line._plan[0])) {
                                    //Create Plan
                                    var planSelected = line._plan[0]._selected[0];
                                    var plan = {};
                                    plan.id = getId(planSelected.self.uri);
									createPlan(plan, planSelected,creditLevel);								
                                    if (!isNullOrEmpty(plan)) {
                                        lineOfService.plan = plan;
                                    }
                                }
                                if (!isNullOrEmpty(line._simcards) && !isNullOrEmpty(line._simcards[0])) {
                                    //Create simCard
                                    var simCardSelected = line._simcards[0]._selected[0];
                                    var simCard = {};
                                    createsimCard(simCard, simCardSelected);
                                    if (!isNullOrEmpty(simCard)) {
                                        lineOfService.simCard = simCard;
                                    }
                                }
                                //Create Service
                                if (!isNullOrEmpty(line._service)) {
                                    for (var i = 0; i < line._service.length; i++) {
                                        for (var j = 0; j < line._service[i]._selected.length; j++) {
                                            var serviceSelected = line._service[i]._selected[j];
                                            if (!isNullOrEmpty(serviceSelected)) {
                                                var serviceElement = {};
                                                createService(serviceElement, serviceSelected);
                                                serviceElement.id = getId(serviceSelected.self.uri);
                                                service.push(serviceElement);
                                            }
                                        }
                                    }
                                    if (service.length > 0) {
                                        lineOfService.service = service;
                                    }
                                }
                                //Create pricing
                                var pricing = {};
                                createLineOfServicePricing(pricing, line);
                                if (!isNullOrEmpty(pricing)) {
                                    lineOfService.pricing = pricing;
                                }
                                lineOfServices.push(lineOfService);
                            }
                        }
                    }
                }
                if (accessories.length > 0) {
                    cart.accessories = accessories;
                }
                if (lineOfServices.length > 0) {
                    cart.lineOfServices = lineOfServices;
                }
            }
        }
    }
}



var refundabledeposit = responseObj["_refundable-deposit"];
var order = responseObj._order;
var monthlyDiscounts = responseObj._monthlydiscounts;
var cartPricing = createPricing(order,refundabledeposit, monthlyDiscounts);


if (!isNullOrEmpty(cartPricing)) {
    cart.pricing = cartPricing;
}

function getId(uri) {
    if (!isNullOrEmpty(uri)) {
        var checkChar = uri.indexOf("?");
        var strArr = "";
        if (checkChar == -1) {
            strArr = uri.split("/");
        } else {
            var url = uri.substring(0, uri.lastIndexOf("?"));
            strArr = url.split("/");
        }
        return strArr[strArr.length - 1];
    } else {
        return "";
    }
}

function getIdByOffset(uri, offset) {
    if (!isNullOrEmpty(uri)) {
        var checkChar = uri.indexOf("?");
        var strArr = "";
        if (checkChar == -1) {
            strArr = uri.split("/");
        } else {
            var url = uri.substring(0, uri.lastIndexOf("?"));
            strArr = url.split("/");
        }
        return strArr[strArr.length - 1 - offset];
    } else {
        return "";
    }
}

function createPricingOptions(priceoption,monthlyPrice) {
	   var option = {};
		if (!isNullOrEmpty(priceoption["price-type"])) {
                    option.type = priceoption["price-type"];
		}
		if (!isNullOrEmpty(priceoption['monthly-total'])) {
			var monthlyAmount = {};
			if (!isNullOrEmpty(priceoption['monthly-total'].amount)) {
				monthlyAmount.amount = priceoption['monthly-total'].amount;
			}
			if (!isNullOrEmpty(priceoption['monthly-total'].currency)) {
				monthlyAmount.currency = priceoption['monthly-total'].currency;
			}
			if (!isNullOrEmpty(priceoption['monthly-total'].display)) {
				monthlyAmount.display = priceoption['monthly-total'].display;
			}
			if (!isNullOrEmpty(priceoption['monthly-total'].ti)) {
				monthlyAmount.taxInclusive = priceoption['monthly-total'].ti;
			}
			if (!isNullOrEmpty(monthlyAmount)) {
				option.monthlyAmount = monthlyAmount;
			}
			//option.monthlyAmount = priceoption['monthly-total'];
		}
		if ((priceoption["price-type"]=="EIP")&& !isNullOrEmpty(monthlyPrice)&& (!isNullOrEmpty(monthlyPrice["term-months"]))) {
                  option.contractTerm = monthlyPrice["term-months"];
		}
		if (!isNullOrEmpty(priceoption['onetime-total'])) {
			var payNowAmount = {};
			if (!isNullOrEmpty(priceoption['onetime-total'].amount)) {
				payNowAmount.amount = priceoption['onetime-total'].amount;
			}
			if (!isNullOrEmpty(priceoption['onetime-total'].currency)) {
				payNowAmount.currency = priceoption['onetime-total'].currency;
			}
			if (!isNullOrEmpty(priceoption['onetime-total'].display)) {
				payNowAmount.display = priceoption['onetime-total'].display;
			}
			if (!isNullOrEmpty(priceoption['onetime-total'].ti)) {
				payNowAmount.taxInclusive = priceoption['onetime-total'].ti;
			}
			if (!isNullOrEmpty(payNowAmount)) {
				option.payNowAmount = payNowAmount;
			}
			//option.payNowAmount = priceoption['onetime-total'];
		}
		if (!isNullOrEmpty(priceoption.ti)) {
			option.taxInclusive = priceOptionPricing.ti;
		}
		if (!isNullOrEmpty(priceoption.pricing)){
				 var components=[];
			for (var x = 0; x < priceoption.pricing.length; x++) {
										 var component={};
				var priceOptionPricing = priceoption.pricing[x];
				if (priceOptionPricing["price-component"] == "FRP") {
								component.name="fullPrice";							
					if (!isNullOrEmpty(priceOptionPricing.listprice)) {
									component.listPrice = priceOptionPricing.listprice;
					}
					if (!isNullOrEmpty(priceOptionPricing.purchaseprice)) {
									component.purchasePrice = priceOptionPricing.purchaseprice;
					}
					if (!isNullOrEmpty(priceOptionPricing.ti)) {
									component.taxInclusive = priceOptionPricing.ti;
					}
					}
				if (priceOptionPricing["price-component"] == "pay-monthly") {
							component.name="eipPayMonthly";
								var purchasePrice={};
					if (!isNullOrEmpty(priceOptionPricing.amount)) {
									purchasePrice.amount = priceOptionPricing.amount;
					}
					if (!isNullOrEmpty(priceOptionPricing.currency)) {
									purchasePrice.currency = priceOptionPricing.currency;
					}
					if (!isNullOrEmpty(priceOptionPricing.display)) {
									purchasePrice.display = priceOptionPricing.display;
					}
								if (!isNullOrEmpty(purchasePrice)) {
									component.purchasePrice = purchasePrice;
					}
								if (!isNullOrEmpty(priceOptionPricing.ti)) {
									component.taxInclusive = priceOptionPricing.ti;
					}
				}
				if (priceOptionPricing["price-component"] == "pay-now") {
								component.name="eipPayNow";	 
				if (!isNullOrEmpty(priceOptionPricing.listprice)) {
									component.listPrice = priceOptionPricing.listprice;
				}
				if (!isNullOrEmpty(priceOptionPricing.purchaseprice)) {
									component.purchasePrice = priceOptionPricing.purchaseprice;
				}
				if (!isNullOrEmpty(priceOptionPricing.ti)) {
									component.taxInclusive = priceOptionPricing.ti;
				}
							
				}
				if (priceOptionPricing["price-component"] == "premium-fee") {
							component.name="premiumFee";	
					if (!isNullOrEmpty(priceOptionPricing.cost)) {
									component.cost = priceOptionPricing.cost;
					}
					if (!isNullOrEmpty(priceOptionPricing.listprice)) {
								component.listPrice = priceOptionPricing.listprice;
				}
					if (!isNullOrEmpty(priceOptionPricing.purchaseprice)) {
								component.purchasePrice = priceOptionPricing.purchaseprice;
				}
					if (!isNullOrEmpty(priceOptionPricing.frequency)) {
									component.frequency = priceOptionPricing.frequency;
					}
					if (!isNullOrEmpty(priceOptionPricing.ti)) {
									component.taxInclusive = priceOptionPricing.ti;
					}
					}
				if (priceOptionPricing["price-component"] == "club-fee") {
								component.name="clubFee";	
					if (!isNullOrEmpty(priceOptionPricing.cost)) {
									component.cost = priceOptionPricing.cost;
					}
					if (!isNullOrEmpty(priceOptionPricing.listprice)) {
								component.listPrice = priceOptionPricing.listprice;
				}
					if (!isNullOrEmpty(priceOptionPricing.purchaseprice)) {
								component.purchasePrice = priceOptionPricing.purchaseprice;
				}
					if (!isNullOrEmpty(priceOptionPricing.frequency)) {
									component.frequency = priceOptionPricing.frequency;
					}
					if (!isNullOrEmpty(priceOptionPricing.ti)) {
									component.taxInclusive = priceOptionPricing.ti;
					}
					}
				if (priceOptionPricing["price-component"] == "device-deposit") {
								component.name="deposit";
					if (!isNullOrEmpty(priceOptionPricing.amount)) {
									component.amount = priceOptionPricing.amount;
					}
					if (!isNullOrEmpty(priceOptionPricing.currency)) {
									component.currency = priceOptionPricing.currency;
					}
					if (!isNullOrEmpty(priceOptionPricing.display)) {
									component.display = priceOptionPricing.display;
					}
					}
				if (priceOptionPricing["price-component"] == "deposit-refund") {
								component.name="depositRefund";
					if (!isNullOrEmpty(priceOptionPricing.frequency)) {
									component.frequency = priceOptionPricing.frequency;
					}
					if (!isNullOrEmpty(priceOptionPricing["price-term"])) {
									component.term = priceOptionPricing["price-term"];
					}
					if (!isNullOrEmpty(priceOptionPricing.amount)) {
									component.amount = priceOptionPricing.amount;
					}
					if (!isNullOrEmpty(priceOptionPricing.currency)) {
									component.currency = priceOptionPricing.currency;
					}
					if (!isNullOrEmpty(priceOptionPricing.display)) {
									component.display = priceOptionPricing.display;
					}
					if (!isNullOrEmpty(priceOptionPricing.ti)) {
									component.taxInclusive = priceOptionPricing.ti;
					}
							}
						if (!isNullOrEmpty(component)) {	
						components.push(component);
					}
				}
						if (!isNullOrEmpty(components)) {
							option.components = components;
			}
		}
	return option;
}

function createAccessoryPricingOptions(priceoption,monthlyPrice, accMonthlyPaymentPrice, accPaynowPrice) {
	   var option = {};
		if (!isNullOrEmpty(priceoption["price-type"])) {
                    option.type = priceoption["price-type"];
		}
		if (!isNullOrEmpty(accMonthlyPaymentPrice)) {
			option.monthlyAmount = accMonthlyPaymentPrice;
		}
		if ((priceoption["price-type"]=="EIP")&& !isNullOrEmpty(monthlyPrice)&& (!isNullOrEmpty(monthlyPrice["term-months"]))) {
                  option.contractTerm = monthlyPrice["term-months"];
		}
		if (!isNullOrEmpty(accPaynowPrice)) {
			option.payNowAmount = accPaynowPrice;
		}
		if (!isNullOrEmpty(priceoption.ti)) {
			option.taxInclusive = priceOptionPricing.ti;
		}
		if (!isNullOrEmpty(priceoption.pricing)){
				 var components=[];
			for (var x = 0; x < priceoption.pricing.length; x++) {
										 var component={};
				var priceOptionPricing = priceoption.pricing[x];
				if (priceOptionPricing["price-component"] == "FRP") {
								component.name="fullPrice";							
					if (!isNullOrEmpty(priceOptionPricing.listprice)) {
									component.listPrice = priceOptionPricing.listprice;
					}
					if (!isNullOrEmpty(priceOptionPricing.purchaseprice)) {
									component.purchasePrice = priceOptionPricing.purchaseprice;
					}
					if (!isNullOrEmpty(priceOptionPricing.ti)) {
									component.taxInclusive = priceOptionPricing.ti;
					}
					}
				if (priceOptionPricing["price-component"] == "pay-monthly") {
							component.name="eipPayMonthly";
								var purchasePrice={};
					if (!isNullOrEmpty(priceOptionPricing.amount)) {
									purchasePrice.amount = priceOptionPricing.amount;
					}
					if (!isNullOrEmpty(priceOptionPricing.currency)) {
									purchasePrice.currency = priceOptionPricing.currency;
					}
					if (!isNullOrEmpty(priceOptionPricing.display)) {
									purchasePrice.display = priceOptionPricing.display;
					}
								if (!isNullOrEmpty(purchasePrice)) {
									component.purchasePrice = purchasePrice;
					}
								if (!isNullOrEmpty(priceOptionPricing.ti)) {
									component.taxInclusive = priceOptionPricing.ti;
					}
				}
				if (priceOptionPricing["price-component"] == "pay-now") {
								component.name="eipPayNow";	 
				if (!isNullOrEmpty(priceOptionPricing.listprice)) {
									component.listPrice = priceOptionPricing.listprice;
				}
				if (!isNullOrEmpty(priceOptionPricing.purchaseprice)) {
									component.purchasePrice = priceOptionPricing.purchaseprice;
				}
				if (!isNullOrEmpty(priceOptionPricing.ti)) {
									component.taxInclusive = priceOptionPricing.ti;
				}
				}
				if (priceOptionPricing["price-component"] == "premium-fee") {
							component.name="premiumFee";	
					if (!isNullOrEmpty(priceOptionPricing.cost)) {
									component.cost = priceOptionPricing.cost;
					}
					if (!isNullOrEmpty(priceOptionPricing.listprice)) {
								component.listPrice = priceOptionPricing.listprice;
				}
					if (!isNullOrEmpty(priceOptionPricing.purchaseprice)) {
								component.purchasePrice = priceOptionPricing.purchaseprice;
				}
					if (!isNullOrEmpty(priceOptionPricing.frequency)) {
									component.frequency = priceOptionPricing.frequency;
					}
					if (!isNullOrEmpty(priceOptionPricing.ti)) {
									component.taxInclusive = priceOptionPricing.ti;
					}
					}
				if (priceOptionPricing["price-component"] == "club-fee") {
								component.name="clubFee";	
					if (!isNullOrEmpty(priceOptionPricing.cost)) {
									component.cost = priceOptionPricing.cost;
					}
					if (!isNullOrEmpty(priceOptionPricing.listprice)) {
								component.listPrice = priceOptionPricing.listprice;
				}
					if (!isNullOrEmpty(priceOptionPricing.purchaseprice)) {
								component.purchasePrice = priceOptionPricing.purchaseprice;
				}
					if (!isNullOrEmpty(priceOptionPricing.frequency)) {
									component.frequency = priceOptionPricing.frequency;
					}
					if (!isNullOrEmpty(priceOptionPricing.ti)) {
									component.taxInclusive = priceOptionPricing.ti;
					}
					}
				if (priceOptionPricing["price-component"] == "device-deposit") {
								component.name="deposit";
					if (!isNullOrEmpty(priceOptionPricing.amount)) {
									component.amount = priceOptionPricing.amount;
					}
					if (!isNullOrEmpty(priceOptionPricing.currency)) {
									component.currency = priceOptionPricing.currency;
					}
					if (!isNullOrEmpty(priceOptionPricing.display)) {
									component.display = priceOptionPricing.display;
					}
					}
				if (priceOptionPricing["price-component"] == "deposit-refund") {
								component.name="depositRefund";
					if (!isNullOrEmpty(priceOptionPricing.frequency)) {
									component.frequency = priceOptionPricing.frequency;
					}
					if (!isNullOrEmpty(priceOptionPricing["price-term"])) {
									component.term = priceOptionPricing["price-term"];
					}
					if (!isNullOrEmpty(priceOptionPricing.amount)) {
									component.amount = priceOptionPricing.amount;
					}
					if (!isNullOrEmpty(priceOptionPricing.currency)) {
									component.currency = priceOptionPricing.currency;
					}
					if (!isNullOrEmpty(priceOptionPricing.display)) {
									component.display = priceOptionPricing.display;
					}
					if (!isNullOrEmpty(priceOptionPricing.ti)) {
									component.taxInclusive = priceOptionPricing.ti;
					}
							}
						if (!isNullOrEmpty(component)) {	
						components.push(component);
					}
				}
						if (!isNullOrEmpty(components)) {
							option.components = components;
			}
		}
	return option;
}
function createPricing(order,refundabledeposit, monthlyDiscounts) {		
	var pricing = {};
	    //Create Options
    var options = {};
	var discounts = [];
	var subtotal = {};
	var total = {};
	var refundableDepositAmount = {};
	 if (!isNullOrEmpty(refundabledeposit) && !isNullOrEmpty(refundabledeposit[0].cost)) {		
	    pricing.refundableDepositAmount = refundabledeposit[0].cost[0];
	}
 

		if (!isNullOrEmpty(order[0]._paynowprice) && !isNullOrEmpty(order[0]._paynowprice[0].cost)) {
		options.payNowAmount = order[0]._paynowprice[0].cost[0];
		subtotal.payNowPrice = order[0]._paynowprice[0].cost[0];
		total.payNowPrice = order[0]._paynowprice[0].cost[0];
	
	}
		if (!isNullOrEmpty(order[0]._monthlyprice) && !isNullOrEmpty(order[0]._monthlyprice[0].cost)) {
		options.monthlyPrice =order[0]._monthlyprice[0].cost[0];
		subtotal.monthlyPrice = order[0]._monthlyprice[0].cost[0];
		total.monthlyPrice = order[0]._monthlyprice[0].cost[0];
	}
	if (!isNullOrEmpty(options)) {	
		pricing.options = options;
	}
	if (!isNullOrEmpty(total)) {	
		pricing.total = total;
	}
	
	if (!isNullOrEmpty(subtotal)) {	
		pricing.subtotal = subtotal;
	}
	if (!isNullOrEmpty(monthlyDiscounts) && !isNullOrEmpty(monthlyDiscounts[0]) && !isNullOrEmpty(monthlyDiscounts[0].monthlydiscounts)) {
		var cartMonthlyDiscount=monthlyDiscounts[0].monthlydiscounts;
		if (!isNullOrEmpty(cartMonthlyDiscount[0].autopaydiscounts)&& !isNullOrEmpty(cartMonthlyDiscount[0].autopaydiscounts[0])){
			var autopayDiscount=cartMonthlyDiscount[0].autopaydiscounts[0];
			var discount ={};			
			if (!isNullOrEmpty(autopayDiscount.eligible)){
				if (autopayDiscount.eligible == 'Y' || autopayDiscount.eligible == true) {
					discount.autoPayEligible = true;
				}else{
					discount.autoPayEligible =false;
				}				
			}
			if (!isNullOrEmpty(autopayDiscount.amount)){
				discount.autoPayAmount =autopayDiscount.amount;
			}
			if (!isNullOrEmpty(autopayDiscount.discounttype)){
				discount.discounttype =autopayDiscount.discounttype;
			}
			if (!isNullOrEmpty(autopayDiscount.applied)){
				if (autopayDiscount.applied == 'Y' || autopayDiscount.applied == true) {
					discount.applied = true;
				}else{
					discount.applied =false;
				}
			}
			if (!isNullOrEmpty(discount)) {	
				discounts.push(discount);
			}			
		}	
	}
	if (discounts.length > 0) {
		pricing.discounts = discounts;
	}
    //Create Promotions

    if (!isNullOrEmpty(order) && !isNullOrEmpty(order[0]._couponinfo) && !isNullOrEmpty(order[0]._couponinfo[0]._coupon)) {
        var coupons = order[0]._couponinfo[0]._coupon;
        var promotions = [];
        for (var i = 0; i < coupons.length; i++) {

            var coupon = coupons[i];
            var promotion = {};
            promotion.promoCode = coupon.code;
            if (!isNullOrEmpty(coupon._appliedpromotions) && !isNullOrEmpty(coupon._appliedpromotions[0]._element)) {
                for (var s = 0; s < coupon._appliedpromotions[0]._element.length; s++) {
                    if (!isNullOrEmpty(coupon._appliedpromotions[0]._element[s].name)) {
                        promotion.promoTitle = coupon._appliedpromotions[0]._element[s].name;
                    }
                    if (!isNullOrEmpty((coupon._appliedpromotions[0]._element[s])["display-description"])) {
                        promotion.description = (coupon._appliedpromotions[0]._element[s])["display-description"];
                    }
                    if (!isNullOrEmpty(promotion)) {
                        promotions.push(promotion);
                    }
                }
            }
        }
        if (promotions.length > 0) {
            pricing.promotions = promotions;
        }
    }
    if (!isNullOrEmpty(order)) {
        //Create tax
        if (!isNullOrEmpty(order[0]._tax) && !isNullOrEmpty(order[0]._tax[0].total)) {
            var tax = {};
            pricing.tax = tax;
            pricing.tax.totalTax = order[0]._tax[0].total;
        }
    }
    return pricing;
}

function createLineOfServicePricing(pricing, line) {	
	var subTotal = {};
	var payNowPrice = null;
	var monthlyPrice = null;
	var price = null;	
	var total = {};	
	var options={};
	var discounts = [];
   var refundableDepositAmount = null;
	 if (!isNullOrEmpty(line["_refundable-deposit"]) && !isNullOrEmpty(line["_refundable-deposit"][0].cost)) {		
	    pricing.refundableDepositAmount = line["_refundable-deposit"][0].cost[0];	
	}
	if (!isNullOrEmpty(line._paynowprice) && !isNullOrEmpty(line._paynowprice[0].cost)) {		
		payNowPrice = {};
		subTotal.payNowPrice = line._paynowprice[0].cost[0];	
		options.payNowPrice = line._paynowprice[0].cost[0];	
	}
	if (!isNullOrEmpty(line._totals) && !isNullOrEmpty(line._totals[0].cost)) {		
		total.payNowPrice = line._totals[0].cost[0];
	}
	if (!isNullOrEmpty(line._monthlyprice) && !isNullOrEmpty(line._monthlyprice[0].cost)) {
		monthlyPrice = {}
		subTotal.monthlyPrice = line._monthlyprice[0].cost[0];
		options.monthlyPrice = line._monthlyprice[0].cost[0];
		total.monthlyPrice = line._monthlyprice[0].cost[0];
	}
	if (!isNullOrEmpty(line._monthlydiscounts)&&(!isNullOrEmpty(line._monthlydiscounts[0]))&&(!isNullOrEmpty(line._monthlydiscounts[0].monthlydiscounts))) {
		var lineMonthlyDiscount=line._monthlydiscounts[0].monthlydiscounts;
		if (!isNullOrEmpty(lineMonthlyDiscount[0].autopaydiscounts)&& !isNullOrEmpty(lineMonthlyDiscount[0].autopaydiscounts[0])){
			var autopayDiscount=lineMonthlyDiscount[0].autopaydiscounts[0];
			var discount ={};			
			if (!isNullOrEmpty(autopayDiscount.eligible)){
				if (autopayDiscount.eligible == 'Y' || autopayDiscount.eligible == true) {
					discount.autoPayEligible = true;
				}else{
					discount.autoPayEligible =false;
				}				
			}
			if (!isNullOrEmpty(autopayDiscount.amount)){
				discount.autoPayAmount =autopayDiscount.amount;
			}
			if (!isNullOrEmpty(autopayDiscount.discounttype)){
				discount.discounttype =autopayDiscount.discounttype;
			}
			if (!isNullOrEmpty(autopayDiscount.applied)){
				if (autopayDiscount.applied == 'Y' || autopayDiscount.applied == true) {
					discount.applied = true;
				}else{
					discount.applied =false;
				}
			}
			if (!isNullOrEmpty(discount)) {	
				discounts.push(discount);
			}			
		}	
	}	
	if (discounts.length > 0) {
		pricing.discounts = discounts;
	}
if (!isNullOrEmpty(options)) {
        pricing.options = options;

    }
	if (!isNullOrEmpty(subTotal)) {	
		pricing.subTotal = subTotal;
	}		
	if (!isNullOrEmpty(total)) {	
		pricing.total = total;
	}
}

function createService(serviceElement, serviceSelected,creditLevel) {
	var serviceItem = serviceSelected._item[0];
	var serviceDefinition = serviceItem._definition[0];
	var servicePriceType=serviceSelected._pricetypes[0];
	var serviceDetails = serviceDefinition.details;
	var quantity = serviceSelected.quantity;
	var monthlyPrice = serviceSelected._monthlyprice;
	var payNowPrice = serviceSelected._paynowprice;
	var price = serviceItem._price;
	var appliedPromotions = serviceSelected._appliedpromotions;
	var availability = serviceSelected._availability;
	for (var i=0; i<serviceDetails.length; i++) {
		var serviceDetail = serviceDetails[i];		
		createServiceElement(serviceElement, serviceDetails);
		serviceElement.skuName = serviceDefinition["display-name"];
		if (!isNullOrEmpty(serviceItem._code) && !isNullOrEmpty(serviceItem._code[0].code)) {
			serviceElement.sku = serviceItem._code[0].code;
		}
		serviceElement.quantity = quantity;				
	//	serviceElement.productSubType = serviceDetail.value;
		createServicePricing(serviceElement, monthlyPrice, payNowPrice, price);
		if (!isNullOrEmpty(availability) && !isNullOrEmpty(availability[0].state)) {
			serviceElement.availability = availability[0].state;
		}	
	} 
}

function createServiceElement(serviceElement, serviceDetails) {
    for (var i = 0; i < serviceDetails.length; i++) {
        var serviceDetail = serviceDetails[i];
		if ((serviceDetail.value.length) != 0) {
            if (serviceDetail.name == 'ColorSwatch') {
                serviceElement.colorSwatch = serviceDetail.value;
            } else if (serviceDetail.name == 'Description') {
                serviceElement.description = serviceDetail.value;
            } else if (serviceDetail.name == 'FamilyId') {
                serviceElement.familyId = serviceDetail.value;
            } else if (serviceDetail.name == 'FamilyName') {
                serviceElement.familyName = serviceDetail.value;
            } else if (serviceDetail.name == 'TI') {
                serviceElement.taxInclusive = serviceDetail.value;
            } else if (serviceDetail.name == 'Memory') {
                serviceElement.memory = serviceDetail.value;
	    }else if (serviceDetail.name == 'ServiceCat') {			
		serviceElement.category = serviceDetail.value;
            } else if (serviceDetail.name == 'MemoryUOM') {
                serviceElement.memoryUOM = serviceDetail.value;
            } else if (serviceDetail.name == 'ProductType') {
                serviceElement.productType = serviceDetail.value;
            }
        }
    }
}

function createServicePricing(serviceElement, monthlyPrice, payNowPrice, price) {
    var pricing = {};
    var options = {};
    if (!isNullOrEmpty(price) && !isNullOrEmpty(price[0])) {
        if (!isNullOrEmpty((price[0])["purchase-price"]) && !isNullOrEmpty(((price[0])["purchase-price"])[0].display)) {
            pricing.mrp = ((price[0])["purchase-price"])[0].display;
        }
        if (!isNullOrEmpty((price[0])["list-price"]) && !isNullOrEmpty(((price[0])["list-price"])[0].display)) {
            pricing.listPrice = ((price[0])["list-price"])[0].display;
        }
    }
    if (!isNullOrEmpty(monthlyPrice) && !isNullOrEmpty(monthlyPrice[0])) {
        if (!isNullOrEmpty((monthlyPrice[0])["term-months"])) {
            options.contractTerm = (monthlyPrice[0])["term-months"];
        }
        if (!isNullOrEmpty((monthlyPrice[0])["monthly-payment-price"]) && !isNullOrEmpty(((monthlyPrice[0])["monthly-payment-price"])[0])) {
            var monthlypaymentprice = ((monthlyPrice[0])["monthly-payment-price"])[0];
            options.monthlyAmount = createPrice(monthlypaymentprice);
        }
    }
	if (!isNullOrEmpty(payNowPrice) && !isNullOrEmpty(payNowPrice[0]) && !isNullOrEmpty((payNowPrice[0])["purchase-price"]) 
			&& !isNullOrEmpty(((payNowPrice[0])["purchase-price"])[0])) {
        var purchaseprice = ((payNowPrice[0])["purchase-price"])[0];
        options.payNowAmount = createPrice(purchaseprice);
    }

    if (!isNullOrEmpty(options)) {
        pricing.options = options;
        serviceElement.pricing = pricing;
    }
}

function createPlan(plan, planSelected,creditLevel) {
	var planItem = planSelected._item[0];
	var planPriceType=planSelected._pricetypes[0];
	var planDefinition = planItem._definition[0];	
	var planDetails = planDefinition.details;
	var quantity = planSelected.quantity;
	var monthlyPrice = planSelected._monthlyprice;
	var payNowPrice = planSelected._paynowprice;
	var price = planItem._price;
	var appliedPromotions = planSelected._appliedpromotions;
	var availability = planSelected._availability;
	var productdefinitions = planSelected._productdefinitions;
	for (var i=0; i<planDetails.length; i++) {
		var planDetail = planDetails[i];		
		createPlanElement(plan, planDetails);
		if (!isNullOrEmpty(productdefinitions) && !isNullOrEmpty(productdefinitions[0])) {
			if (!isNullOrEmpty((productdefinitions[0])["display-name"])) {
				plan.skuName = (productdefinitions[0])["display-name"];		
			}
			if (!isNullOrEmpty((productdefinitions[0])["data-service-soc"])) {
				plan.dataServiceSoc = (productdefinitions[0])["data-service-soc"];		
			}
			if (!isNullOrEmpty((productdefinitions[0])["rate-plan-soc"])) {
				plan.ratePlanSoc = (productdefinitions[0])["rate-plan-soc"];		
			}
		}
		if (!isNullOrEmpty(planItem._code) && !isNullOrEmpty(planItem._code[0].code)) {
			
			plan.code = planItem._code[0].code;
		}
		plan.quantity = quantity;				
			createPlanPricing(plan, monthlyPrice, payNowPrice, price);
		if (!isNullOrEmpty(availability) && !isNullOrEmpty(availability[0].state)) {
			plan.availability = availability[0].state;
		}	
	} 
	
}

function createPlanElement(plan, planDetails) {
    for (var i = 0; i < planDetails.length; i++) {
        var planDetail = planDetails[i];
		if ((planDetail.value.length) != 0) {
            if (planDetail.name == 'ColorSwatch') {
                plan.colorSwatch = planDetail.value;
            } else if (planDetail.name == 'Description') {
                plan.description = planDetail.value;
            } else if (planDetail.name == 'FamilyId') {
                plan.familyId = planDetail.value;
            } else if (planDetail.name == 'FamilyName') {
                plan.familyName = planDetail.value;
            } else if (planDetail.name == 'TI') {
                plan.taxInclusive = planDetail.value;
            } else if (planDetail.name == 'Memory') {
                plan.memory = planDetail.value;
            } else if (planDetail.name == 'MemoryUOM') {
                plan.memoryUOM = planDetail.value;
            } else if (planDetail.name == 'SOCs') {
                plan.soc = planDetail.value;
            } else if (planDetail.name == 'Data') {
                plan.dataSize = planDetail.value;
            } else if (planDetail.name == 'ProductType') {
                plan.productType = planDetail.value;
            }
        }
    }
}

function createPlanPricing(plan, monthlyPrice, payNowPrice, price) {
    var pricing = {};
    var options = {};
    if (!isNullOrEmpty(price) && !isNullOrEmpty(price[0])) {
        if (!isNullOrEmpty((price[0])["purchase-price"]) && !isNullOrEmpty(((price[0])["purchase-price"])[0].display)) {
            pricing.mrp = ((price[0])["purchase-price"])[0].display;
        }
        if (!isNullOrEmpty((price[0])["list-price"]) && !isNullOrEmpty(((price[0])["list-price"])[0].display)) {
            pricing.listPrice = ((price[0])["list-price"])[0].display;
        }
    }
    if (!isNullOrEmpty(monthlyPrice) && !isNullOrEmpty(monthlyPrice[0])) {
        if (!isNullOrEmpty((monthlyPrice[0])["term-months"])) {
            options.contractTerm = (monthlyPrice[0])["term-months"];
        }
        if (!isNullOrEmpty((monthlyPrice[0])["monthly-payment-price"]) && !isNullOrEmpty(((monthlyPrice[0])["monthly-payment-price"])[0])) {
            var monthlypaymentprice = ((monthlyPrice[0])["monthly-payment-price"])[0];
            options.monthlyAmount = createPrice(monthlypaymentprice);
        }
    }
	if (!isNullOrEmpty(payNowPrice) && !isNullOrEmpty(payNowPrice[0])
		&& !isNullOrEmpty((payNowPrice[0])["purchase-price"]) && !isNullOrEmpty(((payNowPrice[0])["purchase-price"])[0])) {
        var purchaseprice = ((payNowPrice[0])["purchase-price"])[0];
        options.payNowAmount = createPrice(purchaseprice);
    }
    if (!isNullOrEmpty(options)) {
        pricing.options = options;
        plan.pricing = pricing;
    }
}

function createDevice(device, deviceSelected,creditLevel,line) {
	var deviceItem = deviceSelected._item[0];
	var devicePricingOption=deviceItem._pricingoptions;
	var deviceDefinition = deviceItem._definition[0];
	var deviceDetails = deviceDefinition.details;
	var quantity = deviceSelected.quantity;
	var monthlyPrice = deviceSelected._monthlyprice;
	var payNowPrice = deviceSelected._paynowprice;
	var price = deviceSelected._price;
	var devicePriceType=deviceSelected._pricetypes[0];
	var appliedPromotions = deviceSelected._appliedpromotions;
	var appliedPromotionsItem = deviceSelected._item[0];
	var availability = deviceItem._extavailabilities;
	var productdefinitions = deviceSelected._productdefinitions;
	if (!isNullOrEmpty(productdefinitions) && !isNullOrEmpty(productdefinitions[0])) {
			if (!isNullOrEmpty((productdefinitions[0])["color"])) {
				device.color = (productdefinitions[0])["color"];		
		}
	}
	for (var i=0; i<deviceDetails.length; i++) {
		var deviceDetail = deviceDetails[i];
		if (deviceDetail.name == 'ProductSubType') {			
			if((deviceDetail.value == 'Handset') || (deviceDetail.value == 'Tablet')||(deviceDetail.value == 'Wearable')){
				// Create Handset				
				createHandset(device, deviceDetails,deviceItem);
				device.skuName = deviceDefinition["display-name"];
				if (!isNullOrEmpty(deviceItem._code) && !isNullOrEmpty(deviceItem._code[0].code)) {
					device.sku = deviceItem._code[0].code;
				}
				if (!isNullOrEmpty(availability) && !isNullOrEmpty(availability[0])) {
					if (!isNullOrEmpty((availability[0])["sku-details"]) && !isNullOrEmpty(((availability[0])["sku-details"])[0].status)) {
						device.availability = ((availability[0])["sku-details"])[0].status;
					}
				}
				device.quantity = quantity;				
				device.productSubType = deviceDetail.value;
				if (!isNullOrEmpty(appliedPromotionsItem) && !isNullOrEmpty(appliedPromotionsItem._appliedpromotions)){
					var offers = [];
						if (!isNullOrEmpty(appliedPromotionsItem._appliedpromotions[0]._element)) {
					for (var j = 0; j < appliedPromotionsItem._appliedpromotions[0]._element.length; j++) {
							var offer = {};
							if (!isNullOrEmpty(appliedPromotionsItem._appliedpromotions[0]._element[j].name)) {
								offer.offerName = appliedPromotionsItem._appliedpromotions[0]._element[j].name;
							}
							if (!isNullOrEmpty((appliedPromotionsItem._appliedpromotions[0]._element[j])["display-name"])) {
								offer.offerShortDescription = (appliedPromotionsItem._appliedpromotions[0]._element[j])["display-name"];
							}
							if (!isNullOrEmpty((appliedPromotionsItem._appliedpromotions[0]._element[j])["display-description"])) {
								offer.offerLongDescription = (appliedPromotionsItem._appliedpromotions[0]._element[j])["display-description"];
							}
							offers.push(offer);
						}
					}
					if (offers.length > 0) {
						device.offers = offers;
					}
				}
				if((!isNullOrEmpty(devicePricingOption)) && (!isNullOrEmpty(devicePricingOption[0].pricingoption))) {
					device.pricingOption = devicePricingOption[0].pricingoption;
                		}
				createDevicePricing(device, monthlyPrice, payNowPrice, price,deviceItem,creditLevel, appliedPromotionsItem,devicePriceType, productdefinitions);
			} 
		} 
	}
}

function createsimCard(simCard, simCardSelected) {
    var simCardItem = simCardSelected._item[0];

	if (!isNullOrEmpty(simCardItem._code) && !isNullOrEmpty(simCardItem._code[0].code)) {
		simCard.sku = simCardItem._code[0].code;
	}
	var simCardDefinition = simCardItem._definition[0];
	
	var simCardDetails = simCardDefinition.details;
	
	simCard.skuName = simCardDefinition["display-name"];
	for (var i=0; i<simCardDetails.length; i++) {
		var simCardDetail = simCardDetails[i];
		if (simCardDetail.name == 'Description' && !isNullOrEmpty(simCardDetail.value)) {
			simCard.description = simCardDetail.value;
		}
		else if (simCardDetail.name == 'ThumbNail'){
				simCard.productImageURL = simCardDetail.value;								
		} 		
	}
	var options={};
	var pricing = {};
    var SimCardPayNowPrice = simCardSelected._paynowprice;	
	if (!isNullOrEmpty(SimCardPayNowPrice) && !isNullOrEmpty(SimCardPayNowPrice[0])
		&& !isNullOrEmpty((SimCardPayNowPrice[0])["purchase-price"]) && !isNullOrEmpty(((SimCardPayNowPrice[0])["purchase-price"])[0])) {
		var purchaseprice = ((SimCardPayNowPrice[0])["purchase-price"])[0];		
		options.payNowPrice = createPrice(purchaseprice);						
		}
		if (!isNullOrEmpty(SimCardPayNowPrice) && !isNullOrEmpty(SimCardPayNowPrice[0])
		&& !isNullOrEmpty((SimCardPayNowPrice[0])["list-price"]) && !isNullOrEmpty(((SimCardPayNowPrice[0])["list-price"])[0])) {
		var listPrice = ((SimCardPayNowPrice[0])["list-price"])[0];		
		pricing.listPrice = createPrice(listPrice);						
	}
	var SimCardMonthlyPrice = simCardSelected._monthlyprice;
	if (!isNullOrEmpty(SimCardMonthlyPrice) && !isNullOrEmpty(SimCardMonthlyPrice[0])
	
		&& !isNullOrEmpty((SimCardMonthlyPrice[0])["monthly-payment-price"]) && !isNullOrEmpty(((SimCardMonthlyPrice[0])["monthly-payment-price"])[0])) {
		var monthlypaymentprice = ((SimCardMonthlyPrice[0])["monthly-payment-price"])[0];		
		options.monthlyPrice = createPrice(monthlypaymentprice);						
	}	
	if (!isNullOrEmpty(options)) {
        pricing.options = options;	
}
	 if (!isNullOrEmpty(pricing)) {
        simCard.pricing = pricing;
    }
    if (!isNullOrEmpty(simCardItem) && !isNullOrEmpty(simCardItem._appliedpromotions)){
		var offers = [];
		if (!isNullOrEmpty(simCardItem._appliedpromotions[0]._element)) {
			for (var j = 0; j < simCardItem._appliedpromotions[0]._element.length; j++) {
				var offer = {};
				if (!isNullOrEmpty(simCardItem._appliedpromotions[0]._element[j].name)) {
					offer.offerName = simCardItem._appliedpromotions[0]._element[j].name;
				}
				if (!isNullOrEmpty((simCardItem._appliedpromotions[0]._element[j])["display-name"])) {
					offer.offerShortDescription = (simCardItem._appliedpromotions[0]._element[j])["display-name"];
				}
				if (!isNullOrEmpty((simCardItem._appliedpromotions[0]._element[j])["display-description"])) {
					offer.offerLongDescription = (simCardItem._appliedpromotions[0]._element[j])["display-description"];
				}
				offers.push(offer);
			}
		}
		if (offers.length > 0) {
			simCard.offers = offers;
		}
    }
}

function createHandset(device, deviceDetails) {
    for (var i = 0; i < deviceDetails.length; i++) {
       var deviceDetail = deviceDetails[i];
		if ((deviceDetail.value.length) != 0) {
			if (deviceDetail.name == 'ColorSwatch') {
				device.colorSwatch = deviceDetail.value;								
			} else if (deviceDetail.name == 'Color') {
				device.color = deviceDetail.value;								
			}else if (deviceDetail.name == 'Description') {
				device.description = deviceDetail.value;								
			} else if (deviceDetail.name == 'FamilyId') {
				device.familyId = deviceDetail.value;								
			} else if (deviceDetail.name == 'FamilyName') {
				device.familyName = deviceDetail.value;								
			} else if (deviceDetail.name == 'Memory') {			
				device.memory = deviceDetail.value;	
			}else if (deviceDetail.name == 'ClubTier') {			
				device.clubTier = deviceDetail.value;
			} else if (deviceDetail.name == 'MemoryUOM') {
				device.memoryUOM = deviceDetail.value;								
			} else if (deviceDetail.name == 'ThumbNail') {
				device.productImageURL = deviceDetail.value;								
			}else if (deviceDetail.name == 'ProductType') {
				device.productType = deviceDetail.value;								
			}
		}
	}
}

function createDevicePricing(device, monthlyPrice, payNowPrice, price,deviceItem,creditLevel, appliedPromotionsItem,devicePriceType, productdefinitions) {
	var pricing = {};
	var deviceMonthlyPrice={};
	if (!isNullOrEmpty(deviceItem._monthlyprice)&&!isNullOrEmpty(deviceItem._monthlyprice[0])){
		deviceMonthlyPrice=deviceItem._monthlyprice[0];
	}
	var creditBasePriceOptions=getCreditBasedPricing(deviceItem,creditLevel);
	if (!isNullOrEmpty(creditBasePriceOptions)&&!isNullOrEmpty(creditBasePriceOptions[0])&&!isNullOrEmpty(creditBasePriceOptions[0].priceoptions)){
		var creditPriceOption=creditBasePriceOptions[0].priceoptions;
		if (!isNullOrEmpty(creditPriceOption)){	
			var typeBasedPricing=getTypeBasedPricing(creditPriceOption,devicePriceType);
			if (!isNullOrEmpty(typeBasedPricing)){		
				var priceoption=typeBasedPricing[0];
				var options = createPricingOptions(priceoption,deviceMonthlyPrice);
				if (!isNullOrEmpty(options)) {
					pricing.options = options;
				}
			}
		}
	}
	if (!isNullOrEmpty(productdefinitions) && !isNullOrEmpty(productdefinitions[0])) {
		if (!isNullOrEmpty((productdefinitions[0])["mrp-price"])) {
			pricing.mrp = createPrice(((productdefinitions[0])["mrp-price"])[0]);
		}
	}else if (!isNullOrEmpty(price) && !isNullOrEmpty(price[0])) {
    	if (!isNullOrEmpty((price[0])["purchase-price"]) && !isNullOrEmpty(((price[0])["purchase-price"])[0])) {
    		pricing.mrp = createPrice(((price[0])["purchase-price"])[0]);
    	}
    }
    if (!isNullOrEmpty(price) && !isNullOrEmpty(price[0])) {
		if (!isNullOrEmpty((price[0])["list-price"]) && !isNullOrEmpty(((price[0])["list-price"])[0])) {
			pricing.listPrice = createPrice(((price[0])["list-price"])[0]);
		}
	}	
	
	if (!isNullOrEmpty(appliedPromotionsItem) && !isNullOrEmpty(appliedPromotionsItem._appliedpromotions)){

        var promotions = [];
		if (!isNullOrEmpty(appliedPromotionsItem._appliedpromotions[0]._element)) {
			for (var j = 0; j < appliedPromotionsItem._appliedpromotions[0]._element.length; j++) {
                var promotion = {};
				promotion.promoCode="";
				if (!isNullOrEmpty((appliedPromotionsItem._appliedpromotions[0]._element[j])["display-name"])) {
					promotion.promoTitle = (appliedPromotionsItem._appliedpromotions[0]._element[j])["display-name"];
                }
				if (!isNullOrEmpty((appliedPromotionsItem._appliedpromotions[0]._element[j])["display-description"])) {
		    		promotion.description = (appliedPromotionsItem._appliedpromotions[0]._element[j])["display-description"];
                }
                promotions.push(promotion);
            }
        }
        if (promotions.length > 0) {
            pricing.promotions = promotions;
        }
    }
	
		device.pricing = pricing;
	}


function createProfile(profile, responseObj, responseJson) {
    var order = responseObj._order;
    var billingAddress = {};
    var shippingAddress = {};
	var e911Address={};
    var personalInfo = {};

    if (!isNullOrEmpty(order[0]._billingaddressinfo)) {
        if (!isNullOrEmpty(order[0]._billingaddressinfo[0]._selector[0]._chosen[0]._description)) {
            var billing = order[0]._billingaddressinfo[0]._selector[0]._chosen[0]._description;
            billingAddress.address1 = (billing[0].address)["street-address"];
            billingAddress.address2 = (billing[0].address)["extended-address"];
            billingAddress.city = billing[0].address.locality;
            billingAddress.country = (billing[0].address)["country-name"];
            billingAddress.region = billing[0].address.region;
            billingAddress.zipCode = (billing[0].address)["postal-code"];
        }
    }
    if (!isNullOrEmpty(billingAddress)) {
        profile.billingAddress = billingAddress;
    }
	if (!isNullOrEmpty(order[0]._e911addressinfo)) {
        if (!isNullOrEmpty(order[0]._e911addressinfo[0]._selector[0]._chosen[0]._description)) {
            var e911 = order[0]._e911addressinfo[0]._selector[0]._chosen[0]._description;
            e911Address.address1 = (e911[0].address)["street-address"];
            e911Address.address2 = (e911[0].address)["extended-address"];
            e911Address.city = e911[0].address.locality;
            e911Address.country = (e911[0].address)["country-name"];
            e911Address.region = e911[0].address.region;
            e911Address.zipCode = (e911[0].address)["postal-code"];
        }
    }
	if (!isNullOrEmpty(e911Address)) {
        profile.e911Address = e911Address;
    }
    
    if (!isNullOrEmpty(order[0]._deliveries)) {
        if (!isNullOrEmpty(order[0]._deliveries[0]._element[0]._destinationinfo[0]._selector[0]._chosen[0]._description)) {
            var shipping = order[0]._deliveries[0]._element[0]._destinationinfo[0]._selector[0]._chosen[0]._description;
            shippingAddress.address1 = (shipping[0].address)["street-address"];
            shippingAddress.address2 = (shipping[0].address)["extended-address"];
            shippingAddress.city = shipping[0].address.locality;
            shippingAddress.country = (shipping[0].address)["country-name"];
            shippingAddress.region = shipping[0].address.region;
            shippingAddress.zipCode = (shipping[0].address)["postal-code"];
        }
    }
    if (!isNullOrEmpty(shippingAddress)) {
        profile.shippingAddress = shippingAddress;
    }
    if ((!isNullOrEmpty(responseJson)) && (!isNullOrEmpty(responseJson._emails)) && (!isNullOrEmpty(responseJson._emails[0]._element[0].email))) {
        personalInfo.emailId = responseJson._emails[0]._element[0].email;
        personalInfo.confirmEmail = responseJson._emails[0]._element[0].email;
    }
    if (!isNullOrEmpty(responseJson)) {
        personalInfo.firstName = responseJson["given-name"];
        personalInfo.middleName = responseJson["additional-name"];
        personalInfo.lastName = responseJson["family-name"];
        personalInfo.carrier = responseJson["previous-carrier"];
        personalInfo.phoneNumber = responseJson.tel;
        personalInfo.creditClass = responseJson["credit-level"];
    }

    if (!isNullOrEmpty(personalInfo)) {
        profile.personalInfo = personalInfo;
    }
}

function createAccessory(priceType,elemChildItemChild, availability, itemDefinition, quantity,creditLevel,elementChild) {
var accessory = {};



	if (!isNullOrEmpty(availability)) {
		accessory.availability = availability;
	}
if (!isNullOrEmpty(elemChildItemChild._eippriceavailabilities)&&  !isNullOrEmpty(elemChildItemChild._eippriceavailabilities[0]) && !isNullOrEmpty(elemChildItemChild._eippriceavailabilities[0]["item-eip-price-available"])){
	accessory.itemEipPriceAvailable=elemChildItemChild._eippriceavailabilities[0]["item-eip-price-available"];
	}
	for (var l = 0; l < itemDefinition.details.length; l++) {
		var itemDetail = itemDefinition.details[l];	
		if ((itemDetail.value.length) != 0) {
			if (itemDetail.name == 'ColorSwatch') {
				accessory.colorSwatch = itemDetail.value;								
			}else if (itemDetail.name == 'Color') {
				accessory.color = itemDetail.value;								
			}else if (itemDetail.name == 'Description') {
				accessory.description = itemDetail.value;								
			} else if (itemDetail.name == 'FamilyId') {
				accessory.familyId = itemDetail.value;								
			} else if (itemDetail.name == 'FamilyName') {
				accessory.familyName = itemDetail.value;								
			} else if (itemDetail.name == 'Memory') {			
				accessory.memory = itemDetail.value;								
			} else if (itemDetail.name == 'MemoryUOM') {
				accessory.memoryUOM = itemDetail.value;								
			}  else if (itemDetail.name == 'ThumbNail') {
				accessory.productImageURL = itemDetail.value;								
			} else if (itemDetail.name == 'ProductSubType') {
				accessory.productSubType = itemDetail.value;								
			} else if (itemDetail.name == 'ProductType') {
				accessory.productType = itemDetail.value;								
			} 				
		}	
		createAccessoryPricing(priceType,elementChild,accessory,elemChildItemChild,creditLevel);			
		
		if (!isNullOrEmpty(quantity)) {
			accessory.quantity = quantity;
		}
		if (!isNullOrEmpty(elemChildItemChild._code) && !isNullOrEmpty(elemChildItemChild._code[0].code)) {
			accessory.sku = elemChildItemChild._code[0].code;
		}
	}
	return accessory;
}

function createAccessoryPricing(priceType,elementChild,accessory,elemChildItemChild,creditLevel) {
	var pricing = {};
var price = null;
		price = elemChildItemChild._price;
	if (!isNullOrEmpty(price) && !isNullOrEmpty(price[0])) {		
		if (!isNullOrEmpty((price[0])["list-price"]) && !isNullOrEmpty(((price[0])["list-price"])[0])) {
			pricing.listPrice = createPrice(((price[0])["list-price"])[0]);
		}
	}

	var productdefinitions = elementChild._productdefinitions;
	var accTotalMonthlyPrice = elementChild._monthlyprice;
	var accTotalPayNowPrice = elementChild._paynowprice;
	if (!isNullOrEmpty(productdefinitions) && !isNullOrEmpty(productdefinitions[0])) {
		if (!isNullOrEmpty((productdefinitions[0])["mrp-price"])) {
			pricing.mrp = createPrice(((productdefinitions[0])["mrp-price"])[0]);
		}

	}else if (!isNullOrEmpty(price) && !isNullOrEmpty(price[0])) {
    	if (!isNullOrEmpty((price[0])["purchase-price"]) && !isNullOrEmpty(((price[0])["purchase-price"])[0])) {
    		pricing.mrp = createPrice(((price[0])["purchase-price"])[0]);
    	}
    }	
	//Creating Accessory Option
	var options = {};	
	var accMonthlyPrice={};
	var accMonthlyPaymentPrice = {};
	var accPaynowPrice = {};
	if (!isNullOrEmpty(accTotalMonthlyPrice)&& !isNullOrEmpty(accTotalMonthlyPrice[0])){
		if (!isNullOrEmpty((accTotalMonthlyPrice[0])["monthly-payment-price"])) {
			accMonthlyPaymentPrice = createPrice(((accTotalMonthlyPrice[0])["monthly-payment-price"])[0]);
		}
	}
	if (!isNullOrEmpty(accTotalPayNowPrice)&& !isNullOrEmpty(accTotalPayNowPrice[0])){
		if (!isNullOrEmpty((accTotalPayNowPrice[0])["purchase-price"])) {
			accPaynowPrice = createPrice(((accTotalPayNowPrice[0])["purchase-price"])[0]);
		}
	}
	if (!isNullOrEmpty(elemChildItemChild._monthlyprice)&&!isNullOrEmpty(elemChildItemChild._monthlyprice[0])){
		accMonthlyPrice=elemChildItemChild._monthlyprice[0];
	}
	var creditBasePriceOptions=getCreditBasedPricing(elemChildItemChild,creditLevel);
	if (!isNullOrEmpty(creditBasePriceOptions)){
		var creditPriceOption=creditBasePriceOptions[0].priceoptions;
		if (!isNullOrEmpty(creditPriceOption)){	
			var typeBasedPricing=getTypeBasedAccessoryPricing(creditPriceOption,priceType);
			if (!isNullOrEmpty(typeBasedPricing)){		
				var priceoption=typeBasedPricing[0];
				var options = createAccessoryPricingOptions(priceoption,accMonthlyPrice, accMonthlyPaymentPrice, accPaynowPrice);
				if (!isNullOrEmpty(options)) {
					pricing.options = options;
		}
		}	
	}
	}
	//creating promotions
	if (!isNullOrEmpty(elemChildItemChild._appliedpromotions)
		&& !isNullOrEmpty(elemChildItemChild._appliedpromotions[0]._element)) {
		var promotions = [];
		for (var i = 0; i < elemChildItemChild._appliedpromotions[0]._element.length; i++) {
			var promotion = {};
			var appliedPromotion = elemChildItemChild._appliedpromotions[0]._element[i];
			promotion.promoId = getId(appliedPromotion.self.uri);
			promotion.promoTitle = appliedPromotion.name;
			promotion.description =((appliedPromotion)["display-description"]);
			promotions.push(promotion);
		}
		pricing.promotions = promotions;
	}
	if (!isNullOrEmpty(pricing)) {
		accessory.pricing = pricing;
	}
}


function getCreditBasedPricing(deviceItem,creditLevel){
if (!isNullOrEmpty(deviceItem._priceoptions)){
	var priceOption = deviceItem._priceoptions;
	var priceoptions=[];
	for (var p = 0; p < priceOption.length; p++) {
		var itemPriceOption=priceOption[p];
		if(creditLevel=="GOOD" && ((getId(itemPriceOption.self.uri))=="i5hu6ra=")){	
			priceoptions.push(itemPriceOption);	
		}else if((creditLevel=="BUILDING") && ((getId(itemPriceOption.self.uri))=="ijkustcejfheo=")){
			priceoptions.push(itemPriceOption);	
		}
	}
}
	return priceoptions;
}



function getTypeBasedPricing(creditPriceOption,devicePriceType){
	if(!isNullOrEmpty(devicePriceType.pricetypes)){
		var devicePriceTypeOption=devicePriceType.pricetypes;			
		var priceTypePriceOption=[];
			for (var d = 0; d < creditPriceOption.length; d++) {  
					var arraypriceOption=creditPriceOption[d];		
					if( (devicePriceTypeOption == "FULL") && (arraypriceOption["price-type"] == "FRP")){
					priceTypePriceOption.push(arraypriceOption);
					}else if( (devicePriceTypeOption == "EIP") && (arraypriceOption["price-type"] == "EIP")){
					priceTypePriceOption.push(arraypriceOption);
					}else if ((devicePriceTypeOption == "CLUB") && (arraypriceOption["price-type"] == "CLUB")){
					priceTypePriceOption.push(arraypriceOption);
					}

			}
	}
	return priceTypePriceOption;
}
function getTypeBasedAccessoryPricing(creditPriceOption,priceType){
	if(!isNullOrEmpty(priceType)){				
		var priceTypePriceOption=[];
			for (var d = 0; d < creditPriceOption.length; d++) {  
					var arraypriceOption=creditPriceOption[d];		
					if( (priceType == "FULL") && (arraypriceOption["price-type"] == "FRP")){
					priceTypePriceOption.push(arraypriceOption);
					}else if( (priceType == "EIP") && (arraypriceOption["price-type"] == "EIP")){
					priceTypePriceOption.push(arraypriceOption);
					}else if ((priceType == "CLUB") && (arraypriceOption["price-type"] == "CLUB")){
					priceTypePriceOption.push(arraypriceOption);
					}
			}
	}
	return priceTypePriceOption;
}
function createPrice(priceDetails) {
    var price = {};
    price.amount = priceDetails.amount;
    price.currency = priceDetails.currency;
    price.display = priceDetails.display;
    return price;
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

function getVal(temp) {
    try {
        var val = eval(temp);
        val.temp = 'temp';
        return val;
    } catch (e) {
        return "";
    }
}
var createFacadeToCortexJson = function(responseObj, callbackJson) {

    cart.shippingOptions = [];
    //add loop for all items
    cart.shippingOptions[0] = {};
    if ((!isNullOrEmpty(responseObj._order)) && (!isNullOrEmpty(responseObj._order[0]._deliveries)) && (!isNullOrEmpty(responseObj._order[0]._deliveries[0]._element)) && (!isNullOrEmpty(responseObj._order[0]._deliveries[0]._element[0]._shippingoptioninfo)) && (!isNullOrEmpty(responseObj._order[0]._deliveries[0]._element[0]._shippingoptioninfo[0]._selector)) && (!isNullOrEmpty(responseObj._order[0]._deliveries[0]._element[0]._shippingoptioninfo[0]._selector[0]._chosen))) {
        cart.shippingOptions[0].name = getVal('responseObj._order[0]._deliveries[0]._element[0]._shippingoptioninfo[0]._selector[0]._chosen[0]._description[0].name');
        cart.shippingOptions[0].displayName = getVal('responseObj._order[0]._deliveries[0]._element[0]._shippingoptioninfo[0]._selector[0]._chosen[0]._description[0]["display-name"]');
        cart.shippingOptions[0].cost = getVal('responseObj._order[0]._deliveries[0]._element[0]._shippingoptioninfo[0]._selector[0]._chosen[0]._description[0].cost[0].display');
        cart.shippingOptions[0].infoTip = '';
        cart.shippingOptions[0].deliveryTime = getVal('responseObj._order[0]._deliveries[0]._element[0]._shippingoptioninfo[0]._selector[0]._chosen[0]._description[0].carrier');
        cart.shippingOptions[0].deliveryDate = '';
        cart.shippingOptions[0].selected = 'true';
        cart.shippingOptions[0].actionURL = getVal('responseObj._order[0]._deliveries[0]._element[0]._shippingoptioninfo[0]._selector[0]._chosen[0]._description[0].self.href');

        var appliedPromotions = getVal('responseObj._order[0]._deliveries[0]._element[0]._shippingoptioninfo[0]._shippingoption[0]._appliedpromotions');
        //var jsonAppliedPromotions = JSON.parse(appliedPromotions);

        //cart.shippingOptions[0].sample=getVal('responseObj._order[0]._deliveries[0]._element[0]._shippingoptioninfo[0]._shippingoption[0]._appliedpromotions');
        var promotions = [];
        for (var i = 0; i < appliedPromotions.length; i++) {
            var prom = appliedPromotions[i];
            if (!isNullOrEmpty(prom._element)) {
                var promotion = {};
                promotion.promoId = getId(prom._element[0].self.uri);
                if (!isNullOrEmpty(prom._element[0].name)) {
                    promotion.promoTitle = prom._element[0].name;
                }
                if (!isNullOrEmpty((prom._element[0])["display-description"])) {
                    promotion.description = (prom._element[0])["display-description"];
                }
                promotions.push(promotion);
            }
        }
        if (!isNullOrEmpty(promotions)) {
            cart.shippingOptions[0].promotions = promotions;
        }
    }
    var totalShippingOptionCount = getVal('responseObj._order[0]._deliveries[0]._element[0]._shippingoptioninfo[0]._selector[0]._choice').length;
    if ((!isNullOrEmpty(responseObj._order)) && (!isNullOrEmpty(responseObj._order[0]._deliveries)) && (!isNullOrEmpty(responseObj._order[0]._deliveries[0]._element)) && (!isNullOrEmpty(responseObj._order[0]._deliveries[0]._element[0]._shippingoptioninfo)) && (!isNullOrEmpty(responseObj._order[0]._deliveries[0]._element[0]._shippingoptioninfo[0]._selector)) && (!isNullOrEmpty(responseObj._order[0]._deliveries[0]._element[0]._shippingoptioninfo[0]._selector[0]._choice))) {
        for (j = 0; j < totalShippingOptionCount; j++) {
            cart.shippingOptions[j + 1] = {};
            cart.shippingOptions[j + 1].name = getVal('responseObj._order[0]._deliveries[0]._element[0]._shippingoptioninfo[0]._selector[0]._choice[j]._description[0].name');
            cart.shippingOptions[j + 1].displayName = getVal('responseObj._order[0]._deliveries[0]._element[0]._shippingoptioninfo[0]._selector[0]._choice[j]._description[0]["display-name"]');
            cart.shippingOptions[j + 1].cost = getVal('responseObj._order[0]._deliveries[0]._element[0]._shippingoptioninfo[0]._selector[0]._choice[j]._description[0].cost[0].display');
            cart.shippingOptions[j + 1].infoTip = '';
            cart.shippingOptions[j + 1].deliveryTime = getVal('responseObj._order[0]._deliveries[0]._element[0]._shippingoptioninfo[0]._selector[0]._choice[j]._description[0].carrier');;
            cart.shippingOptions[j + 1].deliveryDate = '';
            cart.shippingOptions[j + 1].selected = 'false';
            cart.shippingOptions[j + 1].actionURL = getVal('responseObj._order[0]._deliveries[0]._element[0]._shippingoptioninfo[0]._selector[0]._choice[j]._selectaction[0].links[0].href');
        }
    }
    callbackJson(cart);
};

if ((!isNullOrEmpty(responseObj._order)) && (!isNullOrEmpty(responseObj._order[0]._deliveries)) && (!isNullOrEmpty(responseObj._order[0]._deliveries[0]._element)) && (!isNullOrEmpty(responseObj._order[0]._deliveries[0]._element[0]._shippingoptioninfo))) {
    createFacadeToCortexJson(responseObj, function(callback) {
        context.proxyResponse.content = JSON.stringify(callback);
    });
}

var status = {
    "code": 100,
    "message": "Success"
};

rootElement.status = status;
rootElement.cart = cart;
response.content = JSON.stringify(rootElement);