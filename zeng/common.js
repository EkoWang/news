
var DEBUG = 0; //0表示真实数据，1表示测试数据
var ip = GlobalVarManager.getItemStr("ip");			// ip
var port = GlobalVarManager.getItemStr("port");		// 端口
var account = GlobalVarManager.getItemStr("account");
Utility.println("common ip="+ip+"&port="+port+"&account="+account);
var playIp = "http://vod.fjgdwl.com:80/vod_portal/";//去vod播放的路径
var returnIp = "http://vod.fjgdwl.com:80/news/zeng/";//从vod返回到本应用的路径
var menuAssetIds = [["MANU0000000000051768","MANU0000000000078805"],["MANU0000000000051156","MANU0000000000081274"],
					["MANU0000000000051769","MANU0000000000078770"],["MANU0000000000068770","MANU0000000000068770"],
					["MANU0000000000052768","MANU0000000000068773"],["MANU0000000000051770","MANU0000000000068770"]];//二维第一个为推荐节目id,第二个为列表节目id

/*体育迷相关 start*/
var typeArr = ["最新","足球","篮球","综合"];
var assetIdArr = [["MANU0000000000053774","MANU0000000000053773","MANU0000000000053775"], //最新
				  ["MANU0000000000054268","MANU0000000000053776","MANU0000000000054269"], //足球
				  ["MANU0000000000054271","MANU0000000000054270","MANU0000000000054272"], //篮球
				  ["MANU0000000000053778","MANU0000000000053777","MANU0000000000054273"]]; //综合//一维与分类一一对应；二维第一个为最新赛事id,第二个为焦点新闻id,第三个为专题id
var topicAssetId = "MANU0000000000053768";//专题花絮的id
var searchAssetId = "MANU0000000000051176";//搜索时的体育迷栏目id，且搜到的是单条影片，可直接播
/*体育迷相关 end*/
var searchMenuAssetId = "MANU0000000000050996"; //搜索的大栏目id

/*返回首页*/
function gotoIndex(){
	var tvPortalUrl = GlobalVarManager.getItemStr("tvPortalUrl");
	Utility.println("common gotoIndex tvPortalUrl="+tvPortalUrl);
	window.location.href = tvPortalUrl;
	window.setTimeout('window.location.href = "ui://index.htm";',8000);
}

function $(_id){
	return document.getElementById(_id);	
}

//***************************************hashMap  start*******************************//
function hashTableClass(_maxLength) {
	/**
	 * 仿写java中的hashmap对象，在eventFrame里进行数据缓存
	 * @_maxLength：整型，缓存条目数量
	 * 注意：
	 * 	1、自行判定条目是否已存在，控制是否覆盖数据（也可在使用put方法时传入第三个布尔参数进行控制），否则将视为更新已存在的数据
	 * 	2、delete系统方法，可能不被一些vane版本中间件支持
	 */
	this.maxLength = typeof(_maxLength) == "undefined" ? 50 : _maxLength;

	this.hash = new Object();
	this.arry = new Array(); //记录条目的key

	this.put = function(_key, _value, _notCover) {
		/**
		 * @_key：字符串型
		 * @_value：不限制类型
		 * @_notCover：布尔型，设定为真后不进行覆盖
		 */
		if (typeof(_key) == "undefined") {
			return false;
		}
		if (this.contains(_key) == true) {
			if (_notCover) {
				return false;
			}
		}
		this.limit();
		if (this.contains(_key) == false) {
			this.arry.push(_key);
		}
		this.hash[_key] = typeof(_value) == "undefined" ? null : _value;
		return true;
	};
	this.get = function(_key) {
		if (typeof(_key) != "undefined") {
			if (this.contains(_key) == true) {
				return this.hash[_key];
			} else {
				return false;
			}
		} else {
			return false;
		}
	};
	this.remove = function(_key) {
		if (this.contains(_key) == true) {
			delete this.hash[_key];
			for (var i = 0, len = this.arry.length; i < len; i++) {
				if (this.arry[i] == _key) {
					this.arry.splice(i, 1);
					break;
				}
			}
			return true;
		} else {
			return false;
		}
	};
	//this.count = function() {var i = 0; for(var key in this.hash) {i++;} return i;};
	this.contains = function(_key) {
		return typeof(this.hash[_key]) != "undefined";
	};
	this.clear = function() {
		this.hash = {};
		this.arry = [];
	};
	this.limit = function() {
		if (this.arry.length >= this.maxLength) { //保存的对象数大于规定的最大数量
			var key = this.arry.shift(); //删除数组第一个数据，并返回数组原来第一个元素的值
			this.remove(key);
		}
	};
}

