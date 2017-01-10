var ids = {};

ids = extractIDsFromPath(properties.pattern,context.getVariable("proxy.pathsuffix"),"api", ids);

if(String(properties.cortexItemURI) !== "undefined"){
    ids = extractIDsFromPath(properties.cortexItemURI,context.getVariable("ep.item.uri"),"api", ids);
}

if(String(properties.path) !== "undefined"){
    var path = replaceIDs(properties.path,ids);
    context.setVariable("api.cortexTarget.path", path ); 
} 