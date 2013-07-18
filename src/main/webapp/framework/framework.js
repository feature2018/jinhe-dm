IS_TEST = false;

/* 
 * 当前应用名 
 */
APP_CODE    = "DM";
APPLICATION = APP_CODE.toLowerCase();
CONTEXTPATH = APPLICATION + "/";

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
OPERATION_PERMISSION = "设置\"$label\"权限";

/* 延时 */
TIMEOUT_TAB_CHANGE = 200;
TIMEOUT_GRID_SEARCH = 200;

/* 默认唯一编号名前缀 */
CACHE_TREE_NODE = "_treeNode_";
CACHE_MAIN_TREE = "_tree_";
CACHE_TOOLBAR   = "_toolbar_";

DEFAULT_NEW_ID = "-10";


/*
 *	禁止鼠标右键 
 */
document.oncontextmenu = function(eventObj) {
	eventObj = eventObj || window.event;
	var srcElement = Event.getSrcElement(eventObj);
	var tagName = srcElement.tagName.toLowerCase();
	if("input" != tagName && "textarea" != tagName) {
		event.returnValue = false;            
	}
}

/*
 *	用户信息初始化
 */
function initUserInfo() {
	if( true ) return;

	Ajax({
		url : "um/user!getOperatorInfo.action",
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
			location.href = URL_CORE + "../login.htm";
		}
	});
}

