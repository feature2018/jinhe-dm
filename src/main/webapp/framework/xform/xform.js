var XFormCache = new Collection();

function $X(xformId, data) {
	var xform = XFormCache.get(xformId);
	if( xform == null || data ) {
		xform = new XForm($(xformId));
		xform.load(data);

		XFormCache.add(xform.element.id, xform);	
	}
	
	return xform;
}

var XForm = function(element) {
	this.id = element.id;
	this.element = element;
	this.form = element.firstChild;

	this.xmlDom = getXmlDOM();
	this.xslDom = getXmlDOM();
	this.xslDom.resolveExternals = false;

	this.xmlDoc;
	
	this._baseurl  = element.baseurl || "";
	this._iconPath = this._baseurl + "images/"

	this._columnList = {};
}

XForm.prototype.load = function(data) {
	// 隐藏上次的错误信息层
	hideErrorInfo();

	if("object" != typeof(data) || 1 != data.nodeType) {
		alert("传入的XForm数据有问题。")	
	}
	
	this.xmlDoc = new Class_XMLDocument(data.node);
	
	if(this.xmlDoc && this.xmlDoc.xmlDom) {
		// 修正comboedit类型默认第一项的值
		this.fixComboeditDefaultValue(this.xmlDoc.Row);

		this.xslDom.load(this._baseurl + "xform.xsl");
		this.xslDom.selectSingleNode("/xsl:stylesheet/xsl:script").text = "\r\nvar uniqueID=\"" + this.element.uniqueID 
		+ "\";\r\nvar baseurl=\"" + this._baseurl + "\";\r\nvar formEditable=\"" + this.element.editable + "\";\r\n";
		
		var htmlStr = this.xmlDoc.transformXML(this.xslDom); // 利用XSL把XML解析成Html
		this.element.innerHTML = htmlStr.replace(/<\/br>/gi, "");

		if(this.form) {
			this.form.attachEvent('onsubmit', this.checkForm);
			this.form.attachEvent('onreset', this.resetForm);

			// 添加标题栏				
			var theTable = this.form.all.tags("TABLE")[0];
			if(theTable && this.element.getAttribute("caption")) {
				var count = theTable.rows(0).cells.length;
				for(var i = 0; i < theTable.rows(0).cells.length; i++) {
					count += parseInt(theTable.rows(0).cells(i).colSpan);
				}
				var captionTR = theTable.insertRow(0);
				var captionTD = captionTR.insertCell();
				captionTD.colSpan = count;
				captionTD.id = "titleBox";
				captionTD.className = "titleBox";
				captionTD.style.cssText = "font-size:12px;height:19px;background-image:url(" + this._iconPath + "titlebg.gif);background-repeat:no-repeat;";
				captionTD.innerHTML = this.element.getAttribute("caption");
			}
		}

		// 绑定各个column对应的编辑方式
		this.attachEditor();
	
		// 触发onload事件
		var onload = this.element.getAttribute("onload");
		if(onload) {
			eval(onload);
		}

		// 自动聚焦
		if(this.element.editable != "false") {
			this.setFocus();
		}		
	}
}


XForm.prototype.attachEvents = function() {
	// 回车自动聚焦下一个（input、button等）
	this.element.onkeydown = function() {
		var srcElement = event.srcElement;
		if(window.event.keyCode == 13 && srcElement.tagName.toLowerCase() != "textarea") {
			window.event.keyCode = 9;  // 相当于按了下Tab键，光标移动到下一个元素上
		}
	}
	
	this.element.onselectstart = function() {
		event.cancelBubble = true; // 拖动选择事件取消冒泡
	}

	var func = this.element.getAttribute("ondatachange");            
	this.element.ondatachange = function() {
		if( func ) { func(); } 
		else { 
			Reminder.add(this.element.id); // 数据有变化时才添加离开提醒 
		}
	}
}

