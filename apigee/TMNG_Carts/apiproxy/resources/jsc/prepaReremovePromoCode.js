var ids = {};
ids = extractIDsFromPath(properties.pattern,context.getVariable("proxy.pathsuffix"),"api", ids);

ids._orderID = context.getVariable("request.queryparam.orderID");
ids._base32EncodedCouponCode = Base32.encode(ids._couponCode).toLowerCase();

var path = replaceIDs(properties.path,ids);
context.setVariable("ep.request.path", path );
context.setVariable("ep.request.verb","DELETE");
context.setVariable("ep.request.content","");