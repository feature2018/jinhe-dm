
var GridCache = new Collection();

function $G(gridId, data) {
	var grid = GridCache.get(gridId);
	if( grid == null || data ) {
		grid = new Grid($$(gridId), data);
	}
	
	return grid;
}



var scrollbarSize = 17;
var cellWidth = 100; //基本列宽
var cellHeight = 22; //数据行高
var GRID_SCROLL_DELAY_TIME = 0; // 滚动条的滚动事件延迟时间（毫妙）

var Grid = function(element, data) {
	this.id = element.id;
	this.element = element;
 
	this.baseurl  = element.getAttribute("baseurl") || "";
	this.iconPath = this.baseurl + "images/";
	
	this.gridBoxId = this.id + "Box";
	this.element.innerHTML = "<div id='" + this.gridBoxId + "' style='position:relative;overflow:auto;left:0px;top:0px;z-index:1'></div>";
	this.gridBox   = $$(this.gridBoxId);

	this.gridBox.style.width  = this.windowWidth  = element.getAttribute("width")  || "100%";
	var pointHeight = element.getAttribute("height");
	if( pointHeight ) {
		this.gridBox.style.height = this.windowHeight = pointHeight;
	} else {
		// this.gridBox.style.height = "100%";
		this.gridBox.style.height = element.clientHeight; // 固定住grid高度，以免在IE部分版本及FF里被撑开
		this.windowHeight = Math.max(element.offsetHeight, 500);
	}

	this.pageSize = Math.floor(this.windowHeight / cellHeight);
	
	this.load(data);	

	// 添加Grid事件处理
	this.attachEventHandler();	

	GridCache.add(this.id, this);	
}


Grid.prototype.load = function(data, append) {
	if("object" != typeof(data) || data.nodeType != _XML_NODE_TYPE_ELEMENT) {
		alert("传入的Grid数据有问题。")	
	} 
	
	this.template = new GridTemplate(data.node);	
	if( this.template.declare == null ) return;

	// 初始化变量
	var startNum = append ? this.totalRowsNum : 0;		

	// 解析成Html
	var gridTableHtml = parseTempalte(this.template, startNum, this.id); 
	
	if(append) {
		var tempGridNode = document.createElement("div");
		tempGridNode.innerHTML = gridTableHtml.replace(/<\/br>/gi, "") ;
		var tempRows = tempGridNode.childNodes[0].tBodies[0].rows;
		for(var i=0; i < tempRows.length; i++) {
			var cloneRow = tempRows[i].cloneNode(true);
			this.tbody.appendChild(cloneRow);
		}

		Element.removeNode(tempGridNode);
	}
	else {
		this.gridBox.innerHTML = ""; // 初始化容器
		this.gridBox.innerHTML = gridTableHtml.replace(/<\/br>/gi, "") ;

		var table  = $$(this.gridBoxId).childNodes[0];
		this.tbody = table.tBodies[0];
		
		// 拖动改变列宽
		Element.ruleObjList = []; // 先清空原来的拖动条
		var thList = table.tHead.firstChild.childNodes;
		for( var i = 0; i < thList.length; i++ ) {
			Element.attachColResizeII(thList[i]);
		}
		
		// 设置隐藏列事件，双击隐藏列
		for( var i = 0; i < thList.length; i++ ) {
			var th = thList[i];
			th.index = i;
			th.rows = this.tbody.rows;
			Event.attachEvent(th, "dblclick", function() {
				var srcElement = Event.getSrcElement(event);
				while(srcElement.tagName.toLowerCase() != "td") {
					srcElement = srcElement.parentNode;
				}
				srcElement.style.display = "none";

				var rows = srcElement.rows;
				for(var j = 0; j < rows.length; j++ ) {
					rows[j].childNodes[srcElement.index].style.display = "none";
				}
			}) ;
		}		
	}
	
	var table  = $$(this.gridBoxId).childNodes[0];
	this.tbody = table.tBodies[0];
	this.rows  = this.tbody.rows;
	this.totalRowsNum = this.rows.length;
	for(var i=startNum; i < this.totalRowsNum; i++) {
		this.processDataRow(this.rows[i]); // 表格行TR
	}
	
	bindSortHandler(table); // table
} 

