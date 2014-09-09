/* 后台响应数据节点名称 */
XML_SOURCE_TREE = "SourceTree";
XML_REPORT_DATA = "ReportData";
XML_SOURCE_INFO = "SourceInfo";

PAGESIZE = 100;

/* XMLHTTP请求地址汇总 */
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

	URL_GET_OPERATION  = "data/_operation.xml?";

	URL_REPORT_DATA    = "data/REPORT_DATA.xml?";
	URL_REPORT_JSON    = "data/REPORT_JSON.txt?";
	URL_REPORT_EXPORT  = "data/_success.xml?";
}

/* 页面初始化 */
function init() {
	if( !$.isChrome ) {
		_alert("您当前的浏览器不是Chrome浏览器，为能有更好的展示效果，建议换成Chrome访问。");
	}	

	initMenus();
	initEvents();

	loadInitData();
}

/* 菜单初始化 */
function initMenus() {
	/* 树菜单初始化  */
	ICON = "images/"
	var item1 = {
		label:"报表查询",
		callback:showReport,
		icon: ICON + "icon_search.gif",
		visible:function() {return isReport() && !isTreeNodeDisabled() && getOperation("1");}
	}
	var item10 = {
		label:"查看",
		callback: function() {
			loadReportDetail(false, true);
		},
		icon: ICON + "icon_view.gif",
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
		icon: ICON + "report_0.gif",
		visible:function() {return (isReportGroup() || isTreeRoot()) && !isTreeNodeDisabled() && getOperation("2");}
	}
	var item4 = {
		label:"新增分组",
		callback: function() {
			loadReportDetail(true, false, "0");
		},
		icon: ICON + "icon_folder_new.gif",
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
		icon: ICON + "icon_stop.gif",
		visible:function() {return !isTreeRoot() && !isTreeNodeDisabled() && getOperation("4");}
	}
	var item9 = {
		label:"启用",
		callback:enableReport,
		icon: ICON + "icon_start.gif",
		visible:function() {return !isTreeRoot() && isTreeNodeDisabled() && getOperation("4");}
	}
	var item11 = {
		label:"测试报表服务",
		callback:testRestfulReportService,
		icon: ICON + "icon_service.gif",
		visible:function() {return isReport() && !isTreeNodeDisabled() && getOperation("2");}
	}

	var menu = new $.Menu();
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
	
	$1("tree").contextmenu = menu;
}

function isReportGroup() {
	return "0" == getTreeAttribute("type");
}

function isReport() {
	return !isTreeRoot() && !isReportGroup();
}

function loadInitData() {
	var onresult = function() {
		var tree = $.T("tree", this.getNodeValue(XML_SOURCE_TREE));

		// tree.onTreeNodeActived = function(ev) {
		// 	var treeNode = ev.treeNode;
		// 	getTreeOperation(treeNode, function(_operation) {            
		// 		if( isReport() ) {
		// 			showReport();
		// 		}
		// 	});
		// }
		tree.onTreeNodeDoubleClick = function(ev) {
			var treeNode = getActiveTreeNode();
			getTreeOperation(treeNode, function(_operation) {            
				if( isReport() ) {
					showReport();
				}
				if( isReportGroup() ) {
					loadReportDetail(false, false);
				}
			});
		}
		tree.onTreeNodeRightClick = function(ev) {
			onTreeNodeRightClick(ev, true);
			$("#searchFormDiv").hide();
		}
		tree.onTreeNodeMoved = function(ev) {
			$("#searchFormDiv").hide();
			sortTreeNode(URL_SORT_SOURCE, ev);
		}
	}

	$.ajax({url : URL_SOURCE_TREE, onresult : onresult});
}

function loadReportDetail(isCreate, readonly, type) { 
	var treeNode = $.T("tree").getActiveTreeNode();
	var treeID = treeNode.id;
	type = type || treeNode.getAttribute("type") ;
	
	delete $.cache.Variables["treeID_SF"];
	$("#searchFormDiv").hide();
	Element.show($1("reportFormDiv"));
	
	var params = {};
	if( isCreate ) {
		params["parentId"] = treeID; // 新增
		readonly = false;
	} else {
		params["reportId"] = treeID; // 修改					
	}

	$1("sourceSave").disabled = readonly ? "true" : "";

	$.ajax({
		url : URL_SOURCE_DETAIL + "/" + type,
		params : params,
		onresult : function() { 
			var sourceInfoNode = this.getNodeValue(XML_SOURCE_INFO);
			$.cache.XmlDatas[treeID] = sourceInfoNode;
			
			$1("reportForm").editable = readonly ? "false" : "true";
			var xform = $.F("reportForm", sourceInfoNode);
		
			// 设置保存/关闭按钮操作
			$1("closeReportForm").onclick = function() {
				$("#reportFormDiv").hide();
			}
			$1("sourceSave").onclick = function() {
				saveReport(treeID);
			}
		},
		onexception : function() { 
			$("#reportFormDiv").hide();
		}
	});
}

