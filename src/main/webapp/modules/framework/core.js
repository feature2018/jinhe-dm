/*********************************** 常用函数  start **********************************/

/* 对象类型 */
_TYPE_NUMBER = "number";
_TYPE_OBJECT = "object";
_TYPE_FUNCTION = "function";
_TYPE_STRING = "string";
_TYPE_BOOLEAN = "boolean";

/* 常用方法缩写 */
$$ = function(id) {
	return document.getElementById(id);
}

var bind = function(object, fun) {
	return function() {
		return fun.apply(object, arguments);
	}
}

/*
 * 判断值是否为null或空字符串
 */
function isNullOrEmpty(value) {
	return (value == null || (typeof(value) == 'string' && value == ""));
}

/* 前台单元测试断言 */
function assertEquals(actual, expect, msg) {
	if( expect != actual ) {
		alert(msg || "" + "[expect: " + expect + ", actual: " + actual + "]");
	}
}

function assertTrue(result, msg) {
	if( !result && msg ) {
		alert(msg);
	}
}

function assertNotNull(result, msg) {
	if( result == null && msg ) {
		alert(msg);
	}
}


/* 对象名称：Public（全局静态对象） */
var Public = {};

/* 浏览器类型 */
_BROWSER_IE = "IE";
_BROWSER_FF = "FIREFOX";
_BROWSER_OPERA = "OPERA";
_BROWSER_CHROME = "CHROME";
_BROWSER = _BROWSER_IE;

Public.checkBrowser = function() {
	var ua = navigator.userAgent.toUpperCase(); 
	if(ua.indexOf(_BROWSER_IE)!=-1) {
		_BROWSER = _BROWSER_IE;
	}
	else if(ua.indexOf(_BROWSER_FF)!=-1) {
		_BROWSER = _BROWSER_FF;
	}
	else if(ua.indexOf(_BROWSER_OPERA)!=-1) {
		_BROWSER = _BROWSER_OPERA;
	}
	else if(ua.indexOf(_BROWSER_CHROME) != -1 ) {
		_BROWSER = _BROWSER_CHROME;
	}
}
Public.checkBrowser();

Public.isIE = function() {
	return _BROWSER == _BROWSER_IE;
}

Public.isChrome = function() {
	return _BROWSER == _BROWSER_CHROME;
}

Public.executeCommand = function(callback, param) {
	var returnVal;
	try {
		switch (typeof(callback))
		{
		case _TYPE_STRING:
			returnVal = eval(callback);
			break;
		case _TYPE_FUNCTION:
			returnVal = callback(param);
			break;
		case _TYPE_BOOLEAN:
			returnVal = callback;
			break;
		}
	} catch (e) {
		alert(e.message);
		returnVal = false;
	}
	return returnVal;
}

/* 显示等待状态 */
var waitingLayerCount = 0;
Public.showWaitingLayer = function () {
	var waitingDiv = $$("_waitingDiv");
	if(waitingDiv == null) {
		waitingDiv = document.createElement("div");    
		waitingDiv.id = "_waitingDiv";    
		waitingDiv.style.width ="100%";    
		waitingDiv.style.height = "100%";    
		waitingDiv.style.position = "absolute";    
		waitingDiv.style.left = "0px";   
		waitingDiv.style.top = "0px";   
		waitingDiv.style.cursor = "wait"; 
		waitingDiv.style.zIndex = "10000";
		waitingDiv.style.background = "black";   
		Element.setOpacity(waitingDiv, 10);

		document.body.appendChild(waitingDiv);
	}

	if( waitingDiv ) {
		waitingDiv.style.display = "block";
	}

	waitingLayerCount ++;
}

Public.hideWaitingLayer = function() {
	waitingLayerCount --;

	var waitingDiv = $$("_waitingDiv");
	if( waitingDiv && waitingLayerCount <= 0 ) {
		waitingDiv.style.display = "none";
	}
}

Public.initBrowser = function() {
	if(window.dialogArguments) {
		var title = window.dialogArguments.title;
		if( title  ) {
			document.write("<title>" + title + new Array(100).join("　") + "</title>");
		}
	}

	/* 禁止鼠标右键 */
	document.oncontextmenu = function(eventObj) {
		eventObj = eventObj || window.event;
		var srcElement = Event.getSrcElement(eventObj);
		var tagName = srcElement.tagName.toLowerCase();
		if("input" != tagName && "textarea" != tagName) {
			preventDefault(event);            
		}
	}
}
Public.initBrowser();

// -------------------------------------------------- 添加方法，以兼容FireFox、Chrome -----------------------------------------------
if(!window.getComputedStyle) {
  window.getComputedStyle = function(target) {
    return target.currentStyle;
  };
}


function preventDefault(event) {
	if (event.preventDefault) {
		event.preventDefault();
	} else {
		event.returnValue = false;
	}
}

if ( !Public.isIE() ) {
	Element.prototype.selectNodes = function(p_xPath) {
		var m_Evaluator = new XPathEvaluator();
		var m_Result = m_Evaluator.evaluate(p_xPath, this, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);

		var m_Nodes = [];
		if (m_Result) {
			var m_Element;
			while (m_Element = m_Result.iterateNext()) {
				m_Nodes.push(m_Element);
			}
		} 
		return m_Nodes;
	};

	Element.prototype.selectSingleNode = function(p_xPath) {
		var m_Evaluator = new XPathEvaluator();
		var m_Result = m_Evaluator.evaluate(p_xPath, this, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);

		if (m_Result) {
			return m_Result.singleNodeValue;
		} else {
			return null;
		}
	};
}


/* 负责生成对象唯一编号（为了兼容FF） */

/* 默认唯一编号名前缀 */
_UNIQUE_ID_DEFAULT_PREFIX = "_default_id";

var UniqueID = {};
UniqueID.key = 0;

UniqueID.generator = function(prefix) {
	var uid = String(prefix || _UNIQUE_ID_DEFAULT_PREFIX) + String(this.key);
	this.key ++;
	return uid;
}


/* 缓存页面数据（xml、变量等） */
var Cache = {};
Cache.Variables = new Collection();
Cache.XmlDatas  = new Collection();

/*
 *	删除缓存(公用)
 *	参数：	string:cacheID      缓存数据id
			boolean:flag        是否清除关联的XML数据
 */
