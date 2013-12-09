IS_TEST = false;

/* 
 * 当前应用名 
 */
APP_CODE    = "DM";
APPLICATION = APP_CODE.toLowerCase();
CONTEXTPATH = APPLICATION + "/";
AUTH_PATH    = "/" + CONTEXTPATH + "auth/";
NO_AUTH_PATH = "/" + CONTEXTPATH;

URL_UPLOAD_FILE  = AUTH_PATH + "file/upload";	

if( IS_TEST ) {
	URL_CORE = "../framework/";
} else {
	URL_CORE = "/" + APPLICATION + "/framework/";  // 界面核心包相对路径
}

ICON = URL_CORE + "images/";

/* 
 * 常量定义
 */
XML_OPERATION = "Operation";
XML_PAGE_INFO = "PageInfo";

PAGESIZE = 50;

OPERATION_ADD  = "新建$label";
OPERATION_VIEW = "查看\"$label\"";
OPERATION_DEL  = "删除\"$label\"";
OPERATION_EDIT = "编辑\"$label\"";
OPERATION_SEARCH = "查询\"$label\"";
OPERATION_SETTING = "设置\"$label\"";
OPERATION_PERMISSION = "设置\"$label\"权限";

/* 延时 */
TIMEOUT_TAB_CHANGE = 200;
TIMEOUT_GRID_SEARCH = 200;

/* 默认唯一编号名前缀 */
CACHE_TREE_NODE = "_treeNode_";
CACHE_MAIN_TREE = "_tree_";

DEFAULT_NEW_ID = "-10";



/* 用户信息初始化  */
function initUserInfo() {
	if( IS_TEST ) return;

	if( Query.get("login") != "true" ) return;

	Ajax({
		url : "/" + AUTH_PATH + "user/operatorInfo",
		method : "POST",
		headers : {"appCode": APP_CODE},
		contents : {"anonymous": "true"}, 
		onresult : function() {
			var userName = this.getNodeValue("name");
			$$("userInfo").innerText = userName;
		}
	});
}

function logout() {
	Ajax({
		url : URL_CORE + "../logout.in",
		method : "GET",
		onsuccess : function() { 
			Cookie.del("token", "/" + CONTEXTPATH);
			location.href = URL_CORE + "../login.html";
		}
	});
}

// 关闭页面时候自动注销
function logoutOnClose() {
	Event.attachEvent(window, "unload", function() {
		if(10*1000 < window < screenTop || 10*1000 < window.screenLeft) {
			logout();
		}
	});
}

/*
 *	检查密码强度
 *	参数：	object:formObj                  xform对象
			string:url                      请求地址
			string:password                 密码
			string:loginName                登录名
 */
function checkPasswordSecurityLevel(formObj, url, password, loginName) {
	Ajax({
		url : url,
		method : "POST",
		headers : {"appCode": APP_CODE},
		contents : {"password": password, "loginName": loginName}, 
		onresult : function() {
			var securityLevel = this.getNodeValue(XML_SECURITY_LEVEL);
			formObj.securityLevel = securityLevel;
			showPasswordSecurityLevel(formObj);
		},
		onsuccess : function() { 
			formObj.securityLevel = null;
		}
	});
}

/*
 *	显示密码强度提示信息
 *	参数：	object:formObj                  xform对象
 */
function showPasswordSecurityLevel(formObj) {
	var errorInfo = {
		0: "您输入的密码安全等级为不可用，不安全",
		1: "您输入的密码安全等级为低，只能保障基本安全",
		2: "您输入的密码安全等级为中，较安全",
		3: "您输入的密码安全等级为高，很安全"
	};
	formObj.showCustomErrorInfo("password", errorInfo[formObj.securityLevel]);
}


var ws;
var wsElement;
function initWorkSpace() {
	wsElement = $$("ws");
	ws = new WorkSpace(wsElement);
	 
	$$("ws").onTabCloseAll = function(event) {
		hideWorkSpace();
	}
	$$("ws").onTabChange = function(event) {
		var fromTab = event.lastTab;
		var toTab = event.tab;
		showWorkSpace();
	}
}

/* 隐藏tab页工作区 */
function hideWorkSpace() {
	var tr = wsElement.parentNode.parentNode;
	tr.style.display = "none";
	tr.previousSibling.style.display = "none";    
}