function saveReport(treeID) {
	var xform = $.F("reportForm");	
	if( !xform.checkForm() ) return;

	var request = new $.HttpRequest();
	request.url = URL_SAVE_SOURCE;

	var sourceInfoNode = $.cache.XmlDatas[treeID];
	var dataNode = sourceInfoNode.querySelector("data");
	request.setFormContent(dataNode);

	syncButton([$1("sourceSave")], request); // 同步按钮状态

	request.onresult = function() { // 新增结果返回              
		var xmlNode = this.getNodeValue(XML_SOURCE_TREE).querySelector("treeNode");
		appendTreeNode(treeID, xmlNode);
		
		$("#reportFormDiv").hide()
	}

	request.onsuccess = function() { // 更新
		modifyTreeNode(treeID, "name", xform.getData("name"));
		
		$("#reportFormDiv").hide()
	}
	request.send();
}

function deleteReport()  { delTreeNode(URL_DELETE_SOURCE); }
function disableReport() { stopOrStartTreeNode("1", URL_DISABLE_SOURCE); }
function enableReport()  { stopOrStartTreeNode("0", URL_DISABLE_SOURCE); }
 
function copyReportTo() {
	var treeNode = getActiveTreeNode();
	var id = treeNode.id;
	var pId = treeNode.parent.id;

    var params = {id:id, parentID: pId};
    popupTree(URL_GROUPS_TREE, "SourceTree", params, function(target) {
        $.ajax({
            url : URL_COPY_SOURCE + id + "/" + target.id,
            onresult : function() { 
                var newNode = this.getNodeValue(XML_MAIN_TREE).querySelector("treeNode");
                tree.addTreeNode(newNode, target)
            }
        });
    });
}

function moveReport() {
	var tree = $.T("tree");
	var treeNode = tree.getActiveTreeNode();
	var id  = treeNode.id;
    var pId = treeNode.parent.id;

    var params = {id:id, parentID: pId};
    popupTree(URL_GROUPS_TREE, "SourceTree", params, function(target) {
        moveTreeNode(tree, id, target.id, URL_MOVE_SOURCE);
    });
}		

function showReportInPointUrl(treeID, displayUri) {
	var url = displayUri;
	if( displayUri.indexOf("?") < 0 ) {
		url = url + "?id=" + treeID;
	} else {
		url = url + "&id=" + treeID;
	}

	// 关闭左栏
	closePalette();
 
	$("#grid").hide();
	$("#chatFrame").show();
	$1("chatFrame").setAttribute("src", url);
}

var globalValiable = {}; // 用来存放传递给iframe页面的信息

function showReport() {
	var treeNode = getActiveTreeNode();
	var treeID = treeNode.id;
	var displayUri  = (treeNode.getAttribute("displayUri") || "").trim().replace('|', '&'); 
	var paramConfig = (treeNode.getAttribute("param") || "").trim(); 

	globalValiable.title = treeNode.name;

	// 判断当前报表是否专门配置了展示页面
	if( displayUri.length > 0 ) {
		// 如果还配置了参数，则由report页面统一生成查询Form，查询后再打开展示页面里。
		if(paramConfig.length > 0) {
			createQueryForm(treeID, paramConfig, function(dataNode) {
				sendAjax(dataNode);
			});
		}
		else {
			$("#searchForm").html(""); // 删除查询框（其它报表的）
			if(displayUri.indexOf("?type=") > 0) {
				sendAjax(); // 使用通用模板的，有可能此处是不带任何参数的SQL查询
			} 
			else {
				showReportInPointUrl(treeID, displayUri); // 直接打开展示页面
			}
		}
	} 
	else {
		createQueryForm(treeID, paramConfig); // 生成查询Form
	}	

	function sendAjax(searchFormDataNode) {
		var url = getServiceUrl(treeID, displayUri); // 根据服务地址取出数据放在全局变量里
		$.ajax({
			url : url,
			method : "POST",
			formNode : searchFormDataNode,
			type : "json",
			waiting : true,
			ondata : function() { 
				globalValiable.queryParams = this.params;
				globalValiable.data = this.getResponseJSON();
				
				// 数据在iframe里展示
				showReportInPointUrl(treeID, displayUri);
			}
		});
	}
}

