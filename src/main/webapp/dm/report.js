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
		_alert("您当前的浏览器不是Chrome浏览器，为能有更好的展示效果，建议换成Chrome访问。");
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
		treeElement.onTreeNodeActived = treeElement.onTreeNodeDoubleClick = function(eventObj) {
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
			Element.hide($$("searchFormDiv"));
		}
		treeElement.onTreeNodeMoved = function(eventObj) {
			Element.hide($$("searchFormDiv"));
			sort(eventObj);
		}
	}

	Ajax({url : URL_SOURCE_TREE, onresult : onresult});
}

function loadReportDetail(isCreate, readonly, type) { 
	var treeNode = $T("tree").getActiveTreeNode();
	var treeID = treeNode.getId();
	type = type || treeNode.getAttribute("type") ;
	
	Element.hide($$("searchFormDiv"));
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
	if( displayUri.indexOf("?") < 0 ) {
		url = url + "?id=" + treeID;
	} else {
		url = url + "&id=" + treeID;
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

var globalValiable = {}; // 用来存放传递给iframe页面的信息

function showReport() {
	var treeNode = $T("tree").getActiveTreeNode();
	var treeID = treeNode.getId();
	var displayUri  = (treeNode.getAttribute("displayUri") || "").trim().replace('|', '&'); 
	var paramConfig = (treeNode.getAttribute("param") || "").trim(); 

	globalValiable.title = treeNode.getName();

	// 判断当前报表是否专门配置了展示页面
	if( displayUri.length > 0 ) {
		// 如果还配置了参数，则由report页面统一生成查询Form，查询后再打开展示页面里。
		if(paramConfig.length > 0) {
			createQueryForm(treeID, paramConfig, function(searchFormXML) {
				// 根据服务地址取出数据放在全局变量里
				var url = getServiceUrl(treeID, displayUri);
				Ajax({
					url : url,
					method : "POST",
					xformNode : searchFormXML,
					type : "json",
					waiting : true,
					ondata : function() { 
						globalValiable.data = eval(this.getResponseText());
						
						// 数据在iframe里展示
						showReportInPointUrl(treeID, displayUri);
					}
				});
			});
		}
		else {
			showReportInPointUrl(treeID, displayUri); // 直接打开展示页面
		}
	} 
	else {
		createQueryForm(treeID, paramConfig); // 生成查询Form
	}	
}

function searchReport(treeID, download) {		
	var xform = $X("searchForm");	
	if( xform && !xform.checkForm() ) return;

	Element.hide($$("searchFormDiv"));
	var searchFormXML = Cache.XmlDatas.get("searchForm");

	if(download) {
		var queryString = "?";
		if( searchFormXML ) {
			var dataNode = searchFormXML.selectSingleNode(".//data");
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

	if( searchFormXML ) {
		var dataNode = searchFormXML.selectSingleNode(".//data");
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

function getServiceUrl(treeID, displayUri) {
	Query.init(displayUri);
	var url = Query.get("service") || (URL_REPORT_JSON + treeID); // 优先使用展示地址里指定的服务地址
	Query.init();

	return url;
}

function testRestfulReportService() {
	var treeNode = $T("tree").getActiveTreeNode();
	var treeID = treeNode.getId();
	var paramConfig = (treeNode.getAttribute("param") || "").trim(); 
	var displayUri  = (treeNode.getAttribute("displayUri") || "").trim().replace('|', '&'); 
	var url = getServiceUrl(treeID, displayUri);

	if(paramConfig.length > 0) {
		createQueryForm(treeID, paramConfig, sendAjax);
	} 
	else {
		sendAjax();
	}

	function sendAjax(searchFormXML) {
		Ajax({
			url : url,
			method : "POST",
			xformNode : searchFormXML,
			type : "json",
			waiting : true,
			ondata : function() { 
				alert("调试接口：" + url + "，返回结果：", this.getResponseText());
			}
		});
	}
}

window.onload = init;

Event.attachEvent(window, "onunload", function() {
	if(10000 < window.screenTop || 10000 < window.screenLeft) {
		logout(); // 关闭页面自动注销
	}
});


/* 
 * 根据配置自动生成查询表单
 */
var ParamItem = function(index, paramInfo) {
	this.name  = paramInfo.name || ("param" + (index + 1));
	this.label = paramInfo.label;
	this.type  = paramInfo.type || "string";
	this.nullable = (paramInfo.nullable == null ? true : paramInfo.nullable);
	this.checkReg = paramInfo.checkReg;
	this.options = paramInfo.options;
	this.jsonUrl = paramInfo.jsonUrl;
	this.multiple = (paramInfo.multiple == "true") || false;
	this.onchange = paramInfo.onchange;
	this.width = paramInfo.width || "250px";
	this.height = paramInfo.height;	
	this.defaultValue = paramInfo.defaultValue;

	switch(this.type.toLowerCase()) {
		case "number":
			this.mode = "number";
			this.checkReg = this.checkReg || "/^[0-9]*[1-9][0-9]*$/";
			break;
		case "string":
			this.mode = "string";
			break;
		case "date":
			this.mode = "date";
			if( this.defaultValue && (/today[\s]*-/gi).test(this.defaultValue) ) {
				var deltaDays = parseInt(this.defaultValue.split("-")[1]);
				var today = new Date();
				today.setDate(today.getDate() - deltaDays);
				this.defaultValue = today.format('yyyy-MM-dd');
			} 
			break;
	}
}

ParamItem.prototype.createColumn = function() {
	var column = "<column name='" + this.name + "' caption='" +this.label+ "' mode='" +this.mode+ "' empty='" +this.nullable+ "' ";
	if(this.checkReg) {
		column += " inputReg='" +this.checkReg+ "' ";
	}
	if(this.multiple) {
		column += " multiple='multiple' ";
	}
	if(this.onchange) {
		column += " onchange='" +this.onchange+ "' ";
	}
	if(this.height) {
		column += " height='" +this.height+ "' ";
	}

	if(this.options) {
		column += " editor='comboedit' editorvalue='" + this.options.codes + "' editortext='" + this.options.names + "'";
	}

	if(this.jsonUrl) {
		var thisObj = this;
		column += " editor='comboedit' editorvalue='' editortext=''"; // editorvalue='1|2|3' editortext='1|2|3'

		Ajax({
			url : this.jsonUrl,
			method: "GET",
			type : "json",
			ondata : function() { 
				var result = eval(this.getResponseText());
				if( result ) {
					var selectObj = $$(thisObj.name);
					for(var i = 0; i < result.length; i++) {
						selectObj.options[selectObj.options.length] = createOption(result[i]);
					}
				}				
			}
		});
	}	 

	return column + "/>";
}

// item的类型可能为[pk, code, name] or {pk:'xx', id:'yy', text:'zz'}
function createOption(item) {
	var option = new Option();
	option.value = item.pk || item[0];
	option.text  = item.text || item[2];
	return option;
}

ParamItem.prototype.createLayout = function() {
	var layout = [];
	layout[layout.length] = " <TR>";
	layout[layout.length] = "    <TD width='50'><label binding='" + this.name + "'/></TD>";
	layout[layout.length] = "    <TD><input binding='" + this.name + "' type='text' style='width:" + this.width + ";height:" + (this.height || '18px') + ";'/></TD>";
	layout[layout.length] = " </TR>";

	return layout.join("");
}			

ParamItem.prototype.createDataNode= function() {
 	if(this.defaultValue) {
 		return "<" + this.name + "><![CDATA[" + this.defaultValue + "]]></" + this.name + ">";
 	}
	return "";
}

function createQueryForm(treeID, paramConfig, callback) {
	if( Cache.Variables.get("searchForm4TreeId") == treeID && Cache.Variables.get("callbackInSearchForm") == callback) {
		Element.show($$("searchFormDiv"));  // 如果上一次打开的也是同一报表的查询框，则直接显示
		return;
	}
	
	var paramArray = paramConfig ? eval(paramConfig) : [];

	var columns = [];
	var layouts = [];
	var datarow = [];
	for( var i = 0; i < paramArray.length; i++ ) {
		var paramInfo = eval(paramArray[i]);

		var item = new ParamItem(i, paramInfo);
		columns.push(item.createColumn());
		layouts.push(item.createLayout());
		datarow.push(item.createDataNode());
	}

	layouts[layouts.length] = "        <TR>";
	layouts[layouts.length] = "          <TD colspan='2' height='46'><div class='buttonBox'>";
	layouts[layouts.length] = "				<input type='button' class='btStrong' id='btSearch' value='查询'/> - ";
	layouts[layouts.length] = "				<input type='button' class='btStrongL' id='btDownload' value='查询并导出'/> - ";
	layouts[layouts.length] = "				<input type='button' class='btWeak' id='btCloseSearchForm' value='关闭'/>";
	layouts[layouts.length] = "          </div></TD>";
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
	str[str.length] = "    <data><row>" + datarow.join("") + "</row></data>";
	str[str.length] = "</xform>";
	
	var formContent = str.join("");
	var xmlReader = new XmlReader(formContent);
	var searchFormXML = new XmlNode(xmlReader.documentElement);
	var searchForm = $X("searchForm", searchFormXML);
	Cache.XmlDatas.add("searchForm", searchFormXML);
	Cache.Variables.add("searchForm4TreeId", treeID);
	Cache.Variables.add("callbackInSearchForm", callback);
	
	$$("btSearch").onclick = function () {
		if(callback) {
			if( !searchForm.checkForm() ) return;

			Element.hide($$("searchFormDiv"));
			var searchFormXML = Cache.XmlDatas.get("searchForm");

			callback(searchFormXML); // 在回调函数里读取数据并展示
		} 
		else {
			searchReport(treeID, false);
		}
	}
	$$("btDownload").onclick = function () {
		searchReport(treeID, true);
	}
	$$("btCloseSearchForm").onclick = function () {
		Element.hide($$("searchFormDiv"));
	}
}