function delCacheData(cacheID, flag) {
	var cacheData = Cache.Variables.get(cacheID);
	Cache.Variables.del(cacheID);

	if( flag ) {
		for(var i=0; cacheData && i < cacheData.length; i++) {
			Cache.XmlDatas.del(cacheData[i]);
		}
	}
}

/* 集合类: 类似java Map */
function Collection() {
	this.items = {};
}

Collection.prototype.add = function(id, item) {
	this.items[id] = item;
}

Collection.prototype.del = function(id) {
	delete this.items[id];
}

Collection.prototype.clear = function() {
	this.items = {};
}

Collection.prototype.get = function(id) {
	return this.items[id];
}

/*
 *	原型继承
 *	参数：	function:Class		将被继承的类
 */
Collection.prototype.inherit = function(Class) {
	var inheritClass = new Class();
	for(var item in inheritClass) {
		this[item] = inheritClass[item];
	}
}


/* 
 * 负责管理页面上cookie数据.
 * Chrome只支持在线网站的cookie的读写操作，对本地html的cookie操作是禁止的。
 */
var Cookie = {};

Cookie.setValue = function(name, value, expires, path) {
	if(expires == null) {
		var exp = new Date();
		exp.setTime(exp.getTime() + 365*24*60*60*1000);
		expires = exp.toGMTString();
	}

	if(path == null) {
		path = "/";
	}
	window.document.cookie = name + "=" + escape(value) + ";expires=" + expires + ";path=" + path;
}

Cookie.getValue = function(name) {
	var value = null;
	var cookies = window.document.cookie.split(";");
	for(var i = 0; i < cookies.length; i++) {
		var cookie = cookies[i];
		var index  = cookie.indexOf("=");
		var curName = cookie.substring(0, index).replace(/^ /gi,"");
		var curValue = cookie.substring(index + 1);
		
		if(name == curName){
			value = unescape(curValue);
		}
	}
	return value;
}

Cookie.del = function(name, path) {
	var expires = new Date(0).toGMTString();
	this.setValue(name, "", expires, path);
}

Cookie.delAll = function(path) {
	var cookies = window.document.cookie.split(";");
	for(var i = 0; i < cookies.length; i++) {
		var cookie = cookies[i];
		var index  = cookie.indexOf("=");
		var curName = cookie.substring(0, index).replace(/^ /gi,"");
		this.del(curName, path);
	}
}

/* 负责获取当前页面地址参数 */
var Query = {};
Query.items = {}; // {}：Map，由key/value对组成; []:数组

Query.get = function(name, decode) {
	var str = this.items[name];
	if(decode == true) {
		str = unescape(str);
	}
	return str;
}

Query.parse = function(queryString) {
	var params = queryString.split("&");
	for(var i=0; i < params.length; i++) {
		var param = params[i];
		var name  = param.split("=")[0];
		var value = param.split("=")[1];
		this.items[name] = value;
	}
}

Query.init = function(queryString) {
	this.items = {}; // 先清空
	queryString = queryString || window.location.search.substring(1);
	this.parse(queryString);
}

Query.init();


var Log = {};
Log.info = [];

Log.clear = function() {
	this.info = [];
}

// 写入日志信息
Log.write = function(str) {
	var index = this.info.length;
	this.info.push("[" + index + "]" + str);

	return index;
}

Log.read = function(index) {
	if(index == null) {
		return this.info.join("\r\n");
	}
	else {
		return this.info[index];
	}
}

Array.prototype.contains = function(obj) {  
    var i = this.length;  
    while (i--) {  
        if (this[i] === obj) {  
            return true;  
        }  
    }  
    return false;  
}
 
