
/* 错误类型 */
_ERROR_TYPE_OPERATION_EXCEPTION = 0;
_ERROR_TYPE_KNOWN_EXCEPTION = 1;
_ERROR_TYPE_UNKNOWN_EXCEPTION = 2;

/* 通讯用XML节点名 */
_XML_NODE_RESPONSE_ROOT    = "Response";
_XML_NODE_REQUEST_ROOT     = "Request";
_XML_NODE_RESPONSE_ERROR   = "Error";
_XML_NODE_RESPONSE_SUCCESS = "Success";
_XML_NODE_REQUEST_NAME     = "Name";
_XML_NODE_REQUEST_VALUE    = "Value";
_XML_NODE_REQUEST_PARAM    = "Param";

/* HTTP响应状态 */
_HTTP_RESPONSE_STATUS_LOCAL_OK = 0;
_HTTP_RESPONSE_STATUS_REMOTE_OK = 200;

/* HTTP响应解析结果类型 */
_HTTP_RESPONSE_DATA_TYPE_EXCEPTION = "exception";
_HTTP_RESPONSE_DATA_TYPE_SUCCESS = "success";
_HTTP_RESPONSE_DATA_TYPE_DATA = "data";

/* HTTP超时(1分钟) */
_HTTP_TIMEOUT = 60*1000;

/*
 *  XMLHTTP请求参数对象，负责配置XMLHTTP请求参数
 */
function HttpRequestParams() {
	this.url = "";
	this.method = "POST";
	this.async = true;
	this.content = {};
	this.header = {};
}

HttpRequestParams.prototype.setMethod = function(value) {
	this.method = value;
}

/*
 *	设置发送数据
 */
HttpRequestParams.prototype.setContent = function(name, value) {
	this.content[name] = value;
}

/*
 *	设置xform专用格式发送数据
 *	参数：	XmlNode:dataNode 	XmlNode实例，xform的data数据节点
			string:prefix 	    提交字段前缀
 */
HttpRequestParams.prototype.setXFormContent = function(dataNode, prefix) {
	if(dataNode.nodeName != "data") return;

	var rename = dataNode.getAttribute("name");
	var nodes = dataNode.selectNodes("./row/*");
	for(var i = 0; i < nodes.length; i++) {
		var name = rename || nodes[i].nodeName; // 从data节点上获取保存名，如果没有则用原名
		var value = nodes[i].text;
		
		// 前缀，xform declare节点上设置，以便于把值设置到action的bean对象里
		if( prefix ) {
			name = prefix + "." + name;
		}

		this.setContent(name, value, false);
	}
}

/*
 *	清除制定名称的发送数据
 */
HttpRequestParams.prototype.clearContent = function(name) {
	delete this.content[name];
}

/*
 *	清除所有发送数据
 */
HttpRequestParams.prototype.clearAllContent = function() {
	this.content = {};
}

/*
 *	设置请求头信息
 */
HttpRequestParams.prototype.setHeader = function(name, value) {
	this.header[name] = value;
}


/*
 *  XMLHTTP请求对象，负责发起XMLHTTP请求并接收响应数据
	例子：
		var p = new HttpRequestParams();
		p.url = URL_GET_USER_NAME;
		p.setContent("loginName", loginName);
		p.setHeader("appCode", APP_CODE);

		var request = new HttpRequest(p);
		request.onresult = function(){
 
		}
		request.send();
 */
function HttpRequest(paramsInstance) {
	this.value = "";

	this.xmlhttp = new XmlHttp();
	this.xmlReader = new XmlReader();

	this.params = paramsInstance;
}

HttpRequest.prototype.getParamValue = function(name) {
	return this.params.content[name];
}

HttpRequest.prototype.setParamValue = function(name, value) {
	this.params.content[name] = value;
}

/*
 *	获取响应数据源代码
 *	参数：	
 *	返回值：string:result       响应数据源代码
 */
HttpRequest.prototype.getResponseText = function() {
	return this.value;
}

/*
 *	获取响应数据XML文档对象
 *	参数：	
 *	返回值：XmlReader:xmlReader       XML文档对象
 */
HttpRequest.prototype.getResponseXml = function() {
	return this.xmlReader;
}

