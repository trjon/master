 var Base32 = {
    a: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
    pad: "=",
    encode: function (s) {
		/* encodes a string s to base32 and returns the encoded string */
		var a = this.a;
		var pad = this.pad;
		var parts = [];
		var quanta= Math.floor((s.length / 5));
		var leftover = s.length % 5;
		if (leftover != 0) {
		   for (var i = 0; i < (5-leftover); i++) { s += '\x00'; }
		   quanta += 1;
		}
		for (i = 0; i < quanta; i++) {
		   parts.push(a.charAt(s.charCodeAt(i*5) >> 3));
		   parts.push(a.charAt( ((s.charCodeAt(i*5) & 0x07) << 2) | (s.charCodeAt(i*5+1) >> 6)));
		   parts.push(a.charAt( ((s.charCodeAt(i*5+1) & 0x3F) >> 1) ));
		   parts.push(a.charAt( ((s.charCodeAt(i*5+1) & 0x01) << 4) | (s.charCodeAt(i*5+2) >> 4)));
		   parts.push(a.charAt( ((s.charCodeAt(i*5+2) & 0x0F) << 1) | (s.charCodeAt(i*5+3) >> 7)));
		   parts.push(a.charAt( ((s.charCodeAt(i*5+3) & 0x7F) >> 2)));
		   parts.push(a.charAt( ((s.charCodeAt(i*5+3) & 0x03) << 3) | (s.charCodeAt(i*5+4) >> 5)));
		   parts.push(a.charAt( ((s.charCodeAt(i*5+4) & 0x1F) )));
		}

		var replace = 0;
		if (leftover == 1) replace = 6;
		else if (leftover == 2) replace = 4;
		else if (leftover == 3) replace = 3;
		else if (leftover == 4) replace = 1;

		for (i = 0; i < replace; i++) parts.pop();
		for (i = 0; i < replace; i++) parts.push("=");

		return parts.join("");
    },
    decode: function(s) {
        var len = s.length;
        var apad = this.a + this.pad;
        var v,x,r=0,bits=0,c,o='';

        s = s.toUpperCase();

        for(i=0;i<len;i+=1) {
            v = apad.indexOf(s.charAt(i));
            if (v>0 && v<32) {
                x = (x << 5) | v;
                bits += 5;
                if (bits >= 8) {
                    c = (x >> (bits - 8)) & 0xff;
                    o = o + String.fromCharCode(c);
                    bits -= 8;
                }
            }
        }
        // remaining bits are < 8
        if (bits>0) {
            c = ((x << (8 - bits)) & 0xff) >> (8 - bits);
            // Don't append a null terminator.
            // See the comment at the top about why this sucks.
            if (c!==0) {
                o = o + String.fromCharCode(c);
            }
        }
        return o;
    }
};