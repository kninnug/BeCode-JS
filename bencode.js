	/**
	 * Javascript bencode-encoder
	 *
	 * @author Marco Gunnink
	 * @version 1.0-alpha
	 * @package BeCode-JS
	 *
	 * "I took my love down to Violet Hill, there we sat in the snow. All the time she was silent still, 
	 * said 'If you love me won't you let me know, if you love me won't you let me know'."
	*/
	
	/**
	 * Be-Encode a Javascript variable
	 * More details on the bencode-specification here: {@link http://wiki.theory.org/BitTorrentSpecification#bencoding}
	 *
	 * I have added 1 unofficial extension: f<floating-point-value>e. This will only work if unStrict = true.
	 *
	 * @param mixed obj the Javascript-variable to encode
	 * @param bool unStrict if set to true floating-point-values will be encoded as f<float>e
	*/
	var BEncode = function(obj, unStrict){
		this.obj = null, this.unStrict = false;
		
		/**
		 * Strings are encoded this way: <length>:<value>
		 *
		 * @param String the string to encode
		 * @return String the bencoded representation
		*/
		this.encodeString = function(str){
			return str.length+":"+str;
		}
		
		/**
		 * Integers are encoded this way: i<integer>e
		 * Floats are encoded this way: f<float>e, but only when unStrict = true.
		 *
		 * @param Number the integer/float to encode
		 * @return String the bencoded representation
		*/
		this.encodeNumber = function(i){
			if(/\./.test(i.toString())){
				if(unStrict){
					return "f"+i+"e";
				}
				throw new Error("Floating-point values are only allowed when unStrict = true.");
				return null;
			}
			return "i"+i+"e";
		}
		
		/**
		 * Objects are either lists or dictionaries.
		 * Depending on wether the keys are numeric or not, 
		 * the object is encoded as either a list or dictionary, respectively.
		 * 
		 * Lists are encoded this way: l<bencoded-values>e
		 * Dictionaries this way: d<bencoded-string:key><bencoded-value>e
		 *
		 * @param Object|Array the object to encode
		 * @return String the bencoded representation
		*/
		this.encodeObject = function(obj){
			var allNum = true, ret = null;
			for(var x in dict){ // because it's such a pain in the arse to detect wether something is an array or dictionary
				if(isNaN(x)){ allNum = false; break; } // we go for the opportunistic way and just see wether the keys are numeric
			}
			if(allNum){
				ret = "l";
				for(var x = 0; x < obj.length; x++){
					ret += this.encodeElm(list[x]);
				}
				ret += "e";
				return ret;
			}else{
				ret = "d";
				for(var x in obj){
					ret += this.encodeString(x);
					ret += this.encodeElm(dict[x]);
				}
				ret += "e";
				return ret;
			}
			throw new Error("¬(a & ¬a) Your computer just lost its sense of logic, prepare for flying pigs and the end of time");
			return null;
		}
		
		/**
		 * This function looks at the variable-type and hands off encoding to the designated function
		 *
		 * @param mixed elm the element to encode
		 * @return String the encoded string
		*/
		this.encodeElm = function(elm){
			switch(typeof(elm)){
				case "string":
					return this.encodeString(elm);
				break;
				case "number":
					return this.encodeNumber(elm);
				break;
				case "object":
					return this.encodeObject(elm);
				break;
				default:
					return null;
				break;
			}
		}
		
		/**
		 * This function encodes the object
		 * It is called automatically when parameter obj is provided.
		 *
		 * @return String the bencoded object
		*/
		this.encode = function(){
			return this.encodeElm(this.obj);
		}
				
		if(typeof(obj) !== undefined){
			this.obj = obj;
		}
		if(typeof(unStrict) !== undefined){
			this.unStrict = unStrict;
		}
		if(this.obj !== null) return this.encode();
	}
	
	// HFZPNA