var hashTableObj = new hashTableClass(120);
/***************************************hashMap  end*******************************/

//*******************************获取标准URL的参数 start************************//
/**
 * 获取标准URL的参数
 * @_key：字符串，不支持数组参数（多个相同的key）
 * @_url：字符串，（window）.location.href，使用时别误传入非window对象
 * @_spliter：字符串，参数间分隔符
 * 注意：
 * 	1、如不存在指定键，返回空字符串，方便直接显示，使用时注意判断
 * 	2、非标准URL勿用
 * 	3、query（？）与hash（#）中存在键值一样时，以数组返回
 */
function getUrlParams(_key, _url, _spliter) {
	Utility.println("common.js===getUrlParams====_url" + _url);
	if (typeof(_url) == "object") {
		var url = _url.location.href;
	} else {
		var url = _url ? _url : window.location.href;
	}
	if (url.indexOf("?") == -1 && url.indexOf("#") == -1) {
		return "";
	}
	var spliter = _spliter || "&";
	var spliter_1 = "#";
	var haveQuery = false;
	var x_0 = url.indexOf(spliter);
	var x_1 = url.indexOf(spliter_1);
	var urlParams;
	if (x_0 != -1 || x_1 != -1 || url.indexOf("?") != -1) {
		if(url.indexOf("?") != -1) urlParams = url.split("?")[1];
		else if(url.indexOf("#") != -1) urlParams = url.split("#")[1];
		else urlParams = url.split(spliter)[1];
		if (urlParams.indexOf(spliter) != -1 || urlParams.indexOf(spliter_1) != -1) {//可能出现 url?a=1&b=3#c=2&d=5 url?a=1&b=2 url#a=1&b=2的情况。
			var v = [];
			if(urlParams.indexOf(spliter_1) != -1){
				v = urlParams.split(spliter_1);
				urlParams = [];
				for(var x = 0; x < v.length; x++){
					urlParams = urlParams.concat(v[x].split(spliter));
				}
			}else{
				urlParams = urlParams.split(spliter);
			}
		} else {
			urlParams = [urlParams];
		}
		haveQuery = true;
	} else {
		urlParams = [url];
	}
	var valueArr = [];
	for (var i = 0, len = urlParams.length; i < len; i++) {
		var params = urlParams[i].split("=");
		if (params[0] == _key) {
			valueArr.push(params[1]);
		}
	}
	if (valueArr.length > 0) {
		if (valueArr.length == 1) {
			return valueArr[0];
		}
		return valueArr;
	}
	return "";
}
//*****************************获取标准URL的参数 end********************//

//*******************返回字符串汉字长度 英文或特殊字符两个相当于一个汉字 start*******************//
/*
 *str:传入的字符串
 *len:字符串的最大长度
 *返回截取的字符串
 */
function getStrChineseLen(str,len){
	var w = 0;
	str = str.replace(/[ ]*$/g,"");
	if(getStrChineseLength(str)>len){
		for (var i=0; i<str.length; i++) {
			 var c = str.charCodeAt(i);
			 var flag = 0;
			 //单字节加1
			 if ((c >= 0x0001 && c <= 0x007e) || (0xff60<=c && c<=0xff9f)) {
			   w++;
			   flag = 0;
			 }else {
			   w+=2;
			   flag = 1;
			 }
			 if(parseInt((w+1)/2)>len){
				if (flag == 1)return str.substring(0,i-1)+"..";//修改,sunny,防止换行...
				else return str.substring(0,i-2)+"..";
				break;
			 }
		 
		} 
	}
	return str; 
}

function getStrChineseLength(str){
	str = str.replace(/[ ]*$/g,"");
	var w = 0;
	for (var i=0; i<str.length; i++) {
     var c = str.charCodeAt(i);
     //单字节加1
     if ((c >= 0x0001 && c <= 0x007e) || (0xff60<=c && c<=0xff9f)) {
       w++;
     }else {
       w+=2;
     }
    } 	
	var length = w % 2 == 0 ? (w/2) : (parseInt(w/2)+1) ;
	return length;
  
}
//*******************返回字符串汉字长度 英文或特殊字符两个相当于一个汉字 end*******************//

