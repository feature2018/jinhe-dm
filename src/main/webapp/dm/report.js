/*
 *	后台响应数据节点名称
 */
XML_SOURCE_TREE = "SourceTree";
XML_REPORT_DATA = "ReportData";
XML_SOURCE_INFO = "SourceInfo";

PAGESIZE = 100;

/*
 *	XMLHTTP请求地址汇总
 */
URL_SOURCE_TREE    = AUTH_PATH + "rp/all";
URL_GROUPS_TREE    = AUTH_PATH + "rp/groups";
URL_SOURCE_DETAIL  = AUTH_PATH + "rp/detail";
URL_SAVE_SOURCE    = AUTH_PATH + "rp";
URL_DELETE_SOURCE  = AUTH_PATH + "rp/";
URL_DISABLE_SOURCE = AUTH_PATH + "rp/disable/";
URL_SORT_SOURCE    = AUTH_PATH + "rp/sort/";
URL_COPY_SOURCE    = AUTH_PATH + "rp/copy/";
URL_MOVE_SOURCE    = AUTH_PATH + "rp/move/";

URL_GET_OPERATION  = AUTH_PATH + "rp/operations/";  // {id}

URL_REPORT_DATA    = NO_AUTH_PATH + "display/";
URL_REPORT_JSON    = NO_AUTH_PATH + "display/json/";
URL_REPORT_EXPORT  = NO_AUTH_PATH + "display/export/";

if(IS_TEST) {
	URL_SOURCE_TREE    = "data/SOURCE_TREE.xml?";
	URL_GROUPS_TREE    = "data/GROUPS_TREE.xml?";
	URL_SOURCE_DETAIL  = "data/SOURCE_DETAIL.xml?";
	URL_SAVE_SOURCE    = "data/_success.xml?";
	URL_DELETE_SOURCE  = "data/_success.xml?";
	URL_DISABLE_SOURCE = "data/_success.xml?";
	URL_SORT_SOURCE    = "data/_success.xml?";
	URL_COPY_SOURCE    = "data/_success.xml?";
	URL_MOVE_SOURCE    = "data/_success.xml?";

	URL_GET_OPERATION  = "data/operation.xml?";

	URL_REPORT_DATA    = "data/REPORT_DATA.xml?";
	URL_REPORT_JSON    = "data/REPORT_JSON.txt?";
	URL_REPORT_EXPORT  = "data/_success.xml?";

	URL_CORE = "framework/";
}

/* 页面初始化 */
function init() {
	if( !Public.isChrome() ) {
		alert("您当前的浏览器不是Chrome浏览器，为能有更好的展示效果，建议换成Chrome访问。");
	}	

	initNaviBar("dm.1");
	initMenus();
	initEvents();

	loadInitData();
}

/* 菜单初始化 */
function initMenus() {
	/* 树菜单初始化  */
	var item1 = {
		label:"报表查询",
		callback:showReport,
		icon: ICON + "search.gif",
		visible:function() {return isReport() && !isTreeNodeDisabled() && getOperation("1");}
	}
	var item10 = {
		label:"查看",
		callback: function() {
			loadReportDetail(false, true);
		},
		icon: ICON + "view.gif",
		visible:function() {return !isTreeRoot() && getOperation("1"); }
	}
	var item2 = {
		label:"修改",
		callback: function() {
			loadReportDetail(false, false);
		},
		icon: ICON + "icon_edit.gif",
		visible:function() {return !isTreeRoot() && !isTreeNodeDisabled() && getOperation("2"); }
	}
	var item3 = {
		label:"新增报表",
		callback: function() {
			loadReportDetail(true, false, "1");
		},
		icon: ICON + "cms/new_article.gif",
		visible:function() {return (isReportGroup() || isTreeRoot()) && !isTreeNodeDisabled() && getOperation("2");}
	}
	var item4 = {
		label:"新增分组",
		callback: function() {
			loadReportDetail(true, false, "0");
		},
		icon: ICON + "new_folder.gif",
		visible:function() {return (isReportGroup() || isTreeRoot()) && !isTreeNodeDisabled() && getOperation("2");}
	}
	var item5 = {
		label:"删除",
		callback:deleteReport,
		icon: ICON + "icon_del.gif",
		visible:function() {return !isTreeRoot() && getOperation("3");}
	}
	var item6 = {
		label:"复制到",
		callback:copyReportTo,
		icon: ICON + "icon_copy.gif",
		visible:function() {return isReport() && getOperation("2");}
	}
	var item7 = {
		label:"移动到",
		callback:moveReport,
		icon: ICON + "icon_move.gif",
		visible:function() {return !isTreeRoot() && getOperation("2");}
	}
	var item8 = {
		label:"停用",
		callback:disableReport,
		icon: ICON + "stop.gif",
		visible:function() {return !isTreeRoot() && !isTreeNodeDisabled() && getOperation("4");}
	}
	var item9 = {
		label:"启用",
		callback:enableReport,
		icon: ICON + "start.gif",
		visible:function() {return !isTreeRoot() && isTreeNodeDisabled() && getOperation("4");}
	}
	var item11 = {
		label:"测试报表服务JSON",
		callback:testRestfulReportService,
		icon: ICON + "other/entity_0.gif",
		visible:function() {return isReport() && !isTreeNodeDisabled() && getOperation("2");}
	}

	var treeObj = $$("tree");

	var menu = new Menu();
	menu.addItem(item1);
	menu.addSeparator();
	// menu.addItem(item10);
	menu.addItem(item2);
	menu.addItem(item3);
	menu.addItem(item4);
	menu.addItem(item5);
	menu.addSeparator();
	menu.addItem(item6);
	menu.addItem(item7);
	menu.addItem(item8);
	menu.addItem(item9);
	menu.addSeparator();
	menu.addItem(item11);
	
	treeObj.contextmenu = menu;
}

