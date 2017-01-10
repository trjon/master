var ids = {};
ids._bundleID = context.getVariable("ep.request.service.id");
ids = extractIDsFromPath(properties.pattern,context.getVariable("proxy.pathsuffix"),"api", ids);
var path = replaceIDs(properties.path,ids);
context.setVariable("api.cortexTarget.path", path );