/*
 *	获取响应数据XML文档指定节点对象值
 *	参数：	string:name             指定节点名
 *	返回值：any:value               根据节点内容类型不同而定
 */
HttpRequest.prototype.getNodeValue = function(name) {
	if(this.xmlReader.documentElement == null) return;

	var documentElement = new XmlNode(this.xmlReader.documentElement);
	var node = documentElement.selectSingleNode("/" + _XML_NODE_RESPONSE_ROOT + "/" + name);
	if(node == null) return;

	var data;
	var datas = node.selectNodes("node()");
	for(var i = 0; i < datas.length; i++) {
		var temp = datas[i];
		switch (temp.nodeType)
		{
			case _XML_NODE_TYPE_TEXT:
				if(temp.nodeValue.replace(/\s*/g, "") != "") {
					data = temp;
				}
				break;
			case _XML_NODE_TYPE_ELEMENT:
			case _XML_NODE_TYPE_CDATA:
				data = temp;
				break;
		}
		
		if( data ) break;
	}

	if( data ) {
		data = data.cloneNode(true); // 返回复制节点，以便清除整个原始文档
		switch(data.nodeType) {
			case _XML_NODE_TYPE_ELEMENT:
				return data;
			case _XML_NODE_TYPE_TEXT:
			case _XML_NODE_TYPE_CDATA:
				return data.nodeValue;
		}
	}
	return null
}

/*
 * 发起XMLHTTP请求
 * 参数：boolean  是否等待其余请求完成再发送
 */
 HttpRequest.prototype.send = function(wait) {
	 var oThis = this;

	 if(wait) {
		 var count = HttpRequests.getCount();
		 if(count == 0) {
			 oThis.send();
		 }
		 else {
			 HttpRequests.onFinishAll( function() {
				 oThis.send();
			 });
		 }
		 return;
	 }
	
	 try {
		 if(this.params.ani != null) {
			 Public.showWaitingLayer();
		 }

		 this.xmlhttp.onreadystatechange = function() {
			 if(oThis.xmlhttp.readyState == 4) {
				 oThis.clearTimeout();

				 var response = {};
				 response.responseText = oThis.xmlhttp.responseText;
				 response.responseXML  = oThis.xmlhttp.responseXML;
				 response.status       = oThis.xmlhttp.status;
				 response.statusText   = oThis.xmlhttp.statusText;

				 if(oThis.isAbort != true) {
					 setTimeout( function() {
						 oThis.abort();

						 Public.hideWaitingLayer();
						 oThis.onload(response);
						 
						 HttpRequests.del(oThis); // 从队列中去除
						 oThis.executeCallback();
					 }, 100);
				 }
				 else {
					 Public.hideWaitingLayer();

					 HttpRequests.del(oThis);  // 从队列中去除
					 oThis.executeCallback();
				 }
			 }
		 }

		 this.xmlhttp.open(this.params.method, this.params.url, this.params.async);
		 this.setTimeout(); // 增加超时判定
		 this.packageContent();
		 this.setCustomRequestHeader();
		 this.xmlhttp.send(this.requestBody);

		 HttpRequests.add(this); // 存入队列

	 }
	 catch (e) {
		 Public.hideWaitingLayer();

		 //throw e;
		 var parserResult = {};
		 parserResult.dataType = _HTTP_RESPONSE_DATA_TYPE_EXCEPTION;
		 parserResult.type = 1;
		 parserResult.msg = e.description;
		 parserResult.description = e.description;
		 parserResult.source = "";

		 this.onexception(parserResult);
	 }
 }

/*
 *	超时中断请求
 */
HttpRequest.prototype.setTimeout = function(noConfirm) {
	var oThis = this;

	this.timeout = setTimeout(function() {
		if(noConfirm != true && confirm("服务器响应较慢，需要中断请求吗？") == true) {
			oThis.isAbort = true;
			oThis.abort();
			oThis.isAbort = false;
		}
		else {
			oThis.clearTimeout();
			oThis.setTimeout(true);
		}
	}, _HTTP_TIMEOUT);
}

/*
 *	清除超时
 */
HttpRequest.prototype.clearTimeout = function() {
	clearTimeout(this.timeout);
}

/*
 *	对发送数据进行封装，以XML格式发送
 */