function getTreeId() {
	var treeNode = $T("tree").getActiveTreeNode();
	return treeNode.getId();
}

function getTreeNodeType() {
	return getTreeAttribute("type");
}

function isReportGroup() {
	var treeNode = $T("tree").getActiveTreeNode(); 
	return "0" == getTreeNodeType();
}

function isReport() {
	return !isTreeRoot() && !isReportGroup();
}

function loadInitData() {
	var onresult = function() {
		var tree = $T("tree", this.getNodeValue(XML_SOURCE_TREE));

		var treeElement = $$("tree");
		treeElement.onTreeNodeActived = function(eventObj) {
			Focus.focus($$("treeTitle").firstChild.id);
		}
		treeElement.onTreeNodeDoubleClick = function(eventObj) {
		        var treeNode = eventObj.treeNode;
			getTreeOperation(treeNode, function(_operation) {            
				if( isReport() ) {
					showReport();
				}
				if( isReportGroup() ) {
					loadReportDetail(false, false);
				}
			});
		}
		treeElement.onTreeNodeRightClick = function(eventObj) {
			onTreeNodeRightClick(eventObj, true);
		}
		treeElement.onTreeNodeMoved = function(eventObj) {
			sort(eventObj);
		}
	}

	Ajax({url : URL_SOURCE_TREE, onresult : onresult});
}

function loadReportDetail(isCreate, readonly, type) { 
	var treeNode = $T("tree").getActiveTreeNode();
	var treeID = treeNode.getId();
	type = type || treeNode.getAttribute("type") ;
	
	Element.show($$("reportFormDiv"));
	
	var params = {};
	if( isCreate ) {
		params["parentId"] = treeID; // 新增
		readonly = false;
	} else {
		params["reportId"] = treeID; // 修改					
	}

	$$("sourceSave").disabled = readonly ? "true" : "";

	Ajax({
		url : URL_SOURCE_DETAIL + "/" + type,
		contents : params,
		onresult : function() { 
			var sourceInfoNode = this.getNodeValue(XML_SOURCE_INFO);
			Cache.XmlDatas.add(treeID, sourceInfoNode);
			
			$$("reportForm").editable = readonly ? "false" : "true";
			var xform = $X("reportForm", sourceInfoNode);

			attachReminder(treeID, xform); // 离开提醒
		
			// 设置保存/关闭按钮操作
			$$("closeReportForm").onclick = function() {
				Element.hide($$("reportFormDiv"));
			}
			$$("sourceSave").onclick = function() {
				saveReport(treeID);
			}
		},
		onexception : function() { 
			Element.hide($$("reportFormDiv"));
		}
	});
}

function saveReport(treeID) {
	var xform = $X("reportForm");	
	if( !xform.checkForm() ) return;

	var p = new HttpRequestParams();
	p.url = URL_SAVE_SOURCE;

	//是否提交
	var flag = false;
	
	//参数基本信息
	var sourceInfoNode = Cache.XmlDatas.get(treeID);
	if( sourceInfoNode ) {
		var reportInfoDataNode = sourceInfoNode.selectSingleNode(".//data");
		if( reportInfoDataNode ) {
			flag = true;
			p.setXFormContent(reportInfoDataNode);
		}
	}

	if( flag ) {
		var request = new HttpRequest(p);
	   
		syncButton([$$("sourceSave")], request); // 同步按钮状态
		detachReminder(treeID); // 解除提醒

		request.onresult = function() { // 新增结果返回              
			var treeNode = this.getNodeValue(XML_SOURCE_TREE).selectSingleNode("treeNode");
			appendTreeNode(treeID, treeNode); // treeID即为父节点
			
			Element.hide($$("reportFormDiv"));
		}

		request.onsuccess = function() { // 更新
			var name = xform.getData("name");
			if( !isNullOrEmpty(name) ) {
				modifyTreeNode(treeID, "name", name, true);
			}
			modifyTreeNode(treeID, "param",  xform.getData("param"), true);
			modifyTreeNode(treeID, "displayUri",  xform.getData("displayUri"), true);
			
			Element.hide($$("reportFormDiv"));
		}
		request.send();
	}
}

