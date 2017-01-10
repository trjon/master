context.setVariable("redirect","true");

var a = context.getVariable("response.header.Location");
var s = a.split("?")
var cartID = s[0].substr(s[0].lastIndexOf("/")+1);

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

context.setVariable("ep.request.path",path);
context.setVariable("request.queryparam.zoom",zoom);
context.setVariable("ep.request.creditLevel",request.creditLevel);
context.setVariable("ep.request.content","");
context.setVariable("ep.request.verb","GET");