XForm.prototype.attachEditor = function() {
	var cols = this.xmlDoc.Columns;
	for(var i = 0; i < cols.length; i++) {
		var colName   = cols[i].getAttribute("name");
		var colMode   = cols[i].getAttribute("mode");
		var colEditor = cols[i].getAttribute("editor");
		var nodeValue = this.getColumnValue(colName);

		// 取layout中绑定该columne的元素
		var tempObj = $(colName);
		if(tempObj == null) {
			continue;
		}

		var curInstance;
		switch(colMode) {
			case "string":
				if(colEditor == "comboedit") {
					curInstance = new Mode_ComboEdit(colName, this);
				}
				else if(colEditor == "radio") {
					curInstance = new Mode_Radio(colName, this);
				}
				else {
					curInstance = new Mode_String(colName, this);
				}
				break;
			case "number":
				curInstance = new Mode_Number(colName, this);
				break;
			case "function":
				curInstance = new Mode_Function(colName, this);
				break;
			case "hidden":
				curInstance = new Mode_Hidden(colName, this);
				break;
		}
		curInstance.saveAsDefaultValue();
		this._columnList[colName] = curInstance;
	}
}

XForm.prototype.checkForm = function() {
	// 隐藏上次的错误信息层
	hideErrorInfo();

	var cols = this.xmlDoc.Columns;
	for(var i = 0; i < cols.length; i++) {
		var colName  = cols[i].getAttribute("name");
		var _column = this._columnList[colName];
		if(_column) {
			if(_column.validate() == false) {
				return false;
			}
		}
		else { // layout内不存在时创建虚拟实例执行校验
			var _columnTemp = {};
			_columnTemp.obj = {
				empty: cols[i].getAttribute("empty"),
				errorInfo: cols[i].getAttribute("errorInfo"),
				caption: cols[i].getAttribute("caption"),
				submitReg: cols[i].getAttribute("submitReg"),
				value: this.getColumnValue(colName)
			};

			_columnTemp.validate = validate;
			if(_columnTemp.validate() == false) {
				return false;
			}
		}
	}

	$("xml").value = this.xmlDoc.Data.xml;

	return true;
}

XForm.prototype.resetForm = function() {
	//隐藏上次的错误信息层
	hideErrorInfo();

	var cols = this.xmlDoc.Columns;
	for(var i = 0; i < cols.length; i++) {
		var colName = cols[i].getAttribute("name");
		if(this._columnList[colName]) {
			this._columnList[colName].reset();
		}
	}
	if(event) {
		event.returnValue = false;
	}
}

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

	var oldValue = this.getColumnValue(obj.binding);
	if(newValue != oldValue && newValue && newValue != "") {
		this.setColumnValue(obj.binding, newValue);
	}
}

XForm.prototype.updateDataExternal = function(name, value) {
	var node = this.getColumn(name);
	var oldValue  = this.getData(name);

	this.setColumnValue(name, value);
	
	// 更改页面显示数据
	var tempSrcElement;
	var _column = this._columnList[name];
	if(_column) {
		_column.setValue(value);
		tempSrcElement = _column.obj;
	}
	else {
		tempSrcElement = { binding: name };
	}
}

XForm.prototype.updateUnbindingDataExternal = function(id, value) {
	$(id).value = value;

	var node = this.xmlDoc.Layout.selectSingleNode(".//*[@id='" + id + "']");
	if(node) {
		node.setAttribute("value", value);
	}
}

XForm.prototype.setEditable = function(status) {
	if(this.element.editable != status ) {
		return；
	}

	this.element.editable = status;

	var buttonBox = $("buttonBox");
	if(buttonBox) {
		buttonBox.style.display = (status == "true" ? "block": "none");
	}

	var cols = this.xmlDoc.Columns;
	for(var i = 0; i < cols.length; i++) {
		var name = cols[i].getAttribute("name");
		var _column = _columnList[name];
		if( _column ) {
			var columnEditable = cols[i].getAttribute("editable");
			if (columnEditable == "false") continue;
			_column.setEditable(status);
		}
	}

	this.setFocus();
}