String.prototype.convertEntry = function() {
	var str = this;
	str = str.replace(/\&/g, "&amp;");
	str = str.replace(/\"/g, "&quot;");
	str = str.replace(/\</g, "&lt;");
	str = str.replace(/\>/g, "&gt;");
	return str;
}

String.prototype.revertEntity = function() {
	var str = this;
	str = str.replace(/&quot;/g, "\"");
	str = str.replace(/&lt;/g,   "\<");
	str = str.replace(/&gt;/g,   "\>");
	str = str.replace(/&amp;/g,  "\&");
	return str;
}

String.prototype.convertCDATA = function() {
	var str = this;
	str = str.replace(/\<\!\[CDATA\[/g, "&lt;![CDATA[");
	str = str.replace(/\]\]>/g, "]]&gt;");
	return str;
}

String.prototype.revertCDATA = function(){
	var str = this;
	str = str.replace(/&lt;\!\[CDATA\[/g, "<![CDATA[");
	str = str.replace(/\]\]&gt;/g, "]]>");
	return str;
}

/*
 *	根据给定字符串裁减原字符串
 *	参数：	string:trimStr  要裁减的字符串
 *	返回值：string:str      裁减后的字符串
 */
String.prototype.trim = function(trimStr){
	var str = this;

	if( trimStr && str.indexOf(trimStr) == 0 ){
		str = str.substring(trimStr.length);
	}
	else {
		str = str.replace(/^\s+|\s+$/g, '');
	}
	return str;
}

/*
 *	按字节，从起始位置到终止位置截取
 *	参数：	number:startB       起始字节位置
			number:endB         终止字节位置
 *	返回值：string:str          截取后的字符串
 *	补充说明：当起始位置落在双字节字符中间时，强制成该字符右侧；当终止位置落在双字节字符中间时，强制成该字符左侧
 */
String.prototype.substringB = function(startB, endB){
	var str = this;

	var start , end;
	var iByte = 0;
	for(var i = 0 ; i < str.length ; i ++){

		if( iByte >= startB && null == start ){
			start = i;
		}
		if( iByte > endB && null == end){
			end = i - 1;
		}else if( iByte == endB && null == end ){
			end = i;
		}

		var chr = str.charAt(i);
		if( true == /[^\u0000-\u00FF]/.test( chr ) ){
			iByte += 2;
		} else {
			iByte ++;
		}
	}
	return str.substring(start,end);
}
/*
 *	按字节，从起始位置开始截取指定字节数
 *	参数：	number:startB       起始字节位置
			number:lenB         截取字节数
 *	返回值：string:str          截取后的字符串
 */
String.prototype.substrB = function(startB, lenB){
	var str = this;
	return str.substringB(startB, startB + lenB);
}

/*
 *	按字节，从起始位置开始截取指定字节数
 */
String.prototype.getBytes = function(){
	var str = this;
	return str.replace(/[^\u0000-\u00FF]/,"*").length;
}

// 扩展日期，获取四位数年份
Date.prototype.getFullYear = function() {
	var year = this.getYear();
	if(year < 1000) {
		year += 1900;
	}
	return year;
}

Date.prototype.format = function(format) {
	var o = {
		"M+" : this.getMonth() + 1,  
		"d+" : this.getDate(), 
		"h+" : this.getHours(), 
		"m+" : this.getMinutes(), 
		"s+" : this.getSeconds(), 
		"q+" : Math.floor((this.getMonth()+3)/3), // quarter
		"S" : this.getMilliseconds() //millisecond
	}

	if(/(y+)/.test(format)) {
		format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	}

	for(var k in o) {
		if( new RegExp("("+ k +")").test(format) ) {
			format = format.replace(RegExp.$1, RegExp.$1.length == 1? o[k] : ("00" + o[k]).substr((""+ o[k]).length));
		}
	}
	return format;
}

function convertToString(value) {
	if(value == null) {
		return "null";
	}

	var str = "";
	switch( typeof(value) ) {
		case _TYPE_NUMBER:
		case _TYPE_BOOLEAN:
		case _TYPE_FUNCTION:
			str = value.toString();
			break;
		case _TYPE_OBJECT:
			if(value.toString ){
				str = value.toString();
			} else {
				str = "[object]";
			}
			break;
		case _TYPE_STRING:
			str = value;
			break;
		case "undefined":
			str = "";
			break;
	}
	return str;
}

function stringToNumber(str) {
	str = str.replace(/[^0-9\.\-]/g, '');
	if(str == "") {
		return 0;
	}
	return parseFloat(str);
}

function stringToDate(str, pattern) {
	var testYear  = str.substr(pattern.indexOf("yyyy"), 4);
	var testMonth = str.substr(pattern.indexOf("MM"), 2);
	var testDay   = str.substr(pattern.indexOf("dd"), 2);

	var testDate = testYear + "/" + testMonth + "/" + testDay;

	testDate = new Date(testDate);
	return new Date(testDate);
}

function numberToString(number, pattern) {
	return number.toString();
}

//去掉所有的html标记 
function killHTML(str) {
	return str.replace(/<[^>]+>/g, "");
}

/*********************************** 常用函数  end **********************************/

/*********************************** html dom 操作 start **********************************/

var Element = {};

Element.removeNode = function(node) {
	if( node == null ) return;

	if(node.removeNode) {
		node.removeNode(true); // IE支持
	}
	else {
		var parentNode = node.parentNode;
		if( parentNode  ) {
			parentNode.removeChild(node);
		}
	}
}

/*
 *	获取对象页面绝对位置
 *	参数：	object:srcElement       HTML对象
 *	返回值：number:offsetLeft       对象页面绝对位置
 */
Element.absLeft = function(srcElement) {
	var absLeft = 0;
	var tempObj = srcElement;
	while( tempObj && tempObj.offsetParent && tempObj != document.body) {
		absLeft += tempObj.offsetLeft - tempObj.offsetParent.scrollLeft;
		tempObj = tempObj.offsetParent;
	}
	return absLeft;
}
Element.absTop = function(srcElement) {
	var absTop = 0;
	var tempObj = srcElement;
	while( tempObj && tempObj.offsetParent && tempObj != document.body) {
		absTop += tempObj.offsetTop - tempObj.offsetParent.scrollTop;
		tempObj = tempObj.offsetParent;
	}
	return absTop;
}

/*
 *	创建带命名空间的对象
 *	参数：	string:tagName		对象标签名
			string:ns			命名空间
 *	返回值：object	html对象
 */
Element.createNSElement = function(tagName, ns) {
	var obj;
	if( ns == null ) {
		obj = document.createElement(tagName);
	}
	else {
		var tempDiv = document.createElement("DIV");
		tempDiv.innerHTML = "<" + ns + ":" + tagName + "/>";
		obj = tempDiv.firstChild.cloneNode(false);
		Element.removeNode(tempDiv);
	}

	if (obj.uniqueID == null) {
		obj.uniqueID = UniqueID.generator(); // 非IE
	}
	return obj;
}

Element.getNSElements = function(element, tagName, ns) {
	var childs = element.getElementsByTagName(tagName);
	if ( childs == null || childs.length == 0 ) {
		childs = element.getElementsByTagName(ns + ":" + tagName);
	}
	return childs;
}

Element.createElement = function(tagName, className) {
	var element = document.createElement(tagName);
	if( className ) {
		Element.addClass(element, className)
	}

	if (element.uniqueID == null) {
		element.uniqueID = UniqueID.generator(); // 非IE
	}
	return element;
}


Element.show = function(element) {
	element.style.display = "block"; 
	element.style.position = "absolute";  
	element.style.left = "18%";   
	element.style.top  = "70px"; 		
	element.style.zIndex = "999"; 

	Element.setOpacity(element, 95);
}

Element.hide = function(element) {
	element.style.display = "none"; 
	if(window.Balloons) {
		Balloons.dispose();
	}
}


/*
 *	隐藏对象覆盖范围内的高优先级的控件(select等)
 *	参数：	Object:obj			html对象
 *	返回值：
 */
Element.hideConflict = function(obj) {
	var x = Element.absLeft(obj);
	var y = Element.absTop(obj);
	var w = obj.offsetWidth;
	var h = obj.offsetHeight;
	var rect = {x:x, y:y, w:w, h:h};

	function isInside(point, rect) {
		if(point.x > rect.x + rect.w || point.x < rect.x 
			|| point.y > rect.y + rect.h || point.y < rect.y ) {
			return false;
		}
		return true;
	}

	var conflict = [];
	var conflictTags = ["select"];
	for(var i = 0; i < conflictTags.length; i++) {
		var curTag = conflictTags[i];
		var curObjs = document.getElementsByTagName(curTag);
		for(var j = 0; j < curObjs.length; j++) {
			var curObj = curObjs[j];

			var x1 = Element.absLeft(curObj);
			var y1 = Element.absTop(curObj);
			var w1 = curObj.offsetWidth;
			var h1 = curObj.offsetHeight;
			var x2 = x1 + w1;
			var y2 = y1 + h1;

			var flag = isInside( {x:x1, y:y1}, rect );
			flag = flag || isInside( {x:x2, y:y1}, rect );
			flag = flag || isInside( {x:x2, y:y2}, rect );
			flag = flag || isInside( {x:x1, y:y2}, rect );

			if(flag == true) {
				curObj.style.visibility = "hidden";
				conflict[conflict.length] = curObj;
			}
		}
	}
	obj.conflict = conflict;
	return obj;
}

Element.showConflict = function(obj) {
	// 气球有可能已经被其他途径释放掉了，obj被清空
	if( typeof(obj) != "undefined" && obj.conflict  ) {
		for( var i = 0; i < obj.conflict.length; i++ ) {
			obj.conflict[i].style.visibility = "visible";
		}
	}
}

Element.write = function(obj, content) {
	obj.innerHTML = content;
}

/*
 * 动态创建脚本
 * 参数：	String:script			脚本内容
 */
Element.createScript = function(script) {
	var head = document.head || document.getElementsByTagName('head')[0];
	if( head ) {
		var scriptNode = Element.createElement("script");
		scriptNode.text = script;
		head.appendChild(scriptNode);
	}
}

/*
 * 动态创建样式
 * 参数：	String:style			样式内容
 */
 Element.createStyle = function(style) {
	 if(window.DOMParser) {
		 var styleNode = document.createElement("style");
		 styleNode.tyle = "text/css";
		 styleNode.innerHTML = style;

		 var head = document.head || document.getElementsByTagName("head")[0];
		 head.appendChild(styleNode);
	 }
	 else {
		 var styleNode = document.createStyleSheet();
		 styleNode.cssText = style;
	 }
}

/* 设置透明度 */
Element.setOpacity = function(obj, opacity) {
	if(opacity == null || opacity == "") {
		opacity = 100;
	}

	if(window.DOMParser) {
		if(obj.style) {
			obj.style.opacity = opacity / 100;
		}
	}
	else {
		obj.style.filter = "alpha(opacity=" + opacity + ")";
	}
}

/*
 * 是否包含关系
 * 参数：   Object:parentObj        html对象
			Object:obj              html对象
 * 返回值：	
 */
Element.contains = function(parentNode, node) {
	if(parentNode == null || node == null) {
		return false;
	}

	if(window.DOMParser) {
		while(node  && node != document.body) {
			node = node.parentNode;
			if(node == parentNode) {
				return true;
			}
		}
		return false;
	}
	else {
		return parentNode.contains(node);
	}
}

/*
 * 获取元素的当前样式
 * 参数：   Object:obj              html对象
			string:rule             样式名(例:background-color)
 * 返回值：	string:str              样式值
 */
Element.getCurrentStyle = function(obj, rule) {
	if(obj == null) {
		return "";
	}

	if(window.DOMParser) {
		return document.defaultView.getComputedStyle(obj, null).getPropertyValue(rule);
	} 
	else {
		rule = rule.split("-");
		for(var i=1; i < rule.length; i++) {
			rule[i] = rule[i].substring(0, 1).toUpperCase() + rule[i].substring(1);
		}
		rule = rule.join("");
		return obj.currentStyle[rule];
	}
}

 
Element.hasClass = function(element, className) {
	var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
	return element.className.match(reg);
}

/*
 * 动态给js添加class属性。
 * 如果已经包含该样式，则不再重复添加；如不存在，则添加该样式。
 * 一个元素多个样式，样式之间用空格隔开。
 */
Element.addClass = function(element, className) {
	if ( !Element.hasClass(element, className) ) {
		element.className += " " + className;
	}
}

Element.removeClass = function(element, className) {
	if ( Element.hasClass(element, className) ) {
		var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
		element.className = element.className.replace(reg, ' ');
	}
}

/*
 * where：插入位置。包括beforeBegin,beforeEnd,afterBegin,afterEnd。
 * el：用于参照插入位置的html元素对象
 * html：要插入的html代码
 */
Element.insertHtml = function(where, el, html) {
    where = where.toLowerCase();
    if(el.insertAdjacentHTML){

        switch(where){
            case "beforebegin":
                el.insertAdjacentHTML('BeforeBegin', html);
                return el.previousSibling;
            case "afterbegin":
                el.insertAdjacentHTML('AfterBegin', html);
                return el.firstChild;
            case "beforeend":
                el.insertAdjacentHTML('BeforeEnd', html);
                return el.lastChild;
            case "afterend":
                el.insertAdjacentHTML('AfterEnd', html);
                return el.nextSibling;
        }
    }
    var range = el.ownerDocument.createRange();
    var frag;
    switch(where){
         case "beforebegin":
            range.setStartBefore(el);
            frag = range.createContextualFragment(html);
            el.parentNode.insertBefore(frag, el);
            return el.previousSibling;
         case "afterbegin":
            if(el.firstChild){
                range.setStartBefore(el.firstChild);
                frag = range.createContextualFragment(html);
                el.insertBefore(frag, el.firstChild);
                return el.firstChild;
             }else{
                el.innerHTML = html;
                return el.firstChild;
             }
        case "beforeend":
            if(el.lastChild){
                range.setStartAfter(el.lastChild);
                frag = range.createContextualFragment(html);
                el.appendChild(frag);
                return el.lastChild;
            }else{
                el.innerHTML = html;
                return el.lastChild;
            }
        case "afterend":
            range.setStartAfter(el);
            frag = range.createContextualFragment(html);
            el.parentNode.insertBefore(frag, el.nextSibling);
            return el.nextSibling;
    }
};
 
/*
 * 控制对象拖动改变宽度
 * 参数：	Object:element   要拖动改变宽度的HTML对象
 */
Element.attachColResize = function(element) {
	 Element.attachResize(element, "col");
}

/*
 * 控制对象拖动改变高度
 * 参数：	Object:element   要拖动改变高度的HTML对象
 */
Element.attachRowResize = function(element) {
	 Element.attachResize(element, "row");
}
 
Element.attachResize = function(element, type) {
	var handle = document.createElement("DIV"); // 拖动条
	if (type == "col") {
		handle.style.cssText = "cursor:col-resize;position:absolute;overflow:hidden;float:right;top:0px;right:0px;width:3px;height:100%;z-index:3;filter:alpha(opacity:80);opacity:80;background:red;";
	} else if(type == "row") {
		handle.style.cssText = "cursor:row-resize;position:absolute;overflow:hidden;left:0px;bottom:0px;width:100%;height:3px;z-index:3;filter:alpha(opacity:0);opacity:0;";
	} else {
		handle.style.cssText = "cursor:nw-resize;position:absolute;overflow:hidden;right:0px;bottom:0px;width:8px;height:8px;z-index:3;background:#99CC00";
	}
	
	element.appendChild(handle);

	var mouseStart  = {x:0, y:0};  // 鼠标起始位置
	var handleStart = {x:0, y:0};  // 拖动条起始位置

	handle.onmousedown = function(ev) {
		var oEvent = ev || event;
		mouseStart.x  = oEvent.clientX;
		mouseStart.y  = oEvent.clientY;
		handleStart.x = handle.offsetLeft;
		handleStart.y = handle.offsetTop;

		if (handle.setCapture) {
			handle.onmousemove = doDrag;
			handle.onmouseup = stopDrag;
			handle.setCapture();
		} else {
			document.addEventListener("mousemove", doDrag, true);
			document.addEventListener("mouseup", stopDrag, true);
		}
	};

	function doDrag(ev) {
		var oEvent = ev || event;

		// 水平移动距离
		if (type == "col" || type == null) {
			var _width = oEvent.clientX - mouseStart.x + handleStart.x + handle.offsetWidth;
			if (_width < handle.offsetWidth) {
				_width = handle.offsetWidth;
			} 
			else if (_width > document.documentElement.clientWidth - element.offsetLeft) {
				_width = document.documentElement.clientWidth - element.offsetLeft - 2; // 防止拖出窗体外
			}
			element.style.width = _width + "px";
		}

		// 垂直移动距离
		if (type == "row" || type == null) {
			var _height = oEvent.clientY - mouseStart.y + handleStart.y + handle.offsetHeight;
			if (_height < handle.offsetHeight) {
				_height = handle.offsetHeight;
			} 
			else if (_height > document.documentElement.clientHeight - element.offsetTop) {
				_height = document.documentElement.clientHeight - element.offsetTop - 2; // 防止拖出窗体外
			}
			element.style.height = _height + "px";
		}
	};

	function stopDrag() {
		if (handle.releaseCapture) {
			handle.onmousemove = handle.onmouseup = null;
			handle.releaseCapture();
		} else {
			document.removeEventListener("mousemove", doDrag, true);
			document.removeEventListener("mouseup", stopDrag, true);
		}
	};
}

Element.attachColResizeII = function(element) {
	var handle = element; // 拖动条(使用自己)

	var mouseStart  = {x:0, y:0};  // 鼠标起始位置
	var handleStart = {x:0, y:0};  // 拖动条起始位置

	handle.onmousedown = function(ev) {
		var oEvent = ev || event;
		mouseStart.x  = oEvent.clientX;
		handleStart.x = handle.offsetLeft;

		if (handle.setCapture) {
			handle.onmousemove = doDrag;
			handle.onmouseup = stopDrag;
			handle.setCapture();
		} else {
			document.addEventListener("mousemove", doDrag, true);
			document.addEventListener("mouseup", stopDrag, true);
		}
	};

	function doDrag(ev) {
		var oEvent = ev || event;

		var _width = oEvent.clientX - mouseStart.x + handle.offsetWidth;
		if (_width > document.documentElement.clientWidth - handle.offsetLeft) {
			_width = document.documentElement.clientWidth - handle.offsetLeft - 2; // 防止拖出窗体外
		}
		if (_width < 0) {
			_width = handle.width;
		}

		handle.style.width = Math.max(_width, 10) + "px";
	};

	function stopDrag() {
		if (handle.releaseCapture) {
			handle.onmousemove = handle.onmouseup = null;
			handle.releaseCapture();
		} else {
			document.removeEventListener("mousemove", doDrag, true);
			document.removeEventListener("mouseup", stopDrag, true);
		}
	};
}

/*
 * 拖动对象，改变其位置
 * 参数：	Object:element   要拖动的HTML对象
 */
Element.moveable = function(element, handle) {
	handle = handle || element.getElementsByTagName("h2")[0] || element; // 拖动条
	if(handle == null) return;

	var mouseStart  = {x:0, y:0};  // 鼠标起始位置
	var elementStart = {x:0, y:0};  // 拖动条起始位置

	handle.onmousedown = function(ev) {
		var oEvent = ev || event;
		mouseStart.x  = oEvent.clientX;
		mouseStart.y  = oEvent.clientY;
		elementStart.x = element.offsetLeft;
		elementStart.y = element.offsetTop;

		if (handle.setCapture) {
			handle.onmousemove = doDrag;
			handle.onmouseup = stopDrag;
			handle.setCapture();
		} else {
			document.addEventListener("mousemove", doDrag, true);
			document.addEventListener("mouseup", stopDrag, true);
		}
	};

	function doDrag(ev) {
		var oEvent = ev || event;

		var x = oEvent.clientX - mouseStart.x + elementStart.x;
		var y = oEvent.clientY - mouseStart.y + elementStart.y;
		if (x < 0) {
			x = 0;
		} else if (x > document.documentElement.clientWidth - element.offsetWidth) {
			x = document.documentElement.clientWidth - element.offsetWidth;
		}
		if (y < 0) {
			y = 0;
		} else if (y > document.documentElement.clientHeight - element.offsetHeight) {
			y = document.documentElement.clientHeight - element.offsetHeight;
		}
		element.style.left = x + "px";
		element.style.top  = y + "px";
	};

	function stopDrag() {
		if (handle.releaseCapture) {
			handle.onmousemove = handle.onmouseup = null;
			handle.releaseCapture();
		} else {
			document.removeEventListener("mousemove", doDrag, true);
			document.removeEventListener("mouseup", stopDrag, true);
		}
	};
}


/*********************************** html dom 操作  end **********************************/

/*********************************** 事件（Event）函数  start **********************************/

var Event = {};
Event.MOUSEDOWN = 1;
Event.MOUSEUP   = 2;
Event.MOUSEOVER = 4;
Event.MOUSEOUT  = 8;
Event.MOUSEMOVE = 16;
Event.MOUSEDRAG = 32;

Event.timeout = {};

/*
 *	获得事件触发对象
 *	参数：	event:eventObj      事件对象
 *	返回值：object:object       HTML对象
 */
Event.getSrcElement = function(eventObj) {
	var srcElement =  eventObj.target || eventObj.srcElement;
	return srcElement;
}

/* 使事件始终捕捉对象。设置事件捕获范围。 */
Event.setCapture = function(srcElement, eventType) {
	if (srcElement.setCapture) {             
		srcElement.setCapture();         
	} 
	else if(window.captureEvents){           
		window.captureEvents(eventType);         
	}
}

/* 使事件放弃始终捕捉对象。 */
Event.releaseCapture = function(srcElement, eventType) {
	if(srcElement.releaseCapture){
		srcElement.releaseCapture();
	}
	else if(window.captureEvents) {
		window.captureEvents(eventType);
	}
}

/* 取消事件 */
Event.cancel = function(eventObj) {
	if(window.DOMParser) {
		eventObj.preventDefault();
	}
	else {
		eventObj.returnValue = false;
	}
}

/* 阻止事件向上冒泡 */
Event.cancelBubble = function(eventObj) {
	if( eventObj.stopPropagation ) {
		eventObj.stopPropagation();
	}
	else {
		eventObj.cancelBubble = true;
	}
}

/*
 *	附加事件
 *	参数：	object:srcElement       HTML对象
			string:eventName        事件名称(不带on前缀)
			function:listener       回调方法                
 */
Event.attachEvent = function(srcElement, eventName, listener) {
	if(null == eventName || null == listener) {
		return alert("需要的参数为空，请检查");
	}

	if(srcElement.addEventListener) {
		srcElement.addEventListener(eventName, listener, false);
	}
	else if(srcElement.attachEvent) {
		srcElement.attachEvent("on" + eventName, listener);
	}
	else {
		srcElement['on' + eventName] = listener;
	}
}

Event.detachEvent = function(srcElement, eventName, listener) {
	if(null == srcElement || null == eventName || null == listener) {
		return alert("需要的参数为空，请检查");
	}

	if( srcElement.removeEventListener ) {
		srcElement.removeEventListener(eventName, listener, false);
	}
	else {
		srcElement.detachEvent("on" + eventName, listener);
	}
}

Event.fireOnScrollBar = function(eventObj) {
	var isOnScrollBar = false;
	var srcElement = this.getSrcElement(eventObj);

	// 是否有纵向滚动条
	if(srcElement.offsetWidth > srcElement.clientWidth) {
		var offsetX = Event.offsetX(eventObj);
		if(offsetX > srcElement.clientWidth) {
			isOnScrollBar = true;
		}
	}

	// 是否有横向滚动条
	if(false == isOnScrollBar && srcElement.offsetHeight > srcElement.clientHeight) {
		var offsetY = Event.offsetY(eventObj);
		if(offsetY > srcElement.clientHeight) {
			isOnScrollBar = true;
		}
	}
	return isOnScrollBar;
}

// 事件相对触发对象位置X
Event.offsetX = function(eventObj) {
	var clientX = eventObj.clientX;
	var srcElement = this.getSrcElement(eventObj);
	var offsetLeft = Element.absLeft(srcElement);

	return clientX - offsetLeft;
}

// 事件相对触发对象位置Y
Event.offsetY = function(eventObj) {
	var clientY = eventObj.clientY;
	var srcElement = this.getSrcElement(eventObj);
	var offsetTop = Element.absTop(srcElement);

	return clientY - offsetTop;
}

/** 模拟事件 */
function createEventObject() {
	return new Object();
}

function EventFirer(element, eventName) {
	var _name = eventName;
	this.fire = function (event) {
		var func = element.getAttribute(_name) || eval("element." + _name);
		if( func ) {
			var funcType = typeof(func);
			if("string" == funcType) {
				eval(func);
			}
			else if ("function" == funcType) {
				func(event);
			}
		}
	}
}

/*********************************** 事件（Event）函数  end **********************************/

/*********************************** xml文档、节点相关操作  start **********************************/

MSXML_DOCUMENT_VERSION = "Msxml2.DOMDocument.6.0";

/* 将字符串转化成xml节点对象 */
function loadXmlToNode(xml) {
	if(xml == null || xml == "" || xml == "undifined") {
		return null;
	}

	xml = xml.revertEntity();
	var xr = new XmlReader(xml);
	return xr.documentElement;
}

function getXmlDOM() {
	var xmlDom;
	if (Public.isIE()) {
		xmlDom = new ActiveXObject(MSXML_DOCUMENT_VERSION);
		xmlDom.async = false;
	}
	else {
		var parser = new DOMParser();
		xmlDom = parser.parseFromString("<null/>", "text/xml");
		xmlDom.parser = parser;
    } 
	return xmlDom;
}

var EMPTY_XML_DOM = getXmlDOM();

function loadXmlDOM(url) {
	var xmlDom;
	if (window.DOMParser) {
		var xmlhttp = new window.XMLHttpRequest();  
	    xmlhttp.open("GET", url, false);  
		try {  xmlhttp.responseType = 'msxml-document';  } catch (e) {  } 
	    xmlhttp.send(null);  
	    xmlDom = xmlhttp.responseXML.documentElement;  
	}
	else { // < IE10
		xmlDom = new ActiveXObject(MSXML_DOCUMENT_VERSION);
		xmlDom.async = false;
		xmlDom.load(url);
    } 
	return xmlDom;
}

function XmlReader(text) {
	this.xmlDom = null;

	if (Public.isIE()) {
		this.xmlDom = new ActiveXObject(MSXML_DOCUMENT_VERSION);
		this.xmlDom.async = false;
		this.xmlDom.loadXML(text); 
	}
	else {
		var parser = new DOMParser();
		this.xmlDom = parser.parseFromString(text, "text/xml"); 
    } 

	this.documentElement = this.xmlDom.documentElement || this.xmlDom;
}

XmlReader.prototype.loadXml = function(text) {
	if (Public.isIE()) {
		this.xmlDom.loadXML(text); 
	}
	else { 
		var parser = new DOMParser();
		this.xmlDom = parser.parseFromString(text, "text/xml");
    } 
}

XmlReader.prototype.createElement = function(name) {
	var node = this.xmlDom.createElement(name);
	var xmlNode = new XmlNode(node);
	return xmlNode;
}

XmlReader.prototype.createCDATA = function(data) {
	var xmlNode;
	data = String(data).convertCDATA();
	if(window.DOMParser) {
		var tempReader = new XmlReader("<root><![CDATA[" + data + "]]></root>");
		var xmlNode = new XmlNode(tempReader.documentElement.firstChild);
	}
	else {
		xmlNode = new XmlNode(this.xmlDom.createCDATASection(data));
	}
	return xmlNode;
}

 XmlReader.prototype.createElementCDATA = function(name, data) {
	var xmlNode   = this.createElement(name);
	var cdataNode = this.createCDATA(data);
	xmlNode.appendChild(cdataNode);
	return xmlNode;
}

/* 获取解析错误 */
XmlReader.prototype.getParseError = function() {
	var parseError = null;
	if(window.DOMParser) {

	} 
	else {
		if( this.xmlDom.parseError.errorCode != 0 ) {
			parseError = this.xmlDom.parseError;
		}
	}
	return parseError;
}

XmlReader.prototype.toString = function() {
	var str = [];
	str[str.length] = "[XmlReader Object]";
	str[str.length] = "xml:" + this.toXml();
	return str.join("\r\n");
}

XmlReader.prototype.toXml = function() {
	if (Public.isIE()) {
		return this.xmlDom.xml;
	}
	else {
		var xmlSerializer = new XMLSerializer();
        return xmlSerializer.serializeToString(this.xmlDom.documentElement);
	}
}

function xml2String(element) {
	if (Public.isIE()) {
		return element.xml;
	}
	else {
		var xmlSerializer = new XMLSerializer();
        return xmlSerializer.serializeToString(element);
	}
}

function getNodeText(node) {
	return node.text || node.textContent || ""; // 取节点值时，chrome里用textContent
}

/*
 *  XML节点类型
 */
_XML_NODE_TYPE_ELEMENT    = 1; // 元素
_XML_NODE_TYPE_ATTRIBUTE  = 2; // 属性
_XML_NODE_TYPE_TEXT		  = 3; // 文本
_XML_NODE_TYPE_CDATA	  = 4; 
_XML_NODE_TYPE_PROCESSING = 7;
_XML_NODE_TYPE_COMMENT    = 8; // 注释
_XML_NODE_TYPE_DOCUMENT   = 9; // 文档


/* XML Node */
function XmlNode(node) {
	this.node = node;
	this.nodeName = this.node.nodeName;
	this.nodeType = this.node.nodeType;
	this.nodeValue = this.node.nodeValue;
	this.text = getNodeText(this.node); // 取CDATA节点值时，chrome里用textContent
	this.firstChild = this.node.firstChild;
	this.lastChild = this.node.lastChild;
	this.childNodes = this.node.childNodes;
	this.attributes = this.node.attributes;
}

XmlNode.prototype.getAttribute = function(name) {
	if(_XML_NODE_TYPE_ELEMENT == this.nodeType) {
		return this.node.getAttribute(name);
	}
}

XmlNode.prototype.setAttribute = function(name, value, isCDATA) {
	if(_XML_NODE_TYPE_ELEMENT != this.nodeType) {
		return;
	}

	value = value || "";
	if(isCDATA == 1) {
		this.setCDATA(name, value);
	}
	else {
		this.node.setAttribute(name, value);
	}
}

/* 删除节点属性 */
XmlNode.prototype.removeAttribute = function(name) {
	if(_XML_NODE_TYPE_ELEMENT == this.nodeType) {
		return this.node.removeAttribute(name);
	}
}

XmlNode.prototype.getCDATA = function(name) {
	var node = this.node.getElementsByTagName(name)[0];

	if( node == null ) {
		node = this.selectSingleNode(name + "/node()");
	}
	if( node ) {
		var cdataValue = node.text;
		if(cdataValue == null) {
			cdataValue = node.textContent;
		}
		if(cdataValue == null) {
			cdataValue = "";
		}
		return cdataValue.revertCDATA();
	}
}

XmlNode.prototype.setCDATA = function(name, value) {
	var oldNode = this.selectSingleNode(name);
	if(oldNode == null) {
		var xmlReader = new XmlReader("<xml/>");
		var newNode = xmlReader.createElementCDATA(name, value);
		this.appendChild(newNode);
	}
	else {
		var CDATANode = oldNode.selectSingleNode("node()");
		CDATANode.removeNode();

		var xmlReader = new XmlReader("<xml/>");
		CDATANode = xmlReader.createCDATA(value);
		oldNode.appendChild(CDATANode);
	}
}

XmlNode.prototype.removeCDATA = function(name) {
	var node = this.selectSingleNode(name);
	if(node ) {
		node.removeNode(true);
	}
}

XmlNode.prototype.cloneNode = function(deep) {
	if(this.nodeType == _XML_NODE_TYPE_TEXT || this.nodeType == _XML_NODE_TYPE_CDATA) {
		return this;
	}

	var tempNode;
	if( Public.isIE() ) {
		tempNode = new XmlNode(this.node.cloneNode(deep));
	} 
	else {
		tempNode = new XmlNode(new XmlReader(this.toXml()).documentElement);
	}
	return tempNode;
}

XmlNode.prototype.getParent = function() {
	var xmlNode = null;
	if( this.node.parentNode) {
		xmlNode = new XmlNode(this.node.parentNode);
	}
	return xmlNode;
}

XmlNode.prototype.removeNode = function() {
	var parentNode = this.node.parentNode;
	if(parentNode ) {
		parentNode.removeChild(this.node);
	}
}

XmlNode.prototype.selectSingleNode = function(xpath) {
	var xmlNode = null;
	if(window.DOMParser && !Public.isIE()) {
		var ownerDocument;
		if(_XML_NODE_TYPE_DOCUMENT == this.nodeType) {
			ownerDocument = this.node;
		} else {
			ownerDocument = this.node.ownerDocument;
		}
		var xPathResult = ownerDocument.evaluate(xpath, this.node, ownerDocument.createNSResolver(ownerDocument.documentElement), 9);
		if (xPathResult && xPathResult.singleNodeValue) {
			xmlNode = new XmlNode(xPathResult.singleNodeValue);
		}    
	} 
	else {
		var node = this.node.selectSingleNode(xpath);
		if(node ) {
			xmlNode = new XmlNode(node);
		}
	}
	return xmlNode;
}

/*
 *	查询多个节点
 *	参数：	string:xpath		xpath
 *	返回值：array:xmlNodes      XmlNode实例数组
 */
XmlNode.prototype.selectNodes = function(xpath) {
	var xmlNodes = [];
	if(window.DOMParser && !Public.isIE()) {
		var ownerDocument = null;
		if(_XML_NODE_TYPE_DOCUMENT == this.nodeType) {
			ownerDocument = this.node;
		} else {
			ownerDocument = this.node.ownerDocument;
		}
		var xPathResult = ownerDocument.evaluate(xpath, this.node, ownerDocument.createNSResolver(ownerDocument.documentElement), XPathResult.ORDERED_NODE_ITERATOR_TYPE);
		if (xPathResult) {
			var oNode = xPathResult.iterateNext() ;
			while(oNode) {
				xmlNodes[xmlNodes.length] = new XmlNode(oNode);
				oNode = xPathResult.iterateNext();
			}
		}
	} 
	else {
		var nodes = this.node.selectNodes(xpath);
		for(var i = 0; i < nodes.length; i++) {
			xmlNodes[xmlNodes.length] = new XmlNode(nodes[i]);
		}
	}
	return xmlNodes;
}

XmlNode.prototype.appendChild = function(xmlNode) {
	if(xmlNode instanceof XmlNode) {
		this.node.appendChild(xmlNode.node);
	}
	else {
		this.node.appendChild(xmlNode);
	}

	this.nodeValue = this.node.nodeValue;
	this.text = this.node.text;
	this.firstChild = this.node.firstChild;
	this.lastChild = this.node.lastChild;
	this.childNodes = this.node.childNodes;
}

XmlNode.prototype.getFirstChild = function() {
	if(this.firstChild) {
		var node = new XmlNode(this.firstChild);
		return node;
	}
	return null;
}

XmlNode.prototype.getLastChild = function() {
	if(this.lastChild) {
		var node = new XmlNode(this.lastChild);
		return node;
	}
	return null;
}

// 交换子节点
XmlNode.prototype.replaceChild = function(newNode, oldNode) {
	var oldParent = oldNode.getParent();
	if(oldParent && oldParent.equals(this)) {
		try { 
			this.node.replaceChild(newNode.node, oldNode.node);
		}
		catch (e)
		{ }
	}
}
		

// 交换节点
XmlNode.prototype.swapNode = function(xmlNode) {
	var parentNode = this.getParent();
	if( parentNode ) {
		parentNode.replaceChild(xmlNode, this);
	}
}

/* 获取前一个兄弟节点 */
XmlNode.prototype.getPrevSibling = function() {
	var xmlNode = null;
	if( this.node.previousSibling ) {
		xmlNode = new XmlNode(this.node.previousSibling);
	}
	return xmlNode;
}

/* 获取后一个兄弟节点 */
XmlNode.prototype.getNextSibling = function() {
	if( this.node.nextSibling ) {
		var node = new XmlNode(this.node.nextSibling);
		return node;
	}
	return null;
}

XmlNode.prototype.equals = function(xmlNode) {
	return xmlNode && this.node == xmlNode.node;
}

XmlNode.prototype.toString = function() {
	var str = [];
	str[str.length] = "[XmlNode]";
	str[str.length] = "nodeName:" + this.nodeName;
	str[str.length] = "nodeType:" + this.nodeType;
	str[str.length] = "nodeValue:" + this.nodeValue;
	str[str.length] = "xml:" + this.toXml();
	return str.join("\r\n");
}

XmlNode.prototype.toXml = function() {
	if (Public.isIE()) {
		return this.node.xml
	}
	else {
		var xs = new XMLSerializer();
		return xs.serializeToString(this.node);
	}
}

/*********************************** xml文档、节点相关操作  end **********************************/

// 离开提醒
var Reminder = {};

Reminder.items = {};   // 提醒项
Reminder.count = 0;

Reminder.add = function(id) {
	if( null == this.items[id] ) {
		this.items[id] = true;
		this.count ++;
	}
}

Reminder.del = function(id) {
	if(  this.items[id] ) {
		delete this.item[id];
		this.count --;
	}
}

Reminder.remind = function() {
	if(this.getCount() > 0) {
		alert("当然有 <" + this.count + ">项修改未保存，请先保存");
	}
}

/* 统计提醒项 */
Reminder.getCount = function() {
	return this.count;
}

/* 取消提醒 */
Reminder.reset = function() {
	this.items = {};   // 提醒项
	this.count = 0;
}
 
window.onbeforeunload = function() {
	var count = Reminder.getCount();
	if(count > 0) {            
		return "当前有 <" + count + "> 项修改未保存，您确定要离开吗？";
	}
}

/* 给xform等添加离开提醒 */
function attachReminder(id, xform) {
	if( xform ) {
		xform.element.ondatachange = function(eventObj) {
			Reminder.add(eventObj.id); // 数据有变化时才添加离开提醒
		}
	}
	else {
		Reminder.add(id);
	}
}

function detachReminder(id) {
	// Reminder.del(id);
	Reminder.reset();
}

/*
 *	对象名称：Focus（全局静态对象）
 *	职责：负责管理所有注册进来对象的聚焦操作
 */
var Focus = {};
Focus.items = {};
Focus.lastID = null;

/*
 *	注册对象
 *	参数：	object:focusObj		需要聚焦的HTML对象
 *	返回值：string:id			用于取回聚焦HTML对象的id
 */
Focus.register = function(focusObj) {
	var id = focusObj.id;

	// 如果id不存在则自动生成一个
	if(null == id || "" == id) {
		id = UniqueID.generator();
		focusObj.id = id;
	}
	this.items[id] = focusObj;

	this.focus(id);
	return id;
}

/*
 *	聚焦对象
 *	参数：	object:focusObj		需要聚焦的HTML对象
 *	返回值：string:id			用于取回聚焦HTML对象的id
 */
Focus.focus = function(id){
	var focusObj = this.items[id];
	if(focusObj && id != this.lastID){
		if(this.lastID) {
			this.blurItem(this.lastID);
		}

		Element.setOpacity(focusObj, 100); // 施加聚焦效果
		this.lastID = id;
	}
}

/*
 *	施加失焦效果
 *	参数：	string:id			需要聚焦的HTML对象
 */
Focus.blurItem = function(id){
	var focusObj = this.items[id];
	if(focusObj){
		Element.setOpacity(focusObj, 50);
	}
}

/*
 *	释放对象
 *	参数：	object:focusObj		需要聚焦的HTML对象
 *	返回值：string:id			用于取回聚焦HTML对象的id
 */
Focus.unregister = function(id){
	var focusObj = this.items[id];
	if(focusObj){
		delete this.items[id];
	}
}