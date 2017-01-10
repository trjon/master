 var jsonResp = JSON.parse(context.getVariable("ep.response.content"));
var req =  JSON.parse(context.getVariable("request.content"));
var a = jsonResp.self.uri;
var s = a.split("?")
var planConfigID = s[0].substr(s[0].lastIndexOf("/")+1);
context.setVariable("api.planConfigID",planConfigID);

// Assign varibles for create plan configuration
context.setVariable("ep.request.path", "/cortex/planconfigurations/raptor/"
        +  context.getVariable("api.cartID") 
        + "/" + planConfigID + "/addline");
        
context.setVariable("ep.request.content",'{"sub-type": "' + req.subType + '"}');

context.setVariable("ep.request.verb","POST");