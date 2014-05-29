// 对已经生成的XForm实例进行缓存
var XFormCache = new Collection();

function $X(xformId, data) {
	var xform = XFormCache.get(xformId);

	if( xform == null && data == null ) {
		return null;
	}

	if( xform == null || data ) {
		xform = new XForm($$(xformId));
		xform.load(data);

		XFormCache.add(xformId, xform);	
	}
	
	return xform;
}

var XForm = function(element) {
	this.id = element.id;
	this.element = element;
	this.form = element.firstChild;

	this.editable  = element.getAttribute("editable") || "true";
	this._baseurl  = element.getAttribute("baseurl") || "";
	this._iconpath = this._baseurl + "images/";

	this.columnInstanceMap = {};
}

XForm.prototype.load = function(dataObj) {
	hideErrorInfo();

	if("object" != typeof(dataObj) || dataObj.nodeType != _XML_NODE_TYPE_ELEMENT) {
		alert("传入的XForm数据有问题，请检查。")
		return;
	}
	
	this.template = function(xmlDocument) {
		this.xmlDocument = xmlDocument;
	 
		if( this.xmlDocument ) {
			this.declare = this.xmlDocument.selectSingleNode("./declare");
			this.layout  = this.xmlDocument.selectSingleNode("./layout");
			this.script  = this.xmlDocument.selectSingleNode("./script");
			this.columns = this.xmlDocument.selectNodes("./declare/column");
			this.data    = this.xmlDocument.selectSingleNode("./data");
			
			if(this.data == null) {				
				this.data = new XmlNode(EMPTY_XML_DOM.createElement("data"));
				this.xmlDocument.appendChild(this.data);
			}
			
			this.dataRows = this.xmlDocument.selectSingleNode("./data/row");
			if(this.dataRows == null) {
				this.dataRows = new XmlNode(EMPTY_XML_DOM.createElement("row"));
				this.data.appendChild(this.dataRows);	
			}
			
			this.columnsMap = {};
			for(var i = 0; i < this.columns.length; i++) {
				var column = this.columns[i];
				this.columnsMap[column.getAttribute("name")] = column;
			}
		}

		return this;
	}(dataObj);
	
	if(this.template && this.template.xmlDocument) {
 		// 把XML解析成Html
		this.element.innerHTML = this.tempalte2HTML(); 

		// 绑定各个column对应的编辑方式
		this.attachEditor();
	
		// 绑定事件
		this.attachEvents();

		// 自动聚焦
		if(this.editable != "false") {
			this.setFocus();
		}		
	}
}

XForm.prototype.tempalte2HTML = function() {
	 var htmls = new Array();
	 var oThis = this;

	 htmls.push("<form class='xform' method='post'>");
	 htmls.push("<div class='contentBox'>");
	 htmls.push('<table>');

	 for(var name in this.template.columnsMap) {
		var column = this.template.columnsMap[name];
		var hidden = column.getAttribute("mode") == "hidden";
		if(hidden) {
			var value = this.getColumnValue(name);
			value = value ? "value=\"" + value + "\"" : "";
			htmls.push('<input type="hidden" ' + value + ' id="' + name + '"/>');
		}
	 }
	 htmls.push('<input type="hidden" name="xml" id="xml"/>');

	 var layoutTRs = this.template.layout.childNodes;
	 for(var i=0; i < layoutTRs.length; i++) {
		var trNode = layoutTRs[i];
		if(trNode.nodeType != _XML_NODE_TYPE_ELEMENT) {
			continue;
		}

		htmls.push("<tr>");

		var layoutTDs = trNode.childNodes;
		for(var j=0; j < layoutTDs.length; j++) {
			var tdNode = layoutTDs[j];
			if(tdNode.nodeType != _XML_NODE_TYPE_ELEMENT) { 
				continue;
			}

			htmls.push("<td "+ copyNodeAttribute(tdNode) +">");

			var childNodes = tdNode.childNodes;
			for(var n=0; n < childNodes.length; n++) {
				var childNode = childNodes[n];
				if(childNode.nodeType != _XML_NODE_TYPE_ELEMENT) {
					htmls.push(childNode.nodeValue);
					continue;
				}

				var nodeName = childNode.nodeName.toLowerCase();
				var binding = childNode.getAttribute("binding");

				var column = this.template.columnsMap[binding];
				if(column == null) {
					htmls.push(xml2String(childNode));
					continue;
				}

				var mode    = column.getAttribute("mode");
				var editor  = column.getAttribute("editor");
				var caption = column.getAttribute("caption");
				var value = this.getColumnValue(binding);
				var _value = (value ? " value=\"" + value + "\"" : " ");
				
				if(nodeName == "label" && binding && binding != "") {
					htmls.push("<label id='label_" + binding + "'>" + caption + "</label>");
				}
				else if(mode == "string" && editor == 'comboedit') {
					htmls.push("<select " + copyNodeAttribute(childNode) + copyColumnAttribute(column) + _value + "></select>");
				}
				else if(mode == "string" && nodeName == 'textarea') {
					htmls.push("<textarea " + copyNodeAttribute(childNode) + copyColumnAttribute(column) + ">" + (value ? value : "") + "</textarea>");
				}
				else if(mode == "string" || mode == "number" || mode == "function" || mode == "date") {
					htmls.push("<input " + copyNodeAttribute(childNode) + copyColumnAttribute(column) + _value + "></input>");
				}
			}
			htmls.push("</td>");
		}	
		htmls.push("</tr>");
	 }

	 htmls.push("</table>");
	 htmls.push("</div>");
	 htmls.push("</form>");
	 return htmls.join("");

	 // some private function define
	 function copyColumnAttribute(column) {
		var returnVal = " ";
		var attributes = column.attributes;
		for(var i = 0; i < attributes.length; i++) {
			var name  = attributes[i].nodeName;
			var value = attributes[i].nodeValue;
			if(value == null || value == "null") {
				continue;
			}

			if(name == "name") {
				name = "id";
			}
			if(name == "editable") {
				value = value || oThis.editable;
			}
			returnVal += name + " = '" + value + "' ";
		}
		return returnVal;
	 }

	 function copyNodeAttribute(node) {
		var returnVal = "";
		var hasBinding = node.getAttribute("binding") != null;
		var attributes = node.attributes;
		for(var i = 0; i < attributes.length; i++) {
			var attr = attributes[i];
			if(attr.nodeName != "style" || !hasBinding) {
				returnVal += attr.nodeName + "=\"" + attr.nodeValue + "\" ";
			}
			if(attr.nodeName == "style" && hasBinding) {
				returnVal += "style=\"" + attr.nodeValue + "\" ";
			}
		}
		return returnVal;
	 }
}


