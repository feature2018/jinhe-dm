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
URL_SOURCE_TREE    = "rp/all";
URL_GROUPS_TREE    = "rp/groups";
URL_REPORT_DATA    = "display/";
URL_REPORT_JSON    = "display/json/";
URL_REPORT_EXPORT  = "display/export/";
URL_SOURCE_DETAIL  = "rp/detail";
URL_SAVE_SOURCE    = "rp";
URL_DELETE_SOURCE  = "rp/";
URL_DISABLE_SOURCE = "rp/disable/";
URL_SORT_SOURCE    = "rp/sort/";
URL_COPY_SOURCE    = "rp/copy/";
URL_MOVE_SOURCE    = "rp/move/";

URL_RS_LOGIN       = "wms/login";
URL_RS_WH_LIST     = "wms/whList";

if(IS_TEST) {
	URL_SOURCE_TREE    = "data/SOURCE_TREE.xml?";
	URL_GROUPS_TREE    = "data/GROUPS_TREE.xml?";
	URL_REPORT_DATA    = "data/REPORT_DATA.xml?";
	URL_REPORT_JSON    = "data/REPORT_JSON.txt?";
	URL_REPORT_EXPORT  = "data/_success.xml?";
	URL_SOURCE_DETAIL  = "data/SOURCE_DETAIL.xml?";
	URL_SAVE_SOURCE    = "data/_success.xml?";
	URL_DELETE_SOURCE  = "data/_success.xml?";
	URL_DISABLE_SOURCE = "data/_success.xml?";
	URL_SORT_SOURCE    = "data/_success.xml?";
	URL_COPY_SOURCE    = "data/_success.xml?";
	URL_MOVE_SOURCE    = "data/_success.xml?";

	URL_CORE = "framework/";
}

/* 页面初始化 */
function init() {
	initPaletteResize();

	initNaviBar("dm.1", " ");
	initMenus();
	initEvents();

	if( Cookie.getValue("token") ) {
		preLogoutWMS();
	}	

	loadInitData();
}

function preLogoutWMS() {
	var userName = Cookie.getValue("userName");
	$$("userInfo").innerText = "  |  注销【" + userName + "】";
	$$("userInfo").style.cursor = "hand";
	$$("userInfo").onclick = function() {
		Cookie.del("userName");
		Cookie.del("token");
		$$("userInfo").innerText = "";
	}	
}

