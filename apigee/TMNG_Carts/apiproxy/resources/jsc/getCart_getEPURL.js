var cartID = "";
if (properties.flowName == "addDeviceToLine"){
    var uriSplit = context.getVariable("proxy.pathsuffix").split("/");
    cartID = uriSplit[1];
} else {
    cartID = context.getVariable("api.getCart.cartID")+"=";
}
var path = "/cortex/carts/raptor/" + cartID;
var zoom="lineitems:element,lineitems:element:availability,";
zoom = zoom + "lineitems:element:item:code,lineitems:element:item:definition,";
zoom = zoom + "lineitems:element:line:device:selected,";
zoom = zoom + "lineitems:element:line:device:selected:item:definition,";
zoom = zoom + "lineitems:element:line:device:selected:monthlyprice,";
zoom = zoom + "lineitems:element:line:device:selected:paynowprice,";
zoom = zoom + "lineitems:element:line:plan:selected,lineitems:element:line:plan:";
zoom = zoom + "selected:item:definition,lineitems:element:line:plan:selected:monthlyprice,";
zoom = zoom + "lineitems:element:line:plan:selected:paynowprice,lineitems:element:line:renamelineform,";
zoom = zoom + "lineitems:element:monthlyprice,lineitems:element:paynowprice,lineitems:element:price,";
zoom = zoom + "monthlyprice,paynowprice,total";

context.setVariable("api.cortexTarget.path",path);
context.setVariable("request.queryparam.zoom",zoom);
context.setVariable("api.target.verb","GET");