function deleteReport() {
    delTreeNode(URL_DELETE_SOURCE);
}

function disableReport() {
	stopOrStartTreeNode("1", URL_DISABLE_SOURCE);
}

function enableReport() {
	stopOrStartTreeNode("0", URL_DISABLE_SOURCE);
}

function sort(eventObj) {
    sortTreeNode(URL_SORT_SOURCE, eventObj);
}

function copyReportTo() {
	var treeNode = $T("tree").getActiveTreeNode();
	var id = treeNode.getId();
	var name = treeNode.getName();

	var params = { id:id, url:URL_GROUPS_TREE };
	var targetParentId = window.showModalDialog("targetTree.html", {params:params, title:"将【\"" + name + "\"】复制到"}, "dialogWidth:300px;dialogHeight:400px;");	
	if( targetParentId ) {
		Ajax({
			url : URL_COPY_SOURCE + id + "/" + targetParentId,
			onresult : function() { 
				var newNode = this.getNodeValue(XML_SOURCE_TREE).selectSingleNode("treeNode");
				appendTreeNode(targetParentId, newNode);
			}
		});
	}
}

function moveReport() {
	var tree = $T("tree");
	var treeNode = tree.getActiveTreeNode();
	var id = treeNode.getId();
	var name = treeNode.getName();

	var params = { id:id, url:URL_GROUPS_TREE };
	var targetParentId = window.showModalDialog("targetTree.html", {params:params, title:"将\"" + name + "\"移动到"}, "dialogWidth:300px;dialogHeight:400px;");	   
	if(targetParentId) {
		moveTreeNode(tree, id, targetParentId, URL_MOVE_SOURCE);
	}
}		

function showReportInPointUrl(treeID, displayUri) {
	var url = displayUri;
	if( displayUri.indexOf("?service") > 0 ) {
		url = url + "&id=" + treeID;
	}
	else {
		url = url + "?service=display/json/" + treeID; // 可用于既配置了定制页面，又写了script脚本的report
	}

	// 关闭左栏
	$$("palette").style.display = "none";
	$$("openLeftBarIcon").style.display = "";
 
	$$("grid").style.display = "none";
	$$("chatFrame").style.display = "";
	$$("chatFrame").style.width = "100%";
	$$("chatFrame").style.height = "100%";
	$$("chatFrame").setAttribute("src", url);
}

function showReport() {
	var treeNode = $T("tree").getActiveTreeNode();
	var treeID = treeNode.getId();

	var displayUri = treeNode.getAttribute("displayUri"); 
	if(displayUri && displayUri.length > 0) {
		showReportInPointUrl(treeID, displayUri);
		return;
	}

	var paramConfig = treeNode.getAttribute("param");  // eg: 仓库ID:Number,客户ID:Number 
	showSearchForm(paramConfig || "");
}