/* 菜单初始化 */
function initMenus() {
	/* 树菜单初始化  */
	var item1 = {
		label:"报表查询",
		callback:showReport,
		icon:"framework/images/search.gif",
		visible:function() {return isReport() && !isTreeNodeDisabled();}
	}
	var item10 = {
		label:"查看",
		callback: function() {
			loadReportDetail(false, true);
		},
		icon:"framework/images/view.gif",
		visible:function() {return !isTreeRoot()}
	}
	var item2 = {
		label:"修改",
		callback: function() {
			loadReportDetail(false, false);
		},
		icon:"framework/images/icon_edit.gif",
		visible:function() {return !isTreeRoot() && !isTreeNodeDisabled(); }
	}
	var item3 = {
		label:"新增报表",
		callback: function() {
			loadReportDetail(true, false, "1");
		},
		icon:"framework/images/cms/new_article.gif",
		visible:function() {return (isReportGroup() || isTreeRoot()) && !isTreeNodeDisabled();}
	}
	var item4 = {
		label:"新增分组",
		callback: function() {
			loadReportDetail(true, false, "0");
		},
		icon:"framework/images/new_folder.gif",
		visible:function() {return (isReportGroup() || isTreeRoot()) && !isTreeNodeDisabled();}
	}
	var item5 = {
		label:"删除",
		callback:deleteReport,
		icon:"framework/images/icon_del.gif",
		visible:function() {return !isTreeRoot();}
	}
	var item6 = {
		label:"复制到",
		callback:copyReportTo,
		icon:"framework/images/icon_copy.gif",
		visible:function() {return isReport();}
	}
	var item7 = {
		label:"移动到",
		callback:moveReport,
		icon:"framework/images/icon_move.gif",
		visible:function() {return !isTreeRoot();}
	}
	var item8 = {
		label:"停用",
		callback:disableReport,
		icon:"framework/images/stop.gif",
		visible:function() {return !isTreeRoot() && !isTreeNodeDisabled();}
	}
	var item9 = {
		label:"启用",
		callback:enableReport,
		icon:"framework/images/start.gif",
		visible:function() {return !isTreeRoot() && isTreeNodeDisabled();}
	}
	var item11 = {
		label:"测试报表服务JSON",
		callback:testRestfulReportService,
		icon:"framework/images/other/entity_0.gif",
		visible:function() {return isReport() && !isTreeNodeDisabled();}
	}

	var treeObj = $$("tree");

	var menu = new Menu();
	menu.addItem(item1);
	menu.addSeparator();
	menu.addItem(item10);
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
		   if( isReport() ) {
				showReport();
			}
			if( isReportGroup() ) {
				loadReportDetail(false, false);
			}
		}
		treeElement.onTreeNodeRightClick = function(eventObj) {
			if($$("tree").contextmenu) {
				$$("tree").contextmenu.show(eventObj.clientX, eventObj.clientY);                
			}
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

function showReport() {
	var treeNode = $T("tree").getActiveTreeNode();
	var treeID = treeNode.getId();
	
	var paramConfig = treeNode.getAttribute("param");  // "仓库ID:Number,客户ID:Number"; 	
	if( paramConfig && paramConfig.length > 0) {
		if( paramConfig.indexOf("仓库") >= 0 ) {
			if( Cookie.getValue("token")  ) {
				getWarehouseList(); // 已经登录
			}
			else {
				showLoginForm();
				return;
			}
		}
	}

	showSearchForm(paramConfig || "");
}

function showSearchForm(paramConfig, whIds, whNames) {	
	if( paramConfig.indexOf("customizeReport") >= 0 ) {
		showReportInPointUrl();
		return;
	}

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
			if( paramCaption.indexOf("仓库") >= 0) {
				columns[columns.length] = "<column name='" +columnName+ "' caption='" +paramCaption+ "' mode='string' editor='comboedit' editorvalue='" + whIds + "' editortext='" + whNames + "' empty='false'/>";	
			}
			else {
				columns[columns.length] = "<column name='" +columnName+ "' caption='" +paramCaption+ "' mode='" +mode+ "' inputReg='" +inputReg+ "' empty='" +empty+ "'/>";
			}
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

function showReportInPointUrl() {
	var treeNode = $T("tree").getActiveTreeNode();
	var treeID = treeNode.getId();
	var url = treeNode.getAttribute("url");
	if( url ) {	
		if( url.split(",").length == 2 ) {
			var showPage   = url.split(",")[0];
			var serviceUri = url.split(",")[1]; // 如: "http://localhost:9000/dm/rs/kanban/{whId}"
			window.open(showPage + "?service=" + serviceUri);
		}
		else {
			window.open(url);
		}
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

function showLoginForm() {
	var str = [];
	str[str.length] = "<xform>";
	str[str.length] = "    <declare>";
	str[str.length] = "        <column name=\"loginName\"  caption=\"帐    号\" mode=\"string\"/>";
	str[str.length] = "        <column name=\"password\"   caption=\"密　　码\" mode=\"string\"/>";
	str[str.length] = "    </declare>";
	str[str.length] = "    <layout>";
	str[str.length] = "        <TR>";
	str[str.length] = "            <TD width=\"50\"><label binding=\"loginName\"/></TD>";
	str[str.length] = "            <TD><input binding=\"loginName\" type=\"text\" style=\"width:150px\"/></TD>";
	str[str.length] = "        </TR>";
	str[str.length] = "        <TR>";
	str[str.length] = "            <TD width=\"50\"><label binding=\"password\"/></TD>";
	str[str.length] = "            <TD><input binding=\"password\" type=\"password\" style=\"width:150px\"/></TD>";
	str[str.length] = "        </TR>";
	str[str.length] = "        <TR>";
	str[str.length] = "            <TD width=\"50\">&amp;nbsp;</TD>";
	str[str.length] = "            <TD>";
	str[str.length] = "                <input type=\"button\" class=\"btLogin\" id=\"btCloseLoginForm\" value=\"关闭\"/>";
	str[str.length] = "                <input type=\"button\" class=\"btLogin\" id=\"btLogin\" value=\"登录\" onclick=\"login()\"/>";
	str[str.length] = "            </TD>";
	str[str.length] = "        </TR>";
	str[str.length] = "    </layout>";
	str[str.length] = "    <data><row/></data>";
	str[str.length] = "</xform>";

	var xmlReader = new XmlReader(str.join(""));
	var loginFormXML = new XmlNode(xmlReader.documentElement);
	Cache.XmlDatas.add("loginForm", loginFormXML);

	// 初始化登录xform
	Element.show($$("loginFormDiv"));
	$X("loginForm", loginFormXML);

	$$("btCloseLoginForm").onclick = function () {
		Element.hide($$("loginFormDiv"));
	}
}

function login() {
	var loginXForm = $X("loginForm");
	var loginName = loginXForm.getData("loginName") || "";
	var password = loginXForm.getData("password") || "";
	if( "" == loginName ) {
		loginXForm.showCustomErrorInfo("loginName", "请输入姓名");
		return;
	} 
	else if( "" == password ) {
		loginXForm.showCustomErrorInfo("password", "请输入密码");
		return;
	}

	Ajax({
		url : URL_RS_LOGIN,
		params : {"domain": "800best", "loginName": loginName, "password": password},
		method : "POST",
		type : "json",
		ondata : function() { 
			var result = eval(this.getResponseText());
			if(result == null || result == "LoginError") {
				return alert("登陆失败，您输入的账号或密码有误！");
			}

			Cookie.setValue("token", result[0]);
			Cookie.setValue("userName", result[1]);
			preLogoutWMS();

			Element.hide($$("loginFormDiv"));

			getWarehouseList();
		}
	});
}

function getWarehouseList() {
	var userId = Cookie.getValue("token");
	Ajax({
		url : URL_RS_WH_LIST,
		params: {"userId": userId},
		method : "POST",
		type : "json",
		ondata : function() { 
			var result = eval(this.getResponseText());
			if( result ) {
				var whIds = "";
				var whNames = "";
				for(var i = 0; i < result.length; i++) {
					if(whIds.length > 0){
						whIds += "|";
						whNames += "|";
					}
					whIds   += result[i].id;
					whNames += result[i].cname;
				}
				
				var paramConfig = getTreeAttribute("param");
				showSearchForm(paramConfig, whIds, whNames);
			}				
		}
	});
}

function testRestfulReportService() {
	var treeNode = $T("tree").getActiveTreeNode();
	var treeID = treeNode.getId();
	var url = treeNode.getAttribute("url");
	if( url == null ) {
		url = URL_REPORT_JSON + treeID;
	}
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

		Cookie.del("userName");
		Cookie.del("token");
	}
});