var GridTemplate = function(xmlDom) {
	if( xmlDom && xmlDom.xml != "" ) {
		this.declare = xmlDom.getElementsByTagName("declare")[0];
		this.script  = xmlDom.getElementsByTagName("script")[0];
		this.columns = this.declare.getElementsByTagName("column");
		this.data    = xmlDom.getElementsByTagName("data")[0];
		this.dataRows = this.data.getElementsByTagName("row") || [];

		this.columnsMap = {};
		for(var i = 0; i < this.columns.length; i++) {
			this.columnsMap[this.columns[i].getAttribute("name")] = this.columns[i];
		}
		
		this.hasHeader    = this.declare.getAttribute("header") == "checkbox";
		this.needSequence = this.declare.getAttribute("sequence") != "false";
 	}
}

function parseTempalte(template, startNum, gridID) {
	 var thead = new Array();
	 var tbody = new Array();

	 thead.push("<thead><tr>");
	 tbody.push("<tbody class=\"cell\">");
	 if(template.hasHeader) {
		thead.push("<td width=\"50px\" align=\"center\" class=\"column\"><input type=\"checkbox\" id=\"headerCheckAll\"/></td>");
	 }
	 if(template.needSequence) {
		thead.push("<td width=\"50px\" align=\"center\" name=\"sequence\" class=\"column\"><nobr>序号</nobr></td>");
	 }
	 for(var name in template.columnsMap) {
		var column = template.columnsMap[name];
		var width    = column.getAttribute("width");
		width = width ? " width=\"" + width + "\" " : "";
		var _class   = column.getAttribute("display") == "none" ?  "hidden" : "column";
		var caption  = column.getAttribute("caption");
		var sortable = column.getAttribute("sortable") == "true" ? "sortable=\"true\"" : "";
		var align = " align=\"" + getAlign(column) + "\" ";
		thead.push("<td " + width + align + " name=\"" + name + "\" class=\"" + _class + "\" " + sortable + "><nobr>" + caption + "</nobr></td>")
	 }

	 for(var i=0; i < template.dataRows.length; i++) {
		var row = template.dataRows[i];
		var _class =  column.getAttribute("class");
		_class = _class ? "class = \"" + _class + "\"" : "";
		var index = startNum + i + 1;
		
		tbody.push("<tr " + _class + " _index=\"" + index + "\" ");
		for(var name in template.columnsMap) {
			// 把各个属性值复制一份到 tr 的属性上
			var value = row.getAttribute(name);
			if(value) {
				tbody.push( name + "=\"" + row.getAttribute(name) + "\" "); 
			}
		}
		tbody.push(">");

		if(template.hasHeader) {
			tbody.push("<td align=\"center\" mode=\"cellheader\" name=\"cellheader\"><nobr>");
			tbody.push("<input class=\"selectHandle\" name=\"" + gridID + "_header\" type=\"checkbox\" >");
			tbody.push("</nobr></td>")
		}
		if(template.needSequence) {
			tbody.push("<td align=\"center\" mode=\"cellsequence\" name=\"cellsequence\"><nobr>" + index + "</nobr></td>");
		}

		for(var name in template.columnsMap) {
			var column = template.columnsMap[name];
			
			var _class = "";
			if(column.getAttribute("display") == "none") {
				_class = "class=\"hidden\"";
			} 
			else if(column.getAttribute("highlightCol") == "true") {
				_class = "class=\"highlightCol\"";
			}
			tbody.push("<td align=\"" + getAlign(column) + "\" name=\"" + name + "\" " + _class + "><nobr></nobr></td>");
		}
		tbody.push("</tr>");
	 }

	 thead.push("</thead></tr>");	 
	 tbody.push("</tbody>");

	 var htmls = new Array();
     htmls.push("<table>");
	 htmls.push(thead.join(""));
	 htmls.push(tbody.join(""));
	 return htmls.join("");
}

function getAlign(column) {
	var align = column.getAttribute("align");
	if(align) {
		return align;
	}

	switch(column.getAttribute("mode")) {
		case "number":
			return "right";
		case "boolean":
		case "date":
			return "center";
		default:
			return "left";
	}
}

/*
 * 处理数据行，按各列的属性设置每一行上对应该列的值.
 */
