/*********************************** 常用函数  start **********************************/

/* 对象类型 */
_TYPE_NUMBER = "number";
_TYPE_OBJECT = "object";
_TYPE_FUNCTION = "function";
_TYPE_STRING = "string";
_TYPE_BOOLEAN = "boolean";

/* 常用方法缩写 */
$ = function(id){
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
_BROWSER_FF = "FF";
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

Public.executeCommand = function(callback, param) {
	var returnVal;
	try
	{
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
	}
	catch (e)
	{
		returnVal = false;
	}
	return returnVal;
}

/* 显示等待状态 */
Public.showWaitingLayer = function () {
	var waitingDiv = $("_waitingDiv");
	if(waitingDiv == null) {
		var waitingDiv = document.createElement("div");    
		waitingDiv.id = "_waitingDiv";    
		waitingDiv.style.width ="100%";    
		waitingDiv.style.height = "100%";    
		waitingDiv.style.position = "absolute";    
		waitingDiv.style.left = "0px";   
		waitingDiv.style.top = "0px";   
		waitingDiv.style.cursor = "wait"; 
 
 		var str = [];
		str[str.length] = "<TABLE width=\"100%\" height=\"100%\"><TR><TD align=\"center\">";
		str[str.length] = "	 <object classid=\"clsid:d27cdb6e-ae6d-11cf-96b8-444553540000\" ";
		str[str.length] = "		   codebase=\"http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=7,0,0,0\" ";
		str[str.length] = "        width=\"140\" height=\"30\" id=\"loadingbar\" align=\"middle\">";
		str[str.length] = "		<param name=\"movie\" value=\"../images/loadingbar.swf\" />";
		str[str.length] = "		<param name=\"quality\" value=\"high\" />";
		str[str.length] = "		<param name=\"wmode\" value=\"transparent\" />";
		str[str.length] = "		<embed src=\"../images/loadingbar.swf\" quality=\"high\" ";
		str[str.length] = "		       wmode=\"transparent\" width=\"140\" height=\"30\" align=\"middle\" ";
		str[str.length] = "		       type=\"application/x-shockwave-flash\" pluginspage=\"http://www.macromedia.com/go/getflashplayer\" />";
		str[str.length] = "  </object>";
		str[str.length] = "</TD></TR></TABLE>";
		waitingDiv.innerHTML = str.join("\r\n");

		var coverDiv = document.createElement("div");  
		coverDiv.id = "coverDiv";
		coverDiv.style.width  = "100%";    
		coverDiv.style.height = "100%";    
		coverDiv.style.position = "absolute";    
		coverDiv.style.left = "0px";   
		coverDiv.style.top  = "0px";   
		coverDiv.style.zIndex = "10000"; 
		coverDiv.style.background = "black";   
		Element.setOpacity(coverDiv, 10);

		document.body.appendChild(waitingDiv);
		document.body.appendChild(coverDiv);
	}

	if(waitingDiv ) {
		waitingDiv.style.display = "block";
	}
}

Public.hideWaitingLayer = function() {
	var waitingDiv = $("_waitingDiv");
	if( waitingDiv  ) {
		setTimeout( function() {
			waitingDiv.style.display = "none";
			$("coverDiv").style.display = "none";
		}, 100);
	}
}

Public.writeTitle = function() {
	if(window.dialogArguments) {
		var title = window.dialogArguments.title;
		if( title  ) {
			document.write("<title>" + title + new Array(100).join("　") + "</title>");
		}
	}
}
Public.writeTitle();


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

Query.set = function(name, value) {
	this.items[name] = value;
}

Query.parse = function(queryString) {
	var params = queryString.split("&");
	for(var i=0; i < params.length; i++) {
		var param = params[i];
		var name  = param.split("=")[0];
		var value = param.split("=")[1];
		this.set(name, value);
	}
}

Query.init = function() {
	var queryString = window.location.search.substring(1);
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

// 扩展数组，增加数组项
Array.prototype.push = function(item) {
	this[this.length] = item;
}

String.prototype.convertEntry = function() {
	var str = this;
	str = str.repalce(/\&/g, "&amp;");
	str = str.repalce(/\"/g, "&quot;");
	str = str.repalce(/\</g, "&lt;");
	str = str.repalce(/\>/g, "&gt;");
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
	if( 0 == str.indexOf(trimStr) ){
		str = str.substring(trimStr.length);
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
		}else{
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

	if(window.DOMParser) {
		var parentNode = node.parentNode;
		if( parentNode  ) {
			parentNode.removeChild(node);
		}
	}
	else {
		node.removeNode(true);
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
	while( tempObj  && tempObj != document.body) {
		absLeft += tempObj.offsetLeft - tempObj.offsetParent.scrollLeft;
		tempObj = tempObj.offsetParent;
	}
	return absLeft;
}
Element.absTop = function(srcElement) {
	var absTop = 0;
	var tempObj = srcElement;
	while( tempObj  && tempObj != document.body) {
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
Element.createElement = function(tagName, ns) {
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
	return obj;
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
		obj.style.opacity = opacity / 100;
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





/* 缓存页面所有的resize拖动条；元素拖动后可能引起了其他元素位置改变，需要刷新其他元素所对应的resize条位置 */
Element.ruleObjList = [];

/*
 * 控制对象拖动改变宽度
 * 参数：	Object:obj			要拖动改变宽度的HTML对象
 */
Element.attachColResize = function(obj) {
	var offsetX = 3;

	// 添加resize条
	var ruleObj = document.createElement("DIV");
	ruleObj.style.cssText = "cursor:col-resize;position:absolute;overflow:hidden;";
	document.body.appendChild(ruleObj);
	setDivPosition(ruleObj, obj);

	ruleObj.target = obj;
	Element.ruleObjList.push(ruleObj);

    // 计算resize条的坐标值
	function setDivPosition(ruleElement, element) {
		ruleElement.style.width = offsetX;
		ruleElement.style.height = element.offsetHeight;
		ruleElement.style.top  = Element.absTop(element);
		ruleElement.style.left = Element.absLeft(element) + element.offsetWidth - offsetX;
		ruleElement.style.backgroundColor = "white";
		ruleElement.style.filter = "alpha(opacity=0)";		
	}

	// 刷新所有resize条的位置
	function refreshResizeDivPosition() {
		for(var i = 0; i < Element.ruleObjList.length; i++) {
			var ruleElement = Element.ruleObjList[i];
			setDivPosition(ruleElement, ruleElement.target);
		}
	}

	obj.onresize = refreshResizeDivPosition;

	var moveHandler = function() {
		if(ruleObj._isMouseDown == true) {
			ruleObj.style.left = Math.max( Element.absLeft(obj), event.clientX - offsetX);

			if (document.addEventListener) {             
				document.addEventListener("mouseup", stopHandler, true);  
			}
		}
	}

	var stopHandler = function() {
		ruleObj._isMouseDown = false;
		obj.style.width = Math.max(1, obj.offsetWidth + event.clientX - ruleObj._fromX); 

		if (ruleObj.releaseCapture) {             
			ruleObj.releaseCapture();         
		} 
		else {
			document.removeEventListener("mousemove", moveHandler, true);
			document.removeEventListener("mouseup", stopHandler, true);  
		}			
	}
 
	ruleObj.onmousedown = function() {
		this.style.backgroundColor = "#999999";
		this.style.filter = "alpha(opacity=50)";

		this._isMouseDown = true;
		this._fromX = event.clientX;

		if (this.setCapture) {             
			this.setCapture();    
		} 
		else {
			document.addEventListener("mousemove", moveHandler, true);
		}
	};
	ruleObj.onmousemove = function() {
		moveHandler();
	};
	ruleObj.onmouseup = function() { 
		stopHandler();
	};
}

Element.attachRowResize = function(obj) {

}

Element.attachResize = function(obj) {

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
	var srcElement = null;
	if(window.DOMParser) {
		srcElement = eventObj.target;
	}
	else {
		srcElement = eventObj.srcElement;
	}
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
 *	返回值：
 */
Event.attachEvent = function(srcElement, eventName, listener) {
	if(null == srcElement || null == eventName || null == listener) {
		return alert("需要的参数为空，请检查");
	}

	if(srcElement.addEventListener) {
		srcElement.addEventListener(eventName, listener, false);
	}
	else if(srcElement.attachEvent) {
		srcElement.attachEvent("on" + eventName, listener);
	}
	else {
		srcElement['on' + type] = listener;
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
		var func = element.getAttribute(_name);
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

/*
 * 将字符串转化成xml节点对象
 */
function loadXmlToNode(xml) {
	if(xml == null || xml == "" || xml == "undifined") {
		return null;
	}
	var xr = new XmlReader(xml);
	return xr.documentElement;
}

function getXmlDOM() {
	var xmlDom;
	if (window.DOMParser) {
		var parser = new DOMParser();
		xmlDom = parser.parseFromString("<null/>", "text/xml");
		xmlDom.parser = parser;
	}
	else { // Internet Explorer
		xmlDom = new ActiveXObject("Msxml2.DOMDOCUMENT");
		xmlDom.async = false;
    } 
	return xmlDom;
}


function XmlReader(text) {
	this.xmlDom = null;

	if (window.DOMParser) {
		var parser = new DOMParser();
		this.xmlDom = parser.parseFromString(text, "text/xml");
	}
	else { // Internet Explorer
		this.xmlDom = new ActiveXObject("Msxml2.DOMDOCUMENT");
		this.xmlDom.async = false;
		this.xmlDom.loadXML(text); 
    } 

	this.documentElement = this.xmlDom.documentElement;
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

XmlReader.prototype.load = function(url, async) {
	if(window.DOMParser) {

	}
	else {
		var thisObj = this;
		this.xmlDom.async = async;
		this.xmlDom.onreadystatechange = function() {
			if(thisObj.xmlDom.readyState == 4) {
				var onloadType = typeof(thisObj.onload);
				try {
					if(onloadType == _TYPE_FUNCTION) {
						thisObj.onload();
					} 
					else if(onloadType == _TYPE_STRING) {
						eval(thisObj.onload);
					}
				}
				catch (e) { }
			}
		}
		this.xmlDom.load(url);
	}

	this.documentElement = this.xmlDom.documentElement;
}

/*
 *	获取解析错误
 */
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
	var str = "";
	if(window.DOMParser) { 
		var xmlSerializer = new XMLSerializer();
        str = xmlSerializer.serializeToString(this.xmlDom.documentElement);
	}
	else {
		str = this.xmlDom.xml;
	}
	return str;
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
	this.text = this.node.text;
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
	var node = this.selectSingleNode(name + "/node()");
	if(node ) {
		return node.nodeValue.revertCDATA();
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
	var tempNode;
	if( window.DOMParser ) {
		tempNode = new XmlNode(new XmlReader(this.toXml()).documentElement);
	} else {
		tempNode = new XmlNode(this.node.cloneNode(deep));
	}
	return tempNode;
}

XmlNode.prototype.getParent = function() {
	var xmlNode = null;
	if( this.node.parentNode  ) {
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
	if(window.DOMParser) {
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
	if(window.DOMParser) {
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
	this.node.appendChild(xmlNode.node);

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

/*
 *	获取前一个兄弟节点
 */
XmlNode.prototype.getPrevSibling = function() {
	var xmlNode = null;
	if( this.node.previousSibling ) {
		xmlNode = new XmlNode(this.node.previousSibling);
	}
	return xmlNode;
}

/*
 * 获取后一个兄弟节点
 */
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
	if(window.DOMParser) {
		var xs = new XMLSerializer();
		return xs.serializeToString(this.node);
	}
	else {
		return this.node.xml
	}
}

/*********************************** xml文档、节点相关操作  end **********************************/

// 离开提醒
var Reminder = {};

Reminder.items = {};   // 提醒项
Reminder.count = 0;
Reminder.flag  = true; // 是否要提醒

Reminder.add = function(id) {
	if( null == this.items[id] ) {
		this.items[id] = true;
		this.count ++;
	}
}

Reminder.del = function(id) {
	if( this.items[id] ) {
		delete this.item[id];
		this.count --;
	}
}

Reminder.remind = function() {
	if(this.getCount() > 0) {
		alert("当然有 <" + this.count + ">项修改未保存，请先保存");
	}
}

/*
 * 统计提醒项
 */
Reminder.getCount = function() {
	if( true== this.flag) {
		return this.count;
	} else {
		return 0;
	}
}

/*
 * 取消提醒
 */
Reminder.cancel = function() {
	this.flag = false;
}

/*
 * 允许提醒
 */
Reminder.restore = function() {
	this.flag = true;
}

window.attachEvent("onbeforeunload", function() {
	if(Reminder.getCount() > 0) {            
		event.returnValue = "当前有 <" + count + "> 项修改未保存，您确定要离开吗？";
	}
});

/* 给xform等添加离开提醒 */
function attachReminder(id, xform) {
	if( xform ) {
		xform.ondatachange = function() {
			Reminder.add(id); // 数据有变化时才添加离开提醒
		}
	}
	else {
		Reminder.add(id);
	}
}

function detachReminder(id) {
	Reminder.del(id);
}



/*
 *	对象名称：Blocks
 *	职责：负责管理所有Block实例
 */
var Blocks = {};
Blocks.items = {};

/*
 *	创建区块实例
 *	参数：	Object:blockObj		HTML对象
			Object:associate	关联的HTML对象
			boolean:visible		默认显示状态
 *	返回值：
 */
Blocks.create = function(blockObj, associate, visible) {
	var block = new Block(blockObj, associate, visible);
	this.items[block.uniqueID] = block;
}
/*
 *	获取区块实例
 *	参数：	string:id		HTML对象id
 *	返回值：Block:block		Block实例
 */
Blocks.getBlock = function(id) {
	var block = this.items[id];
	return block;
}


/*
 *	对象名称：Block
 *	职责：负责控制区块显示隐藏等
 */
var Block = function(blockObj, associate, visible) {
	this.object = blockObj;
	this.uniqueID = this.object.id;
	this.associate = associate;
	this.visible = visible || true;

	this.width = null;
	this.height = null;	
	this.mode = null;

	this.init();
}

/*
 *	初始化区块
 */
Block.prototype.init = function() {
	this.width  = this.object.currentStyle.width;
	this.height = this.object.currentStyle.height;

	if(false == this.visible) {
		this.hide();
	}
}

/*
 *	显示详细信息
 *	参数：	boolean:useFixedSize	是否启用固定尺寸显示
 */
Block.prototype.show = function(useFixedSize) {
	if( this.associate ) {
		this.associate.style.display = "";
	}
	this.object.style.display = "";

	var width  = "auto";
	var height = "auto";
	
	// 启用固定尺寸
	if(false != useFixedSize) {
		width  = this.width || width;
		height = this.height || height;
	}
	this.object.style.width = width;
	this.object.style.height = height;

	this.visible = true;
}

/*
 *	隐藏详细信息
 */
Block.prototype.hide = function() {
	if(  this.associate){
		this.associate.style.display = "none";
	}
	this.object.style.display = "none";

	this.visible = false;
}

/*
 *	切换显示隐藏状态
 *	参数：	boolean:visible		是否显示状态（可选，无参数则默认切换下一状态）
 */
Block.prototype.switchTo = function(visible) {
	visible = visible || !this.visible;

	if( visible){
		this.show();	
	}
	else {
		this.hide();
	}
}

/*
 *	原型继承
 *	参数：	function:Class		将被继承的类
 */
Block.prototype.inherit = function(Class) {
	var inheritClass = new Class();
	for(var item in inheritClass){
		this[item] = inheritClass[item];
	}
}


/*
 *	对象名称：WritingBlock
 *	职责：负责区块内容写入
 *
 */
function WritingBlock() {
	this.mode = null;
	this.line = 0;
	this.minLine = 3;
	this.maxLength = 16;
}

/*
 *	打开分行写入模式
 */
WritingBlock.prototype.open = function(){
	this.mode = "line";
	this.line = 0;
	this.writeTable();
}

/*
 *	写入分行模式用的表格
 */
WritingBlock.prototype.writeTable = function() {
	var str = [];
	str[str.length] = "<table class=hfull><tbody>";
	for(var i = 0;i < this.minLine; i++) {
		str[str.length] = "<tr>";
		str[str.length] = "  <td class=bullet>&nbsp;</td>";
		str[str.length] = "  <td style=\"width: 55px\"></td>";
		str[str.length] = "  <td></td>";
		str[str.length] = "</tr>";
	}
	str[str.length] = "</tbody></table>";

	this.object.innerHTML = str.join("");    
}

/*
 *	清除内容
 */
WritingBlock.prototype.clear = function() {
	this.object.innerHTML = "";
}

/*
 *	关闭分行写入模式
 */
WritingBlock.prototype.close = function() {
	this.mode = null;
}

/*
 *	分行写入内容（左右两列）
 *	参数：	string:name     名称
			string:value    值
 */
WritingBlock.prototype.writeln = function(name, value) {
	if("line" == this.mode){
		var table = this.object.firstChild;
		if(table && "TABLE" != table.nodeName.toUpperCase()) {
			this.clear();
			table = null;
		}
		if(null == table) {
			this.writeTable();
		}

		// 大于最小行数，则插入新行
		if(this.line >= this.minLine) {
			var newrow = table.rows[0].cloneNode(true);
			table.firstChild.appendChild(newrow);
		}

		if(value && value.length > this.maxLength) {
			value = value.substring(0, this.maxLength) + "...";
		}

		var row = table.rows[this.line];
		var cells = row.cells;
		cells[1].innerText = name + ":";
		cells[2].innerText = value || "-";

		this.line++;
	}
}

/*
 *	写入内容
 */
WritingBlock.prototype.write = function(content) {
	this.mode = null;
	this.object.innerHTML = content;
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

	//如果id不存在则自动生成一个
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
		
		focusObj.style.filter = ""; // 施加聚焦效果
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
		focusObj.style.filter = "alpha(opacity=50) gray()";
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




/*
 *	重新封装alert
 *	参数：	string:info     简要信息
			string:detail   详细信息
 */
function Alert(info, detail) {
	info = convertToString(info);
	detail = convertToString(detail);

	var maxWords = 100;
	var params = {};
	params.type = "alert";
	params.info = info;
	params.detail = detail;
	if("" == detail && maxWords < info.length) {
		params.info = info.substring(0, maxWords) + "...";
		params.detail = info;        
	}
	params.title = "";
	window.showModalDialog(URL_CORE + '_info.htm', params, 'dialogwidth:280px; dialogheight:150px; status:yes; help:no;resizable:yes;unadorned:yes');
}

/*
 *	重新封装confirm
 *	参数：	string:info             简要信息
			string:detail           详细信息
 *	返回值：boolean:returnValue     用户选择确定/取消
 */
function Confirm(info,detail) {
	info = convertToString(info);
	detail = convertToString(detail);

	var maxWords = 100;
	var params = {};
	params.type = "confirm";
	params.info = info;
	params.detail = detail;
	if("" == detail && maxWords<info.length) {
		params.info = info.substring(0, maxWords) + "...";
		params.detail = info;        
	}
	params.title = "";
	var returnValue = window.showModalDialog(URL_CORE + '_info.htm', params, 'dialogwidth:280px; dialogheight:150px; status:yes; help:no;resizable:yes;unadorned:yes');
	return returnValue;
}

/*
 *	带是/否/取消三个按钮的对话框
 *	参数：	string:info             简要信息
			string:detail           详细信息
 *	返回值：boolean:returnValue     用户选择是/否/取消
 */
function Confirm2(info,detail) {
	info = convertToString(info);
	detail = convertToString(detail);

	var maxWords = 100;
	var params = {};
	params.type = "confirm2";
	params.info = info;
	params.detail = detail;
	if("" == detail && maxWords < info.length) {
		params.info = info.substring(0, maxWords) + "...";
		params.detail = info;        
	}
	params.title = "";
	var returnValue = window.showModalDialog(URL_CORE + '_info.htm', params, 'dialogwidth:280px; dialogheight:150px; status:yes; help:no;resizable:yes;unadorned:yes');
	return returnValue;
}

/*
 *	重新封装prompt
 *	参数：	string:info             简要信息
			string:defaultValue     默认值
			string:title            标题
			boolean:protect         是否保护
			number:maxBytes         最大字节数
 *	返回值：string:returnValue      用户输入的文字
 */
function Prompt(info, defaultValue, title, protect, maxBytes) {
	info = convertToString(info);
	defaultValue = convertToString(defaultValue);
	title = convertToString(title);

	var params = {};
	params.info = info;
	params.defaultValue = defaultValue;
	params.title = title;
	params.protect = protect;
	params.maxBytes = maxBytes;
	var returnValue = window.showModalDialog(URL_CORE + '_prompt.htm', params, 'dialogwidth:280px; dialogheight:150px; status:yes; help:no;resizable:no;unadorned:yes');
	return returnValue;
}

/*
 *	捕获页面js报错
 */
function onError(msg,url,line) {
	alert(msg, "错误:" + msg + "\r\n行:" + line + "\r\n地址:" + url);
	event.returnValue = true;
}

window._alert = window.alert;
window._confirm = window.confirm;
window._prompt = window.prompt;

window.alert = Alert;
window.confirm = Confirm;
window.confirm2 = Confirm2;
window.prompt = Prompt;
window.onerror = onError;


