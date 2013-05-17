
/* 核心包相对路径 */
URL_CORE = "../../common/";

/* 延时  */
TIMEOUT_TAB_CHANGE = 200;

/* 后台响应数据节点名称  */
XML_MAIN_TREE = "CacheTree";
XML_CACHE_STRATEGY  = "CacheStrategy";
XML_CACHE_ITEM_LIST = "CacheItemList";
XML_OPERATION = "Operation";
XML_PAGE_LIST = "PageList";
XML_HIT_RATE  = "HitRate";

/* 默认唯一编号名前缀 */
CACHE_TREE_NODE = "_treeNode_";
CACHE_MAIN_TREE = "_tree_";
CACHE_TOOLBAR   = "_toolbar_";
 
/* 名称 */
OPERATION_EDIT = "维护\"$label\"";

/* XMLHTTP请求地址汇总  */
URL_INIT = "data/cache_init.xml";
URL_CACHE_DETAIL = "data/cache1.xml";
URL_SAVE_CACHE = "data/_success.xml";
URL_CACHE_CLEAR = "data/_success.xml";
URL_CACHE_INIT = "data/_success.xml";
URL_VIEW_CACHED_ITEM = "data/option1.xml";
URL_SAVE_OPTION = "data/_success.xml";
URL_GET_OPERATION = "data/operation.xml";
URL_REFRESH_ITEM = "data/item.xml";

//URL_INIT = "../../../pms/cache!getAllCacheStrategy4Tree.action";
//URL_CACHE_DETAIL = "../../../pms/cache!getCacheStrategyInfo.action";
//URL_SAVE_CACHE = "../../../pms/cache!modifyCacheStrategy.action";
//URL_CACHE_CLEAR = "../../../pms/cache!releaseCache.action";
//URL_CACHE_INIT = "../../../pms/cache!initPool.action";
//URL_VIEW_CACHED_ITEM = "../../../pms/cache!viewCachedItem.action";
//URL_SAVE_OPTION = "data/_success.xml";
//URL_GET_OPERATION = "data/operation.xml";
//URL_REFRESH_ITEM = "../../../pms/cache!refresh.action";


 
/*页面初始化 */
function init() {
	initPaletteResize();
	initListContainerResize();
//	initUserInfo();
	initToolBar();
	initNaviBar();
	initMenus();
	initBlocks();
	initWorkSpace(false);
	initEvents();
	initFocus();

	loadInitData();
}

/*
 *	页面初始化加载数据(包括工具条、菜单树)：
 */
function loadInitData() {
	var p = new HttpRequestParams();
	p.url = URL_INIT;

	var request = new HttpRequest(p);
	request.onresult = function() {
		var _operation = this.getNodeValue(XML_OPERATION);
		loadToolBar(_operation);

		var mainTreeXML = this.getNodeValue(XML_MAIN_TREE);
		Cache.XmlDatas.add(CACHE_MAIN_TREE, mainTreeXML);
 	
		var treeObj = $("tree");
		var tree = initTree(treeObj, mainTreeXML.toXml()); 
		
		// 添加自定义树事件
		treeObj.onTreeNodeActived = function(eventObj) {
			onTreeNodeActived(eventObj);
		}
		treeObj.onTreeNodeDoubleClick = function(eventObj) {
			onTreeNodeDoubleClick(eventObj);
		}
		treeObj.onTreeNodeRightClick = function(eventObj) {
			onTreeNodeRightClick(eventObj);
		}
	}
	request.send();
}

/*
 *	工具条加载数据
 *	参数：	string:_operation      操作权限
 */