/* 显示tab页工作区 */
function showWorkSpace() {
	var tr = wsElement.parentNode.parentNode;
	tr.style.display = "";
	tr.previousSibling.style.display = "";
}


/* 左栏添加左右拖动效果 */
function initPaletteResize() {
	var palette = $$("palette");
	//Element.attachColResize(palette);
}

/* 添加上下拖动效果 */
function initListContainerResize() {
	var listContainer = $$("listContainer");
	// Element.attachRowResize(listContainer);
}
 
/* 点击树刷新按钮 */
function onClickTreeBtRefresh() {
	loadInitData();
}

/* 点击左栏控制按钮 */
function onClickPaletteBt() {
	var block = Blocks.getBlock("palette");
	if( block ) {
		block.switchTo();
	}
	
	$$("paletteBt").className = block.visible ? "icon" : "iconClosed";
}

/* 点击树标题  */
function onClickTreeTitle() {
	Focus.focus($$("treeTitle").firstChild.id);
}

/* 点击状态栏标题 */
function onClickStatusTitle() {
	Focus.focus($$("statusTitle").firstChild.id);
}

/* 点击grid标题 */
function onClickGridTitle() {
	Focus.focus("gridTitle");
}

function onTreeNodeActived(eventObj){
	 Focus.focus( $$("treeTitle").firstChild.id );
	 showTreeNodeInfo();
}

function onTreeNodeRightClick(eventObj, carePermission, treeName) {
	showTreeNodeInfo();

	var menu = $$(treeName || "tree").contextmenu;
	if(menu == null) {
		return;
	}

	if( carePermission ) {
        var treeNode = eventObj.treeNode;
        getTreeOperation(treeNode, function(_operation) {
			menu.show(eventObj.clientX, eventObj.clientY);
        });
	}
	else {
		menu.show(eventObj.clientX, eventObj.clientY);
	}
}

/*
 *	获取树操作权限
 *	参数：	treeNode:treeNode       treeNode实例
			function:callback       回调函数
 */
function getTreeOperation(treeNode, callback, url) {
	url = url || URL_GET_OPERATION;
	var _operation = treeNode.getAttribute("_operation");

	var treeId = treeNode.getId();
	if(treeId == "_rootId") {
		treeId = 0;
	}
	
	// 如果节点上还没有_operation属性，则发请求从后台获取信息
	if( isNullOrEmpty(_operation) ) { 
		Ajax({
			url : url + treeId,
			onresult : function() {
				_operation = this.getNodeValue(XML_OPERATION);
				treeNode.setAttribute("_operation", _operation);

				if ( callback ) {
					callback(_operation);
				}
			}
		});			
	} 
	else {
		if ( callback ) {
			callback(_operation);
		}
	}    
}

/*
 *	清除树节点操作权限
 *	参数：	xmlNode:treeNode                XmlNode实例
			boolean:clearChildren           是否清除子节点
 */
function clearOperation(treeNode, clearChildren) {
	treeNode.removeAttribute("_operation");

	if( clearChildren != false ) {
		var childs = treeNode.selectNodes(".//treeNode");
		for(var i=0; i < childs.length; i++) {
			childs[i].removeAttribute("_operation");
		}
	}
}
	
/*
 *	检测右键菜单项是否可见
 *	参数：	string:code     操作码
 */
function getOperation(code, treeName) {
	var flag = false;
	var treeNode = $T(treeName || "tree").getActiveTreeNode();
	if( treeNode ) {
		var _operation = treeNode.getAttribute("_operation");
		flag = checkOperation(code, _operation);
	}
	return flag;
}

/*
 *	检测操作权限
 *	参数：	string:code             操作码
			string:_operation       权限
 *	返回值：
 */
function checkOperation(code, _operation) {
	var flag = false;
	if( "string" == typeof(code) && "string" == typeof(_operation) ) {
		var reg = new RegExp("(^" + code + ",)|(^" + code + "$)|(," + code + ",)|(," + code + "$)", "gi");
		flag = reg.test(_operation);
	}
	return flag;
}

