var ids = {};
ids = extractIDsFromPath(properties.pattern,context.getVariable("proxy.pathsuffix"),"api", ids);

if(String(properties.path) !== "undefined"){
    var path = replaceIDs(properties.path,ids);
    context.setVariable("api.cortexTarget.path", path ); 
    context.setVariable("ep.request.path", path ); 
}

if(String(properties.verb) !== "undefined"){
    context.setVariable("ep.request.verb", properties.verb ); 
}

if(String(properties.content) !== "undefined"){
    context.setVariable("ep.request.content", properties.content ); 
}