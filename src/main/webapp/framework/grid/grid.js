
var GridCache = new Collection();

function $G(gridId, data) {
	var grid = GridCache.get(gridId);
	if( grid == null || data ) {
		grid = new Grid($(gridId), data);
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
 
	this.baseurl  = element.baseurl || "";
	this.iconPath = this.baseurl + "images/"
	
	this.element.innerHTML = "<div id='" + this.id + "Box' style='position:absolute;overflow:auto;left:0px;top:0px;z-index:1'></div>";
	this.gridBox   = $(this.id + "Box");
	this.gridBox.style.height = this.windowHeight = element.height || "100%";
	this.gridBox.style.width  = this.windowWidth  = element.width  || "100%";

	this.pageSize = Math.floor(this.windowHeight / cellHeight);
	
	this.load(data);	

	// 添加Grid事件处理
	this.attachEventHandler();	

	GridCache.add(this.id, this);	
}


Grid.prototype.load = function(data, append) {
	if("object" != typeof(data) || data.nodeType != 1) {
		alert("传入的Grid数据有问题。")	
	} 
	
	this.gridDoc = new Grid_DOCUMENT(data.node);	
	if( this.gridDoc.xmlDom == null ) return;
 
	this.xslDom = getXmlDOM();
	this.xslDom.resolveExternals = false;
	this.xslDom.load(this.baseurl + "grid.xsl");

	// 初始化XSL里的变量
	var startNum = append ? this.totalRowsNum : 0;
	this.xslDom.selectSingleNode("/xsl:stylesheet/xsl:script").text = "\r\n" 
		+ "; var startNum=" + startNum + ";"
		+ "; var gridId='" + this.id + "'; \r\n"; 
		
	var gridTableHtml = this.gridDoc.transformXML(this.xslDom); // 利用XSL把XML解析成Html
	
	if(append) {
		var tempGridNode = document.createElement("div");
		tempGridNode.innerHTML = gridTableHtml.replace(/<\/br>/gi, "") ;
		var tempRows = tempGridNode.childNodes[0].tBodies[0].rows;
		for(var i=0; i < tempRows.length; i++) {
			var cloneRow = tempRows[i].cloneNode(true);
			this.tbody.appendChild(cloneRow);
		}

		tempGridNode.removeNode(true);
	}
	else {
		this.gridBox.innerHTML = ""; // 初始化容器
		this.gridBox.innerHTML = gridTableHtml.replace(/<\/br>/gi, "") ;
		
		// 拖动改变列宽
		Element.ruleObjList = []; // 先清空原来的拖动条
		var thList = this.gridBox.childNodes[0].tHead.firstChild.childNodes;
		for( var i = 0; i < thList.length; i++ ) {
			Element.attachColResize(thList[i]);
		}
		
		// 设置隐藏列事件，双击隐藏列
		var colList = this.gridBox.childNodes[0].childNodes[0].childNodes;
		for( var i = 0; i < colList.length; i++ ) {
			var th = thList[i];
			th.index = i;
			Event.attachEvent(th, "dblclick", function() {
				var srcElement = Event.getSrcElement(event);
				while(srcElement.tagName.toLowerCase() != "td") {
					srcElement = srcElement.parentNode;
				}
				colList[srcElement.index].style.display = "none";
			}) ;
		}		
	}
	
	this.tbody = this.tbody || this.gridBox.childNodes[0].tBodies[0];
	this.rows = this.tbody.rows;
	this.totalRowsNum = this.rows.length;
	for(var i=startNum; i < this.totalRowsNum; i++) {
		this.processDataRow(this.rows[i]); // 表格行TR
	}
	
	bindSortHandler(this.gridBox.childNodes[0]);
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
		var columnNode = this.gridDoc.columnsMap[columnName]; 
		if( columnName == null || columnName == "cellsequence" || columnName == "cellheader" || columnNode == null)  {
			continue;
		}
 
		var value = curRow.getAttribute(columnName); // xsl解析后，各行的各个TD值统一记录在了TR上。
		// curRow.removeAttribute(columnName);
		var nobrNodeInCell = cell.childNodes[0];  // nobr 节点
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
			case "function":                          
				break;    
			case "image":          
				nobrNodeInCell.innerHTML = "<img src='" + value + "'/>";
				break;    
			case "boolean":      
				var checked = (value =="true") ? "checked" : "";
				nobrNodeInCell.innerHTML = "<input class='selectHandle' name='" + columnName + "' type='radio' " + checked + "/>";
				nobrNodeInCell.all.tags("INPUT")[0].disabled = true;
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
				oThis.gridBox.scrollTop -= oThis._ageSize * cellHeight;
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


var Grid_DOCUMENT = function(xmlDom) {
	this.xmlDom = xmlDom;

	this.transformXML = function(xslDom) {			
		return this.xmlDom.transformNode(xslDom).replace(/&amp;nbsp;/g, "&nbsp;").replace(/\u00A0/g, "&amp;nbsp;");
	}
	
	this.refresh = function() {
		this.hasData = (this.xmlDom && this.xmlDom.xml != "");
		if( this.hasData ) {
			this.Declare = this.xmlDom.selectSingleNode("./declare");
			this.Script  = this.xmlDom.selectSingleNode("./script");
			this.Columns = this.xmlDom.selectNodes("./declare/column");
			this.Data    = this.xmlDom.selectSingleNode("./data");

			this.columnsMap = {};
			for(var i = 0; i < this.Columns.length; i++) {
				this.columnsMap[this.Columns[i].getAttribute("name")] = this.Columns[i];
			}
			
			this.header = this.Declare.getAttribute("header");
			this.hasHeader = (this.header == "radio" || this.header == "checkbox");
	 
			this.VisibleColumns = this.selectNodes(".//declare//column[(@display!='none') or not(@display)]");
			this.dataRows = this.selectNodes(".//data//row");
		}
	}

	this.refresh();
}
Grid_DOCUMENT.prototype.selectNodes = function(xpath) {
	return this.xmlDom.selectNodes(xpath);
}
Grid_DOCUMENT.prototype.selectSingleNode = function(xpath) {
	return this.xmlDom.selectSingleNode(xpath);
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
		for(var i=0; i <= totalpages; i++) {
			str[str.length] = "  <option value=\"" + i + "\"" + (curPage == i ? " selected" : "") + ">" + i + "</option>";
		}
		str[str.length] = "</select>";

		this.innerHTML = str.join("");
	}
	
	//绑定事件
	gridPageBar.attachEvents = function() {
		var gridBtRefreshObj = $("GridBtRefresh");
		var gridBtFirstObj   = $("GridBtFirst");
		var gridBtPrevObj    = $("GridBtPrev");
		var gridBtNextObj    = $("GridBtNext");
		var gridBtLastObj    = $("GridBtLast");
		var gridPageListObj  = $("GridPageList");

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


function bindSortHandler(table) {
	this.rows  = table.tBodies[0].rows;
	this.tags  = table.tHead.rows[0].cells;
	var defaultClass = this.tags[0].className;

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
			oThis.tags[i].className = defaultClass;
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