var ids = {};
ids._bundleID = context.getVariable("ep.request.service.id");
ids = extractIDsFromPath(properties.pattern,context.getVariable("proxy.pathsuffix"),"api", ids);
var path = replaceIDs(properties.path,ids);
context.setVariable("ep.request.path", path );

context.setVariable("ep.request.content","");
context.setVariable("ep.request.verb","POST");