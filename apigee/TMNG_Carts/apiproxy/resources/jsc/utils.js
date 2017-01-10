    function extractIDsFromPath(pattern, path, prefix, ids){
    	var pttSplit = pattern.split("/");
    	var pathSplit = path.split("/");
    	pttSplit.forEach(function(d,i){
    		if(d.startsWith("_")){
    			context.setVariable(prefix + "." + d.substr(1), pathSplit[i]);
    			ids[d] = pathSplit[i];
    		}
    	});
    	return ids;
    }

 function getIDs(pattern, path){
	var pttSplit = pattern.split("/");
	var pathSplit = path.split("/");
	var ids = {};
	pttSplit.forEach(function(d,i){
		if(d.startsWith("_")){
			ids[d] = pathSplit[i];
		}
	});
	return ids;
}

function replaceIDs(pathPattern, ids){
	var pttSplit = pathPattern.split("/");
	var path = "";
	pttSplit.forEach(function(d,i){
		if(d.startsWith("_")){
		    if(String(ids[d]) !== "undefined" )
			    path = path + "/" + ids[d] ;
			else
			    path = path + "/" + d;
		} else {
		    if(i>0)
			path = path + "/" + d ;
		}
	});
	return path;
}