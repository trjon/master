var auditIp =  context.getVariable("proxy.client.ip");
var requestPayload=JSON.parse((context.getVariable("api.request.content")));
var rootElement={};
var auditRecordsPayload=[];
if (!isNullOrEmpty(requestPayload["audit-records"])){
	auditRecordsPayload=requestPayload["audit-records"];
}
var auditRecords=[];
	for (var count = 0; count < auditRecordsPayload.length; count++) {	
	var auditRecord={};
	var auditRecrd=auditRecordsPayload[count];
	if (!isNullOrEmpty(auditRecrd["audit-value"]))
	{	
		auditRecord["audit-value"]=auditRecrd["audit-value"];
	}
	if (!isNullOrEmpty(auditRecrd["audit-key"]))
	{	
		auditRecord["audit-key"]=auditRecrd["audit-key"];
	}
	if (!isNullOrEmpty(auditRecrd["audit-time"]))
	{	
		auditRecord["audit-time"]=auditRecrd["audit-time"];
	}
	if (!isNullOrEmpty(auditIp))
	{	
		auditRecord["audit-ip"]=auditIp;
	}
	
	auditRecords.push(auditRecord);
		
	}
	
	rootElement["audit-records"]=auditRecords;
	var auditR = JSON.stringify(rootElement);
	context.setVariable("api.request.content",auditR);
	
	function isNullOrEmpty(value) {
	//check for null
	if (value == null || value == undefined) {
		return true;
	} else if (!isNaN(value)) {
	    return false;
	} else if (typeof value == "string" && value.length == 0) { // Check for String 
		return true;
    } else if (typeof value == "object" && Object.keys(value).length == 0) { // Check for Objects and Arrays
		return true;
	}
    return false;
}
	