function loadToolBar(_operation) {
	var toolbarXML = Cache.XmlDatas.get(CACHE_TOOLBAR);
	if( toolbarXML == null ) { // 还没有就创建
		var str = [];
		str[str.length] = "<toolbar>";
		str[str.length] = "    <button id=\"a1\" code=\"p1\" icon=\"images/icon_pre.gif\" label=\"上页\" cmd=\"ws.prevTab()\" enable=\"true\"/>";
		str[str.length] = "    <button id=\"a2\" code=\"p2\" icon=\"images/icon_next.gif\" label=\"下页\" cmd=\"ws.nextTab()\" enable=\"true\"/>";
		str[str.length] = "    <separator/>";
		str[str.length] = "    <button id=\"b1\" code=\"2\" icon=\"images/edit.gif\" label=\"维护\" cmd=\"maintainCache()\" enable=\"'_rootId'!=getTreeNodeId()\"/>";
		str[str.length] = "    <button id=\"b2\" code=\"2\" icon=\"images/init.gif\" label=\"初始化\" cmd=\"initCache()\" enable=\"'_rootId'!=getTreeNodeId() &amp;&amp; '1'==getTreeNodeReleased()\"/>";
		str[str.length] = "    <button id=\"b3\" code=\"2\" icon=\"images/clear.gif\" label=\"清空\" cmd=\"clearCache()\" enable=\"'_rootId'!=getTreeNodeId()\"/>";
		str[str.length] = "</toolbar>";

		var xmlReader = new XmlReader(str.join("\r\n"));
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
		
		var visible = false;
		if("string" == typeof(_operation)) {
			var reg = new RegExp("(^" + code + ",)|(^" + code + "$)|(," + code + ",)|(," + code + "$)", "gi");
			visible = reg.test(_operation);
		}
		toolbar.setVisible(id, visible);

		if( visible ) {
			var enable = Public.executeCommand(enableStr);
			toolbar.enable(id, enable);
		}
	}
}

/*
 *	菜单初始化
 */
function initMenus() {
	var item1 = {
		label:"维护",
		callback:maintainCache,
		icon:"images/edit.gif",
		enable: function() {return true;},
		visible:function() {return "_rootId" != getTreeNodeId() && true == getOperation("2");}
	}
	var item2 = {
		label:"初始化",
		callback:initCache,
		icon:"images/init.gif",
		enable:function() {return true;},
		visible:function() {return "_rootId"!=getTreeNodeId() && "1"==getTreeNodeReleased()  && true==getOperation("2");}
	}
	var item3 = {
		label:"清空",
		callback:clearCache,
		icon:"images/clear.gif",
		enable:function() {return true;},
		visible:function() {return "_rootId"!=getTreeNodeId()  && true==getOperation("2");}
	}

	var menu1 = new Menu();
	menu1.addItem(item1);
	menu1.addSeparator();
	menu1.addItem(item2);
	menu1.addItem(item3);

	$("tree").contextmenu = menu1;
}

function getTreeNodeId() {
	return getTreeAttribute("id");
}
 
function getTreeNodeReleased() {
	return getTreeAttribute("released");
}

/*
 *	初始化缓存池
 */
function initCache() {
	var treeObj = $T("tree");
	var treeNode = treeObj.getActiveTreeNode();
	if ( treeNode ) {
		var treeID = treeNode.getId();
		var p = new HttpRequestParams();
		p.url = URL_CACHE_INIT;
		p.setContent("code", treeID);

		var request = new HttpRequest(p);
		request.onsuccess = function() {
			refreshTreeNodeState(treeNode, "0");
			treeObj.reload();

			delCacheData(CACHE_TREE_NODE + treeID);
			loadCacheDetais(treeID, "1");
		}
		request.send();
	}
}

/*
 *	清空缓存池
 */
function clearCache() {
	var treeObj = $T("tree");
	var treeNode = treeObj.getActiveTreeNode();
	if ( treeNode ) {
		var treeID = treeNode.getId();
		var p = new HttpRequestParams();
		p.url = URL_CACHE_CLEAR;
		p.setContent("code", treeID);

		var request = new HttpRequest(p);
		request.onsuccess = function() {
			refreshTreeNodeState(treeNode, "1");
			treeObj.reload();

			delCacheData(CACHE_TREE_NODE + treeID);
			loadCacheDetais(treeID, "1");
		}
		request.send();
	}
}