Grid.prototype.processDataRow = function(curRow) {
	attachHighlightRowEvent(curRow);
	
	var cells = curRow.childNodes;
	for(var j=0; j < cells.length; j++) {
		var cell = cells[j];
		var columnName = cell.getAttribute("name");
		var columnNode = this.template.columnsMap[columnName]; 
		if( columnName == null || columnName == "cellsequence" || columnName == "cellheader" || columnNode == null)  {
			continue;
		}

		var value = curRow.getAttribute(columnName) || " "; // xsl解析后，各行的各个TD值统一记录在了TR上。

		var nobrNodeInCell = cell.childNodes[0];    // nobr 节点
		var mode = columnNode.getAttribute("mode");
		switch( mode ) {
			case "string":
				var editor = columnNode.getAttribute("editor");
				var editortext = columnNode.getAttribute("editortext");
				var editorvalue = columnNode.getAttribute("editorvalue");
				if(editor == "comboedit" && editorvalue && editortext) {
					var listNames  = editortext.split("|");
					var listValues = editorvalue.split("|");
					for(var n = 0; n < listValues.length; n++) {
						if(value == listValues[n]) {
							value = listNames[n];
							break;
						}
					}
				}
				
				nobrNodeInCell.innerText = value;
				cell.setAttribute("title", value);								
				break;
			case "number":
				nobrNodeInCell.innerText = value;
				cell.setAttribute("title", value);
				break;       
			case "date":
				nobrNodeInCell.innerText = value;
				cell.setAttribute("title", value);
				break;         
			case "function":                          
				break;    
			case "image":          
				nobrNodeInCell.innerHTML = "<img src='" + value + "'/>";
				break;    
			case "boolean":      
				var checked = (value =="true") ? "checked" : "";
				nobrNodeInCell.innerHTML = "<form style='padding:0px;margin:0px;'><input class='selectHandle' name='" + columnName + "' type='radio' " + checked + "/></form>";
				nobrNodeInCell.getElementsByTagName("INPUT")[0].disabled = true;
				break;
		}							
	}	
}

/*
 * 根据页面上的行数，获取相应的Row对象
 * 参数：	index	行序号
 * 返回值：	Row对象
 */
Grid.prototype.getRowByIndex = function(index) {
	for(var i = 0; i < this.rows.length; i++) {
		var row = this.rows[i];
		if(row.getAttribute("_index") == index) {
			return row;
		}
	}
}

// 获取选中行中指定列的值
Grid.prototype.getRowAttributeValue = function(attrName) {
	var rowIndex = this.element.selectRowIndex; 
	if(rowIndex) {
		var row = this.getRowByIndex(rowIndex);
		return row.getAttribute(attrName);
	}
	return null;
}

// 获取某一列的值
Grid.prototype.getColumnValues = function(columnName) {
	var values = [];
	for(var i = 0; i < this.rows.length; i++) {
		var row = this.rows[i];
		values[i] = row.getAttribute(columnName);
	}
	return values;
}

// 新增一行
Grid.prototype.insertRow = function(map) {
	var rowIndex = this.totalRowsNum ++ ;
	var newRow = this.tbody.insertRow(rowIndex);

	var thList = this.gridBox.childNodes[0].tHead.firstChild.childNodes;
	for(var i = 0; i < thList.length; i++) {
		var columnName = thList[i].getAttribute("name");
		
		var cell = newRow.insertCell(i);
		cell.setAttribute( "name", columnName );
		
		var column = this.template.columnsMap[columnName];
		if(column && column.getAttribute("display") == "none" ) {
			Element.addClass(cell, "hidden");
		} 
		else {
			Element.addClass(cell, "column");
		}
		
		var nobr = document.createElement("nobr");
		cell.appendChild( nobr );		

		if(columnName == "sequence") {
			nobr.innerText = this.totalRowsNum;
		}
	}

	for(var property in map) {
		newRow.setAttribute(property, map[property]);
	}
	this.processDataRow(newRow);
}

// 删除单行
Grid.prototype.deleteRow = function(row) {
	// Element.addClass(row, "hidden");
	this.tbody.removeChild(row);
}

Grid.prototype.deleteRowByIndex = function(rowIndex) {
	var row = this.getRowByIndex(rowIndex);
	this.deleteRow(row);
}

Grid.prototype.deleteSelectedRow = function() {
	var rowIndex = this.element.selectRowIndex;
	this.deleteRowByIndex(rowIndex);
}
	