/* request请求期间，同步按钮禁止/允许状态 */
function syncButton(btObjs, request) {
	for(var i=0; i < btObjs.length; i++) {
		disableButton(btObjs[i]);
	}

	request.ondata = function() {
		for(var i=0; i < btObjs.length; i++) {
			enableButton(btObjs[i]);
		}
	}
}
/* 禁止点击按钮 */
function disableButton(btObj) {
	btObj.disabled = true;
}
/* 允许点击按钮 */
function enableButton(btObj) {
	btObj.disabled = false;
}

/*
 *	初始化导航条
 *	参数：	string:curId       当前菜单项id
 */
function initNaviBar(curId, relativePath) {	
	var isModule = (window.location.href.indexOf("module") > 0);
	relativePath = relativePath || (isModule ? "../../../" : "../");

	Ajax({
		url : relativePath + "navi.xml",
		method : "GET",
		onresult : function() {
			var data = this.getNodeValue("NaviInfo");

			var str = [];
			var menuItems = data.selectNodes("MenuItem");
			for(var i=0; i < menuItems.length; i++) {
				var menuItem = menuItems[i];
				var id   = menuItem.getAttribute("id");
				var href = menuItem.getAttribute("href");
				var name = menuItem.getAttribute("name");

				if(href == null) {
					str[str.length] = name;
					continue;
				}

				if( false == /^javascript\:/.test(href) ) {
					href = relativePath + href;
				}
				
				var cssStyle = (curId == id) ? "naviActive" : "navi";
				str[str.length] = "<a href=\"" + href + "\" class=\"" + cssStyle + "\">" + name + "</a>";
			}
			$$("navibar").innerHTML = str.join(" ");
			$$("navibar").style.display = "inline";
		}
	});
}

/* 事件绑定初始化 */
function initEvents() {
	Event.attachEvent($$("treeBtRefresh"), "click", onClickTreeBtRefresh);
	Event.attachEvent($$("treeTitle"),     "click", onClickTreeTitle);

	Focus.register( $$("treeTitle").firstChild );

	logoutOnClose(); // 关闭页面自动注销
}

/* 创建导入Div */
function createImportDiv(remark, checkFileWrong, importUrl) {
	var importDiv = $$("importDiv");
	if( importDiv == null ) {
		importDiv = document.createElement("div");    
		importDiv.id = "importDiv";      
		importDiv.style.background = "#BEC6EE";    
		importDiv.style.width = "250px";    
		importDiv.style.height = "100px";   
		importDiv.style.padding = "10px 10px 10px 10px";   
		importDiv.style.fontSize = "12px"; 
		document.body.appendChild(importDiv);

		var str = [];
		str[str.length] = "<form id='importForm' method='post' target='fileUpload' enctype='multipart/form-data'>";
		str[str.length] = "	 <input type='file' name='file' id='sourceFile'/> <br> " + remark + "<br> ";
		str[str.length] = "	 <input type='button' id='importBt' value='导入' /> ";
		str[str.length] = "	 <input type='button' id='closeBt'  value='关闭' /> ";
		str[str.length] = "</form>";
		str[str.length] = "<iframe width='0px' height='0px' name='fileUpload'></iframe>";
		
		importDiv.innerHTML = str.join("\r\n");

		$$("closeBt").onclick = function () {
			Element.hide(importDiv);
		}
	}

	// 每次 importUrl 可能不一样，比如导入门户组件时。不能缓存
	$$("importBt").onclick = function() {
		var fileValue = $$("sourceFile").value;
		if( fileValue == null) {
			 return alert("请选择导入文件!");				 
		}

		var length = fileValue.length;
		var subfix = fileValue.substring(length - 4, length);
		if( checkFileWrong && checkFileWrong(subfix) ) {
		   return alert(remark);
		}

		var form = $$("importForm");
		form.action = importUrl;
		form.submit();

		Element.hide(importDiv);
	}

	return importDiv;
}

 /* 创建导出用iframe */
function createExportFrame() {
	var frameName = "exportFrame";
	var frameObj = $$(frameName);
	if( frameObj == null ) {
		frameObj = document.createElement("<iframe name='" + frameName + "' id='" + frameName + "' src='about:blank' style='display:none'></iframe>");
		document.body.appendChild(frameObj);
	}
	return frameName;
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
	window.showModalDialog(URL_CORE + '_info.htm', params, 'dialogwidth:278px; dialogheight:150px; status:yes; help:no;resizable:yes;unadorned:yes');
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

/* 捕获页面js报错 */
function onError(msg, url, line) {
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