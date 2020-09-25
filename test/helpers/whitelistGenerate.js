
export const event_whitelist = {
  generate: function (val) { 
  	var whitelist = [];
  	var address_pre = "0x5aeda56215b167893e80b4fe645ba6d5bab767de";
  	for(var num = 1; num <= val; num ++){
  		whitelist.push(address_pre+num);
  	}
  	return whitelist;
  }
};


