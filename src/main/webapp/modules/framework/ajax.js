/* 通讯用XML节点名 */
_XML_NODE_RESPONSE_ROOT    = "Response";
_XML_NODE_REQUEST_ROOT     = "Request";
_XML_NODE_RESPONSE_ERROR   = "Error";
_XML_NODE_RESPONSE_SUCCESS = "Success";
_XML_NODE_REQUEST_NAME     = "Name";
_XML_NODE_REQUEST_VALUE    = "Value";
_XML_NODE_REQUEST_PARAM    = "Param";

/* HTTP响应解析结果类型 */
_HTTP_RESPONSE_DATA_TYPE_EXCEPTION = "exception";
_HTTP_RESPONSE_DATA_TYPE_SUCCESS = "success";
_HTTP_RESPONSE_DATA_TYPE_DATA = "data";

/* HTTP超时(3分钟) */
_HTTP_TIMEOUT = 3*60*1000;


/*
 *  对象名称：XmlHttp对象，负责XmlHttp对象创建
 */
function XmlHttp() {
	if(window.ActiveXObject) {
		return new ActiveXObject("MSXML2.XMLHTTP"); // for IE6
	} 
	else if( window.XMLHttpRequest ) {
		return new XMLHttpRequest();
	} 
	else {
		alert("您的浏览器不支持XMLHTTP");
		return null;
	}
}

/*
 *  XMLHTTP请求参数对象，负责配置XMLHTTP请求参数
 */
function HttpRequestParams() {
	this.url = "";
	this.method = "POST";
	this.type = "xml"; // "xml or json"
	this.async = true;
	this.params = {};
	this.header = {};
}

/*
 *	设置发送数据
 */
HttpRequestParams.prototype.addParam = HttpRequestParams.prototype.setContent = function(name, value) {
	this.params[name] = value;
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

		this.addParam(name, value);
	}
}

/*
 *	清除制定名称的发送数据
 */
HttpRequestParams.prototype.clearContent = function(name) {
	delete this.params[name];
}

/*
 *	清除所有发送数据
 */
HttpRequestParams.prototype.clearAllContent = function() {
	this.params = {};
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
		p.addParam("loginName", loginName);
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

	this.paramObj = paramsInstance;
}

HttpRequest.prototype.getParamValue = function(name) {
	return this.paramObj.params[name];
}

HttpRequest.prototype.setParamValue = function(name, value) {
	this.paramObj.params[name] = value;
}

/*
 *	获取响应数据源代码
 *	返回值：string:result       响应数据源代码
 */
HttpRequest.prototype.getResponseText = function() {
	return this.value;
}

