
var DEBUG = 0; //0��ʾ��ʵ���ݣ�1��ʾ��������
var ip = GlobalVarManager.getItemStr("ip");			// ip
var port = GlobalVarManager.getItemStr("port");		// �˿�
var account = GlobalVarManager.getItemStr("account");
Utility.println("common ip="+ip+"&port="+port+"&account="+account);
var playIp = "http://vod.fjgdwl.com:80/vod_portal/";//ȥvod���ŵ�·��
var returnIp = "http://vod.fjgdwl.com:80/news/wang/";//��vod���ص���Ӧ�õ�·��
var menuAssetIds = [["MANU0000000000078800","MANU0000000000078805"],["MANU0000000000071302","MANU0000000000071797"],
					["MANU0000000000071303","MANU0000000000071798"],["MANU0000000000077278","MANU0000000000077279"],
					["MANU0000000000077276","MANU0000000000077277"]];//��ά��һ��Ϊ�Ƽ���Ŀid,�ڶ���Ϊ�б��Ŀid

/*��������� start*/
var typeArr = ["����","����","����","�ۺ�"];
var assetIdArr = [["MANU0000000000053774","MANU0000000000053773","MANU0000000000053775"], //����
				  ["MANU0000000000054268","MANU0000000000053776","MANU0000000000054269"], //����
				  ["MANU0000000000054271","MANU0000000000054270","MANU0000000000054272"], //����
				  ["MANU0000000000053778","MANU0000000000053777","MANU0000000000054273"]]; //�ۺ�//һά�����һһ��Ӧ����ά��һ��Ϊ��������id,�ڶ���Ϊ��������id,������Ϊר��id
var topicAssetId = "MANU0000000000053768";//ר�⻨����id
var searchAssetId = "MANU0000000000051176";//����ʱ����������Ŀid�����ѵ����ǵ���ӰƬ����ֱ�Ӳ�
/*��������� end*/
var searchMenuAssetId = "MANU0000000000050996"; //�����Ĵ���Ŀid