function showSearchForm(paramConfig) {	
	var columns = [];
	var layouts = [];
	var paramArray = paramConfig.split(",");
	for( var i = 0; i < paramArray.length; i++ ) {
		var param = paramArray[i];
		var tempArray = param.split(":");
		if(tempArray.length >= 2) {
			var columnName = "param" + (i + 1);
			var paramCaption = tempArray[0];
			var paramType = tempArray[1];

			var mode = "string";
			var inputReg = null; 
			switch(paramType.toLowerCase()) {
				case "number":
					mode = "number";
					inputReg = "/^[0-9]*[1-9][0-9]*$/";
					break;
				case "string":
					mode = "string";
					break;
				case "date":
					mode = "string";
					inputReg = "/^((?:19|20)\\d\\d)-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/";
					break;
			}
			
			var empty = "true";
			if(tempArray.length == 3) {
				var empty = tempArray[2];
			}

			columns[columns.length] = "<column name='" +columnName+ "' caption='" +paramCaption+ "' mode='" +mode+ "' inputReg='" +inputReg+ "' empty='" +empty+ "'/>";

			layouts[layouts.length] = " <TR>";
			layouts[layouts.length] = "    <TD width='50'><label binding='" + columnName + "'/></TD>";
			layouts[layouts.length] = "    <TD><input binding='" + columnName + "' type='text' style='width:250px'/></TD>";
			layouts[layouts.length] = " </TR>";
		}
	}		
	layouts[layouts.length] = "        <TR>";
	layouts[layouts.length] = "          <TD colspan='2' align='center' height='36'>";
	layouts[layouts.length] = "				<input type='button' class='btStrong' id='btSearch' value='查询'/> - ";
	layouts[layouts.length] = "				<input type='button' class='btStrongL' id='btDownload' value='查询并导出'/> - ";
	layouts[layouts.length] = "				<input type='button' class='btWeak' id='btCloseSearchForm' value='关闭'/>";
	layouts[layouts.length] = "          </TD>";
	layouts[layouts.length] = "        </TR>";
	
	Element.show($$("searchFormDiv"));
	$$("reportName").innerText = "查询报表【" + getTreeNodeName() + "】";
	
	var str = [];
	str[str.length] = "<xform>";
	str[str.length] = "    <declare>";
	str[str.length] = columns.join("");
	str[str.length] = "    </declare>";
	str[str.length] = "    <layout>";
	str[str.length] = layouts.join("");
	str[str.length] = "    </layout>";
	str[str.length] = "    <data><row/></data>";
	str[str.length] = "</xform>";
	
	var formContent = str.join("");
	var xmlReader = new XmlReader(formContent);
	var searchFormXML = new XmlNode(xmlReader.documentElement);
	var searchForm = $X("searchForm", searchFormXML);
	Cache.XmlDatas.add("searchForm", searchFormXML);
	
	$$("btSearch").onclick = function () {
		var treeID = getTreeNodeId();
		searchReport(treeID, false);
	}
	$$("btDownload").onclick = function () {
		var treeID = getTreeNodeId();
		searchReport(treeID, true);
	}
	$$("btCloseSearchForm").onclick = function () {
		Element.hide($$("searchFormDiv"));
	}
}

function searchReport(treeID, download) {		
	var xform = $X("searchForm");	
	if( xform && !xform.checkForm() ) return;

	Element.hide($$("searchFormDiv"));
	var searchLogFormXML = Cache.XmlDatas.get("searchForm");

	if(download) {
		var queryString = "?";
		if( searchLogFormXML ) {
			var dataNode = searchLogFormXML.selectSingleNode(".//data");
			if (dataNode) {
				var nodes = dataNode.selectNodes("./row/*");
				for(var i = 0; i < nodes.length; i++) {
					var name  = nodes[i].nodeName;
					var value = nodes[i].text;
					queryString +=  name + "=" + value
					if( queryString.length > 1 ) {
						queryString += "&";
					}
				}
			}
		}
		window.frames["downloadFrame"].location.href = URL_REPORT_EXPORT + treeID + "/1/0" + queryString;
		return;
	}

	var p = new HttpRequestParams();	
	p.waiting = true;

	if( searchLogFormXML ) {
		var dataNode = searchLogFormXML.selectSingleNode(".//data");
		if (dataNode) {
			p.setXFormContent(dataNode);
		}
	}
 
	p.url = URL_REPORT_DATA + treeID + "/1/" + PAGESIZE;
	var request = new HttpRequest(p);
	request.onresult = function() {
		$$("grid").style.display = "";
		$$("chatFrame").style.display = "none";

		$G("grid", this.getNodeValue(XML_REPORT_DATA)); 
		var gridToolBar = $$("gridToolBar");

		var pageListNode = this.getNodeValue(XML_PAGE_INFO);			
		initGridToolBar(gridToolBar, pageListNode, function(page) {
			request.paramObj.url = URL_REPORT_DATA + treeID + "/" + page + "/" + PAGESIZE;
			request.onresult = function() {
				$G("grid", this.getNodeValue(XML_REPORT_DATA)); 
			}				
			request.send();
		} );
		
		var gridElement = $$("grid"); 
		gridElement.onScrollToBottom = function () {			
			var currentPage = gridToolBar.getCurrentPage();
			if(gridToolBar.getTotalPages() <= currentPage) return;

			var nextPage = parseInt(currentPage) + 1; 
			request.paramObj.url = URL_REPORT_DATA + treeID + "/" + nextPage + "/" + PAGESIZE;
			request.onresult = function() {
				$G("grid").load(this.getNodeValue(XML_REPORT_DATA), true);
				initGridToolBar(gridToolBar, this.getNodeValue(XML_PAGE_INFO));
			}				
			request.send();
		}
	}
	request.send();
} 

function testRestfulReportService() {
	var treeNode = $T("tree").getActiveTreeNode();
	var url = URL_REPORT_JSON + treeNode.getId();
	Ajax({
		url : url,
		method : "GET",
		type : "json",
		ondata : function() { 
			alert("调试接口：" + url + "，返回结果：", this.getResponseText());
		}
	});
}

window.onload = init;

Event.attachEvent(window, "onunload", function() {
	if(10000 < window.screenTop || 10000 < window.screenLeft) {
		logout(); // 关闭页面自动注销
	}
});