function refreshTreeNodeState(treeNode, state) {
	state = state || treeNode.getAttribute("released");
	treeNode.setAttribute("released", state);    
}

/*
 *	区块初始化
 */
function initBlocks() {
	var paletteObj = $("palette");
	Blocks.create(paletteObj);

	var treeContainerObj = $("treeContainer");
	Blocks.create(treeContainerObj, treeContainerObj.parentNode);

	var statusContainerObj = $("statusContainer");
	Blocks.create(statusContainerObj, statusContainerObj.parentNode, false);

	// 状态信息区实例继承WritingBlock可写功能
	var block = Blocks.getBlock("statusContainer");
	if( block ) {
		block.inherit(WritingBlock);
	}     
}
 
/*
 *	聚焦初始化
 */
function initFocus() {
	var treeTitleObj = $("treeTitle");
	Focus.register(treeTitleObj.firstChild);
}

/*
 *	事件绑定初始化
 */
function initEvents() {
	Event.attachEvent($("treeBtRefresh"), "click", onClickTreeBtRefresh);
	Event.attachEvent($("treeTitleBt"),   "click", onClickTreeTitleBt);
	Event.attachEvent($("statusTitleBt"), "click", onClickStatusTitleBt);
	Event.attachEvent($("paletteBt"),     "click", onClickPaletteBt);
	Event.attachEvent($("treeTitle"),     "click", onClickTreeTitle);
	Event.attachEvent($("statusTitle"),   "click", onClickStatusTitle);
}

/*
 *	点击树节点
 *	参数：	Object:eventObj     模拟事件对象
 */
function onTreeNodeActived(eventObj) {
	Focus.focus($("treeTitle").firstChild.id);
	showTreeNodeStatus({id : "ID", name : "名称"});

	//防止因为载入工具条数据而导致不响应双击事件
	clearTimeout(window._toolbarTimeout);
	
	var treeNode = eventObj.treeNode;
	window._toolbarTimeout = setTimeout(function() {
		loadToolBarData(treeNode);
	}, 0);
}

/*
 *	双击树节点
 */
function onTreeNodeDoubleClick(eventObj) {
	if( "_rootId" != getTreeNodeId() ) {
		maintainCache();
	}
}

/*
 *	右击树节点
 */
function onTreeNodeRightClick(eventObj) {
	showTreeNodeStatus({id:"ID", name:"名称"});

	var treeNode = eventObj.treeNode;
	var x = eventObj.clientX;
	var y = eventObj.clientY;
	getTreeOperation(treeNode, function(_operation) {
		var treeObj = $("tree");
		if( treeObj.contextmenu ) {
			treeObj.contextmenu.show(x, y);                
		}
		loadToolBar(_operation);
	});
}

/*
 *	工具条载入数据
 */
function loadToolBarData(treeNode) {
	if( treeNode ) {
		getTreeOperation(treeNode, function(_operation) {
			loadToolBar(_operation);
		});
	}
}

/*
 *	获取树操作权限
 *	参数：	treeNode:treeNode       treeNode实例
			function:callback       回调函数
 */
function getTreeOperation(treeNode, callback) {
	var _operation = treeNode.getAttribute("_operation");
	if( isNullOrEmpty(_operation) ) { 
		// 如果节点上还没有_operation属性，则发请求从后台获取信息
		var p = new HttpRequestParams();
		p.url = URL_GET_OPERATION;
		p.setContent("resourceId", treeNode.getId());

		var request = new HttpRequest(p);
		request.onresult = function() {
			_operation = this.getNodeValue(XML_OPERATION);
			treeNode.setAttribute("_operation", _operation);

			if( callback ) { callback(_operation); }	
		}
		request.send();            
	} 
	else {	
		if( callback ) { callback(_operation); }	
	}
}

