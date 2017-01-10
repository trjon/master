 var responseObj = JSON.parse(context.getVariable("ep.response.content"));
 var rootElement = {};
 rootElement["audit-records"] = responseObj["audit-records"];
 response.content = JSON.stringify(rootElement);