// 更新单行记录的某个属性值
Grid.prototype.modifyRow = function(row, propertyName, propertyValue) {
	row.setAttribute(propertyName, propertyValue);
	this.processDataRow(row);
}

Grid.prototype.modifyRowByIndex = function(rowIndex, propertyName, propertyValue) {
	var row = this.getRowByIndex(rowIndex);
	this.modifyRow(row, propertyName, propertyValue);
}

Grid.prototype.modifySelectedRow = function(propertyName, propertyValue) {
	var rowIndex = this.element.selectRowIndex;
	this.modifyRowByIndex(rowIndex, propertyName, propertyValue);
}

Grid.prototype.getHighlightRow = function() {
	for(var i = 0; i < this.rows.length; i++) {
		var row = this.rows[i];
		if( Element.hasClass(row, "rolloverRow")) {
			return row;
		}
	}
}

function attachHighlightRowEvent(curRow) {
	// 鼠标经过行时高亮显示
	curRow.onmouseover = function() { 
		 this.oldClassName = this.className;
		 Element.addClass(this, "rolloverRow");    // 鼠标经过时添加class为highlight的值			 
	}			
	curRow.onmouseout = function() { 
		this.className = this.oldClassName; // 鼠标离开时还原之前的class值
		this.removeAttribute("oldClassName");
	}
}

// 添加Grid事件处理
Grid.prototype.attachEventHandler = function() {
	// 添加滚动条事件
	var oThis = this;

	this.gridBox.onscroll = function() {
		 if(oThis.gridBox.scrollHeight - oThis.gridBox.scrollTop <= oThis.element.firstChild.clientHeight) {
			// alert("到达底部");
			var eventFirer = new EventFirer(oThis.element, "onScrollToBottom");
			eventFirer.fire(createEventObject());
		 }
	}

	this.element.onmousewheel = function() {
		oThis.gridBox.scrollTop += -Math.round(window.event.wheelDelta / 120) * cellHeight;
	}
	
	this.element.onkeydown = function() {
		switch (event.keyCode) {
		    case 33:	//PageUp
				oThis.gridBox.scrollTop -= oThis.pageSize * cellHeight;
				return false;
		    case 34:	//PageDown
				oThis.gridBox.scrollTop += oThis.pageSize * cellHeight;
				return false;
		    case 35:	//End
				oThis.gridBox.scrollTop = oThis.gridBox.offsetHeight - oThis.windowHeight;
				return false;
		    case 36:	//Home
				oThis.gridBox.scrollTop = 0;
				return false;
		    case 37:	//Left
				oThis.gridBox.scrollLeft -= 10;
				return false;
		    case 38:	//Up
				oThis.gridBox.scrollTop -= cellHeight;
				return false;
		    case 39:	//Right
				oThis.gridBox.scrollLeft += 10;
				return false;
		    case 40:	//Down
				oThis.gridBox.scrollTop += cellHeight;
				return false;
		}
	}
 
	this.element.onclick = function() { // 单击行
		fireClickRowEvent(this, event, "onClickRow");
	}
	this.element.ondblclick = function() { // 双击行
		fireClickRowEvent(this, event, "onDblClickRow");
	}

	this.element.oncontextmenu = function() {
		fireClickRowEvent(this, event, "onRightClickRow"); // 触发右键事件
	}

    // 触发自定义事件
	function fireClickRowEvent(gridElement, event, firerName) {
		var _srcElement = event.srcElement;
		if( notOnGridHead(_srcElement) ) { // 确保点击处不在表头
			var trObj = _srcElement;
			if( trObj.tag != "TR" ) {
				trObj = trObj.parentElement;
			}

			if(trObj && trObj.getAttribute("_index") ) {
				var rowIndex = parseInt( trObj.getAttribute("_index") );
				var oEvent = createEventObject();
				oEvent.result = {
					rowIndex: rowIndex
				};

				gridElement.selectRowIndex = rowIndex;
				var eventFirer = new EventFirer(gridElement, firerName);
				eventFirer.fire(oEvent);  // 触发右键事件
			}	
		}		
	}
	
	// 确保点击处不在表头
	function notOnGridHead(srcElement) { 
		return !isContainTag(srcElement, "THEAD");
	}
	
	function isContainTag(obj, tag) {
        while( obj ) {
			if (obj.tagName == tag) {
				return true;
			}
            obj = obj.parentElement;
        }
		return false;
    }
}