/*
 *	编辑缓存信息
 */
function maintainCache() {
	var treeObj = $T("tree");
	var treeNode = treeObj.getActiveTreeNode();
	if( treeNode ) {
		var treeID = treeNode.getId();
		var treeName = treeNode.getName();

		var callback = {};
		callback.onTabClose = function(eventObj) {
			delCacheData(eventObj.tab.SID);
		};
		callback.onTabChange = function() {
			setTimeout(function() {
				loadCacheDetais(treeID, "1");
			}, TIMEOUT_TAB_CHANGE);
		};

		var inf = {};
		inf.defaultPage = "page1";
		inf.label = OPERATION_EDIT.replace(/\$label/i, treeName);
		inf.callback = callback;
		inf.SID = CACHE_TREE_NODE + treeID;
		var tab = ws.open(inf);
	}
}

/*
 *	树节点数据详细信息加载数据
 *	参数：	string:treeID               树节点id
			string:page                 页码
			function:callback           回调(如果不定义则调用initCacheTacticsPages)
 */
function loadCacheDetais(treeID, page, callback) {
	var cacheID = CACHE_TREE_NODE + treeID;
	var treeDetail = Cache.Variables.get(cacheID);
	if( treeDetail ) {
		if( callback ) {
			callback(cacheID);				
		} 
		else {
			initCacheTacticsPages(cacheID);
		}
	}
	
	var p = new HttpRequestParams();
	p.url = URL_CACHE_DETAIL;
	p.setContent("code", treeID);
	p.setContent("page", page);

	var request = new HttpRequest(p);
	request.onresult = function() {
		var cacheInfoNode = this.getNodeValue(XML_CACHE_STRATEGY);
		var cacheInfoNodeID = cacheID + "." + XML_CACHE_STRATEGY;

		var cacheOptionNode = this.getNodeValue(XML_CACHE_ITEM_LIST);
		var cacheOptionNodeID = cacheID + "." + XML_CACHE_ITEM_LIST;

		var pageListNode = this.getNodeValue(XML_PAGE_LIST);
		var pageListNodeID = cacheID + "." + XML_PAGE_LIST;

		var hitRateNode = this.getNodeValue(XML_HIT_RATE);
		var hitRateNodeID = cacheID + "." + XML_HIT_RATE;

		//给缓存项grid数据根节点增加cacheId属性
		cacheOptionNode.setAttribute("cacheId", treeID);
		
		Cache.XmlDatas.add(cacheInfoNodeID, cacheInfoNode);
		Cache.XmlDatas.add(cacheOptionNodeID, cacheOptionNode);
		Cache.XmlDatas.add(pageListNodeID, pageListNode);
		Cache.XmlDatas.add(hitRateNodeID, hitRateNode);
		Cache.Variables.add(cacheID, [cacheInfoNodeID, cacheOptionNodeID, pageListNodeID, hitRateNodeID]);
			
		// 增加回调方法，为了实现单独刷新grid
		if( callback ) {
			callback(cacheID);				
		} 
		else {
			initCacheTacticsPages(cacheID);
		}
	}
	request.send();
}

/*
 *	缓存相关页加载数据
 */
function initCacheTacticsPages(cacheID) { 
	var xmlIsland = Cache.XmlDatas.get(cacheID + "." + XML_CACHE_STRATEGY);
	if( xmlIsland ) {
		var strategyXForm = $X("page1Form");
		strategyXForm.load(xmlIsland.node);
		attachReminder(cacheID, $("page1Form"));
	}

	createGridToolBar(cacheID); // 重新创建grid工具条
	var gridDataXML = Cache.XmlDatas.get(cacheID + "." + XML_CACHE_ITEM_LIST);
	if( gridDataXML ) {
		var page1GridObj = $("page1Grid");
		var grid = $G("page1Grid", gridDataXML);      
	}		
	initGridMenu();	
	loadGridEvents();

	//设置点击率
	var hitRateData = Cache.XmlDatas.get(cacheID + "." + XML_HIT_RATE);
	if( hitRateData ) {
		$("page1HitRate").innerHTML = "『 池命中率：" + hitRateData + " 』";
	}
	
	//设置保存按钮操作
	$("page1BtSave").onclick = function() {
		saveCacheStrategy(cacheID);
	}
}