/****************************ajax请求 start**************************************/
function ajaxClass(_url, _successCallback, _failureCallback, _urlParameters, _callbackParams, _async, _charset, _timeout, _frequency, _requestTimes, _frame) {
	/**
	 * AJAX通过GET或POST的方式进行异步或同步请求数据
	 * 注意：
	 * 	1、服务器240 No Content是被HTTP标准视为请求成功的
	 * 	2、要使用responseXML就不能设置_charset，需要直接传入null
	 * 	3、_frame，就是实例化本对象的页面对象，请尽量保证准确，避免出现难以解释的异常
	 */
	/**
	 * @param{string} _url: 请求路径
	 * @param{function} _successCallback: 请求成功后执行的回调函数，带一个参数（可扩展一个）：new XMLHttpRequest()的返回值
	 * @param{function} _failureCallback: 请求失败/超时后执行的回调函数，参数同成功回调，常用.status，.statusText
	 * @param{string} _urlParameters: 请求路径所需要传递的url参数/数据
	 * @param{*} _callbackParams: 请求结束时在回调函数中传入的参数，自定义内容
	 * @param{boolean} _async: 是否异步调用，默认为true：异步，false：同步
	 * @param{string} _charset: 请求返回的数据的编码格式，部分iPanel浏览器和IE6不支持，需要返回XML对象时不能使用
	 * @param{number} _timeout: 每次发出请求后多长时间内没有成功返回数据视为请求失败而结束请求（超时）
	 * @param{number} _frequency: 请求失败后隔多长时间重新请求一次
	 * @param{number} _requestTimes: 请求失败后重新请求多少次
	 * @param{object} _frame: 窗体对象，需要严格控制，否则会有可能出现页面已经被销毁，回调还执行的情况
	 */
	this.url = _url || "";
	this.successCallback = _successCallback || function(_xmlHttp, _params) {
		Utility.println("[xmlHttp] responseText: " + _xmlHttp.responseText);
	};
	this.failureCallback = _failureCallback || function(_xmlHttp, _params) {
		Utility.println("[xmlHttp] status: " + _xmlHttp.status + ", statusText: " + _xmlHttp.statusText);
	};
	this.urlParameters = _urlParameters || "";
	this.callbackParams = _callbackParams || null;
	this.async = typeof(_async) == "undefined" ? true : _async;
	this.charset = _charset || null;
	this.timeout = _timeout || 5000; //20s
	this.frequency = _frequency || 500; //10s
	this.requestTimes = _requestTimes || 1;
	this.frame = _frame || window;

	this.timer = -1;
	this.counter = 0;

	this.method = "GET";
	this.headers = null;
	this.username = "";
	this.password = "";

	this.createXmlHttpRequest = function() {
		var xmlHttp = null;
		try { //Standard
			xmlHttp = new XMLHttpRequest();
		} catch (exception) { //Internet Explorer
			try {
				xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
			} catch (exception) {
				try {
					xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
				} catch (exception) {
					return false;
				}
			}
		}
		return xmlHttp;
	};
	this.xmlHttp = this.createXmlHttpRequest();

	this.requestData = function(_method, _headers, _username, _password) {
		/**
		 * @param{string} _method: 传递数据的方式，POST/GET
		 * @param{string} _headers: 传递数据的头信息，json格式
		 * @param{string} _username: 服务器需要认证时的用户名
		 * @param{string} _password: 服务器需要认证时的用户密码
		 */
		this.frame.clearTimeout(this.timer);
		this.method = typeof(_method) == "undefined" ? "GET" : (_method.toLowerCase() == "post") ? "POST" : "GET";
		this.headers = typeof(_headers) == "undefined" ? null : _headers;
		this.username = typeof(_username) == "undefined" ? "" : _username;
		this.password = typeof(_password) == "undefined" ? "" : _password;
		Utility.println("[xmlHttp] method=" + this.method + "-->headers=" + _headers + "-->username=" +  this.username + "-->password=" + this.password);
		var target = this;
		var url;
		var data;
		this.xmlHttp.onreadystatechange = function() {
			target.stateChanged();
		};
		if (this.method == "POST") { //encodeURIComponent
			url = encodeURI(this.url);
			data = this.urlParameters;
		} else {
			url = encodeURI(this.url + (((this.urlParameters != "" && this.urlParameters.indexOf("?") == -1) && this.url.indexOf("?") == -1) ? ("?" + this.urlParameters) : this.urlParameters));
			data = null;
		}
		Utility.println("[xmlHttp] username=" + this.username + "-->xmlHttp=" + this.xmlHttp + "typeof(open)=" + typeof(this.xmlHttp.open));
		if (this.username != "") {
			this.xmlHttp.open(this.method, url, this.async, this.username, this.password);
		} else {
			this.xmlHttp.open(this.method, url, this.async);
		}
		Utility.println("[xmlHttp] method=" + this.method + "-->url=" + url + "-->async=" + this.async);
		var contentType = false;
		if (this.headers != null) {
			for (var key in this.headers) {
				if (key.toLowerCase() == "content-type") {
					contentType = true;
				}
				Utility.println("common__contentType=" + contentType);
				this.xmlHttp.setRequestHeader(key, this.headers[key]);
			}
		}
		if (!contentType) {
			Utility.println("[xmlHttp] setRequestHeader");
			//this.xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			//this.xmlHttp.setRequestHeader("Content-type","text/xml;charset=utf-8");
			this.xmlHttp.setRequestHeader("Content-type","application/xml;charset=utf-8")
		}
		if (this.charset != null) { //要使用responseXML就不能设置此属性
			this.xmlHttp.overrideMimeType("text/html; charset=" + this.charset);
		}
		Utility.println("[xmlHttp] " + this.method + " url: " + url + ", data: " + data);
		this.xmlHttp.send(data);
	};
	this.stateChanged = function() { //状态处理
		if (this.xmlHttp.readyState < 2) {
			Utility.println("[xmlHttp] readyState=" + this.xmlHttp.readyState);
		} else {
			Utility.println("[xmlHttp] readyState=" + this.xmlHttp.readyState + ", status=" + this.xmlHttp.status);
		}

		var target = this;
		if (this.xmlHttp.readyState == 2) {
			this.timer = this.frame.setTimeout(function() {
				target.checkStatus();
			}, this.timeout);
		} else if (this.xmlHttp.readyState == 3) {
			if (this.xmlHttp.status == 401) {
				Utility.println("[xmlHttp] Authentication, need correct username and pasword");
			}
		} else if (this.xmlHttp.readyState == 4) {
			this.frame.clearTimeout(this.timer);
			if (this.xmlHttp.status == 200 || this.xmlHttp.status == 204) {
				this.success();
			} else {
				this.failed();
			}
		}
	};
	this.success = function() {
		if (this.callbackParams == null) {
			this.successCallback(this.xmlHttp);
		} else {
			this.successCallback(this.xmlHttp, this.callbackParams);
		}
		this.counter = 0;
	};
	this.failed = function() {
		if (this.callbackParams == null) {
			this.failureCallback(this.xmlHttp);
		} else {
			this.failureCallback(this.xmlHttp, this.callbackParams);
		}
		this.counter = 0;
	};
	this.checkStatus = function() { //超时处理，指定时间内没有成功返回信息按照失败处理
		if (this.xmlHttp.readyState != 4) {
			if (this.counter < this.requestTimes) {
				this.requestAgain();
			} else {
				Utility.println("[xmlHttp] readyState=" + this.xmlHttp.readyState + ", status=" + this.xmlHttp.status + " timeout");
				this.failed();
				this.requestAbort();
			}
		}
	};
	this.requestAgain = function() {
		this.requestAbort();
		var target = this;
		this.frame.clearTimeout(this.timer);
		this.timer = this.frame.setTimeout(function() {
			Utility.println("[xmlHttp] request again");
			target.counter++;
			target.requestData(target.method, target.headers, target.username, target.password);
		}, this.frequency);
	};
	this.requestAbort = function() {
		Utility.println("[xmlHttp] call abort");
		this.frame.clearTimeout(this.timer);
		this.xmlHttp.abort();
		Utility.println("[xmlHttp] call abort has called");
	};
	this.addParameter = function(_json) {
		/**
		 * @param{object} _json: 传递的参数数据处理，只支持json格式
		 */
		var url = this.url;
		var str = this.urlParameters;
		for (var key in _json) {
			if (url.indexOf("?") != -1) {
				url = "";
				if (str == "") {
					str = "&" + key + "=" + _json[key];
				} else {
					str += "&" + key + "=" + _json[key];
				}
				continue;
			}
			if (str == "") {
				str += "?";
			} else {
				str += "&";
			}
			str += key + "=" + _json[key];
		}
		this.urlParameters = str;
		return str;
	};
	this.getResponseXML = function() { //reponseXML of AJAX is null when response header 'Content-Type' is not include string 'xml', not like 'text/xml', 'application/xml' or 'application/xhtml+xml'
		if (this.xmlHttp.responseXML != null) {
			return this.xmlHttp.responseXML;
		} else if (this.xmlHttp.responseText.indexOf("<?xml") != -1) {
			return typeof(DOMParser) == "function" ? (new DOMParser()).parseFromString(this.xmlHttp.responseText, "text/xml") : (new ActivexObject("MSXML2.DOMDocument")).loadXML(this.xmlHttp.responseText);
		}
		return null;
	};
}
/****************************ajax请求 end**************************************/