/*
 *	初始化翻页工具条
 *	参数：	object:gridPageBar       工具条对象
			XmlNode:pageInfo        XmlNode实例
			function:callback       回调函数
 *	返回值：
 */
function initGridToolBar(gridPageBar, pageInfo, callback) {

	gridPageBar.init = function() {
		this.clear();
		this.create();
		this.attachEvents();
	}
		
	gridPageBar.clear = function() {
		this.innerHTML = ""; // 清空内容
	}
	
	//创建按钮
	gridPageBar.create = function() {
		var totalpages = gridPageBar.getTotalPages();
		var curPage = gridPageBar.getCurrentPage();

		var str = [];
		str[str.length] = "<span class=\"button refresh\" id=\"GridBtRefresh\" title=\"刷新\"></span>";
		str[str.length] = "<span class=\"button first\"   id=\"GridBtFirst\"   title=\"第一页\"></span>";
		str[str.length] = "<span class=\"button prev\"    id=\"GridBtPrev\"    title=\"上一页\"></span>";
		str[str.length] = "<span class=\"button next\"    id=\"GridBtNext\"    title=\"下一页\"></span>";
		str[str.length] = "<span class=\"button last\"    id=\"GridBtLast\"    title=\"最后一页\"></span>";
		
		str[str.length] = "<select id=\"GridPageList\">";
		for(var i=1; i <= totalpages; i++) {
			str[str.length] = "  <option value=\"" + i + "\"" + (curPage == i ? " selected" : "") + ">" + i + "</option>";
		}
		str[str.length] = "</select>";

		this.innerHTML = str.join("");
	}
	
	//绑定事件
	gridPageBar.attachEvents = function() {
		var gridBtRefreshObj = $$("GridBtRefresh");
		var gridBtFirstObj   = $$("GridBtFirst");
		var gridBtPrevObj    = $$("GridBtPrev");
		var gridBtNextObj    = $$("GridBtNext");
		var gridBtLastObj    = $$("GridBtLast");
		var gridPageListObj  = $$("GridPageList");

		Event.attachEvent(gridBtRefreshObj, "click", function() {
			var curPage = gridPageBar.getCurrentPage();
			gridPageBar.gotoPage(curPage);
		});
		Event.attachEvent(gridBtFirstObj, "click", function() {
			gridPageBar.gotoPage("1");
		});
		Event.attachEvent(gridBtLastObj, "click", function() {
			var lastpage = gridPageBar.getLastPage();
			gridPageBar.gotoPage(lastpage);
		});
		Event.attachEvent(gridBtNextObj, "click", function() {
			var curPage = gridPageBar.getCurrentPage();
			var lastpage = gridPageBar.getLastPage();
			var page = lastpage;
			if(curPage < lastpage) {
				page = curPage + 1;
			}
			gridPageBar.gotoPage(page);
		});
		Event.attachEvent(gridBtPrevObj, "click", function() {
			var curPage = gridPageBar.getCurrentPage();
			var page = 1;
			if(curPage > 1) {
				page = curPage - 1;
			}
			gridPageBar.gotoPage(page);
		});
		Event.attachEvent(gridPageListObj, "change", function() {
			gridPageBar.gotoPage(gridPageListObj.value);
		});
	}
	
	//获取当前页码
	gridPageBar.getCurrentPage = function() {
		var currentpage = pageInfo.getAttribute("currentpage");
		return currentpage ? parseInt(currentpage) : 1;
	}
	
	//获取最后一页页码
	gridPageBar.getLastPage = function() {
		var lastpage = this.getTotalPages();
		return lastpage ? parseInt(lastpage) : 1;
	}
	
	//获取总页码
	gridPageBar.getTotalPages = function() {
		var totalpages = pageInfo.getAttribute("totalpages");
		return totalpages ? parseInt(totalpages) : 1;
	}
	
	//转到指定页
	gridPageBar.gotoPage = function(page) {
		callback(page);
	}
	
	gridPageBar.init();
}