/*
 *	创建grid工具条
 */
function createGridToolBar(cacheID) {
	var xmlIsland = Cache.XmlDatas.get(cacheID + "." + XML_PAGE_LIST);
	if( xmlIsland ) {
		initGridToolBar($("gridToolBar"), xmlIsland, function(page) {			
			var gridObj = $G("page1Grid");
			if( gridObj.gridDoc.hasData() ) {
				var tempCacheId = gridObj.gridDoc.xmlDom.getAttribute("cacheId");
				delCacheData(CACHE_TREE_NODE + tempCacheId, false);

				loadCacheDetais(tempCacheId, page, function(cacheID) {
					var gridDataXML = Cache.XmlDatas.get(cacheID + "." + XML_CACHE_ITEM_LIST);
					if( gridDataXML ) {
						var page1GridObj = $("page1Grid");
						var grid = $G("page1Grid", gridDataXML);      
					}	
					initGridMenu();
					loadGridEvents();						

					//设置点击率
					var hitRateData = Cache.XmlDatas.get(cacheID + "." + XML_HIT_RATE);
					if( hitRateData ) {
						$("page1HitRate").innerHTML = "『 池命中率：" + hitRateData + " 』";
					}
				});

				//刷新工具条
				onInactiveRow();
			}
		});
	}
}

/* Grid菜单初始化 */
function initGridMenu() {
	var gridObj = $("page1Grid");
	var item1 = {
		label:"查看缓存项信息",
		callback:showItemInfo,
		icon:"images/view.gif",
		enable:function() {return true;},
		visible:function() {return true;}
	}
	var item2 = {
		label:"刷新本缓存项",
		callback:refreshCurrentRow,
		icon:"images/refresh.gif",
		enable:function() {return true;},
		visible:function() {return true;}
	}

	var menu1 = new Menu();
	menu1.addItem(item1);
	menu1.addItem(item2);

	gridObj.contextmenu = menu1;
}

/* grid绑定事件 */
function loadGridEvents() {
	var gridObj = $("page1Grid");

	gridObj.onClickRow = function(eventObj) {
		var rowIndex = eventObj.result.rowIndex;
		showItemStatus(rowIndex);
	}
	
	gridObj.onRightClickRow = function(eventObj) {
		var rowIndex = eventObj.result.rowIndex;
		var x = event.clientX;
		var y = event.clientY;

		gridObj.contextmenu.show(x, y);
	}
	
	// 单击grid空白处
	gridObj.onInactiveRow = function(eventObj) {
		Focus.focus($("treeTitle").firstChild.id);
		
		showTreeNodeStatus({id:"ID", name:"名称"});
 
		clearTimeout(window._toolbarTimeout);
		window._toolbarTimeout = setTimeout(function() {
			loadToolBarData($T("tree").getActiveTreeNode());
		}, 0);
	}
}

/*
 *	保存缓存
 */
