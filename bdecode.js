	/**
	 * Javascript bencode-decoder
	 *
	 * @author Marco Gunnink
	 * @version 1.0-alpha
	 * @package BeCode-JS
	 *
	 * "I took my love down to Violet Hill, there we sat in the snow. All the time she was silent still, 
	 * said 'If you love me won't you let me know, if you love me won't you let me know'."
	*/
	
	/**
	 * Decode a bencoded string.
	 * More details on the bencode-specification here: {@link http://wiki.theory.org/BitTorrentSpecification#bencoding}
	 *
	 * I have added 1 unofficial extension: f<floating-point-value>e. This will only work if unStrict = true.
	 * Also, integers (and floats) aren't really checked against full compliance with the specification,
	 * if it can be parsed as a valid Javascript-int/float it will be accepted. 
	 * See {@link http://www.w3schools.com/jsref/jsref_parseInt.asp} and {@link http://www.w3schools.com/jsref/jsref_parseFloat.asp}
	 *
	 * Decoding will stop immediatly if an error is found.
	 *
	 * @param string str the bencoded string to decode
	 * @param bool unStrict if set to true, f<float-value>e will be allowed, otherwise it will raise an error
	*/
	var BDecode = function(str, unStrict){
		this.str = null, this.unStrict = false;
		var pos = 0;
		
		/**
		 * Integers are in this format: i<integer-value>e
		 * Strictly they may not start with a '0' if more follows, this is not checked.
		 * If the value correctly parses as a Javascript-integer it is accepted.
		 *
		 * Not for stand-alone use
		 *
		 * @return Number integer
		*/
		this.decodeInt = function(){
			if(this.str.charAt(pos) == "i") pos++;
			var num = "",
				startPos = pos;
			while(this.str.charAt(pos) !== "e"){
				num += this.str.charAt(pos);
				pos++;
			}
			num = parseInt(num);
			if(isNaN(num)){
				throw new Error("Value at position "+startPos+" is not a valid integer.");
				return null;
			}
			pos++;
			return num;
		};
		
		/**
		 * Floats are not specified in the official Bittorrent specification. 
		 * They are an extension of mine, therefore this function will only work if
		 * unStrict = true.
		 *
		 * Floats work in the same manner as integers (see above): f<float-value>e
		 * If the value parses as a Javascript-float it is accepted.
		 *
		 * Not for standalone use
		 *
		 * @return Number floating point value
		*/
		this.decodeFloat = function(){
			if(!unStrict){
				throw new Error("Floats are only allowed when unStrict = true.");
				return null;
			}
			if(this.str.charAt(pos) == "f") pos++;
			var num = "",
				startPos = pos;
			while(this.str.charAt(pos) !== "e"){
				num += this.str.charAt(pos);
				pos++;
			}
			num = parseFloat(num);
			if(isNaN(num)){
				throw new Error("Value at position "+startPos+" is not a valid float.");
				return null;
			}
			pos++;
			return num;
		}
		
		/**
		 * Lists are in this format: l<bencoded-element>e
		 * Elements can be any valid bencoded value, so nesting is allowed.
		 * There are no separators between elements.
		 *
		 * Not for standalone use.
		 *
		 * @return Array list
		*/
		this.decodeList = function(){
			if(this.str.charAt(pos) == "l") pos++;
			var startPos = pos,
				val = [];
			while(this.str.charAt(pos) !== "e"){
				if(pos > this.str.length) return;
				val.push(this.decodeElm());
			}
			pos++;
			return val;
		};
		
		/**
		 * Dictionaries are in this format: d<bencoded-string:key><bencoded-element>e
		 * For every element the key comes first, then immediatly the element, again no separators.
		 * The element-value can be any valid bencoded value, nesting is allowed.
		 *
		 * Not for standalone use.
		 *
		 * @return Object dictionary
		*/
		this.decodeDict = function(){
			if(this.str.charAt(pos) == "d") pos++;
			var startPos = pos,
				val = {},
				key = "";
			while(this.str.charAt(pos) !== "e"){
				if(pos > this.str.length) return null;
				key = this.decodeString();
				if(key === null) return null;
				val[key] = this.decodeElm();
				if(val[key] === null) return null;
			}
			return val;
		};
		
		/**
		 * Strings are in this format: <base-10-length-integer>:<string>
		 * The length is not a bencoded integer. There is no beginning- or end-delimeter.
		 * All characters are allowed, as long as the string does not exceed the length.
		 *
		 * Not for standalone use
		 *
		 * @return String string
		*/
		this.decodeString = function(){
			var ret = "", len = 0, startPos = pos;
			while(this.str.charAt(pos-1) !== ":"){
				if(pos > this.str.length) return;
				len += this.str.charAt(pos);
				pos++;
			}
			len = parseInt(len);
			if(isNaN(len) || len === 0){
				throw new Error("Value at position "+startPos+": '"+this.str.charAt(startPos)+"' is not a valid length-number.");
				return null;
			}
			ret = this.str.substr(pos, pos+len);
			pos += len;
			return ret;
		};
		
		/**
		 * This function hands off the decoding of the element at this.pos, to its designated function.
		 * 
		 * Not for standalone use.
		 *
		 * @return mixed the decoded value
		*/
		this.decodeElm = function(){
			while(pos < this.str.length){
				switch(this.str.charAt(pos)){
					case "i":
						return this.decodeInt();
					break;
					case "f":
						return this.decodeFloat();
					break;
					case "l":
						return this.decodeList();
					break;
					case "d":
						return this.decodeDict();
					break;
					default:
						return this.decodeString();
					break;
				}
			}
		}
		
		/**
		 * This function decodes the entire string in this.str.
		 * This is called when the str parameter is provided.
		*/
		this.decode = function(){
			return this.decodeElm();
		}
		
		if(typeof(str) !== undefined){
			this.str = str;
		}
		if(typeof(unStrict) !== undefined){
			this.unStrict = unStrict;
		}
		if(this.str !== null) return this.decode();
	};
	
	// HFZPNA