XForm.prototype.attachEvents = function() {
	this.element.onselectstart = function() {
		event.cancelBubble = true; // 拖动选择事件取消冒泡
	}

	if(this.form) {
		Event.attachEvent(this.form, "submit", this.checkForm);
	}
}

XForm.prototype.attachEditor = function() {
	var columnsMap = this.template.columnsMap;
	for(var colName in columnsMap) {
		var column = columnsMap[colName];

		// 取layout中绑定该column的元素，如果没有，则column无需展示。
		if($$(colName) == null) {
			continue;
		}

		var curInstance;
		var colMode   = column.getAttribute("mode");
		switch(colMode) {
			case "string":
				var colEditor = column.getAttribute("editor");
				if(colEditor == "comboedit") {
					curInstance = new Mode_ComboEdit(colName, this);
				}
				else {
					curInstance = new Mode_String(colName, this);
				}
				break;
			case "number":
				curInstance = new Mode_String(colName, this);
				break;
			case "date":
			case "function":
				curInstance = new Mode_Function(colName, this);
				break;
			case "hidden":
				curInstance = new Mode_Hidden(colName, this);
				break;
		}

		curInstance.saveAsDefaultValue();
		this.columnInstanceMap[colName] = curInstance;

		if(column.getAttribute('empty') == "false") {
			Element.insertHtml('afterEnd', $$(colName).nextSibling || $$(colName), "<span style='color:red;margin-left:3px;margin-right:5px;'>*</span>");
		}
	}

	this.setEditable();
}

XForm.prototype.checkForm = function() {
	hideErrorInfo();

	for(var colName in this.columnInstanceMap) {
		var curInstance = this.columnInstanceMap[colName];
		if( !curInstance.validate() ) {
			return false;
		}
	}

	$$("xml").value = this.template.data.xml;
	return true;
}

XForm.prototype.setEditable = function(status) {
	status = status || "true";
	this.element.editable = status;

	var buttonBox = $$("buttonBox");
	if(buttonBox) {
		buttonBox.style.display = (status == "true" ? "block": "none");
	}

	for(var colName in this.columnInstanceMap) {		
		 var _status = status;

		// 如果column上默认定义为不可编辑，则永远不可编辑
		if (this.getColumnAttribute(colName, "editable") == "false") {
			_status = "false";
		} 

		this.columnInstanceMap[colName].setEditable(_status);
	}

	this.setFocus();
}

XForm.prototype.setFocus = function(name) {
	if( name == null || name == "") {
		var column = this.template.declare.selectSingleNode("column[(@editable='true' or not(@editable)) and (@display!='none')]");
		if(column != null) {
			name = column.getAttribute("name");	
		}	
	}	

	var curInstance = this.columnInstanceMap[name];
	if( curInstance ) {
		curInstance.setFocus();
	}
}

XForm.prototype.setColumnEditable = function(name, value) {
	var curInstance = this.columnInstanceMap[name];
	if( curInstance ) {
		curInstance.setEditable(value);
	}
}