/**********************************将xml对象转化为json对象 start***********************/

/*
** Dom解析函数
** 适用xml文件和dom文档
** @frag:dom对象, xml文件数据
** @return: 返回一个可直接被引用的数据对象
*/
function parseDom(frag) {
	var obj = new Object;
	var childs = getChilds(frag);
	var len = childs.length;
	var attrs = frag.attributes;
	if(attrs != null) {
		for(var i = 0; i < attrs.length; i++) {
			Utility.println("common__parseDom__nodeName=" + attrs[i].nodeName + "__nodeValue=" + attrs[i].nodeValue);
			obj[attrs[i].nodeName] = attrs[i].nodeValue;
		}
	}
	if(len == 0){
		return obj;
	}
	else
	{
		var tags = new Array();
		for(var i = 0; i < len; i++) {
			if(!inArray(childs[i].nodeName, tags)) tags.push(childs[i].nodeName);
		}

		for(var i = 0; i < tags.length; i++) {
			var nodes = getChildByTag(tags[i]);
			obj[tags[i]] = new Array;
			for(var j = 0; j < nodes.length; j++) {
				obj[tags[i]].push(getValue(nodes[j]));
			}
		}
	}
	return obj;
	
	//判断是否存在于数组的私有方法
	function inArray(a, arr) {
		for(var i = 0; i < arr.length; i++) {
			if(arr[i] == a) return true;
		}
		return false;
	}
	
	/*
	* nodeType:1(元素element),2:(属性attr),3:(文本text),8:(注释comments),9:(文档documents)
	*/
	//获取非文本类型子节点
	function getChilds(node) {
		var c = node.childNodes;// 返回包含被选节点的子节点的NodeList,如果选定的节点没有子节点，则该属性返回不包含节点的 NodeList。
		var a = new Array;
		if(c != null) {
			for(var i = 0; i < c.length; i++) {
				if(c[i].nodeType != 3) a.push(c[i]);
			}
		}
		return a;
	}
	
	//子元素中根据节点名来获取元素集合
	function getChildByTag(tag) {
		var a = new Array;
		for(var i = 0; i < len; i++) {
			if(childs[i].nodeName == tag) a.push(childs[i]);
		}
		return a;
	}
	
	//获取节点的文本，如果存在子节点则递归
	function getValue(node) {
		var c = getChilds(node);
		var obj_arr = new Object;
		if(c.length == 0) {
			if(node.firstChild){//文本
				obj_arr.value = node.firstChild.nodeValue;
			}
			var attrs = node.attributes;
			if(attrs != null){
				for(var i = 0; i < attrs.length; i++) {
					obj_arr[attrs[i].nodeName] = attrs[i].nodeValue;
				}
			}
			return obj_arr;
		}
		else return parseDom(node);
	}
}

