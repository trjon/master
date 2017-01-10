var ids = {};
var req =  JSON.parse(context.getVariable("request.content"));

ids._planConfigurationID = req.planconfigurationsID;
ids._planOptionSelectorID = req.planOptionSelectorID;

ids = extractIDsFromPath(properties.pattern,context.getVariable("proxy.pathsuffix"),"api", ids);
var path = replaceIDs(properties.path,ids);
context.setVariable("api.cortexTarget.path", path );