/*������ҳ*/
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
	 * ��дjava�е�hashmap������eventFrame��������ݻ���
	 * @_maxLength�����ͣ�������Ŀ����
	 * ע�⣺
	 * 	1�������ж���Ŀ�Ƿ��Ѵ��ڣ������Ƿ񸲸����ݣ�Ҳ����ʹ��put����ʱ��������������������п��ƣ���������Ϊ�����Ѵ��ڵ�����
	 * 	2��deleteϵͳ���������ܲ���һЩvane�汾�м��֧��
	 */
	this.maxLength = typeof(_maxLength) == "undefined" ? 50 : _maxLength;

	this.hash = new Object();
	this.arry = new Array(); //��¼��Ŀ��key

	this.put = function(_key, _value, _notCover) {
		/**
		 * @_key���ַ�����
		 * @_value������������
		 * @_notCover�������ͣ��趨Ϊ��󲻽��и���
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
		if (this.arry.length >= this.maxLength) { //����Ķ��������ڹ涨���������
			var key = this.arry.shift(); //ɾ�������һ�����ݣ�����������ԭ����һ��Ԫ�ص�ֵ
			this.remove(key);
		}
	};
}

var hashTableObj = new hashTableClass(120);
/***************************************hashMap  end*******************************/

//*******************************��ȡ��׼URL�Ĳ��� start************************//
/**
 * ��ȡ��׼URL�Ĳ���
 * @_key���ַ�������֧����������������ͬ��key��
 * @_url���ַ�������window��.location.href��ʹ��ʱ�������window����
 * @_spliter���ַ�����������ָ���
 * ע�⣺
 * 	1���粻����ָ���������ؿ��ַ���������ֱ����ʾ��ʹ��ʱע���ж�
 * 	2���Ǳ�׼URL����
 * 	3��query��������hash��#���д��ڼ�ֵһ��ʱ�������鷵��
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
		if (urlParams.indexOf(spliter) != -1 || urlParams.indexOf(spliter_1) != -1) {//���ܳ��� url?a=1&b=3#c=2&d=5 url?a=1&b=2 url#a=1&b=2�������
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
//*****************************��ȡ��׼URL�Ĳ��� end********************//

//*******************�����ַ������ֳ��� Ӣ�Ļ������ַ������൱��һ������ start*******************//
/*
 *str:������ַ���
 *len:�ַ�������󳤶�
 *���ؽ�ȡ���ַ���
 */
function getStrChineseLen(str,len){
	var w = 0;
	str = str.replace(/[ ]*$/g,"");
	if(getStrChineseLength(str)>len){
		for (var i=0; i<str.length; i++) {
			 var c = str.charCodeAt(i);
			 var flag = 0;
			 //���ֽڼ�1
			 if ((c >= 0x0001 && c <= 0x007e) || (0xff60<=c && c<=0xff9f)) {
			   w++;
			   flag = 0;
			 }else {
			   w+=2;
			   flag = 1;
			 }
			 if(parseInt((w+1)/2)>len){
				if (flag == 1)return str.substring(0,i-1)+"..";//�޸�,sunny,��ֹ����...
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
     //���ֽڼ�1
     if ((c >= 0x0001 && c <= 0x007e) || (0xff60<=c && c<=0xff9f)) {
       w++;
     }else {
       w+=2;
     }
    } 	
	var length = w % 2 == 0 ? (w/2) : (parseInt(w/2)+1) ;
	return length;
  
}
//*******************�����ַ������ֳ��� Ӣ�Ļ������ַ������൱��һ������ end*******************//

/****************************ajax���� start**************************************/
function ajaxClass(_url, _successCallback, _failureCallback, _urlParameters, _callbackParams, _async, _charset, _timeout, _frequency, _requestTimes, _frame) {
	/**
	 * AJAXͨ��GET��POST�ķ�ʽ�����첽��ͬ����������
	 * ע�⣺
	 * 	1��������240 No Content�Ǳ�HTTP��׼��Ϊ����ɹ���
	 * 	2��Ҫʹ��responseXML�Ͳ�������_charset����Ҫֱ�Ӵ���null
	 * 	3��_frame������ʵ�����������ҳ������뾡����֤׼ȷ������������Խ��͵��쳣
	 */
	/**
	 * @param{string} _url: ����·��
	 * @param{function} _successCallback: ����ɹ���ִ�еĻص���������һ������������չһ������new XMLHttpRequest()�ķ���ֵ
	 * @param{function} _failureCallback: ����ʧ��/��ʱ��ִ�еĻص�����������ͬ�ɹ��ص�������.status��.statusText
	 * @param{string} _urlParameters: ����·������Ҫ���ݵ�url����/����
	 * @param{*} _callbackParams: �������ʱ�ڻص������д���Ĳ������Զ�������
	 * @param{boolean} _async: �Ƿ��첽���ã�Ĭ��Ϊtrue���첽��false��ͬ��
	 * @param{string} _charset: ���󷵻ص����ݵı����ʽ������iPanel�������IE6��֧�֣���Ҫ����XML����ʱ����ʹ��
	 * @param{number} _timeout: ÿ�η��������೤ʱ����û�гɹ�����������Ϊ����ʧ�ܶ��������󣨳�ʱ��
	 * @param{number} _frequency: ����ʧ�ܺ���೤ʱ����������һ��
	 * @param{number} _requestTimes: ����ʧ�ܺ�����������ٴ�
	 * @param{object} _frame: ���������Ҫ�ϸ���ƣ�������п��ܳ���ҳ���Ѿ������٣��ص���ִ�е����
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
		 * @param{string} _method: �������ݵķ�ʽ��POST/GET
		 * @param{string} _headers: �������ݵ�ͷ��Ϣ��json��ʽ
		 * @param{string} _username: ��������Ҫ��֤ʱ���û���
		 * @param{string} _password: ��������Ҫ��֤ʱ���û�����
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
		if (this.charset != null) { //Ҫʹ��responseXML�Ͳ������ô�����
			this.xmlHttp.overrideMimeType("text/html; charset=" + this.charset);
		}
		Utility.println("[xmlHttp] " + this.method + " url: " + url + ", data: " + data);
		this.xmlHttp.send(data);
	};
	this.stateChanged = function() { //״̬����
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
	this.checkStatus = function() { //��ʱ����ָ��ʱ����û�гɹ�������Ϣ����ʧ�ܴ���
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
		 * @param{object} _json: ���ݵĲ������ݴ���ֻ֧��json��ʽ
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
/****************************ajax���� end**************************************/

/**********************************��xml����ת��Ϊjson���� start***********************/

/*
** Dom��������
** ����xml�ļ���dom�ĵ�
** @frag:dom����, xml�ļ�����
** @return: ����һ����ֱ�ӱ����õ����ݶ���
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
	
	//�ж��Ƿ�����������˽�з���
	function inArray(a, arr) {
		for(var i = 0; i < arr.length; i++) {
			if(arr[i] == a) return true;
		}
		return false;
	}
	
	/*
	* nodeType:1(Ԫ��element),2:(����attr),3:(�ı�text),8:(ע��comments),9:(�ĵ�documents)
	*/
	//��ȡ���ı������ӽڵ�
	function getChilds(node) {
		var c = node.childNodes;// ���ذ�����ѡ�ڵ���ӽڵ��NodeList,���ѡ���Ľڵ�û���ӽڵ㣬������Է��ز������ڵ�� NodeList��
		var a = new Array;
		if(c != null) {
			for(var i = 0; i < c.length; i++) {
				if(c[i].nodeType != 3) a.push(c[i]);
			}
		}
		return a;
	}
	
	//��Ԫ���и��ݽڵ�������ȡԪ�ؼ���
	function getChildByTag(tag) {
		var a = new Array;
		for(var i = 0; i < len; i++) {
			if(childs[i].nodeName == tag) a.push(childs[i]);
		}
		return a;
	}
	
	//��ȡ�ڵ���ı�����������ӽڵ���ݹ�
	function getValue(node) {
		var c = getChilds(node);
		var obj_arr = new Object;
		if(c.length == 0) {
			if(node.firstChild){//�ı�
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

//������ԭ�������һ������תjson�ַ����ķ�������Ҫ����תjson����
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

//�ڶ���ԭ�������һ������תjson�ַ����ķ�������Ҫ����תjson����
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

/*****************************************��xml����ת��Ϊjson���� end****************************/

var util = {
	/**
	 * util.date��������������Date�йصĹ���
	 */
	date: {
		/**
		 * util.date.format����������������ڶ���d��ʽ��Ϊformatterָ���ĸ�ʽ
		 * @param {object} d ����Ҫ���и�ʽ����date����
		 * @param {string} formatter ������Ҫ�ĸ�ʽ���硰yyyy-MM-dd hh:mm:ss��
		 * @return {string} ��ʽ����������ַ������硰2008-09-01 14:00:00��							
		 */
		format: function(d, formatter) {
		    if(!formatter || formatter == "")
		    {
		        formatter = "yyyy-MM-dd";
		    }
			
			var weekdays = {
				chi: ["������", "����һ", "���ڶ�", "������", "������", "������", "������"],
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
 * showList��������þ��ǿ�����ҳ���б�������Ϣ���¹����л��Լ���ҳ��
 * @__listSize    �б���ʾ�ĳ��ȣ�
 * @__dataSize    �������ݵĳ��ȣ�
 * @__position    ���ݽ����λ�ã�
 * @__startplace  ҳ�潹��Div��ʼλ�õ�TOPֵ��
 */
function showList(__listSize, __dataSize, __position, __startplace, f){
	this.listSize = __listSize;  //�б���ʾ�ĳ��ȣ�
	this.dataSize = __dataSize;  //�������ݵĳ��ȣ�
	this.position = __position;  //���ݽ����λ�ã�
	this.tempSize = this.dataSize<this.listSize?this.dataSize:this.listSize;
	this.focusPos = this.dataSize-this.position<this.tempSize?this.tempSize-(this.dataSize-this.position):0; //ҳ�潹���λ�ã�

	this.listHigh = null;  //�б���ÿ���еĸ߶ȣ����������ݻ������飬���磺40 �� [40,41,41,40,42];
	this.focusDiv = null;  //ҳ�潹���ID���ƻ��߶���Ϊ�����������磺"focusDiv" �� new showSlip("focusDiv",0,3,40);
	this.focusPlace = new Array();  //��¼ÿ��ҳ�潹���λ��ֵ��
	this.startPlace = __startplace;	 //ҳ�潹��Div��ʼλ�õ�TOPֵ��
	
	this.haveData = function(){}; //����ʾ�б���Ϣʱ����������Ϣ�ͻ���ø÷�����
	this.notData = function(){}; //����ʾ�б���Ϣʱ����������Ϣ�ͻ���ø÷�����
	//���������������������յ�����Ϊ{idPos:Num, dataPos:Num}�Ķ��󣬸ö�������idPosΪҳ�潹���ֵ������dataPosΪ���ݽ����ֵ��
	
	this.focusUp  = function(){this.changeList(-1);}; //���������ƶ���
	this.focusDown= function(){this.changeList(1); }; //���������ƶ���
	this.pageUp   = function(){this.changePage(-1);}; //�б�����۶ҳ��
	this.pageDown = function(){this.changePage(1); }; //�б�����۶ҳ��
	
	//��ʼ��ʾ�б���Ϣ
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
	//�л����ݽ����λ��
	this.changeList = function(__num){
		if(this.position+__num<0||this.position+__num>this.dataSize-1) return;
		this.position += __num;
		if(this.focusPos+__num<0||this.focusPos+__num>this.listSize-1){
			this.showList();
		}else{
			this.changeFocus(__num);
		}	
	}
	//�л�ҳ���б�ҳ
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
	//�л�ҳ�潹���λ��
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
	//��ʾ�б���Ϣ
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