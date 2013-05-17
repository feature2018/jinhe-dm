
var GridCache = new Collection();

function $G(gridId, data) {
	var gridObj = GridCache.get(gridId);
	if( gridObj == null || data ) {
		gridObj = new Grid($(gridId), data);
	}
	
	return gridObj;
}


var scrollBarZoom = 20;
var scrollbarSize = 17;
var cellWidth = 100; //基本列宽
var cellHeight = 22; //数据行高

var Grid = function(element, data) {
	this.element = element;
 
	this._baseurl  = element.baseurl || "";
	this._iconPath = this._baseurl + "images/"
	
	this.element.innerHTML = "<div id='gridBox' style='position:absolute;left:0px;top:0px;width:100%;height:100%;z-index:1'></div>" + 
						     "<div id='scrollBox' style='position:absolute;left:0px;top:0px;width:1px;height:1px;z-index:2'></div>";
	this._gridBox   = $("gridBox");
	this._scrollBox = $("scrollBox");	
	
	this.load(data);	
	
	// 添加Grid事件处理
	this.attachEventHandler();	

	GridCache.add(element.id, this);
}

Grid.prototype.load = function(data) {
	if("object" != typeof(data) || data.nodeType != 1) {
		alert("传入的Grid数据有问题。")	
	} 
	
	this.gridDoc = new Grid_DOCUMENT(data.node);	
	if( this.gridDoc.xmlDom == null ) {
		return;
	}
 
	// 初始化各容器状态
	this._gridBox.innerHTML = "";
	
	this.xslDom = getXmlDOM();
	this.xslDom.resolveExternals = false;
	this.xslDom.load(this._baseurl + "grid.xsl");
	this.xslDom.selectSingleNode("/xsl:stylesheet/xsl:script").text = "\r\n var cellHeight=22; var gridId='" + this.element.id + "'; \r\n"; // 初始化XSL里的变量
	
	var gridTableHtml = this.gridDoc.transformXML(this.xslDom); // 利用XSL把XML解析成Html
	this._gridBox.innerHTML = "<nobr>" + gridTableHtml.replace(/<\/br>/gi, "") + "</nobr>";
	
	var rows = $("gridTable").childNodes[0].tBodies[0].rows;
	for(var i=0; i < rows.length; i++) {
		var curRow = rows[i]; // 表格行 TR
		attachHighlightRowEvent(curRow);
		
		var cells = curRow.childNodes;
		for(var j=0; j < cells.length; j++) {
			var cell = cells[j];
			var columnName = cell.getAttribute("name");
			if( columnName && columnName != "cellsequence"  && columnName != "cellheader")  {
				var value = curRow.getAttribute(columnName); // xsl解析后，各行的各个TD值统一记录在了TR上。
				curRow.removeAttribute(columnName);
				
				var nobrNodeInCell = cell.childNodes[0];  // nobr 节点
				var columnNode = this.gridDoc.columnsMap[columnName]; 
				if( columnNode ) {
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
		}	
	}
	
	// for (this.gridDoc.columnsMap)
	// var sortable = tHead.td.getAttribute("sortable");
}

function attachHighlightRowEvent(curRow) {
	// 鼠标经过行时高亮显示
	curRow.onmouseover = function() { 
		 this.oldClassName = this.className;
		 addClass(this, "rolloverRow");    // 鼠标经过时添加class为highlight的值			 
	}			
	curRow.onmouseout = function() { 
		this.className = this.oldClassName; // 鼠标离开时还原之前的class值
		this.removeAttribute("oldClassName");
	}
}

// 添加Grid事件处理
Grid.prototype.attachEventHandler = function() {
 
	this.element.onclick = function() { // 单击行
		if( notOnGridHead(event.srcElement) ) { // 确保点击处不在表头
			var _srcElement = event.srcElement;
			// clickTR(_srcElement);
			// clickTD(_srcElement);
		}
	}
	this.element.ondblclick = function() { // 双击行
		if( notOnGridHead(event.srcElement) ) { 
			var _srcElement = event.srcElement;
			// dbClickTR(_srcElement);
		}
	}

	this.element.oncontextmenu = function() {
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
 			
				var eventRightClickGridRow = new EventFirer(this, "onRightClickRow");
				eventRightClickGridRow.fire(oEvent);  // 触发右键事件
			}
		}
	}
	
	// 确保点击处不在表头
	function notOnGridHead(srcElement) { 
		return !isContainTag(srcElement, "gridBox", "THEAD");
	}
	
	// 确保点击处不在滚动条区域
	function notOnGridScollBar(srcElement) { 
		return  !isContainTag(srcElement, "_scrollBox", "DIV"); 
	}
	
	function isContainTag(obj, containerId, tag) {
        while( obj.id != containerId ) {
			if (obj.tagName == tag) {
				return true;
			}
            obj = obj.parentElement;
        }
		return false;
    }
}

//动态给js添加class属性
function addClass (element, className) {
	if( !element.className ) {
		element.className = className;    // 如果element本身不存在class,则直接添加class
	} else {
		element.className += " " +className;  // 如果之前有一个class值，注意中间要多一个空格,然后再加上
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
			this.Rows = this.selectNodes(".//data//row");
 
			this.RowByIndex = {};
			for(var i=0; i < this.Rows.length; i++) {
				var curRow = this.Rows[i];
				var _index = curRow.getAttribute("_index");
				this.RowByIndex[_index] = curRow;
			}
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