XForm.prototype.getData = function(name, replace) {
	var nodeValue = this.getColumnValue(name);
	if(true == replace) {
		nodeValue = nodeValue.replace(/\"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\'/g, "&#39;");
	}
	return nodeValue;
}

XForm.prototype.getColumn = function(name) {
	var _column = this.xmlDoc.columnsMap[name];
	if(_column == null) {
		alert(name + "不存在");
	}
	return _column;
}

XForm.prototype.xml = function() {
	return xmlDoc.toString();
}

// <row user="2222" password="aaaaaaaaa" id="222" date="2005/09/09"/>
XForm.prototype.reloadData = function(rowNode) {
	// 修正comboedit类型默认第一项的值
	this.fixComboeditDefaultValue(rowNode);

	// 隐藏上次的错误信息层
	hideErrorInfo();

	var cols = this.xmlDoc.Columns;  // 以column定义为获取依据
	for(var i = 0; i < cols.length; i++) {
		var name  = cols[i].getAttribute("name");
		var value = rowNode.getAttribute(name);
		this.updateDataExternal(name, value || "");
	}
}

XForm.prototype.fixComboeditDefaultValue = function(rowNode) {
	var cols = this.xmlDoc.Columns;
	for(var i = 0; i < cols.length; i++) {
		var name   = cols[i].getAttribute("name");
		var empty  = cols[i].getAttribute("empty");
		var editor = cols[i].getAttribute("editor");
		var editorValue = cols[i].getAttribute("editorvalue") || "";
		var firstValue = editorValue.split("|")[0];
		var value = this.getColumnValue(name);

		// 当empty = false(表示不允许为空)时，下拉列表的默认值自动取第一项值
		if((value == null || value.length == 0) && firstValue != "" && (editor=="comboedit" || editor=="radio") && empty=="false") {
			this.setColumnValue(name, firstValue);
		}
	}
}


XForm.prototype.saveAsDefaultValue = function() {
	//隐藏上次的错误信息层
	hideErrorInfo();

	var cols = this.xmlDoc.Columns;
	for(var i = 0; i < cols.length; i++) {
		var colName = cols[i].getAttribute("name");
		var _column = _columnList[colName];
		_column.saveAsDefaultValue();    
	}
}

XForm.prototype.setFocus = function(name) {
	if( name == null || name == "") {
		var column = this.xmlDoc.declare.selectSingleNode("column[(@editable='true' or not(@editable)) and (@display!='none' or not(@display))]");
		if(column == null) {
			return;
		}
		name = column.getAttribute("name");
	}

	var _column = this._columnList[name];
	if( _column ) {
		_column.setFocus();
		$(name).focus();
	}
}

XForm.prototype.setColumnEditable = function(name, booleanValue) {
	var _columnNode = this.getColumn(name);
	_columnNode.setAttribute("editable", booleanValue);
	
	var _column = this._columnList[name];
	if( _column ) {
		_column.setEditable(booleanValue);
	}
}


XForm.prototype.showCustomErrorInfo = function(name, str) {
	var instance = this._columnList[name];
	if( instance ) {
		showErrorInfo(str, instance.obj);
	}
}

XForm.prototype.getColumnAttribute = function(name, attrName) {
	var column = this.xmlDoc.columnsMap[name];
	if( column ) {
		return column.getAttribute(attrName);
	}
	else {
		alert("指定的列[" + name + "]不存在");
		return null;
	}
}

XForm.prototype.setLabelContent = function(name, content) {
	var labelObj = $("label_" + name);
	if( labelObj ) {
		if(labelObj.length > 1) {
			labelObj = labelObj[0];
		}
		labelObj.innerHTML = content;
	}
}

XForm.prototype.getXmlDocument = function() {
	return this.xmlDoc.xmlDom;
}

/*
 * 获取row节点上与column对应的值
 */
XForm.prototype.getColumnValue = function(name) {
	var rowNode = this.xmlDoc.Row;
	var node = rowNode.selectSingleNode(name);
	var nodeValue = (null == node ? null : node.text);

	return nodeValue;
}

/*
 *  函数说明：设置row节点上与column对应的值
 *  参数：  string:name             列名
			string/array:value      值
 */
XForm.prototype.setColumnValue = function(name, value) {
	// 单值，给定值却是数组，则取第一个
	if(value instanceof Array) { 
		value = value[0];
	}

	var rowNode = this.xmlDoc.Row;
	var node = rowNode.selectSingleNode(name);
	if( node == null ) { 
		node = this.xmlDom.createElement(name); // 创建单值节点
		rowNode.appendChild(node);
	}

	var CDATANode = node.selectSingleNode("cdata()");
	if( CDATANode ) {
		CDATANode.text = value;
	}
	else{
		var newCDATANode = this.xmlDom.createCDATASection(value);
		node.appendChild(newCDATANode);
	}
}




function Mode_String(colName, element) {
	this.name = colName;
	this.obj = $(colName);
	this.obj._value = this.obj.value;

	this.setEditable();

	this.obj.onblur = function() {
		if("text" == this.type) {
			this.value = this.value.replace(/(^\s*)|(\s*$)/g, "");
		}

		if(this.value == "" && this.empty == "false") {
			showErrorInfo("请输入 [" + this.caption.replace(/\s/g, "") + "]", this);
		}
		else if(this.inputReg != "null" && eval(this.inputReg).test(this.value) == false){
			showErrorInfo("[" + this.caption.replace(/\s/g, "") + "] 格式不正确，请更正。", this);
		}
		else {
			element.updateData(this);
		}
	}

	this.obj.onpropertychange = function() {
		if(window.event.propertyName == "value") {
			if(this.inputReg != "null" && eval(this.inputReg).test(this.value) == false){ // 输入不符合
				restore(this, this._value);
			}
			else if(this.value.replace(/[^\u0000-\u00FF]/g, "**").length > parseInt(this.maxLength)) {
				restore(this, this.value.substringB(0, this.maxLength));
			}
			else{
				this._value = this.value;
			}
		}
	};
}

Mode_String.prototype = {
	setValue : function(s) {
		this.obj._value = this.obj.value = s;
	},
	
	setEditable : function(s) {
		this.obj.editable = s || this.obj.getAttribute("editable");

		var disabled = (this.obj.editable == "false");
		this.obj.className = (disabled ? "string_disabled" : "string");

		if(this.obj.tagName == "TEXTAREA") {
			this.obj.readOnly = disabled;  // textarea 禁止状态无法滚动显示所有内容，所以改为只读
		} else {
			this.obj.disabled = disabled;        
		}
	},
	
	validate : validate,
	
	reset : function() {
		this.obj.value = this.obj.defaultValue;
	},

	saveAsDefaultValue : function() {
		this.obj.defaultValue = this.obj.value;
	},

	setFocus : function(){
		try {
			this.obj.focus();
		} catch(e){ }
	}
}
 



// 下拉选择框，单选或多选
function Mode_ComboEdit(colName, element) {
	this.name = colName;
	this.obj = $(colName);
 	this.obj._value = this.obj.attributes["value"].nodeValue;
	this.obj.disabled = (this.obj.getAttribute("editable") == "false");

	var selectedValues = {};
	var valueArr = this.obj._value.split(",");
	for(var i=0; i < valueArr.length; i++) {
		selectedValues[ valueArr[i] ] = true;
	}

	var valueList = this.obj.editorvalue.split('|');
	var textList  = this.obj.editortext.split('|');
	var selectedIndex = [];
	for(var i=0; i < valueList.length; i++){
		var value = valueList[i];
		var lable = textList[i];
		if( lable == "&#124;" ){
			lable = "|";
		}

		var option = new Option();
		option.value = value;
		option.text  = lable;
		if( selectedValues[value] ) {
			option.selected = true;
			selectedIndex[selectedIndex.length] = i;
		}
		this.obj.options[this.obj.options.length] = option;
	}
	if( selectedIndex.length > 0 ){
		this.obj.defaultSelectedIndex = selectedIndex.join(",");
	} 
	else {
		this.obj.defaultSelectedIndex = this.obj.selectedIndex = -1;
	}
	
	this.obj.onchange = function() {
		var x = [];
		for(var i=0; i < this.options.length; i++) {
			var opt = this.options[i];
			if(opt.selected) {
				x[x.length] = opt.value;
			}
		}
		this._value = x.join(",");
		element.updateData(this);
	}
}

Mode_ComboEdit.prototype.setValue = function(value) {
	var valueList = {};
	var valueArray = value.split(",");
	for(var i = 0; i < valueArray.length; i++){
		valueList[valueArray[i]] = true;
	}
	var isMatch = false;
	for(var i=0; i < this.obj.options.length; i++){
		var opt = this.obj.options[i];
		if(valueList[opt.value]) {
			opt.selected = true;
			isMatch = true;
		}
	}

	if(false == isMatch){
		this.obj.selectedIndex = -1;	
	}
}

Mode_ComboEdit.prototype.setEditable = function(s) {
	this.obj.disabled  = (s == "true" ? false : true);
	this.obj.className = (s == "true" ? "comboedit" : "comboedit_disabled");
	this.obj.editable = s;
}

Mode_ComboEdit.prototype.validate = function() {
	var empty = this.obj.getAttribute("empty");
	var value = this.obj.value;
	if(value == "" && empty == "false") {
		showErrorInfo("[" + this.obj.caption.replace(/\s/g, "") + "] 不允许为空，请选择。", this.obj);
		return false;
	}
	return true;
}

Mode_ComboEdit.prototype.reset = function() {
	this.obj.selectedIndex = -1;
	var selectedIndex = this.obj.defaultSelectedIndex;
	if(selectedIndex != "") {
		selectedIndex = selectedIndex.split(",");
		for(var i=0; i < selectedIndex.lengt; i++) {
			this.obj.options[selectedIndex[i]].selected = true;
		}
	}
}

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

Mode_ComboEdit.prototype.setFocus = function() {
	try {
		this.obj.focus();
	} catch(e) {
	}
}




function Mode_Radio(colName, element) {
	this.name = colName;
	this.obj = $(colName);

	var tempThis = this;
	this.obj._value = this.obj.value;

	var tempRadios = "";
	var valueList = this.obj.editorvalue;
	var textList = this.obj.editortext;
	var valueArray = valueList.split('|');
	for(var i=0; i < valueArray.length; i++ ) {
		var value = valueArray[i];
		var tempLable = textList.split('|')[i];

		var tempID   = this.obj.binding + '_radio_' + this.obj.uniqueID + "_" + i;
		var tempName = this.obj.binding + '_radio_' + this.obj.uniqueID;
		tempRadios += '<input type="radio" class="radio" id="' + tempID + '" name="' + tempName + '" value="' + value + '"' 
			+ (this.obj._value == value ? ' checked' : '') + (this.obj.getAttribute('editable') == 'false' ? ' disabled' : '') 
			+ ' binding="' + this.obj.binding + '">' + '<label for="' + tempID + '">' + tempLable + '</label>';
	}
	this.obj.innerHTML = tempRadios;
	
	var inputObjs = this.obj.all.tags("INPUT");
	var tempObj   = this.obj;
	for(var i=0; i < inputObjs.length; i++) {
		var inputObj = inputObjs[i];
		inputObj.style.cssText = tempObj.defaultStyle;
		inputObj.multipleIndex = tempObj.multipleIndex;

		inputObj.onclick = function() {
			element.updateData(this);
			tempObj._value = this.value;
		}
	}
}

Mode_Radio.prototype.setValue = function(value) {
	var inputObjs = this.obj.all.tags("INPUT");
	for(var i=0; i < inputObjs.length; i++) {
		var inputObj = inputObjs[i];
		if(inputObj.value == value ) {
			inputObj.checked = true;
			this.obj._value = inputObj.value;
			return;
		} 
		else {
			inputObj.checked = false;
		}
	}
}

Mode_Radio.prototype.setEditable = function(s) {
	var inputObjs = this.obj.all.tags("INPUT");
	for(var i=0; i < inputObjs.length; i++) {
		var inputObj = inputObjs[i];
		inputObj.disabled = (s == "true" ? false : true);
	}
	this.obj.editable = s;
}

Mode_Radio.prototype.validate = function() {
	return true;
}

Mode_Radio.prototype.reset = function() {
	var inputObjs = this.obj.all.tags("INPUT");
	for(var i=0; i < inputObjs.length; i++) {
		var inputObj = inputObjs[i];
		inputObj.checked = inputObj.defaultChecked;
	}
}
Mode_Radio.prototype.saveAsDefaultValue = function() {
	var inputObjs = this.obj.all.tags("INPUT");
	for(var i=0; i < inputObjs.length; i++){
		var inputObj = inputObjs[i];
		inputObj.defaultChecked = inputObj.checked;
	}
}
Mode_Radio.prototype.setFocus = function(){
	var inputObjs = this.obj.all.tags("INPUT");
	try{
		inputObjs[0].focus();
	}catch(e){
	}
}




function Mode_Number(colName, element) {
	this.name = colName;
	this.obj = $(colName);

	var tempThis = this;
	this.obj._value = this.obj.value;

	if(this.obj.getAttribute('empty') == "false") {
		this.obj.insertAdjacentHTML("afterEnd", "<span style='color:red;position:relative;left:3px;top:-2px'>*</span>");
	}

	this.obj.disabled = (this.obj.getAttribute("editable") == "false");
	this.obj.className = (this.obj.disabled ? "string_disabled" : "string");	

	this.obj.onfocus = function() {
		var tempEvent = this.onpropertychange;
		this.onpropertychange = null;
		this.value = stringToNumber(this.value);
		this.onpropertychange = tempEvent;
		this.select();
	}
	this.obj.onblur = function() {
		if(this.value=="" && this.empty == "false") {
			showErrorInfo("请输入 [" + this.caption.replace(/\s/g, "") + "]", this);
		}
		else if(this.inputReg != "null" && eval(this.inputReg).test(this.value) == false) {
			showErrorInfo("[" + this.caption.replace(/\s/g, "") + "] 格式不正确，请更正。", this);
		}
		else {
			tempThis.setValue(this.value);
			element.updateData(this);
		}
	}

	this.obj.onpropertychange = function() {
		if(window.event.propertyName == "value") {
			if(this.inputReg != "null" && eval(this.inputReg).test(this.value) == false) { // 输入不合法
				var value = stringToNumber(this._value);
				if(eval(this.inputReg).test(value)) {
					restore(this, value);
				} else {
					restore(this, "");
				}
			} else {
				this._value = this.value;
			}
		}
	};
}

Mode_Number.prototype.setValue = function(value) {
	restore(this.obj, numberToString(value, this.obj.pattern));
}

Mode_Number.prototype.setEditable = function(s) {
	this.obj.disabled  = (s == "true" ? false : true);
	this.obj.className = (s == "true" ? "string" : "string_disabled");
	this.obj.editable = s;
}

Mode_Number.prototype.validate = validate;

Mode_Number.prototype.reset = function() {
	this.obj.value = this.obj.defaultValue;
}

Mode_Number.prototype.saveAsDefaultValue = function() {
	this.obj.defaultValue = this.obj.value;
}

Mode_Number.prototype.setFocus = function(){
	try {
		this.obj.focus();
	} catch(e) {
	}
}



function Mode_Function(colName, element) {
	this.name = colName;
	this.obj = $(colName);

	var tempThis = this;
	this.obj._value = this.obj.value;

	if(this.obj.clickOnly!="false"){ // 可通过column上clickOnly来控制是否允许可手工输入
		this.obj.readOnly = true;
	}
	
	//如果不可为空，添加星号
	if(this.obj.getAttribute('empty') == "false"){
		this.obj.insertAdjacentHTML("afterEnd", "<span style='color:red;position:relative;left:3px;top:-2px'>*</span>");
	}

	this.obj.disabled  = (this.obj.getAttribute("editable") == "false");
	this.obj.className = (this.obj.disabled ? "function_disabled" : "function");

	waitingForVisible(function() {
		tempThis.obj.style.width = Math.max(1, tempThis.obj.offsetWidth - 20);
	});

	this.obj.onblur = function() {
		if("text" == this.type) {
			this.value = this.value.replace(/(^\s*)|(\s*$)/g, "");
		}
		
		if(this.value=="" && this.empty=="false"){
			showErrorInfo("请输入 [" + this.caption.replace(/\s/g, "") + "]", this);
		} 
		else if(this.inputReg!="null" && eval(this.inputReg).test(this.value) == false) {
			showErrorInfo("[" + this.caption.replace(/\s/g,"") + "] 格式不正确，请更正",this);
		}
		else{
			element.updateData(this);
		}
	};
	this.obj.onpropertychange = function() {
		if(window.event.propertyName == "value") {
			if(this.inputReg != "null" && eval(this.inputReg).test(this.value) == false) { // 输入不符合
				restore(this, this._value);
			} 
			else if(this.value.replace(/[^\u0000-\u00FF]/g, "**").length > parseInt(this.maxLength)) {
				restore(this, this.value.substringB(0, this.maxLength));
			} 
			else {
				this._value = this.value;
			}
		}
	};

	if( !this.obj.disabled ) {
		var tempThisObj = this.obj;

		//添加点击按钮
		this.obj.insertAdjacentHTML('afterEnd', '<button style="width:20px;height:18px;background-color:transparent;border:0px;"><img src="' + _iconPath + 'function.gif"></button>');
		var btObj = this.obj.nextSibling; // 动态添加进去的按钮
		btObj.onclick = function(){
			try {
				eval(tempThisObj.cmd);
			} catch(e) {
				showErrorInfo("运行自定义JavaScript代码<" + tempThisObj.cmd + ">出错，异常信息：" + e.description, tempThisObj);
				throw(e);
			}
		}
	}	
}

Mode_Function.prototype.setValue = function(value) {
	this.obj._value = this.obj.value = value;
}
Mode_Function.prototype.setEditable = function(s) {
	this.obj.disabled  = (s == "false");
	this.obj.className = (this.obj.disabled ? "function_disabled" : "function");

	this.obj.nextSibling.disabled = this.obj.disabled;
	this.obj.nextSibling.className = (this.obj.disabled ? "bt_disabled" : "");
	this.obj.editable = s;
}
Mode_Function.prototype.validate = validate;
Mode_Function.prototype.reset = function() {
	this.obj.value = this.obj.defaultValue;
}
Mode_Function.prototype.saveAsDefaultValue = function() {
	this.obj.defaultValue = this.obj.value;
}
Mode_Function.prototype.setFocus = function() {
	try {
		this.obj.focus();
	} catch(e) {
	}
}


function Mode_Hidden(colName, element) {
	this.name = colName;
	this.obj = $(colName);
}
Mode_Hidden.prototype.setValue = function(s) {}
Mode_Hidden.prototype.setEditable = function(s) {}
Mode_Hidden.prototype.validate = function() {
	return true;
}
Mode_Hidden.prototype.reset = function() {}
Mode_Hidden.prototype.saveAsDefaultValue = function() {}
Mode_Hidden.prototype.setFocus = function() {}



var Class_XMLDocument = function(xmlDom) {
	this.xmlDom = xmlDom;

	this.toString = function() {
		return this.xmlDom ? this.xmlDom.xml : null;
	}

	this.transformXML = function(xslDom) {			
		return this.xmlDom.transformNode(xslDom).replace(/&amp;nbsp;/g, "&nbsp;").replace(/\u00A0/g, "&amp;nbsp;");
	}
	
	this.refresh = function() {
		if( this.xmlDom ) {
			this.declare = this.xmlDom.selectSingleNode("./declare");
			this.Layout  = this.xmlDom.selectSingleNode("./layout");
			this.Script  = this.xmlDom.selectSingleNode("./script");
			this.Columns = this.xmlDom.selectNodes("./declare/column");
			this.Data    = this.xmlDom.selectSingleNode("./data");
			
			if(this.Data == null) {				
				var dataNode = getXmlDOM().createElement("data");
				this.xmlDom.appendChild(dataNode);
				this.Data = dataNode;
			}
			
			this.Row = this.xmlDom.selectSingleNode("./data/row[0]");
			if(this.Row == null) {
				var rowNode = getXmlDOM().createElement("row");
				this.Data.appendChild(rowNode);	
				this.Row = rowNode;
			}
			
			this.columnsMap = {};
			for(var i = 0; i < this.Columns.length; i++) {
				this.columnsMap[this.Columns[i].getAttribute("name")] = this.Columns[i];
			}
		}
	}

	this.refresh();
}



function validate() {
	var empty = this.obj.empty;
	var errorInfo = this.obj.errorInfo;
	var caption = this.obj.caption.replace(/\s/g,"");
	var submitReg = this.obj.submitReg;
	var value = this.obj.value;

	if(value == "" && empty == "false") {
		errorInfo = "[" + caption.replace(/\s/g, "") + "] 不允许为空，请选择。";
	}

	if(submitReg != "null" && submitReg && !eval(submitReg).test(value)) {
		errorInfo = errorInfo || "[" + caption + "] 格式不正确，请更正.";
	}

	if( errorInfo != "null" && errorInfo ) {
		showErrorInfo(errorInfo, this.obj);

		if(this.isInstance != false) {
			this.setFocus();
		}
		if( event ) {
			event.returnValue = false;
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

function waitingForVisible(func, element) {
	// 控件未隐藏, 则直接执行
	if( 0 != element.offsetWidth ) {
		func();
		return;
	}

	// 控件隐藏, 则等待onresize
	var tasks = element.resizeTask || [];
	tasks[task.length] = func;
	element.resizeTask = tasks;

	if( element.onresize == null ) {
		element.onresize = function() {
			var tasks = element.resizeTask;
			for(var i=0; i < tasks.length; i++) {
				tasks[i]();
			}
			element.onresize = null;
		}
	}
}