// 关闭页面时候自动注销
function logoutOnClose() {
	window.attachEvent("onuload", function() {
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

/*
 *	隐藏tab页工作区
 */
function hideWorkSpace() {
	var tr = wsElement.parentNode.parentNode;
	tr.style.display = "none";
	tr.previousSibling.style.display = "none";    
}

/*
 *	显示tab页工作区
 */
function showWorkSpace() {
	var tr = wsElement.parentNode.parentNode;
	tr.style.display = "";
	tr.previousSibling.style.display = "";
}


/*
 *	左栏添加左右拖动效果
 */
function initPaletteResize() {
	var palette = $$("palette");
	Element.attachColResize(palette, -1);
}

/*
 *	添加上下拖动效果
 */
function initListContainerResize() {
	var listContainer = $$("listContainer");
	Element.attachRowResize(listContainer, 8);
}


var toolbar;
 
function initToolBar() {
	toolbar = ToolBars.create($$("toolbar"));
}

/*
 *	点击树刷新按钮
 */
function onClickTreeBtRefresh() {
	loadInitData();
}

/*
 *	点击树标题按钮
 */
function onClickTreeTitleBt() {
	var treeTitleObj = $$("treeTitle");
	var statusTitleObj = $$("statusTitle");

	var block = Blocks.getBlock("treeContainer");
	if( block ) {
		block.switchTo();
	}
	if( block.visible ) {
		treeTitleObj.firstChild.className = "opened";
		statusTitleObj.firstChild.className = "opened";

		var block = Blocks.getBlock("statusContainer");
		if( block ) {
			block.show();
		}
	} else {
		treeTitleObj.firstChild.className = "closed";
		statusTitleObj.firstChild.className = "opened";

		var block = Blocks.getBlock("statusContainer");
		if( block ) {
			block.show(false);
		}
	}
}

/*
 *	点击状态栏标题按钮
 */
function onClickStatusTitleBt() {
	var treeTitleObj = $$("treeTitle");
	var statusTitleObj = $$("statusTitle");

	var block = Blocks.getBlock("statusContainer");
	if( block ) {
		block.switchTo();
	}

	if(block.visible) {
		statusTitleObj.firstChild.className = "opened";        
	}
	else {
		statusTitleObj.firstChild.className = "closed";

		var block = Blocks.getBlock("treeContainer");
		if( block && true != block.visible ) {
			treeTitleObj.firstChild.className = "opened";

			var block = Blocks.getBlock("treeContainer");
			if( block ) {
				block.show();
			}
		}
	}
}

/*
 *	点击左栏控制按钮
 */
function onClickPaletteBt() {
	var block = Blocks.getBlock("palette");
	if( block ) {
		block.switchTo();
	}
	
	$$("paletteBt").className = block.visible ? "icon" : "iconClosed";
}

/*
 *	点击树标题
 */
function onClickTreeTitle() {
	Focus.focus($$("treeTitle").firstChild.id);
}

/*
 *	点击状态栏标题
 */
function onClickStatusTitle() {
	Focus.focus($$("statusTitle").firstChild.id);
}

/*
 *	点击grid标题
 *	参数：	
 *	返回值：
 */
function onClickGridTitle() {
	Focus.focus("gridTitle");
}


/*
 *	获取树操作权限
 *	参数：	treeNode:treeNode       treeNode实例
			function:callback       回调函数
 */
function getTreeOperation(treeNode, callback, url) {
	url = url || URL_GET_OPERATION;
	var _operation = treeNode.getAttribute("_operation");
	
	// 如果节点上还没有_operation属性，则发请求从后台获取信息
	if( isNullOrEmpty(_operation) ) { 
		Ajax({
			url : url + treeNode.getId(),
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
 *	检测右键菜单项是否可见
 *	参数：	string:code     操作码
 */
function getOperation(code) {
	var flag = false;
	var treeNode = $T("tree").getActiveTreeNode();
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


/*
 *	获取树节点属性
 *	参数：	string:name         属性名
 *	返回值：string:value        属性值
 */
function getTreeAttribute(name) {
	var treeObj = $T("tree");
	var treeNode = treeObj.getActiveTreeNode();
	if( treeNode ) {
		return treeNode.getAttribute(name);
	}
	return null;   
}

function getTreeNodeId() {
	return getTreeAttribute("id");
}

function getTreeNodeName() {
	return getTreeAttribute("name");
}

function isTreeNodeDisabled() {
	return getTreeAttribute("disabled") == "1";
}

function isTreeRoot() {
	return "_rootId" == getTreeNodeId();
}

/*
 *	修改树节点属性
 *	参数：  string:id               树节点id
			string:attrName         属性名
			string:attrValue        属性值
			string:refresh          是否刷新树
 *	返回值：
 */
function modifyTreeNode(id, attrName, attrValue, refresh) {
	var treeObj = $T("tree");
	var treeNode = treeObj.getTreeNodeById(id);
	if( treeNode ) {
		treeNode.setAttribute(attrName, attrValue);
	}
	if( refresh ) {
		treeObj.reload();
	}
}

/*
 *	添加子节点
 *	参数：	string:id           树节点id
			XmlNode:xmlNode     XmlNode实例
 *	返回值：
 */
function appendTreeNode(id, xmlNode) {
	var treeObj = $T("tree");
	var treeNode = treeObj.getTreeNodeById(id);
	if( treeNode && xmlNode ) {
		treeObj.insertTreeNodeXml(xmlNode.toXml(), treeNode);
	}
}

/*
 *	获取树全部节点id数组
 *	参数：	XmlNode:xmlNode         XmlNode实例
			string:xpath            选取节点xpath
 *	返回值：Array:Ids               节点id数组
 */
function getTreeNodeIds(xmlNode, xpath) {
	  var idArray = [];
	  var treeNodes = xmlNode.selectNodes(xpath || "./treeNode//treeNode");
	  for(var i=0; i < treeNodes.length; i++) {
		  var curNode = treeNodes[i];
		  var id = curNode.getAttribute("id");
		  if( id ) {
			  idArray.push(id);
		  }
	  }
	  return idArray;
}

/*
 *	树节点定位
 *	参数：	Element:treeObj         tree控件
			Element:keywordObj      关键字输入框
 *	返回值：
 */
function searchTree(treeObj, keywordObj) {	
	var tempAlert = window.alert;  // 覆盖树控件搜索出错信息提示方法
	
	window.alert = function(str) {
		var balloon = Balloons.create(str);
		balloon.dockTo(keywordObj);
	}

	if( treeObj.research ) {
		var keyword = treeObj.keyword;
		treeObj.searchNode(keyword, "name", "hazy", "down");
		treeObj.research = false;
	}
	else{
		treeObj.searchNext("down", true);
	}

	// 还原信息提示方法
	window.alert = tempAlert;
}

/*
 *	树节点定位
 *	参数：	Element:treeObj         tree控件
			Element:btObj           搜索按钮
			Element:keywordObj      关键字输入框
 *	返回值：
 */
function attachSearchTree(treeObj, btObj, keywordObj) {
	// 设置搜索按钮操作
	btObj.onclick = function() {
		searchTree(treeObj, keywordObj);
	}

	// 设置搜索关键字操作
	keywordObj.value = "";
	keywordObj.onchange = function() {
		treeObj.research = true;
		treeObj.keyword = this.value;
	}

	keywordObj.onchange();    
}

/*
 *	清除tree数据
 *	参数：	Element:treeObj         tree控件对象
 */
function clearTreeData(treeObj) {
	var xmlReader = new XmlReader("<actionSet/>");
	var emptyNode = new XmlNode(xmlReader.documentElement);
	treeObj.load(emptyNode.node);
	treeObj.research = true;
}    

/*
 *	根据条件将部分树节点设置为不可选状态
 */
function disableTreeNodes(treeXML, xpath) {
	var nodeLsit = treeXML.selectNodes(xpath);
	if(nodeLsit) {
		for(var i = 0; i < nodeLsit.length; i++) {
			nodeLsit[i].setAttribute("canselected", "0");
		}
	}
}

function disableSingleTreeNode(treeXML, xpath) {
	var node = treeXML.selectSingleNode(xpath);
	if(node) {
		node.setAttribute("canselected", "0");
	}
}
			
/*
 *	删除树选中节点
 *	参数：	Element:treeObj         tree控件对象
			Array:exceptIds         例外的id
 *	返回值：
 */
function removeTreeNode(treeObj, exceptIds) {
	exceptIds = exceptIds || ["_rootId"];

	var selectedNodes = treeObj.getSelectedTreeNode();
	for(var i=0; i < selectedNodes.length; i++) {
		var curNode = selectedNodes[i];
		var id = curNode.getId();

		var flag = true;
		for(var j=0; j < exceptIds.length; j++) {
			if(id == exceptIds[j]) {
				flag = false;
				break;
			}
		}

		if(flag) {
			treeObj.removeTreeNode(curNode);
		}
	}
}

/*
 *	将树选中节点添加到另一树中(注：过滤重复id节点，并且结果树只有一层结构)
 *	参数：	Element:fromTree         树控件
			Element:toTree           树控件
			Function:checkFunction      检测单个节点是否允许添加
 *	返回值：
 */
function addTreeNode(fromTree, toTree, checkFunction) {	
	var reload = false;
	var selectedNodes = fromTree.getSelectedTreeNode(false);	
	for(var i=0; i < selectedNodes.length; i++) {
		var curNode = selectedNodes[i];

		if("0" == curNode.getAttribute("canselected")) {
			continue;  // 过滤不可选择的节点
		}

		curNode.setSelectedState(0, true, true);

		if( checkFunction ) {
			var result = checkFunction(curNode);
			if( result && result.error ) {
				// 显示错误信息
				if( result.message ) {
					var balloon = Balloons.create(result.message);
					balloon.dockTo(toTree.element);
				}

				if( result.stop ) {
					return;
				}
				continue;
			}
		}

		var groupName = curNode.getName();
		var id = curNode.getId();

		var sameAttributeTreeNode = hasSameAttributeTreeNode(toTree, "id", id);
		if("_rootId" != id && false == sameAttributeTreeNode) {
			// 至少有一行添加才刷新Tree
			reload = true;

			// 排除子节点
			var treeNode = toTree.getTreeNodeById("_rootId");
			if( treeNode ) {
				var cloneNode = new XmlNode(curNode.node).cloneNode(false);
				toTree.insertTreeNodeXml(cloneNode.toXml(),treeNode);
			}
		}
	}

	if( reload ) {
		toTree.reload();
	}
	fromTree.reload();
}

/*
 *	检测是否有相同属性节点
 *	参数：	Element:treeObj         tree控件对象
			string:attrName         属性名
			string:attrValue        属性值
 *	返回值：
 */
function hasSameAttributeTreeNode(treeObj, attrName, attrValue) {
	var flag = false;
	var root = treeObj.getTreeNodeById("_rootId").node;
	var treeNode = root.selectSingleNode(".//treeNode[@" + attrName + "='" + attrValue + "']");
	if( treeNode ) {
		flag = true;
		flag.treeNode = treeNode;
	}
	return flag;
}

/*
 *	显示当前树节点信息
 */
function showTreeNodeStatus(params) {
	var treeObj = $T("tree");
	var treeNode = treeObj.getActiveTreeNode();
	if( treeNode ) {
		var id = treeNode.getId();
		var block = Blocks.getBlock("statusContainer");
		if( block && "_rootId" != id ) {
			block.open();

			for(var item in params) {
				var name = params[item];
				var val = treeNode.getAttribute(item);
				block.writeln(name, val);                
			}

			block.close();
		}
		if( "_rootId" == id ) {
		   block.hide();
		}
	}
}

function showTreeNodeInfo() {
	showTreeNodeStatus(
		{id:"ID", name:"名称", creatorName:"创建者", createTime:"创建时间", updatorName:"修改者", updateTime:"修改时间"}
	);
}

// 删除选中节点，适用于多层结构树
function delTreeNode(url) {
	if( !confirm("您确定要删除吗？") )  return;

	var tree = $T("tree");
	var treeNode = tree.getActiveTreeNode();
	Ajax({
		url : url || URL_DELETE_NODE + treeNode.getId(),
		method : "DELETE",
		onsuccess : function() { 
			var parentNode = treeNode.getParent();
			if( parentNode ) {
				tree.setActiveTreeNode(parentNode.getId());
			}
			tree.removeTreeNode(treeNode);
		}
	});	
}

// 删除选中Grid行
function delGridRow(url) {
	if( !confirm("您确定要删除吗？") ) return;
	
	var rowIndex = $$("grid").selectRowIndex; 
	if( rowIndex ) {
		var grid = $G("grid");
		var row = grid.getRowByIndex(rowIndex);
		var userID = row.getAttribute("id");  
		
		Ajax({
			url : url + userID,
			method : "DELETE",
			onsuccess : function() { 
				grid.deleteRow(row);
			}
		});	
	}
}

/*
 *	停用启用节点
 *	参数：	url      请求地址
			state    状态
			iconName 节点图标
 */
function stopOrStartTreeNode(url, state, iconName) {		
	var tree = $T("tree");
	var treeNode = tree.getActiveTreeNode();
	Ajax({
		url : url || URL_STOP_NODE + treeNode.getId() + "/" + state,
		onsuccess : function() { 
			// 刷新父子树节点停用启用状态: 启用上溯，停用下溯
			var curNode = new XmlNode(treeNode.node);
			refreshTreeNodeState(curNode, state);
	
			if("1"==state) {
				var childNodes = curNode.selectNodes(".//treeNode");
				for(var i=0; i < childNodes.length; i++) {                
					refreshTreeNodeState(childNodes[i], state);
				}
			} else if ("0" == state) {
				while( curNode && curNode.getAttribute("id") > 0 ) {
					refreshTreeNodeState(curNode, state);
					curNode = curNode.getParent();
				}            
			}
			
			tree.reload(); 
		}
	});
	
	this.refreshTreeNodeState = function(xmlNode) {
        xmlNode.setAttribute("disabled", state);
        xmlNode.setAttribute("icon", ICON + iconName + (state == "0" ? "" : "_2 ") + ".gif");
    }
}

// 对同层的树节点进行排序
function sortTreeNode(url, eventObj) {
	var movedNode  = eventObj.movedTreeNode;
	var targetNode = eventObj.toTreeNode;
	var direction  = eventObj.moveState; // -1: 往上, 1: 往下
	var movedNodeID = movedNode.getId();
 
	Ajax({
		url : url + movedNodeID + "/" + targetNode.getId() + "/" + direction,
		onsuccess : function() { 
			 $T("tree").moveTreeNode(movedNode, targetNode, direction);
		}
	});
}


/*
 *	禁止点击按钮
 */
function disableButton(btObj) {
	btObj.disabled = true;
}
/*
 *	允许点击按钮：
 */
function enableButton(btObj) {
	btObj.disabled = false;
}
/*
 *	request请求期间，同步按钮禁止/允许状态
 */
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

function initBlocks(){
	Blocks.create($$("palette"));

	var treeContainerObj = $$("treeContainer");
	Blocks.create(treeContainerObj, treeContainerObj.parentNode);

	var statusContainerObj = $$("statusContainer");
	Blocks.create(statusContainerObj, statusContainerObj.parentNode, false);

	//状态信息区实例继承WritingBlock可写功能
	var block = Blocks.getBlock("statusContainer");
	if( block ){
		block.inherit(WritingBlock);
	}     
}

function initFocus(){
	var treeTitleObj = $$("treeTitle");
	var statusTitleObj = $$("statusTitle");

	Focus.register(treeTitleObj.firstChild);
	Focus.register(statusTitleObj.firstChild);
}

/*
 *	事件绑定初始化
 */
function initEvents() {
	Event.attachEvent($$("treeBtRefresh"), "click", onClickTreeBtRefresh);
	Event.attachEvent($$("treeTitleBt"),   "click", onClickTreeTitleBt);
	Event.attachEvent($$("statusTitleBt"), "click", onClickStatusTitleBt);
	Event.attachEvent($$("treeTitle"),     "click", onClickTreeTitle);
	Event.attachEvent($$("statusTitle"),   "click", onClickStatusTitle);
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
 *	工具条加载数据
 *	参数：	string:_operation      操作权限
			string:contentXML      工具条具体内容
 */
function _loadToolBar(_operation, contentXML) {
	var toolbarXML = Cache.XmlDatas.get(CACHE_TOOLBAR);
	if( toolbarXML == null ) { // 还没有就创建
		var xmlReader = new XmlReader(contentXML);
		toolbarXML = new XmlNode(xmlReader.documentElement);
		Cache.XmlDatas.add(CACHE_TOOLBAR, toolbarXML);
		toolbar.loadXML(toolbarXML); // 载入工具条
	}

	// 控制显示
	var buttons = toolbarXML.selectNodes("./button");
	for(var i=0; i < buttons.length; i++) {
		var curButton = buttons[i];
		var id = curButton.getAttribute("id");
		var code = curButton.getAttribute("code");
		var enableStr = curButton.getAttribute("enable");
		
		var visible = true;
		if("string" == typeof(_operation)) {
			var reg = new RegExp("(^" + code + ",)|(^" + code + "$)|(," + code + ",)|(," + code + "$)", "gi");
			visible = reg.test(_operation);
		}
		toolbar.setVisible(id, visible); // 按钮是否显示

		if( visible ) {
			var enable = Public.executeCommand(enableStr);
			toolbar.enable(id, enable); // 按钮是否禁用
		}
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