/*
 *	获取响应数据XML文档对象
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
	var childNodes = node.selectNodes("node()"); 
	for(var i = 0; i < childNodes.length; i++) {
		var childNode = childNodes[i];
		switch (childNode.nodeType)
		{
			case _XML_NODE_TYPE_TEXT:
				if(childNode.nodeValue.replace(/\s*/g, "") != "") {
					data = childNode;
				}
				break;
			case _XML_NODE_TYPE_ELEMENT:
			case _XML_NODE_TYPE_CDATA:
				data = childNode;
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
 */
 HttpRequest.prototype.send = function(wait) {
	 var oThis = this;
	
	 try {
		 if(this.paramObj.waiting) {
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

				 if(oThis.isAbort) {
					 Public.hideWaitingLayer();
				 }
				 else {
					 setTimeout( function() {
						 oThis.abort();

						 Public.hideWaitingLayer();
						 oThis.onload(response);

					 }, 100);
				 }
			 }
		 }

		 this.xmlhttp.open(this.paramObj.method, this.paramObj.url, this.paramObj.async);
		 
		 this.setTimeout(); // 增加超时判定
		 this.packageRequestParams();
		 this.customizeRequestHeader();

		 /* selectNodes()方法是依赖于 msxml 的，在IE10以前，浏览器处理了返回的XML格式的doucment , 使之变为 msxml-document ，使用 selectNode() 没问题。
		    但是IE10去掉了这一处理，返回原生的 XML， 所以需要我们自己手动设置成 msxml 。*/
		 try {  this.xmlhttp.responseType = 'msxml-document';  } catch (e) {  } 
		 
		 this.xmlhttp.send(this.requestBody);

	 } catch (e) {
		 Public.hideWaitingLayer();

		 // throw e;
		 var parserResult = {};
		 parserResult.dataType = _HTTP_RESPONSE_DATA_TYPE_EXCEPTION;
		 parserResult.type = 1;
		 parserResult.msg =  parserResult.description = e.description || e.message;
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
HttpRequest.prototype.packageRequestParams = function() {
	var contentXml = new XmlReader("<" + _XML_NODE_REQUEST_ROOT+"/>");
	var contentXmlRoot = new XmlNode(contentXml.documentElement);
 
	for(var name in this.paramObj.params) {
		var value = this.paramObj.params[name];
		if(value) {
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
	}

	this.requestBody = contentXml.toXml();
}

/*
 *	自定义请求头信息
 */
HttpRequest.prototype.customizeRequestHeader = function() {
	this.xmlhttp.setRequestHeader("REQUEST-TYPE", "xmlhttp");
	this.xmlhttp.setRequestHeader("CONTENT-TYPE","text/xml");
	this.xmlhttp.setRequestHeader("CONTENT-TYPE","application/octet-stream");

	if( !window.DOMParser ) {
		this.xmlhttp.setRequestHeader("Content-Length", this.requestBody.length);
	}

	// 设置header里存放的参数到requestHeader中
	for(var item in this.paramObj.header) {									
		var itemValue = String(this.paramObj.header[item]);
		try {
			this.xmlhttp.setRequestHeader(item, itemValue);
		}
		catch (e) {
			// chrome往header里设置中文会报错
		}
	}

	// 当页面url具有参数token则加入Cookie（可用于跨应用转发，见redirect.html）
	var token = Query.get("token");
	if( token != null ) {
		var exp = new Date();  
		exp.setTime(exp.getTime() + (30*1000));
		var expires = exp.toGMTString();  // 过期时间设定为30s
		Cookie.setValue("token", token, expires, "/" + CONTEXTPATH);
	}

}


/* HTTP响应状态 */
_HTTP_RESPONSE_STATUS_LOCAL_OK  = 0;    // 本地OK
_HTTP_RESPONSE_STATUS_REMOTE_OK = 200;  // 远程OK

/*
 *	加载数据完成，对结果进行处理
 *	参数：	Object:response     该对象各属性值继承自xmlhttp对象
 */
HttpRequest.prototype.onload = function(response) {
	this.value = response.responseText;

	//远程(200) 或 本地(0)才允许
	var httpStatus = response.status; 
	if(httpStatus != _HTTP_RESPONSE_STATUS_LOCAL_OK && httpStatus != _HTTP_RESPONSE_STATUS_REMOTE_OK) {
		var param = {};
		param.dataType = _HTTP_RESPONSE_DATA_TYPE_EXCEPTION;
		param.type = 1;
		param.source = this.value;
		param.msg = "HTTP " + httpStatus + " 错误\r\n" + response.statusText;
		param.description = "请求远程地址\"" + this.paramObj.url + "\"出错";
		new Message_Exception(param, this);
		this.returnValue = false;
		return;
	}

	// 因数据类型为json的请求返回的数据不是XML格式，但出异常的时候异常信息是XML格式，所以如果没有异常，则直接执行ondata
	if(this.paramObj.type == "json" && this.value.indexOf("<Error>") < 0) {
		this.ondata();
		return;
	}


	// 解析返回结果，判断是success 还是 error
	var responseParser = new HTTP_Response_Parser(this.value);
	this.xmlReader = responseParser.xmlReader;

	if(responseParser.result.dataType == _HTTP_RESPONSE_DATA_TYPE_EXCEPTION) {
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
	this.xmlReader.loadXml("");
}

// 定义空方法做为默认的回调方法
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
 *  对象名称：HTTP_Response_Parser对象
 *  职责：负责分析处理后台响应数据
 *
 *  成功信息格式：
 *  <Response>
 *      <Success>
 *          <type>1</type>
 *          <msg><![CDATA[ ]]></msg>
 *          <description><![CDATA[ ]]></description>
 *      </Success>
 *  </Response>
 *
 *  错误信息格式：
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
			// this.result.dataType = _HTTP_RESPONSE_DATA_TYPE_EXCEPTION; // 未找到有效节点则认为是异常信息
			this.result.dataType = _HTTP_RESPONSE_DATA_TYPE_DATA; // 未找到 Response 节点，可能直接返回了一段文本；不再认为是异常
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
 *  对象名称：Message_Success对象
 *  职责：负责处理成功信息
 */
function Message_Success(param, request) {
	request.ondata();

	var str = [];
	str[str.length] = "Success";
	str[str.length] = "msg=\""  + param.msg  + "\"";

	if(param.type != "0" && request.paramObj.type != "0") {
		alert(param.msg, str.join("\r\n"));

		// 3秒后自动自动隐藏成功提示信息
		setTimeout(function() {
			if($$("X-messageBox")) {
				$$("X-messageBox").style.display = "none";
			}
		}, 3000);
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
 * 
 * param.type： 参考 ErrorMessageEncoder
 * <li>1－普通业务逻辑错误信息，没有异常发生的
 * <li>2－有异常发生，同时被系统捕获后添加友好错误消息的
 * <li>3－其他系统没有预见的异常信息
 */
function Message_Exception(param, request) {
	var str = [];
	str[str.length] = "Error";
	str[str.length] = "type=\"" + param.type + "\"";
	str[str.length] = "msg=\"" + param.msg + "\"";
	str[str.length] = "description=\"" + param.description + "\"";
	str[str.length] = "source=\"" + param.source + "\"";

	if( param.msg && param.type != "0" && param.relogin != "1") {
		alert(param.msg, str.join("\r\n"));
	}

	request.onexception(param);

	// 是否需要重新登录
	if(param.relogin == "1") {
		/* 重新登录前，先清除token cookie，防止在门户iframe登录平台应用（如DMS），而'/tss'目录下的token依旧是过期的，
	     * 这样再次点击菜单（需redirect.html跳转的菜单）时还是会要求重新登录。 */
		Cookie.del("token", "");
		Cookie.del("token", "/");
		Cookie.del("token", "/" + FROMEWORK_CODE.toLowerCase());
		Cookie.del("token", "/" + CONTEXTPATH);

		popupMessage(param.msg);
		relogin(request);
	}
}

function relogin(request) {
	var reloginBox = $$("relogin_box");
	if(reloginBox == null) {
		var boxHtml = [];
		boxHtml[boxHtml.length] = "    <form>";
		boxHtml[boxHtml.length] = "      <h1>重新登录</h1>";
		boxHtml[boxHtml.length] = "      <span> 用户名：<input type='text' id='loginName' placeholder='请输入您的账号'/> </span>";
		boxHtml[boxHtml.length] = "      <span> 密&nbsp; 码：<input type='password' id='password' placeholder='请输入您的密码' /> </span>";
		boxHtml[boxHtml.length] = "      <span class='bottonBox'>";
		boxHtml[boxHtml.length] = "      	<input type='button' class='btLogin' id='bt_login' value='确 定'/>&nbsp;&nbsp;";
		boxHtml[boxHtml.length] = "      	<input type='button' id='bt_cancel' value='取 消'/>";
		boxHtml[boxHtml.length] = "      </span>";
		boxHtml[boxHtml.length] = "    </form>";

		reloginBox = document.createElement("div");    
		reloginBox.id = "relogin_box";    
		reloginBox.className = "popupBox";

 		reloginBox.innerHTML = boxHtml.join("");

		document.body.appendChild(reloginBox);
	}

	// 显示登录框
	reloginBox.style.display = "block";
	var loginNameObj = $$("loginName");
	var passwordObj = $$("password");
	loginNameObj.focus();
	passwordObj.value = ""; // 清空上次输入的密码，以防泄密
	
	loginNameObj.onblur = function() { 
        var value = this.value;
        if(value == null || value == "") return;
 		
 		if(loginNameObj.identifier) {
			delete loginNameObj.identifier;
		}
 		
        Ajax({
            url: "/" + CONTEXTPATH + "getLoginInfo.in",
            headers: {"appCode": FROMEWORK_CODE},
            contents: {"loginName": value},
            onexcption: function() {
                loginNameObj.focus();
            },
            onresult: function(){
                loginNameObj.identifier = this.getNodeValue("ClassName");
                passwordObj.focus();
            }
        });
    }

	var loginButton = $$("bt_login");
	var cancelButton = $$("bt_cancel");

	cancelButton.onclick = function() {
		reloginBox.style.display = "none";
	}
	
	var doLogin = function() {
		var loginName = loginNameObj.value;
        var password = passwordObj.value;
        var identifier = loginNameObj.identifier;
        
        if( "" == loginName ) {
            popupMessage("请输入账号");
            $$("loginName").focus();
            return;
        } 
		else if( "" == password ) {
            popupMessage("请输入密码");
            $$("password").focus();
            return;
        } 
        else if( identifier == null ) {
            popupMessage("无法登录，用户配置可能有误，请联系管理员。");
            return;
        } 
 
		var p = request.paramObj;
		p.setHeader("loginName", loginName);
		p.setHeader("password",  password);
		p.setHeader("identifier", identifier);

		request.send();

		reloginBox.style.display = "none";
	}

	loginButton.onclick = doLogin;

    Event.attachEvent(document, "keydown", function(eventObj) {
        if(13 == eventObj.keyCode) { // enter
            event.returnValue = false;
            $$("bt_login").focus();

            setTimeout(function() {
                doLogin();
            }, 10);
        }
    });
}

function popupMessage(msg) {
	if(window._alert) {
		_alert(msg);
	}
	else {
		alert(msg);
	}
}

/*
 *  对象名称：Ajax请求对象
 *  职责：再次封装，简化xmlhttp使用
 * 
	 Ajax({
		url : url,
		method : "GET",
		headers : {},
		params  : {}, 
		ondata : function() { },
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
	if(arg.type) {
		p.type = arg.type;
	}
	if(arg.waiting) {
		p.waiting = arg.waiting;
	}
	if(arg.async != null) {
		p.async = arg.async;
	}

	for(var item in arg.headers) {
		p.setHeader(item, arg.headers[item]);
	}
	for(var item in arg.contents) {
		p.addParam(item, arg.contents[item]);
	}
	for(var item in arg.params) {
		p.addParam(item, arg.params[item]);
	}

	if(arg.xformNode) {
		var dataMap = xformExtractData(arg.xformNode);
		for( var key in dataMap) {
			if( arg.add2Header ) {
				p.setHeader(key, dataMap[key]);
			} else {
				p.addParam(key, dataMap[key]);
			}
		}
	}

	var request = new HttpRequest(p);
	if( arg.ondata ) {
		request.ondata = arg.ondata;
	}
	if( arg.onresult ) {
		request.onresult = arg.onresult;
	}

	if( arg.onexception == null ) {
		arg.onexception = function(errorMsg) {
			// alert(errorMsg.description); // 遇到异常却看不到任何信息，可尝试放开这里的注释
		};
	}
	request.onexception = arg.onexception;

	if( arg.onsuccess ) {
		request.onsuccess = arg.onsuccess;
	}
	request.send();

	return request;
}