function parseJson(str) {
	//Utility.println("parse.js_parseJson_str="+str);
	eval('var val = ' + str + ';');
	return val;
}

//在数组原型上添加一个数组转json字符串的方法，需要对象转json方法
Array.prototype.toJson = function () {
	var arr = new Array;
	for(var i = 0; i < this.length; i++) {
		switch(typeof this[i]) {
			case 'number':
				arr[i] = this[i];
				break;
			case 'boolean':
				arr[i] = this[i];
				break;
			case 'string':
				arr[i] = '"' + this[i].replace(/"/g, '\\\"') + '"';
				break;
			case 'object':
				arr[i] = this[i].toJson();
				break;
		}
	}
	return '[' + arr.join(', ') + ']';
};

//在对象原型上添加一个数组转json字符串的方法，需要数组转json方法
Object.prototype.toJson = function () {
	if(typeof this == 'object') {
		if(this instanceof Array) {
			return this.toJson();
		} else {
			var arr = new Array;
			var str = '';
			for(var p in this) {
				if(typeof this[p] == 'function') break;
				switch(typeof this[p]) {
					case 'number':
						str = this[p];
						break;
					case 'boolean':
						str = this[p];
						break;
					case 'string':
						str = '"' + this[p].replace(/"/g, '\\\"') + '"';
						break;
					case 'object':
						str = this[p].toJson();
						break;
				}
				arr.push(p + ':' + str);
			}
			return '{' + arr.join(', ') + '}';
		}
	} else return 'not object';
};

/*****************************************将xml对象转换为json对象 end****************************/

var util = {
	/**
	 * util.date对象，用来放置与Date有关的工具
	 */
	date: {
		/**
		 * util.date.format方法，将传入的日期对象d格式化为formatter指定的格式
		 * @param {object} d 传入要进行格式化的date对象
		 * @param {string} formatter 传入需要的格式，如“yyyy-MM-dd hh:mm:ss”
		 * @return {string} 格式化后的日期字符串，如“2008-09-01 14:00:00”							
		 */
		format: function(d, formatter) {
		    if(!formatter || formatter == "")
		    {
		        formatter = "yyyy-MM-dd";
		    }
			
			var weekdays = {
				chi: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
				eng: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
			};
		    var year = d.getYear().toString();
		    var month = (d.getMonth() + 1).toString();
		    var date = d.getDate().toString();
		    var day = d.getDay();
			var hour = d.getHours().toString();
			var minute = d.getMinutes().toString();
			var second = d.getSeconds().toString();

			var yearMarker = formatter.replace(/[^y|Y]/g,'');
			if(yearMarker.length == 2) {
				year = year.substring(2,4);
			} else if (yearMarker.length == 0) {
				year = "";
			}

			var monthMarker = formatter.replace(/[^M]/g,'');
			if(monthMarker.length > 1) {
				if(month.length == 1) {
					month = "0" + month;
				}
			} else if (monthMarker.length == 0) {
				month = "";
			}

			var dateMarker = formatter.replace(/[^d]/g,'');
			if(dateMarker.length > 1) {
				if(date.length == 1) {
					date = "0" + date;
				}
			} else if (dateMarker.length == 0) {
				date = "";
			}

			var hourMarker = formatter.replace(/[^h]/g, '');
			if(hourMarker.length > 1) {
				if(hour.length == 1) {
					hour = "0" + hour;
				}
			} else if (hourMarker.length == 0) {
				hour = "";
			}

			var minuteMarker = formatter.replace(/[^m]/g, '');
			if(minuteMarker.length > 1) {
				if(minute.length == 1) {
					minute = "0" + minute;
				}
			} else if (minuteMarker.length == 0) {
				minute = "";
			}

			var secondMarker = formatter.replace(/[^s]/g, '');
			if(secondMarker.length > 1) {
				if(second.length == 1) {
					second = "0" + second;
				}
			} else if (secondMarker.length == 0) {
				second = "";
			}
		    
		    var dayMarker = formatter.replace(/[^w]/g, '');
		    var lang = user.UILanguage;
		    var result = formatter.replace(yearMarker,year).replace(monthMarker,month).replace(dateMarker,date).replace(hourMarker,hour).replace(minuteMarker,minute).replace(secondMarker,second); 
			if (dayMarker.length != 0) {
				result = result.replace(dayMarker,weekdays[lang][day]);
			}
		    return result;
		},
        
        getDate: function(offset) {
            var d = new Date();
            var year = d.getYear();
            var month = d.getMonth();
            var date = d.getDate();
            var hour = d.getHours();
            var minute = d.getMinutes();
            var second = d.getSeconds();
            
            var dd = new Date(year, month, (date+offset), hour, minute, second);
            return dd;
        }
	}
}

/*
 * showList对象的作用就是控制在页面列表数据信息上下滚动切换以及翻页；
 * @__listSize    列表显示的长度；
 * @__dataSize    所有数据的长度；
 * @__position    数据焦点的位置；
 * @__startplace  页面焦点Div开始位置的TOP值；
 */
function showList(__listSize, __dataSize, __position, __startplace, f){
	this.listSize = __listSize;  //列表显示的长度；
	this.dataSize = __dataSize;  //所有数据的长度；
	this.position = __position;  //数据焦点的位置；
	this.tempSize = this.dataSize<this.listSize?this.dataSize:this.listSize;
	this.focusPos = this.dataSize-this.position<this.tempSize?this.tempSize-(this.dataSize-this.position):0; //页面焦点的位置；

	this.listHigh = null;  //列表中每个行的高度，可以是数据或者数组，例如：40 或 [40,41,41,40,42];
	this.focusDiv = null;  //页面焦点的ID名称或者定义为滑动对象，例如："focusDiv" 或 new showSlip("focusDiv",0,3,40);
	this.focusPlace = new Array();  //记录每行页面焦点的位置值；
	this.startPlace = __startplace;	 //页面焦点Div开始位置的TOP值；
	
	this.haveData = function(){}; //在显示列表信息时，有数据信息就会调用该方法；
	this.notData = function(){}; //在显示列表信息时，无数据信息就会调用该方法；
	//调用以上两个方法都会收到参数为{idPos:Num, dataPos:Num}的对象，该对象属性idPos为页面焦点的值，属性dataPos为数据焦点的值；
	
	this.focusUp  = function(){this.changeList(-1);}; //焦点向上移动；
	this.focusDown= function(){this.changeList(1); }; //焦点向下移动；
	this.pageUp   = function(){this.changePage(-1);}; //列表向上鄱页；
	this.pageDown = function(){this.changePage(1); }; //列表向下鄱页；
	
	//开始显示列表信息
	this.startShow = function(){
		this.focusPlace[0]= this.startPlace;
		if(typeof(this.listHigh)=="number"){
			for(var i=1; i<this.listSize; i++) this.focusPlace[i] = this.listHigh*i+this.startPlace;
		}else if(typeof(this.listHigh)=="object"){
			for(var i=1; i<this.listSize; i++) this.focusPlace[i] = typeof(this.listHigh[i-1])=="undefined"?this.listHigh[this.listHigh.length-1]+this.focusPlace[i-1]:this.listHigh[i-1]+this.focusPlace[i-1];
		}
		if(typeof(this.focusDiv)=="string"){
			if (typeof(f) == "object"){
				f.document.getElementById(this.focusDiv).style.top = this.focusPlace[this.focusPos]
			} else {
				document.getElementById(this.focusDiv).style.top = this.focusPlace[this.focusPos];
			}
		}else{
			this.focusDiv.tunePlace(this.focusPlace[this.focusPos]);
		}
		this.showList();
	}
	//切换数据焦点的位置
	this.changeList = function(__num){
		if(this.position+__num<0||this.position+__num>this.dataSize-1) return;
		this.position += __num;
		if(this.focusPos+__num<0||this.focusPos+__num>this.listSize-1){
			this.showList();
		}else{
			this.changeFocus(__num);
		}	
	}
	//切换页面列表翻页
	this.changePage = function(__num){
		var tempPos = this.position-this.focusPos;
		if((tempPos==0 && __num<0)||(tempPos==this.dataSize-this.tempSize && __num>0)) return;
		tempPos += __num*this.tempSize;
		if(tempPos<0){
			tempPos = 0;
		}else if(tempPos>this.dataSize-this.tempSize){
			tempPos = this.dataSize-this.tempSize;
		}
		if(this.focusPos!=0) this.changeFocus(this.focusPos*-1);
		this.position = tempPos;
		this.showList();
	}
	//切换页面焦点的位置
	this.changeFocus = function(__num){
		this.focusPos += __num;		
		if(typeof(this.focusDiv)=="string"){
			if (typeof(f) == "object"){
				f.document.getElementById(this.focusDiv).style.top = this.focusPlace[this.focusPos];
			} else {
				document.getElementById(this.focusDiv).style.top = this.focusPlace[this.focusPos];
			}
		}else{
			this.focusDiv.moveStart(__num/Math.abs(__num), Math.abs(this.focusPlace[this.focusPos-__num]-this.focusPlace[this.focusPos]));
		}
	}
	//显示列表信息
	this.showList = function(){
		var tempPos = this.position-this.focusPos;
		for(var i=tempPos; i<tempPos+this.listSize; i++){
			if(i<this.dataSize){
				this.haveData({idPos:i-tempPos, dataPos:i});
			}else{
				this.notData({idPos:i-tempPos, dataPos:i});
			}
		}
	}
}