XForm.prototype.getData = function(name, replace) {
	var nodeValue = this.getColumnValue(name);
	if(replace == true) {
		nodeValue = nodeValue.replace(/\"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\'/g, "&#39;");
	}
	return nodeValue;
}

/* 获取row节点上与column对应的值 */
XForm.prototype.getColumnValue = function(name) {
	var rowNode = this.template.dataRows;
	var node = rowNode.selectSingleNode(name);
	if(node && node.text) {
		return node.text.convertEntry();
	}
	return null;
}

/*
 *  设置row节点上与column对应的值
 *  参数：  string:name             列名
			string/array:value      值
 */
XForm.prototype.setColumnValue = function(name, value) {
	var rowNode = this.template.dataRows;
	var node = rowNode.selectSingleNode(name);
	if( node == null ) { 
		node = new XmlNode(EMPTY_XML_DOM.createElement(name)); // 创建单值节点
		rowNode.appendChild(node);
	}

	var CDATANode = node.firstChild;
	if( CDATANode == null ) {
		CDATANode = EMPTY_XML_DOM.createCDATASection(value);
		node.appendChild(CDATANode);
	}
	else {
		CDATANode.text = value;
		if (CDATANode.textContent || CDATANode.textContent == "") {
			CDATANode.textContent = value; // chrome
		}
	}

	var eventOndatachange = new EventFirer(this.element, "ondatachange");
	var eventObj = createEventObject();
	eventObj.id = this.id + "_" + name;
	eventOndatachange.fire(eventObj);  // 触发事件
}

// 将界面数据更新到XForm模板的data/row/里
XForm.prototype.updateData = function(obj) {
	if(event.propertyName == "checked") {
		var newValue = obj.checked == true ? 1 : 0;
	}
	else if(obj.tagName.toLowerCase() == "select") {
		var newValue = obj._value;            
	}
	else {
		var newValue = obj.value;
	}

	var oldValue = this.getColumnValue(obj.id);
	if( isNullOrEmpty(newValue) && isNullOrEmpty(oldValue) ) {
		return;
	}
	if(newValue != oldValue) {
		this.setColumnValue(obj.id, newValue);
	}
}

// 将数据设置到界面输入框上显示，同时更新到data/row/里
XForm.prototype.updateDataExternal = function(name, value) {
	this.setColumnValue(name, value);
	
	// 更改页面显示数据
	var colInstance = this.columnInstanceMap[name];
	if(colInstance) {
		colInstance.setValue(value);
	}
}

XForm.prototype.showCustomErrorInfo = function(name, str) {
	var instance = this.columnInstanceMap[name];
	if( instance ) {
		showErrorInfo(str, instance.obj);
	}
}

XForm.prototype.getColumnAttribute = function(name, attrName) {
	var column = this.template.columnsMap[name];
	if( column ) {
		return column.getAttribute(attrName);
	}
	else {
		return alert("指定的列[" + name + "]不存在");
	}
}

XForm.prototype.getXmlDocument = function() {
	return this.template.xmlDocument;
}

XForm.prototype.xml = function() {
	return xmlDoc.toString();
}


// 普通文本输入框
var Mode_String = function(colName, xform) {
	this.obj = $$(colName);
	this.obj._value = this.obj.value; // 备份原值

	var oThis = this;
	this.obj.onblur = function() {
		// 判断input的类型
		if("text" == this.type) { 
			this.value = this.value.replace(/(^\s*)|(\s*$)/g, ""); // 去掉前后的空格
		}

		xform.updateData(this);
	};

	this.obj.onpropertychange = function() {
		if(window.event.propertyName == "value") {
			var maxLength = parseInt(this.getAttribute('maxLength'));

			// 超出长度则截掉，中文算作两个字符
			if(this.value.replace(/[^\u0000-\u00FF]/g, "**").length > maxLength) {
				restore(this, this.value.substringB(0, maxLength));
			}
			else{
				this._value = this.value;
			}
		}
	};
}

Mode_String.prototype = {
	setValue : function(value) {
		this.obj._value = this.obj.value = value;
	},

	validate: validate,
	
	setEditable : function(status) {
		this.obj.editable = status || this.obj.getAttribute("editable");

		var disabled = (this.obj.editable == "false");
		this.obj.className = (disabled ? "string_disabled" : "string");

		if(this.obj.tagName == "textarea") {
			this.obj.readOnly = disabled;  // textarea 禁止状态无法滚动显示所有内容，所以改为只读
		} else {
			this.obj.disabled = disabled;        
		}
	},

	saveAsDefaultValue : function() {
		this.obj.defaultValue = this.obj.value;
	},

	setFocus : setFocus
}


// 自定义方法输入值类型
var Mode_Function = function(colName, xform) {
	this.obj = $$(colName);
	this.obj._value = this.obj.value; // 备份原值
	this.isdate = (this.obj.getAttribute("mode").toLowerCase() == "date");
 
	if( !this.obj.disabled ) {
		if(this.isdate) {
			if(this.picker == null) {
				this.picker = new Pikaday( {
			        field: document.getElementById(this.obj.id),
			        firstDay: 1,
			        minDate: new Date('2000-01-01'),
			        maxDate: new Date('2020-12-31'),
			        yearRange: [2000,2020],
			        format: 'yyyy-MM-dd'
			    });
			}
		}
		else {
			// 添加点击按钮
			var icon = xform._iconpath + 'function.gif';
			var html = '<img src="' + icon + '" style="width:20px;height:18px;border:0px;position:relative;top:4px;left:-21px;"/>';
			Element.insertHtml('afterEnd', this.obj, html);
			
			var tempThis = this;

			var btObj = this.obj.nextSibling; // 动态添加进去的按钮
			btObj.onclick = excuteCMD;
		}
	}	

	function excuteCMD() {
		var cmd = tempThis.obj.getAttribute("cmd");
		try {
			eval(cmd);
		} catch(e) {
			showErrorInfo("运行自定义JavaScript代码<" + cmd + ">出错，异常信息：" + e.description, tempThis.obj);
			throw(e);
		}
	}

	this.obj.onblur = function() {
		xform.updateData(this);
	};
}
 
Mode_Function.prototype = {
	setValue : function(value) {
		this.obj._value = this.obj.value = value;
	},

	validate: validate,
	
	setEditable : function(status) {
		this.obj.disabled  = (status == "false");
		this.obj.className = (this.obj.disabled ? "function_disabled" : "function");

		// function图标
		if(!this.isdate) {
			this.obj.nextSibling.disabled  = this.obj.disabled;
			this.obj.nextSibling.className = (this.obj.disabled ? "bt_disabled" : "");
			this.obj.readOnly = true;
		}
		
		this.obj.editable = status;
	},

	saveAsDefaultValue : function() {
		this.obj.defaultValue = this.obj.value;
	},

	setFocus : setFocus
}


// 下拉选择框，单选或多选
var Mode_ComboEdit = function(colName, xform) {
	this.obj = $$(colName);
    this.multiple = this.obj.getAttribute("multiple") == "multiple";
	
	var valueNode = this.obj.attributes["value"];
 	this.obj._value = valueNode ? valueNode.nodeValue : "";

	var selectedValues = {};
	if(this.obj._value != "") {
		var valueArr = this.obj._value.split(",");
		for(var i=0; i < valueArr.length; i++) {
			selectedValues[ valueArr[i] ] = true;
		}
	}

	var valueList = this.obj.getAttribute("editorvalue").split('|');
	var textList  = this.obj.getAttribute("editortext").split('|');
	var selectedIndex = [];
	for(var i=0; i < valueList.length; i++) {
		var value = valueList[i];
		this.obj.options[i] = new Option(textList[i], value);
 
		if( selectedValues[value] ) {
			this.obj.options[i].selected = true;
			selectedIndex[selectedIndex.length] = i;
		}
	}
	if( selectedIndex.length > 0 ){
		this.obj.defaultSelectedIndex = selectedIndex.join(",");
	} 
	else {
		this.obj.defaultSelectedIndex = this.obj.selectedIndex = -1;
	}

	if(this.multiple && this.obj.getAttribute("height") == null) {
		this.obj.style.height = Math.min(Math.max(valueList.length, 4), 4) * 18 + "px";
	}	

	// 当empty = false(表示不允许为空)时，下拉列表的默认值自动取第一项值
	if( this.obj._value == "" &&  this.obj.getAttribute('empty') == "false") {
		this.setValue(valueList[0]);
	}
	
	this.obj.onchange = function() {
		var x = [];
		for(var i=0; i < this.options.length; i++) {
			var option = this.options[i];
			if(option.selected) {
				x[x.length] = option.value;
			}
		}
		this._value = x.join(",");
		xform.updateData(this);

		var onchangeFunc = this.getAttribute("onchange");
		if(onchangeFunc) {
			eval(onchangeFunc + "('" + this._value + "')");
		}
	}
}

Mode_ComboEdit.prototype.setValue = function(value) {
	var valueList = {};
	var valueArray = value.split(",");
	for(var i = 0; i < valueArray.length; i++){
		valueList[valueArray[i]] = true;
	}

	var noSelected = true;
	for(var i=0; i < this.obj.options.length; i++){
		var opt = this.obj.options[i];
		if(valueList[opt.value]) {
			opt.selected = true;
			noSelected = false;
		}
	}

	if(noSelected){
		this.obj.selectedIndex = -1;	
	}
}

Mode_ComboEdit.prototype.setEditable = function(status) {
	this.obj.disabled  = (status == "true" ? false : true);
	this.obj.className = (status == "true" ? "comboedit" : "comboedit_disabled");
	this.obj.editable  = status;
}

Mode_ComboEdit.prototype.validate = validate;

Mode_ComboEdit.prototype.saveAsDefaultValue = function() {
	var selectedIndex = [];
	for(var i=0; i < this.obj.options.length; i++){
		var opt = this.obj.options[i];
		if(opt.selected) {
			selectedIndex[selectedIndex.length] = i;
		}
	}
	this.obj.defaultSelectedIndex = selectedIndex.join(",");
}

Mode_ComboEdit.prototype.setFocus = setFocus;


function Mode_Hidden(colName, xform) {
	this.obj = $$(colName);
}
Mode_Hidden.prototype.setValue = function(s) {}
Mode_Hidden.prototype.setEditable = function(s) {}
Mode_Hidden.prototype.validate = function() { return true; }
Mode_Hidden.prototype.saveAsDefaultValue = function() {}
Mode_Hidden.prototype.setFocus = function() {}


function setFocus() {
	try {
		this.obj.focus();
	} catch(e) {
	}
}

function validate() {
	var empty     = this.obj.getAttribute("empty");
	var errorInfo = this.obj.getAttribute("errorInfo");
	var caption   = this.obj.getAttribute("caption").replace(/\s/g, "");
	var inputReg  = this.obj.getAttribute("inputReg");
	
	var value = this.obj.value;
	if(value == "" && empty == "false") {
		errorInfo = "[" + caption.replace(/\s/g, "") + "] 不允许为空。";
	}

	if(inputReg && !eval(inputReg).test(value)) {
		errorInfo = errorInfo || "[" + caption + "] 格式不正确，请更正.";
	}

	if( errorInfo ) {
		showErrorInfo(errorInfo, this.obj);

		if(this.isInstance != false) {
			if(this.setFocus) {
				this.setFocus();
			}
		}
		if( event ) {
			preventDefault(event);
		}
		return false;
	}

	return true;
}

function showErrorInfo(errorInfo, obj) {
	clearTimeout(200);
	
	setTimeout(function() {
		// 页面全局Balllon对象
		if( window.Balloons ) {
			var balloon = Balloons.create(errorInfo);
			balloon.dockTo(obj);
		}
	}, 100);
}

// 隐藏上次的错误信息层（即错误提示气泡）
function hideErrorInfo() {
	if( window.Balloons ) {
		Balloons.dispose();
	}
}

function restore(obj, value) {    
	var tempEvent = obj.onpropertychange;
	if( tempEvent == null ) {
		clearTimeout(obj.timeout);
		tempEvent = obj._onpropertychange;
	}
	else {
		obj._onpropertychange = tempEvent;
	}

	obj.onpropertychange = null;
	obj.timeout = setTimeout(function() {
		obj.value = value;
		obj.onpropertychange = tempEvent;
	}, 10);
}

function xformExtractData(xformNode, needPrefix) {
	if( xformNode ) {
		var dataNode = xformNode.selectSingleNode(".//data");

		var prefix = null;
		if(needPrefix) {
			prefix = xformNode.selectSingleNode("./declare").getAttribute("prefix");
		}
		
		return dataNode2Map(dataNode, prefix);
	}
	return null;
}

function dataNode2Map(dataNode, prefix) {
	var map = {};
	if(dataNode && dataNode.nodeName == "data") {
		var rename = dataNode.getAttribute("name");
		var nodes = dataNode.selectNodes("./row/*");
		for(var i = 0; i < nodes.length; i++) {
			var name = rename || nodes[i].nodeName; // 从data节点上获取保存名，如果没有则用原名
			
			// 前缀，xform declare节点上设置，以便于把值设置到action的bean对象里
			if( prefix ) {
				name = prefix + "." + name;
			}

			map[name] = nodes[i].text;
		}
	}
	return map;
}


/* -------------------------------------------- 日期控件 -----------------------------------------------------*/

(function (root, factory)
{
    root.Pikaday = factory(root.moment);

}(this, function (moment)
{
    'use strict';

    /**
     * feature detection and helper functions
     */

    var hasEventListeners = !!window.addEventListener,

    document = window.document,

    sto = window.setTimeout,

    addEvent = function(el, e, callback, capture)
    {
        if (hasEventListeners) {
            el.addEventListener(e, callback, !!capture);
        } else {
            el.attachEvent('on' + e, callback);
        }
    },

    removeEvent = function(el, e, callback, capture)
    {
        if (hasEventListeners) {
            el.removeEventListener(e, callback, !!capture);
        } else {
            el.detachEvent('on' + e, callback);
        }
    },

    fireEvent = function(el, eventName, data)
    {
        var ev;

        if (document.createEvent) {
            ev = document.createEvent('HTMLEvents');
            ev.initEvent(eventName, true, false);
            ev = extend(ev, data);
            el.dispatchEvent(ev);
        } else if (document.createEventObject) {
            ev = document.createEventObject();
            ev = extend(ev, data);
            el.fireEvent('on' + eventName, ev);
        }
    },

    trim = function(str)
    {
        return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g,'');
    },

    hasClass = function(el, cn)
    {
        return (' ' + el.className + ' ').indexOf(' ' + cn + ' ') !== -1;
    },

    addClass = function(el, cn)
    {
        if (!hasClass(el, cn)) {
            el.className = (el.className === '') ? cn : el.className + ' ' + cn;
        }
    },

    removeClass = function(el, cn)
    {
        el.className = trim((' ' + el.className + ' ').replace(' ' + cn + ' ', ' '));
    },

    isArray = function(obj)
    {
        return (/Array/).test(Object.prototype.toString.call(obj));
    },

    isDate = function(obj)
    {
        return (/Date/).test(Object.prototype.toString.call(obj)) && !isNaN(obj.getTime());
    },

    isLeapYear = function(year)
    {
        // solution by Matti Virkkunen: http://stackoverflow.com/a/4881951
        return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
    },

    getDaysInMonth = function(year, month)
    {
        return [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
    },

    setToStartOfDay = function(date)
    {
        if (isDate(date)) date.setHours(0,0,0,0);
    },

    compareDates = function(a,b)
    {
        // weak date comparison (use setToStartOfDay(date) to ensure correct result)
        return a.getTime() === b.getTime();
    },

    extend = function(to, from, overwrite)
    {
        var prop, hasProp;
        for (prop in from) {
            hasProp = to[prop] !== undefined;
            if (hasProp && typeof from[prop] === 'object' && from[prop].nodeName === undefined) {
                if (isDate(from[prop])) {
                    if (overwrite) {
                        to[prop] = new Date(from[prop].getTime());
                    }
                }
                else if (isArray(from[prop])) {
                    if (overwrite) {
                        to[prop] = from[prop].slice(0);
                    }
                } else {
                    to[prop] = extend({}, from[prop], overwrite);
                }
            } else if (overwrite || !hasProp) {
                to[prop] = from[prop];
            }
        }
        return to;
    },


    /**
     * defaults and localisation
     */
    defaults = {

        // bind the picker to a form field
        field: null,

        // automatically show/hide the picker on `field` focus (default `true` if `field` is set)
        bound: undefined,

        // position of the datepicker, relative to the field (default to bottom & left)
        // ('bottom' & 'left' keywords are not used, 'top' & 'right' are modifier on the bottom/left position)
        position: 'bottom left',

        // the default output format for `.toString()` and `field` value
        format: 'YYYY-MM-DD',

        // the initial date to view when first opened
        defaultDate: null,

        // make the `defaultDate` the initial selected value
        setDefaultDate: false,

        // first day of week (0: Sunday, 1: Monday etc)
        firstDay: 0,

        // the minimum/earliest date that can be selected
        minDate: null,
        // the maximum/latest date that can be selected
        maxDate: null,

        // number of years either side, or array of upper/lower range
        yearRange: 10,

        // used internally (don't config outside)
        minYear: 0,
        maxYear: 9999,
        minMonth: undefined,
        maxMonth: undefined,

        isRTL: false,

        // Additional text to append to the year in the calendar title
        yearSuffix: '',

        // Render the month after year in the calendar title
        showMonthAfterYear: false,

        // how many months are visible (not implemented yet)
        numberOfMonths: 1,

        // internationalization
        i18n: {
            previousMonth : 'Previous Month',
            nextMonth     : 'Next Month',
            months        : ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
            weekdays      : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
            weekdaysShort : ['周日','周一','周二','周三','周四','周五','周六']
        },

        // callback function
        onSelect: null,
        onOpen: null,
        onClose: null,
        onDraw: null
    },


    /**
     * templating functions to abstract HTML rendering
     */
    renderDayName = function(opts, day, abbr)
    {
        day += opts.firstDay;
        while (day >= 7) {
            day -= 7;
        }
        return abbr ? opts.i18n.weekdaysShort[day] : opts.i18n.weekdays[day];
    },

    renderDay = function(i, isSelected, isToday, isDisabled, isEmpty)
    {
        if (isEmpty) {
            return '<td class="is-empty"></td>';
        }
        var arr = [];
        if (isDisabled) {
            arr.push('is-disabled');
        }
        if (isToday) {
            arr.push('is-today');
        }
        if (isSelected) {
            arr.push('is-selected');
        }
        return '<td data-day="' + i + '" class="' + arr.join(' ') + '"><button class="pika-button" type="button">' + i + '</button>' + '</td>';
    },

    renderRow = function(days, isRTL)
    {
        return '<tr>' + (isRTL ? days.reverse() : days).join('') + '</tr>';
    },

    renderBody = function(rows)
    {
        return '<tbody>' + rows.join('') + '</tbody>';
    },

    renderHead = function(opts)
    {
        var i, arr = [];
        for (i = 0; i < 7; i++) {
            arr.push('<th scope="col"><abbr title="' + renderDayName(opts, i) + '">' + renderDayName(opts, i, true) + '</abbr></th>');
        }
        return '<thead>' + (opts.isRTL ? arr.reverse() : arr).join('') + '</thead>';
    },

    renderTitle = function(instance)
    {
        var i, j, arr,
            opts = instance._o,
            month = instance._m,
            year  = instance._y,
            isMinYear = year === opts.minYear,
            isMaxYear = year === opts.maxYear,
            html = '<div class="pika-title">',
            monthHtml,
            yearHtml,
            prev = true,
            next = true;

        for (arr = [], i = 0; i < 12; i++) {
            arr.push('<option value="' + i + '"' +
                (i === month ? ' selected': '') +
                ((isMinYear && i < opts.minMonth) || (isMaxYear && i > opts.maxMonth) ? 'disabled' : '') + '>' +
                opts.i18n.months[i] + '</option>');
        }
        monthHtml = '<div class="pika-label">' + opts.i18n.months[month] + '<select class="pika-select pika-select-month">' + arr.join('') + '</select></div>';

        if (isArray(opts.yearRange)) {
            i = opts.yearRange[0];
            j = opts.yearRange[1] + 1;
        } else {
            i = year - opts.yearRange;
            j = 1 + year + opts.yearRange;
        }

        for (arr = []; i < j && i <= opts.maxYear; i++) {
            if (i >= opts.minYear) {
                arr.push('<option value="' + i + '"' + (i === year ? ' selected': '') + '>' + (i) + '</option>');
            }
        }
        yearHtml = '<div class="pika-label">' + year + opts.yearSuffix + '<select class="pika-select pika-select-year">' + arr.join('') + '</select></div>';

        if (opts.showMonthAfterYear) {
            html += yearHtml + monthHtml;
        } else {
            html += monthHtml + yearHtml;
        }

        if (isMinYear && (month === 0 || opts.minMonth >= month)) {
            prev = false;
        }

        if (isMaxYear && (month === 11 || opts.maxMonth <= month)) {
            next = false;
        }

        html += '<button class="pika-prev' + (prev ? '' : ' is-disabled') + '" type="button">' + opts.i18n.previousMonth + '</button>';
        html += '<button class="pika-next' + (next ? '' : ' is-disabled') + '" type="button">' + opts.i18n.nextMonth + '</button>';

        return html += '</div>';
    },

    renderTable = function(opts, data)
    {
        return '<table cellpadding="0" cellspacing="0" class="pika-table">' + renderHead(opts) + renderBody(data) + '</table>';
    },


    /**
     * Pikaday constructor
     */
    Pikaday = function(options)
    {
        var self = this,
            opts = self.config(options);

        self._onMouseDown = function(e)
        {
            if (!self._v) {
                return;
            }
            e = e || window.event;
            var target = e.target || e.srcElement;
            if (!target) {
                return;
            }

            if (!hasClass(target, 'is-disabled')) {
                if (hasClass(target, 'pika-button') && !hasClass(target, 'is-empty')) {
                    self.setDate(new Date(self._y, self._m, parseInt(target.innerHTML, 10)));
                    if (opts.bound) {
                        sto(function() {
                            self.hide();
                        }, 100);
                    }
                    return;
                }
                else if (hasClass(target, 'pika-prev')) {
                    self.prevMonth();
                }
                else if (hasClass(target, 'pika-next')) {
                    self.nextMonth();
                }
            }
            if (!hasClass(target, 'pika-select')) {
                if (e.preventDefault) {
                    e.preventDefault();
                } else {
                    e.returnValue = false;
                    return false;
                }
            } else {
                self._c = true;
            }
        };

        self._onChange = function(e)
        {
            e = e || window.event;
            var target = e.target || e.srcElement;
            if (!target) {
                return;
            }
            if (hasClass(target, 'pika-select-month')) {
                self.gotoMonth(target.value);
            }
            else if (hasClass(target, 'pika-select-year')) {
                self.gotoYear(target.value);
            }
        };

        self._onInputChange = function(e)
        {
            var date;

            if (e.firedBy === self) {
                return;
            }
            else {
                date = new Date(Date.parse(opts.field.value));
            }
            self.setDate(isDate(date) ? date : null);
            if (!self._v) {
                self.show();
            }
        };

        self._onInputFocus = function()
        {
            self.show();
        };

        self._onInputClick = function()
        {
            self.show();
        };

        self._onInputBlur = function()
        {
            if (!self._c) {
                self._b = sto(function() {
                    self.hide();
                }, 50);
            }
            self._c = false;
        };

        self._onClick = function(e)
        {
            e = e || window.event;
            var target = e.target || e.srcElement,
                pEl = target;
            if (!target) {
                return;
            }
            if (!hasEventListeners && hasClass(target, 'pika-select')) {
                if (!target.onchange) {
                    target.setAttribute('onchange', 'return;');
                    addEvent(target, 'change', self._onChange);
                }
            }
            do {
                if (hasClass(pEl, 'pika-single')) {
                    return;
                }
            }
            while ((pEl = pEl.parentNode));
            if (self._v && target !== opts.trigger) {
                self.hide();
            }
        };

        self.el = document.createElement('div');
        self.el.className = 'pika-single' + (opts.isRTL ? ' is-rtl' : '');

        addEvent(self.el, 'mousedown', self._onMouseDown, true);
        addEvent(self.el, 'change', self._onChange);

        if (opts.field) {
            if (opts.bound) {
                document.body.appendChild(self.el);
            } else {
                opts.field.parentNode.insertBefore(self.el, opts.field.nextSibling);
            }
            addEvent(opts.field, 'change', self._onInputChange);

            if (!opts.defaultDate) {
                opts.defaultDate = new Date(Date.parse(opts.field.value));
                opts.setDefaultDate = true;
            }
        }

        var defDate = opts.defaultDate;

        if (isDate(defDate)) {
            if (opts.setDefaultDate) {
                self.setDate(defDate, true);
            } else {
                self.gotoDate(defDate);
            }
        } else {
            self.gotoDate(new Date());
        }

        if (opts.bound) {
            this.hide();
            self.el.className += ' is-bound';
            addEvent(opts.trigger, 'click', self._onInputClick);
            addEvent(opts.trigger, 'focus', self._onInputFocus);
            addEvent(opts.trigger, 'blur', self._onInputBlur);
        } else {
            this.show();
        }

    };


    /**
     * public Pikaday API
     */
    Pikaday.prototype = {


        /**
         * configure functionality
         */
        config: function(options)
        {
            if (!this._o) {
                this._o = extend({}, defaults, true);
            }

            var opts = extend(this._o, options, true);

            opts.isRTL = !!opts.isRTL;

            opts.field = (opts.field && opts.field.nodeName) ? opts.field : null;

            opts.bound = !!(opts.bound !== undefined ? opts.field && opts.bound : opts.field);

            opts.trigger = (opts.trigger && opts.trigger.nodeName) ? opts.trigger : opts.field;

            var nom = parseInt(opts.numberOfMonths, 10) || 1;
            opts.numberOfMonths = nom > 4 ? 4 : nom;

            if (!isDate(opts.minDate)) {
                opts.minDate = false;
            }
            if (!isDate(opts.maxDate)) {
                opts.maxDate = false;
            }
            if ((opts.minDate && opts.maxDate) && opts.maxDate < opts.minDate) {
                opts.maxDate = opts.minDate = false;
            }
            if (opts.minDate) {
                setToStartOfDay(opts.minDate);
                opts.minYear  = opts.minDate.getFullYear();
                opts.minMonth = opts.minDate.getMonth();
            }
            if (opts.maxDate) {
                setToStartOfDay(opts.maxDate);
                opts.maxYear  = opts.maxDate.getFullYear();
                opts.maxMonth = opts.maxDate.getMonth();
            }

            if (isArray(opts.yearRange)) {
                var fallback = new Date().getFullYear() - 10;
                opts.yearRange[0] = parseInt(opts.yearRange[0], 10) || fallback;
                opts.yearRange[1] = parseInt(opts.yearRange[1], 10) || fallback;
            } else {
                opts.yearRange = Math.abs(parseInt(opts.yearRange, 10)) || defaults.yearRange;
                if (opts.yearRange > 100) {
                    opts.yearRange = 100;
                }
            }

            return opts;
        },

        /**
         * return a formatted string of the current selection 
         */
        toString: function(format)
        {
        	format = format || this._o.format;
            return !isDate(this._d) ? '' : this._d.format(format);
        },

        /**
         * return a Date object of the current selection
         */
        getDate: function()
        {
            return isDate(this._d) ? new Date(this._d.getTime()) : null;
        },

        /**
         * set the current selection
         */
        setDate: function(date, preventOnSelect)
        {
            if (!date) {
                this._d = null;
                return this.draw();
            }
            if (typeof date === 'string') {
                date = new Date(Date.parse(date));
            }
            if (!isDate(date)) {
                return;
            }

            var min = this._o.minDate,
                max = this._o.maxDate;

            if (isDate(min) && date < min) {
                date = min;
            } else if (isDate(max) && date > max) {
                date = max;
            }

            this._d = new Date(date.getTime());
            setToStartOfDay(this._d);
            this.gotoDate(this._d);

            if (this._o.field) {
                this._o.field.value = this.toString();
                fireEvent(this._o.field, 'change', { firedBy: this });
            }
            if (!preventOnSelect && typeof this._o.onSelect === 'function') {
                this._o.onSelect.call(this, this.getDate());
            }
        },

        /**
         * change view to a specific date
         */
        gotoDate: function(date)
        {
            if (!isDate(date)) {
                return;
            }
            this._y = date.getFullYear();
            this._m = date.getMonth();
            this.draw();
        },

        gotoToday: function()
        {
            this.gotoDate(new Date());
        },

        /**
         * change view to a specific month (zero-index, e.g. 0: January)
         */
        gotoMonth: function(month)
        {
            if (!isNaN( (month = parseInt(month, 10)) )) {
                this._m = month < 0 ? 0 : month > 11 ? 11 : month;
                this.draw();
            }
        },

        nextMonth: function()
        {
            if (++this._m > 11) {
                this._m = 0;
                this._y++;
            }
            this.draw();
        },

        prevMonth: function()
        {
            if (--this._m < 0) {
                this._m = 11;
                this._y--;
            }
            this.draw();
        },

        /**
         * change view to a specific full year (e.g. "2012")
         */
        gotoYear: function(year)
        {
            if (!isNaN(year)) {
                this._y = parseInt(year, 10);
                this.draw();
            }
        },

        /**
         * change the minDate
         */
        setMinDate: function(value)
        {
            this._o.minDate = value;
        },

        /**
         * change the maxDate
         */
        setMaxDate: function(value)
        {
            this._o.maxDate = value;
        },

        /**
         * refresh the HTML
         */
        draw: function(force)
        {
            if (!this._v && !force) {
                return;
            }
            var opts = this._o,
                minYear = opts.minYear,
                maxYear = opts.maxYear,
                minMonth = opts.minMonth,
                maxMonth = opts.maxMonth;

            if (this._y <= minYear) {
                this._y = minYear;
                if (!isNaN(minMonth) && this._m < minMonth) {
                    this._m = minMonth;
                }
            }
            if (this._y >= maxYear) {
                this._y = maxYear;
                if (!isNaN(maxMonth) && this._m > maxMonth) {
                    this._m = maxMonth;
                }
            }

            this.el.innerHTML = renderTitle(this) + this.render(this._y, this._m);

            if (opts.bound) {
                this.adjustPosition();
                if(opts.field.type !== 'hidden') {
                    sto(function() {
                        opts.trigger.focus();
                    }, 1);
                }
            }

            if (typeof this._o.onDraw === 'function') {
                var self = this;
                sto(function() {
                    self._o.onDraw.call(self);
                }, 0);
            }
        },

        adjustPosition: function()
        {
            var field = this._o.trigger, pEl = field,
            width = this.el.offsetWidth, height = this.el.offsetHeight,
            viewportWidth = window.innerWidth || document.documentElement.clientWidth,
            viewportHeight = window.innerHeight || document.documentElement.clientHeight,
            scrollTop = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop,
            left, top, clientRect;

            if (typeof field.getBoundingClientRect === 'function') {
                clientRect = field.getBoundingClientRect();
                left = clientRect.left + window.pageXOffset;
                top = clientRect.bottom + window.pageYOffset;
            } else {
                left = pEl.offsetLeft;
                top  = pEl.offsetTop + pEl.offsetHeight;
                while((pEl = pEl.offsetParent)) {
                    left += pEl.offsetLeft;
                    top  += pEl.offsetTop;
                }
            }

            // default position is bottom & left
            if (left + width > viewportWidth ||
                (
                    this._o.position.indexOf('right') > -1 &&
                    left - width + field.offsetWidth > 0
                )
            ) {
                left = left - width + field.offsetWidth;
            }
            if (top + height > viewportHeight + scrollTop ||
                (
                    this._o.position.indexOf('top') > -1 &&
                    top - height - field.offsetHeight > 0
                )
            ) {
                top = top - height - field.offsetHeight;
            }
            this.el.style.cssText = [
                'position: absolute',
                'left: ' + left + 'px',
                'top: ' + top + 'px'
            ].join(';');
        },

        /**
         * render HTML for a particular month
         */
        render: function(year, month)
        {
            var opts   = this._o,
                now    = new Date(),
                days   = getDaysInMonth(year, month),
                before = new Date(year, month, 1).getDay(),
                data   = [],
                row    = [];
            setToStartOfDay(now);
            if (opts.firstDay > 0) {
                before -= opts.firstDay;
                if (before < 0) {
                    before += 7;
                }
            }
            var cells = days + before,
                after = cells;
            while(after > 7) {
                after -= 7;
            }
            cells += 7 - after;
            for (var i = 0, r = 0; i < cells; i++)
            {
                var day = new Date(year, month, 1 + (i - before)),
                    isDisabled = (opts.minDate && day < opts.minDate) || (opts.maxDate && day > opts.maxDate),
                    isSelected = isDate(this._d) ? compareDates(day, this._d) : false,
                    isToday = compareDates(day, now),
                    isEmpty = i < before || i >= (days + before);

                row.push(renderDay(1 + (i - before), isSelected, isToday, isDisabled, isEmpty));

                if (++r === 7) {
                    data.push(renderRow(row, opts.isRTL));
                    row = [];
                    r = 0;
                }
            }
            return renderTable(opts, data);
        },

        isVisible: function()
        {
            return this._v;
        },

        show: function()
        {
            if (!this._v) {
                if (this._o.bound) {
                    addEvent(document, 'click', this._onClick);
                }
                removeClass(this.el, 'is-hidden');
                this._v = true;
                this.draw();
                if (typeof this._o.onOpen === 'function') {
                    this._o.onOpen.call(this);
                }
            }
        },

        hide: function()
        {
            var v = this._v;
            if (v !== false) {
                if (this._o.bound) {
                    removeEvent(document, 'click', this._onClick);
                }
                this.el.style.cssText = '';
                addClass(this.el, 'is-hidden');
                this._v = false;
                if (v !== undefined && typeof this._o.onClose === 'function') {
                    this._o.onClose.call(this);
                }
            }
        },

        /**
         * GAME OVER
         */
        destroy: function()
        {
            this.hide();
            removeEvent(this.el, 'mousedown', this._onMouseDown, true);
            removeEvent(this.el, 'change', this._onChange);
            if (this._o.field) {
                removeEvent(this._o.field, 'change', this._onInputChange);
                if (this._o.bound) {
                    removeEvent(this._o.trigger, 'click', this._onInputClick);
                    removeEvent(this._o.trigger, 'focus', this._onInputFocus);
                    removeEvent(this._o.trigger, 'blur', this._onInputBlur);
                }
            }
            if (this.el.parentNode) {
                this.el.parentNode.removeChild(this.el);
            }
        }

    };

    return Pikaday;

}));