function saveCacheStrategy(cacheID) {
	var check = $("page1Form").checkForm();
	if(check == false) {
		return
	}
	
	var p = new HttpRequestParams();
	p.url = URL_SAVE_CACHE;

	//是否提交
	var flag = false;
	
	var groupCache = Cache.Variables.get(cacheID);
	if( groupCache ) {       

		//缓存基本信息
		var cacheInfoNode = Cache.XmlDatas.get(cacheID + "." + XML_CACHE_STRATEGY);
		if( cacheInfoNode ) {
			var cacheInfoDataNode = cacheInfoNode.selectSingleNode(".//data");
			if( cacheInfoDataNode ) {
				flag = true;
				var prefix = cacheInfoNode.selectSingleNode("./declare").getAttribute("prefix");
				p.setXFormContent(cacheInfoDataNode, prefix);
			}
		}   

		// 缓存项信息
		var cacheOptionNode = Cache.XmlDatas.get(cacheID + "." + XML_CACHE_ITEM_LIST);
		if( cacheOptionNode ) {
			var cacheOptionDataStr = [];
			var cacheOptionDataNodes = cacheOptionNode.selectNodes(".//data//row[(not(@_new='true') or not(@_new)) or (@_modify='true')]");
			
			for(var i=0; i < cacheOptionDataNodes.length; i++) {
				var curNode = cacheOptionDataNodes[i];
				cacheOptionDataStr.push(curNode.toXml());
			}
			if( cacheOptionDataStr.length > 0 ) {
				flag = true;
				p.setContent(XML_CACHE_ITEM_LIST, "<data>" + cacheOptionDataStr.join("") + "</data>");
			}
		}
	}

	if( flag ) {
		var request = new HttpRequest(p);
		syncButton([$("page1BtSave")], request);  // 同步按钮状态
		request.onsuccess = function() {
			detachReminder(cacheID);

			var toolbarObj = $("gridToolBar");
			var curPage = toolbarObj.getCurrentPage();
			toolbarObj.gotoPage(curPage);
		}
		request.send();
	}
}

 
/*
 *	查看缓存项信息
 */
function showItemInfo() {
	var gridObj = $("page1Grid");
	var curRowIndex = gridObj.getCurrentRowIndex_Xml()[0];              
	if( curRowIndex ) {
		var curRowNode = gridObj.getRow(curRowIndex);
		var key = curRowNode.getAttribute("key");
		var code = curRowNode.getAttribute("code");

		var url = URL_VIEW_CACHED_ITEM + "?key=" + key + "&code=" + code;
		window.open(url, "查看缓存项信息", "");
	}
}

/*
 *	显示缓存项信息
 */
function showItemStatus(rowIndex) {
	if( rowIndex ) {
		var gridObj = $G("page1Grid");
		var rowNode = gridObj.getRow(rowIndex);
		var id  = rowNode.getAttribute("id");
		var key = rowNode.getAttribute("key");
	}

	var block = Blocks.getBlock("statusContainer");
	if( block ) {
		block.open();
		block.writeln("ID", id || "");
		block.writeln("key", key || "");
		block.close();
	}
}

/*
 *	刷新单条数据
 */
function refreshCurrentRow() {
	var gridObj = $("page1Grid");
	var curRowIndex = gridObj.getCurrentRowIndex_Xml()[0];
	if( curRowIndex ) {
		var rowNode = gridObj.getRow(curRowIndex);
		var key = rowNode.getAttribute("key");
		var code = rowNode.getAttribute("code");

		var p = new HttpRequestParams();
		p.url = URL_REFRESH_ITEM;
		p.setContent("key", key);
		p.setContent("code", code);

		var request = new HttpRequest(p);
		request.onsuccess = function() {
			gridObj.delRow(curRowIndex);
		}
		request.onresult = function() {
			var row = this.getNodeValue(XML_CACHE_ITEM_LIST);
			var columns = gridObj.getAllColumnNames();
			for(var i=0; i < columns.length; i++) {
				var name = columns[i];
				var value = row.getAttribute(name);
				if( value ) {
					gridObj.modifyRow(curRowIndex, name, value);
				}
			}
		}
		request.send();
	}
}



window.onload = init;

// 关闭页面自动注销
window.attachEvent("onunload", function() {
	if(10000 < window.screenTop || 10000 < window.screenLeft) {
		logout();
	}
});