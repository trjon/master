var auditKeys = context.getVariable("getAuditRecords.audit-keys");
var base32EncodedAuditKey = "";
var path = "";
if (!isNullOrEmpty(auditKeys)){
    base32EncodedAuditKey = Base32.encode(auditKeys).toLowerCase();
    path = "/cortex/auditrecords/carts/raptor/" + context.getVariable("cartID") + "=/" + base32EncodedAuditKey;
}else {
    path = "/cortex/auditrecords/carts/raptor/" + context.getVariable("cartID") + "=";
}
context.setVariable("ep.request.path",path);

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