function searchReport(treeID, download) {		
	var xform = $.F("searchForm");	
	if( xform && !xform.checkForm() ) return;

	$("#searchFormDiv").hide();
	var searchFormXML = $.cache.XmlDatas["searchFormXML"];

	if(download) {
		var queryString = "?";
		if( searchFormXML ) {
			var nodes = searchFormXML.querySelectorAll("data row");
			$.each(nodes, function(i, node) {
				queryString +=  node.nodeName + "=" + $.XML.getText(node);
				if( queryString.length > 1 ) {
					queryString += "&";
				}
			});
		}
		$("#downloadFrame").setAttribute("src", URL_REPORT_EXPORT + treeID + "/1/0" + queryString);
		return;
	}
 
 	var request = new $.HttpRequest();
	request.url = URL_REPORT_DATA + treeID + "/1/" + PAGESIZE;
	request.waiting = true;
	if( searchFormXML ) {
		var dataNode = searchFormXML.querySelector("data");
		request.setFormContent(dataNode);
	}
	
	request.onresult = function() {
		$1("grid").style.display = "";
		$1("chatFrame").style.display = "none";

		var grid = $.G("grid", this.getNodeValue(XML_REPORT_DATA)); 
		var gridToolBar = $1("gridToolBar");

		var pageListNode = this.getNodeValue(XML_PAGE_INFO);			
		$.initGridToolBar(gridToolBar, pageListNode, function(page) {
			request.url = URL_REPORT_DATA + treeID + "/" + page + "/" + PAGESIZE;
			request.onresult = function() {
				$.G("grid", this.getNodeValue(XML_REPORT_DATA)); 
			}				
			request.send();
		} );
		
		grid.el.onScrollToBottom = function () {			
			var currentPage = gridToolBar.getCurrentPage();
			if(currentPage <= gridToolBar.getTotalPages() ) {
				var nextPage = parseInt(currentPage) + 1; 
				request.url = URL_REPORT_DATA + treeID + "/" + nextPage + "/" + PAGESIZE;
				request.onresult = function() {
					$.G("grid").load(this.getNodeValue(XML_REPORT_DATA), true);
					$.initGridToolBar(gridToolBar, this.getNodeValue(XML_PAGE_INFO));
				}				
				request.send();
			}
		}
	}
	request.send();
} 

function getServiceUrl(treeID, displayUri) {
	$.Query.init(displayUri);
	var url = $.Query.get("service") || (URL_REPORT_JSON + treeID); // 优先使用展示地址里指定的服务地址
	$.Query.init();

	return url;
}

function testRestfulReportService() {
	var treeNode = getActiveTreeNode();
	var treeID = treeNode.id;
	var paramConfig = (treeNode.getAttribute("param") || "").trim(); 
	var displayUri  = (treeNode.getAttribute("displayUri") || "").trim().replace('|', '&'); 
	var url = getServiceUrl(treeID, displayUri);

	if(paramConfig.length > 0) {
		createQueryForm(treeID, paramConfig, sendAjax);
	} 
	else {
		sendAjax();
	}

	function sendAjax(searchFormDataNode) {
		$.ajax({
			url : url,
			method : "POST",
			formNode : searchFormDataNode,
			type : "json",
			waiting : true,
			ondata : function() { 
				alert("调试接口：" + url + "，返回结果：", this.getResponseText());
			}
		});
	}
}

window.onload = init;
 

function createQueryForm(treeID, paramConfig, callback) {
	if( $.cache.Variables["treeID_SF"] == treeID && $.funcCompare($.cache.Variables["callback_SF"], callback) ) {
		Element.show($1("searchFormDiv"));  // 如果上一次打开的和本次打开的是同一报表的查询框，则直接显示
		return;
	}

	var buttonBox = [];
	buttonBox[buttonBox.length] = "        <TR>";
	buttonBox[buttonBox.length] = "          <TD colspan='2' height='46'><div class='buttonBox'>";
	buttonBox[buttonBox.length] = "				<input type='button' class='btStrong' id='btSearch' value='查询'/> - ";
	buttonBox[buttonBox.length] = "				<input type='button' class='btStrongL' id='btDownload' value='查询并导出'/> - ";
	buttonBox[buttonBox.length] = "				<input type='button' class='btWeak' id='btCloseSearchForm' value='关闭'/>";
	buttonBox[buttonBox.length] = "          </div></TD>";
	buttonBox[buttonBox.length] = "        </TR>";

	var searchForm = $.json2Form("searchForm", paramConfig, buttonBox.join(""));

	Element.show($1("searchFormDiv"));
	$1("reportName").innerText = "查询报表【" + getTreeNodeName() + "】";

	$.cache.XmlDatas["searchFormXML"] = searchForm.template.sourceXML;
	$.cache.Variables["treeID_SF"] = treeID;
	$.cache.Variables["callback_SF"] = callback;
	
	$1("btSearch").onclick = function () {
		if(callback) {
			if( searchForm.checkForm() ) {
				$("#searchFormDiv").hide();
				var searchFormXML = $.cache.XmlDatas["searchFormXML"];
				var dataNode = searchFormXML.querySelector("data");
				callback(dataNode); // 在回调函数里读取数据并展示
			}
		} 
		else {
			searchReport(treeID, false);
		}
	}
	$1("btDownload").onclick = function () {
		searchReport(treeID, true);
	}
	$1("btCloseSearchForm").onclick = function () {
		$("#searchFormDiv").hide();
	}
}

// ------------------------------------------------- 多级下拉选择联动 ------------------------------------------------

function getNextLevelOption(nextIndex, serviceID, currParam, currParamValue) {
	if(nextIndex == null || serviceID == null || currParam == null || $.isNullOrEmpty(currParamValue)) return;

	var dreg = /^[1-9]+[0-9]*]*$/;
	var paramElementId = "param" + nextIndex;
 
	var paramName = dreg.test(currParam) ? "param" + currParam : currParam;
	
	// serviceID maybe is ID of report, maybe a serviceUrl
	var url = dreg.test(serviceID) ? '../display/json/' + serviceID : serviceID;

	$.getNextLevelOption($.F("searchForm"), paramName, currParamValue, url, paramElementId);
}