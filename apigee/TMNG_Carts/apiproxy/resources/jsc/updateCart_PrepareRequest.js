var ids = {};
var req =  JSON.parse(context.getVariable("request.content"));
ids._planConfigurationID = req.planconfigurationsID;
ids = extractIDsFromPath(properties.pattern,context.getVariable("proxy.pathsuffix"),"api", ids);

var path = replaceIDs(properties.path,ids);
context.setVariable("ep.request.path", path );
context.setVariable("ep.request.verb", "POST" );
context.setVariable("ep.request.content", "" );