 var a = context.getVariable("ep.response.header.Location");
var s = a.split("?");
var cartID = s[0].substr(s[0].lastIndexOf("/")+1);
context.setVariable("api.cartID",cartID);

// Assign varibles for create plan configuration
context.setVariable("ep.request.path", "/cortex/planconfigurations/raptor/" 
    + context.getVariable("api.cartID") );
context.setVariable("ep.request.content","");
context.setVariable("ep.request.verb","POST");