HttpRequest.prototype.packageContent = function() {
	var contentXml = new XmlReader("<" + _XML_NODE_REQUEST_ROOT+"/>");
	var contentXmlRoot = new XmlNode(contentXml.documentElement);

	function setParamNode(name, value) {
		var tempNameNode  = contentXml.createElement(_XML_NODE_REQUEST_NAME);
		var tempCDATANode = contentXml.createCDATA(name);
		tempNameNode.appendChild(tempCDATANode);

		var tempValueNode = contentXml.createElement(_XML_NODE_REQUEST_VALUE);
		var tempCDATANode = contentXml.createCDATA(value);
		tempValueNode.appendChild(tempCDATANode);

		var tempParamNode = contentXml.createElement(_XML_NODE_REQUEST_PARAM);
		tempParamNode.appendChild(tempNameNode);
		tempParamNode.appendChild(tempValueNode);

		contentXmlRoot.appendChild(tempParamNode);
	}

	for(var name in this.params.content) {
		var value = this.params.content[name];
		if(value == null) {
			continue;
		}

		setParamNode(name, value);
	}

	var contentStr = contentXml.toXml();
	this.xmlhttp.setRequestHeader("Content-Length", contentStr.length);
	this.requestBody = contentStr;
}

/*
 *	设置自定义请求头信息
 */
HttpRequest.prototype.setCustomRequestHeader = function() {
	this.xmlhttp.setRequestHeader("REQUEST-TYPE", "xmlhttp");
	this.xmlhttp.setRequestHeader("REFERER", this.params.url);
	for(var item in this.params.header) {									
		var itemValue = String(this.params.header[item]);
		if( itemValue != "" ) {
			this.xmlhttp.setRequestHeader(item, itemValue);
		}
	}

	// 当页面url具有参数token则加
	var token = Query.get("token");
	if( token != null ) {
		var exp = new Date();  
		exp.setTime(exp.getTime() + (30*1000));
		var expires = exp.toGMTString();  // 过期时间设定为30s
		Cookie.setValue("token", token, expires, "/" + CONTEXTPATH);
	}
	this.xmlhttp.setRequestHeader("CONTENT-TYPE","text/xml");
	this.xmlhttp.setRequestHeader("CONTENT-TYPE","application/octet-stream");
}

/*
 *	加载数据完成，对结果进行处理
 *	参数：	Object:response     该对象各属性值继承自xmlhttp对象
 */
HttpRequest.prototype.onload = function(response) {
	this.value = response.responseText;

	//远程(200) 或 本地(0)才允许
	var httpStatus = response.status;
	var httpStatusText = response.statusText;
	if(httpStatus != _HTTP_RESPONSE_STATUS_LOCAL_OK && httpStatus != _HTTP_RESPONSE_STATUS_REMOTE_OK) {
		var param = {};
		param.dataType = _HTTP_RESPONSE_DATA_TYPE_EXCEPTION;
		param.type = 1;
		param.source = this.value;
		param.msg = "HTTP " + httpStatus + " 错误\r\n" + httpStatusText;
		param.description = "请求远程地址\"" + this.params.url + "\"出错";
		new Message_Exception(param, this);
		this.returnValue = false;
		return;
	}

	var responseParser = new HTTP_Response_Parser(this.value);

	// 将通过解析后的xmlReader
	this.xmlReader = responseParser.xmlReader;

	if(responseParser.result.dataType ==_HTTP_RESPONSE_DATA_TYPE_EXCEPTION) {
		new Message_Exception(responseParser.result, this);
		this.returnValue = false;
	}
	else if(responseParser.result.dataType==_HTTP_RESPONSE_DATA_TYPE_SUCCESS) {
		new Message_Success(responseParser.result, this);
		this.returnValue = true;
	}
	else {
		this.ondata();
		this.onresult();
		this.returnValue = true;

		// 当返回数据中含脚本内容则自动执行
		var script = this.getNodeValue("script");
		if( script != null) {
			Element.createScript(script); // 创建script元素并添加到head中.
		}
	}

	// 清除原始文档
	this.xmlReader.xmlDom.loadXML("");
}

HttpRequest.prototype.ondata = HttpRequest.prototype.onresult = HttpRequest.prototype.onsuccess = HttpRequest.prototype.onexception = function() {

}