/* 显示Grid列表 */
function showGrid(serviceUrl, dataNodeName, editRowFuction, gridName, page, requestParam, pageBar) {
	pageBar  = pageBar || $$("gridToolBar");
	gridName = gridName || "grid";
	page     =  page || "1";

	var p = requestParam || new HttpRequestParams();
	p.url = serviceUrl + "/" + page;

	var request = new HttpRequest(p);
	request.onresult = function() {
		$G(gridName, this.getNodeValue(dataNodeName)); 
 
		var gotoPage = function(page) {
			request.paramObj.url = serviceUrl + "/" + page;
			request.onresult = function() {
				$G(gridName, this.getNodeValue(dataNodeName)); 
			}				
			request.send();
		}

		var pageInfoNode = this.getNodeValue(XML_PAGE_INFO);			
		initGridToolBar(pageBar, pageInfoNode, gotoPage);
		
		var gridElement = $$(gridName); 
		gridElement.onDblClickRow = function(eventObj) {
			editRowFuction();
		}
		gridElement.onRightClickRow = function() {
			gridElement.contextmenu.show(event.clientX, event.clientY);
		}   
		gridElement.onScrollToBottom = function () {			
			var currentPage = pageBar.getCurrentPage();
			if(pageBar.getTotalPages() <= currentPage) return;

			var nextPage = parseInt(currentPage) + 1; 
			request.paramObj.url = serviceUrl + "/" + nextPage;
			request.onresult = function() {
				$G(gridName).load(this.getNodeValue(dataNodeName), true);

				var pageInfoNode = this.getNodeValue(XML_PAGE_INFO);
				initGridToolBar(pageBar, pageInfoNode, gotoPage);
			}				
			request.send();
		}
	}
	request.send();
}


function bindSortHandler(table) {
	this.rows  = table.tBodies[0].rows;
	this.tags  = table.tHead.rows[0].cells;
	var defaultClass = [];
	for(var i=0; i < this.tags.length; i++) {
		defaultClass[i] = this.tags[i].className;
	}
	
	// 将数据行和列转换成二维数组
	this._2DArray = [];
	for(var i=0; i < this.rows.length; i++) {
		this._2DArray[i] = [];
		for(var j=0; j < this.tags.length; j++) {
			var cell = this.rows[i].cells[j];
			this._2DArray[i].push(cell.innerHTML);
		}
	}
	
	for(var i=0; i < this.tags.length; i++) {
		var tag = this.tags[i];
		var sortable = tag.getAttribute("sortable");
		if( sortable == "true") {
			tag._colIndex = i;
			Event.attachEvent(tag, "click", bind(tag, sortHandler));
		}		
	}

	var oThis = this;
	var direction = 1;
	function sortHandler() {
		for(var i=0; i < oThis.tags.length; i++) {
			oThis.tags[i].className = defaultClass[i];
		}

		if(direction == 1) {
			Element.removeClass(cell, "desc");
			Element.addClass(this, "asc");
		} else {
			Element.removeClass(cell, "asc");
			Element.addClass(this, "desc");			
		}
		sort(direction, this._colIndex);
		direction = direction * -1;

		function sort(direction, columnIndex) {
			this._2DArray.sort(function(a, b) {
				var x = killHTML( a[columnIndex] ).replace(/,/g, '');
				var y = killHTML( b[columnIndex] ).replace(/,/g, '');
				var compareValue;
				if( isNaN(x) ) {
					compareValue = x.localeCompare(y);
				}
				else {
					compareValue = Number(x) - Number(y);
				}
				return compareValue * direction;
			});

			// 设置排序列的样式
			for (var i = 0; i < this.rows.length; i++) {
				for (var j = 0; j < this.tags.length; j++) {
					var cell = this.rows[i].cells[j];
					Element.removeClass(cell, "sorting");
				}
				Element.addClass(this.rows[i].cells[columnIndex], "sorting");
			}

			// 将排序后的二维数组重新输出到对应的行和列中
			for (var i = 0; i < this.rows.length; i++) {
				for (var j = 0; j < this.tags.length; j++) {
					var cell = this.rows[i].cells[j];
					cell.innerHTML = this._2DArray[i][j];
				}
			}
		}
	}
}

// 删除选中Grid行
function delGridRow(url, gridName) {
	if( !confirm("您确定要删除该行记录吗？") ) return;
	
	var grid = $G(gridName || "grid");
	var userID = grid.getRowAttributeValue("id");
	if( userID ) {
		Ajax({
			url : url + userID,
			method : "DELETE",
			onsuccess : function() { 
				grid.deleteSelectedRow();
			}
		});	
	}
}