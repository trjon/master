var req = JSON.parse(request.content);
context.setVariable("ep.request.creditLevel",req.creditLevel);
context.setVariable("ep.request.content",'{ \"code\": "' + req.code + '" }');
context.setVariable("ep.request.verb","POST");


var ids = {};
ids._orderID = req.orderID;
ids = extractIDsFromPath(properties.pattern,context.getVariable("proxy.pathsuffix"),"api", ids);
if(String(properties.path) !== "undefined"){
    var path = replaceIDs(properties.path,ids);
    context.setVariable("ep.request.path", path ); 
}