/*
 *	终止XMLHTTP请求
 */
HttpRequest.prototype.abort = function() {
	if(null != this.xmlhttp) {
		this.xmlhttp.abort();
	}
}

/*
 *	执行回调函数
 */
HttpRequest.prototype.executeCallback = function() {
	if( HttpRequests.getCount() == 0 && HttpRequests.callback != null ) {
		HttpRequests.callback();
		HttpRequests.callback = null;
	}
}


/*
 *  对象名称：HTTP_Response_Parser对象
 *  职责：负责分析处理后台响应数据
 *
 *  成功信息格式
 *  <Response>
 *      <Success>
 *          <type>1</type>
 *          <msg><![CDATA[ ]]></msg>
 *          <description><![CDATA[ ]]></description>
 *      </Success>
 *  </Response>
 *
 *  错误信息格式
 *  <Response>
 *      <Error>
 *          <type>1</type>
 *          <relogin>1</relogin>
 *          <msg><![CDATA[ ]]></msg>
 *          <description><![CDATA[ ]]></description>
 *      </Error>
 *  </Response>
 */
function HTTP_Response_Parser(responseText) {
	this.source = responseText;
	this.xmlReader = new XmlReader(responseText);
 
	this.result = {};
	var parseError = this.xmlReader.getParseError();
	if( parseError != null) {
		this.result.dataType = _HTTP_RESPONSE_DATA_TYPE_EXCEPTION;
		this.result.source = this.source;
		this.result.msg = "服务器异常";
		this.result.description = "数据出错在第" + parseError.line + "行第" + parseError.linepos + "字符\r\n" + parseError.reason;
	} 
	else {
		var documentNode = new XmlNode(this.xmlReader.documentElement);
		var informationNode = documentNode.selectSingleNode("/" + _XML_NODE_RESPONSE_ROOT + "/*");
		var hasInformation = false;

		if( informationNode == null) {		
			this.result.dataType = _HTTP_RESPONSE_DATA_TYPE_EXCEPTION; // 未找到有效节点则认为是异常信息
		}
		else if(informationNode.nodeName == _XML_NODE_RESPONSE_ERROR) { // 只要有Error节点就认为是异常信息
			this.result.dataType = _HTTP_RESPONSE_DATA_TYPE_EXCEPTION;
			this.result.source = this.source;
			hasInformation = true;
		}
		else if(informationNode.nodeName == _XML_NODE_RESPONSE_SUCCESS) { //只要有Success就认为是成功信息
			this.result.dataType = _HTTP_RESPONSE_DATA_TYPE_SUCCESS;
			hasInformation = true;
		} 
		else {
			this.result.dataType = _HTTP_RESPONSE_DATA_TYPE_DATA;
		}

		if(hasInformation) {
			var detailNodes = informationNode.selectNodes("*");
			for(var i = 0; i < detailNodes.length; i++) {
				var tempName  = detailNodes[i].nodeName;
				var tempValue = detailNodes[i].text;
				this.result[tempName] = tempValue;
			}
		}
	}
}


/*
 *  对象名称：XmlHttp对象，负责XmlHttp对象创建
 */
function XmlHttp() {
	if(window.ActiveXObject) {
		return new ActiveXObject("MSXML2.XMLHTTP");
	} 
	else if(window.XMLHttpRequest) {
		return new XMLHttpRequest();
	} 
	else {
		alert("您的浏览器不支持XMLHTTP");
		return null;
	}
}

/*
 *  对象名称：Message_Success对象
 *  职责：负责处理成功信息
 */
function Message_Success(param, request) {
	request.ondata();

	var str = [];
	str[str.length] = "Success";
	str[str.length] = "type=\"" + param.type + "\"";
	str[str.length] = "msg=\"" + param.msg + "\"";
	str[str.length] = "description=\"" + param.description + "\"";

	if(param.type != "0" && request.params.type != "0") {
		alert(param.msg, str.join("\r\n"));
	}

	request.onsuccess(param);
}

/*
 *  对象名称：Message_Exception对象
 *  职责：负责处理异常信息
 *
 *  注意：本对象除了展示异常信息（通过alert方法，window.alert=Alert，Alert在framework.js里做了重新定义）外，
 *  还可以根据是否需要重新登录来再一次发送request请求，注意此处参数Message_Exception(param, request)，该
 *  request依然还是上一次发送返回异常信息的request，将登陆信息加入后（loginName/pwd等，通过_relogin.htm页面获得），
 *  再一次发送该request请求，从而通过AutoLoginFilter的验证，取回业务数据。  
 *  这样做的好处是，当session过期需要重新登陆时，无需离开当前页面回到登陆页登陆，保证了用户操作的连贯性。
 */
function Message_Exception(param, request) {
	request.ondata();

	var str = [];
	str[str.length] = "Error";
	str[str.length] = "type=\"" + param.type + "\"";
	str[str.length] = "msg=\"" + param.msg + "\"";
	str[str.length] = "description=\"" + param.description + "\"";
	str[str.length] = "source=\"" + param.source + "\"";

	if(param.type != "0" && request.params.type != "0") {
		alert(param.msg, str.join("\r\n"));
	}

	request.onexception(param);

	//初始化默认值
	if( request.params.relogin != null) {
		param.relogin = request.params.relogin;
	}
	else if( param.relogin == null ) { // 默认不重新登录
		param.relogin = "0";
	}

	if(param.relogin == "1") {
		Cookie.del("token", "/" + CONTEXTPATH); // 先清除令牌

		var loginObj = window.showModalDialog(URL_CORE + "_relogin.htm", {title:"请重新登录"},"dialogWidth:250px;dialogHeight:200px;resizable:yes");
		if( loginObj != null) {
			var p = request.params;
			p.setHeader("loginName", loginObj.loginName);
			p.setHeader("password",  loginObj.password);
			p.setHeader("identifier", loginObj.identifier);

			request.send();
		}
	}
	else if(param.relogin == "2" ) { // 单点登录应用跳转，需要输入用户在目标系统中的密码
		var loginObj = window.showModalDialog(URL_CORE + "_relogin2.htm",{title:"请重新输入密码"},"dialogWidth:250px;dialogHeight:200px;resizable:yes");
		if(loginObj != null) {
			request.params.setHeader("pwd", loginObj.password);
			request.send();
		}
	}
}


/*
 *	对象名称：HttpRequests（全局静态对象）
 *	职责：负责所有http请求连接
 */
var HttpRequests = {};
HttpRequests.items = [];

/*
 *	终止所有请求连接
 */
HttpRequests.closeAll = function() {
	for(var i = 0; i < this.items.length; i++) {
		this.items[i] = true;
		this.items[i].abort();
		this.items[i] = false;
	}
}

/*
 *	加入一个请求连接
 */
HttpRequests.add = function(request) {
	this.items[this.items.length] = request;
}

/*
 *	去除一个请求连接
 */
HttpRequests.del = function(request) {
	for(var i = 0; i < this.items.length; i++) {
		if(this.items[i] == request ) {
			this.items.splice(i, 1); // splice() 方法用于插入、删除或替换数组的元素
			break;
		}
	}
}

/*
 *	统计当前连接数
 */
HttpRequests.getCount = function() {
	return this.items.length;
}

/*
 *	等待当前请求全部结束
 */
HttpRequests.onFinishAll = function(callback) {
	this.callback = callback;
}


/*
 *  对象名称：Ajax请求对象
 *  职责：再次封装，简化xmlhttp使用
 * 
	 Ajax({
		url : url,
		method : "GET",
		headers : {},
		contents : {}, 
		onresult : function() { },
		onexception : function() { },
		onsuccess : function() { }
	});
 */
function Ajax() {
	var arg = arguments[0];

	var p = new HttpRequestParams();
	p.url = arg.url;

	if(arg.method) {
		p.method = arg.method;
	}

	for(var item in arg.headers) {
		p.setHeader(item, arg.headers[item]);
	}
	for(var item in arg.contents) {
		p.setContent(item, arg.contents[item]);
	}

	var request = new HttpRequest(p);
	if( arg.onresult ) {
		request.onresult = arg.onresult;
	}
	if( arg.onexception ) {
		request.onexception = arg.onexception;
	}
	if( arg.onsuccess ) {
		request.onsuccess = arg.onsuccess;
	}
	request.send();

	return request;
}
