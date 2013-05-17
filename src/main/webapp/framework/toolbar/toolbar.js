/*
 *	标签名
 */
_TOOLBAR_NAMESPACE = "ToolBar";
_TAG_NAME_BOX = "Box";
_TAG_NAME_BUTTON = "Button";
_TAG_NAME_LISTBUTTON = "ListButton";
_TAG_NAME_TXTBUTTON = "TxtButton";
_TAG_NAME_SEPARATOR = "Separator";
_TAG_NAME_BUTTON_MORE = "ButtonMore";
_TAG_NAME_DIV = "div";
_TAG_NAME_IMG = "img";
_TAG_NAME_NOBR = "nobr";

/*
 *	xml节点名
 */
_XML_NODE_NAME_BUTTON = "button";
_XML_NODE_NAME_LISTBUTTON = "listbutton";
_XML_NODE_NAME_TXTBUTTON = "txtbutton";
_XML_NODE_NAME_SEPARATOR = "separator";

_XML_NODE_TYPE_ELEMENT = 1;
_XML_NODE_TYPE_ATTRIBUTE = 2;
_XML_NODE_TYPE_TEXT = 3;
_XML_NODE_TYPE_COMMENT = 8;
_XML_NODE_TYPE_DOCUMENT = 9;

/*
 *	唯一编号名前缀
 */
_UNIQUE_ID_TOOLBAR_PREFIX = "toolbar__id";
_UNIQUE_ID_TOOLBAR_ITEM_PREFIX = "toolbar_item__id";
_UNIQUE_ID_DEFAULT_PREFIX = "default__id";

/*
 *	样式名称
 */
_STYLE_NAME_TOOLBAR_BUTTON_ACTIVE = "active";
_STYLE_NAME_TOOLBAR_BUTTON_INVERT = "invert";
_STYLE_NAME_TOOLBAR_BUTTON_DISABLE = "disable";
_STYLE_NAME_TOOLBAR_BUTTON_MORE_ACTIVE = "active";
_STYLE_NAME_TOOLBAR_BUTTON_MORE_INVERT = "invert";
_STYLE_NAME_TOOLBAR_LISTBUTTON_ACTIVE = "active";
_STYLE_NAME_TOOLBAR_LISTBUTTON_INVERT = "invert";
_STYLE_NAME_TOOLBAR_LISTBUTTON_ARROW = "arrow";
_STYLE_NAME_TOOLBAR_TXTBUTTON_ACTIVE = "active";
_STYLE_NAME_TOOLBAR_TXTBUTTON_INVERT = "invert";
_STYLE_NAME_TOOLBAR_TXTBUTTON_DISABLE = "disable";

/*
 *	文件地址
 */
_FILE_IMG_BUTTON_MORE = "icons/more.gif";
_FILE_IMG_LISTBUTTON_ARROW = "icons/arrow.gif";


/*
 *	对象名称：ToolBars（全局静态对象）
 *	职责：负责管理所有ToolBar实例
 */
var ToolBars = {};
ToolBars.items = {};

/*
 *	创建一个ToolBar实例
 *	参数：  object:tbObj  ToolBar实例关联的HTML对象
 *	返回值：ToolBar:toolbar     ToolBar实例
 */
ToolBars.create = function(tbObj) {
	var toolbar = new ToolBar(tbObj);
	this.items[toolbar.uniqueID] = toolbar;

	return toolbar;
}

/*
 *	统计所有ToolBar实例数量
 */
ToolBars.count = function() {
	var count = 0;
	for(var item in this.items) {
		count ++;
	}
	return count;
}

/*
 *	以文本方式输出对象信息
 */
ToolBars.toString = function() {
	var str = [];
	str[str.length] = "[ToolBars 对象]";
	str[str.length] = "items:" + this.count();
	return str.join("\r\n");

}



/*
 *	对象名称：ToolBar
 *	职责：负责展示工具条
 */
function ToolBar(tbObj) {
	this.object = tbObj;
	this.btContainer = null;
	this.btMore = null;
	this.items = {};
	this.submenu = null;
	this.submenuMap = {};

	this.uniqueID = UniqueID.generator(_UNIQUE_ID_TOOLBAR_PREFIX);
	this.object.innerHTML = "";

	this.create();
	this.attachEvents();
}

/*
 *	创建界面
 */
ToolBar.prototype.create = function() {
	var box  = Element.createElement(_TAG_NAME_BOX, _TOOLBAR_NAMESPACE);
	var nobr = Element.createElement(_TAG_NAME_NOBR);
	var more = Element.createElement(_TAG_NAME_BUTTON_MORE, _TOOLBAR_NAMESPACE);
	var img  = Element.createElement(_TAG_NAME_IMG);

	img.src = _FILE_IMG_BUTTON_MORE;
	more._instance = this;

	box.appendChild(nobr);
	more.appendChild(img);

	this.object.appendChild(box);
	this.object.appendChild(more);

	this.btContainer = nobr;
	this.btMore = more;
	
	if( window.Menu ) {
		var submenu = new Menu();
		this.submenu = submenu;
	}
}

/*
 *	载入按钮配置
 *	参数：  XmlNode/string:xmlstr       xml字符串或者XmlNode实例
 */
ToolBar.prototype.loadXML = function(xmlstr) {
	this.clear();

	//根据参数类型区分获取xml方式        
	var toolbarNode = null;
	switch(typeof(xmlstr)) {
		case "string":
			var xmlReader = new XmlReader(xmlstr);
			toolbarNode = new XmlNode(xmlReader.documentElement);
			break;
		case "object":
			if( window.XmlNode && (xmlstr instanceof window.XmlNode) ) {
				toolbarNode = xmlstr;
			} 
			else if( window.ActiveXObject && (xmlstr instanceof window.ActiveXObject) ) {
				toolbarNode = xmlstr;
			}
	}

	if( toolbarNode ) {
		var nodes = toolbarNode.selectNodes("*");
		for(var i=0; i < nodes.length; i++) {
			var curNode = nodes[i];
			this.add(curNode);
		}
	}
}

/*
 *	清除所有ToolBarItem实例
 */
ToolBar.prototype.clear = function() {
	for(var item in this.items) {
		this.del(item);
	}
	this.submenuMap = {};
}

/*
 *	释放实例
 */
ToolBar.prototype.dispose = function() {
	this.clear();

	if( window.Menu ) {
		this.submenu.dispose();
	}
	for(var item in this) {
		delete this[item];
	}
}

/*
 *	添加按钮
 *	参数：  xmlNode/Object:itemObj    XML节点或Object类型
 */
ToolBar.prototype.add = function(itemObj) {
	if( _TYPE_OBJECT == typeof(itemObj) ) {

		//Node类型，转化成Object
		if(_XML_NODE_TYPE_ELEMENT == itemObj.nodeType) {
			itemObj = this.convert(itemObj);
		}

		//如果没有id则创建一个
		var id = itemObj.id || UniqueID.generator(_UNIQUE_ID_TOOLBAR_ITEM_PREFIX);
		itemObj.id = id;

		var item = new ToolBarItem(itemObj);
		item.dockTo(this.btContainer);

		this.items[id] = item;

		this.addSubMenuItem(itemObj);
	}
}

/*
 *	将xml节点转化成Object类型
 *	参数：  xmlNode:node    XML节点
 *	返回值：    Object:itemObj      Object类型
 */
ToolBar.prototype.convert = function(node) {
	var itemObj = {};
	itemObj.type = node.nodeName;
	itemObj.subitems = [];
	for(var i=0; i < node.attributes.length; i++) {
		var attr = node.attributes[i];
		itemObj[attr.nodeName] = attr.nodeValue;
	}
	var childs = node.childNodes;
	for(var i=0; i < childs.length; i++) {
		var curChild = childs[i];
		if(_XML_NODE_TYPE_ELEMENT == curChild.nodeType) {
			var subItemObject = {};
			for(var j=0; j < curChild.attributes.length; j++) {
				var attr = curChild.attributes[j];
				subItemObject[attr.nodeName] = attr.nodeValue;
			}
			itemObj.subitems[itemObj.subitems.length] = subItemObject;
		}
	}
	return itemObj;
}

/*
 *	为更多按钮下拉菜单添加选项
 *	参数：  xmlNode/Object:itemObj    XML节点或Object类型
 */
ToolBar.prototype.addSubMenuItem = function(itemObj) {
	if( window.Menu && _XML_NODE_NAME_SEPARATOR != itemObj.type) {
		var subMenuItem = {};
		subMenuItem.label = itemObj.label;
		subMenuItem.callback = itemObj.cmd;
		subMenuItem.icon = itemObj.icon;
		subMenuItem.enable = true;
		subMenuItem.visible = true;

		this.submenuMap[itemObj.id] = this.submenu.addItem(subMenuItem);
	}
}

/*
 *	清除指定按钮
 *	参数：  string:id       按钮ID
 */
ToolBar.prototype.del = function(id) {
	var curItem = this.items[id];
	if( curItem ) {
		curItem.dispose();
		delete this.items[id];
		this.delSubMenuItem(id);
	}
}

/*
 *	从更多按钮下拉菜单删除选项
 *	参数：  string:id       按钮ID
 */
ToolBar.prototype.delSubMenuItem = function(id) {
	var submenuUniqueID = this.submenuMap[id];
	this.submenu.delItem(submenuUniqueID);
}

/*
 *	绑定事件
 */
ToolBar.prototype.attachEvents = function() {
	this.object.onselectstart = _toolbar_onselectstart;
	this.btMore.onmouseover   = _toolbar_more_onmouseover;
	this.btMore.onmouseout    = _toolbar_more_onmouseout;
	this.btMore.onmousedown   = _toolbar_more_onmousedown;
	this.btMore.onmouseup     = _toolbar_more_onmouseup;
	this.btMore.onclick       = _toolbar_more_onclick;
}

/*
 *	更多按钮高亮效果
 */
ToolBar.prototype.active = function() {
	this.btMore.className = _STYLE_NAME_TOOLBAR_BUTTON_MORE_ACTIVE;
}

/*
 *	更多按钮低亮效果
 */
ToolBar.prototype.inactive = function() {
	this.btMore.className = "";
}

/*
 *	更多按钮反白效果
 */
ToolBar.prototype.invert = function() {
	this.btMore.className = _STYLE_NAME_TOOLBAR_BUTTON_MORE_INVERT;
}

/*
 *	统计所有ToolBarItem实例数量
 */
ToolBar.prototype.count = function() {
	var count = 0;
	for(var item in this.items) {
		count++;
	}
	return count;
}

/*
 *	检测更多按钮是否应该生效
 */
ToolBar.prototype.checkMore = function() {
	var count = 0;
	for(var item in this.items) {
		var curItem = this.items[item];
		switch(curItem.type) {
			case _XML_NODE_NAME_BUTTON:
			case _XML_NODE_NAME_LISTBUTTON:
				if( curItem.isOutSide()) {
					count ++;
				}
				break;
			case _XML_NODE_NAME_SEPARATOR:
				break;
		}
	}

	return count > 0;
}

/*
 *	触发点击更多按钮事件
 */
ToolBar.prototype.fireOnShowMore = function() {
	if( this.checkMore() ) {
		Public.execCommand(this.onShowMore);
		this.refreshSubMenu();
	}
}

/*
 *	刷新更多按钮下拉菜单选项
 *	参数：  xmlNode/Object:itemObj    XML节点或Object类型
 */
ToolBar.prototype.refreshSubMenu = function() {
	if( window.Menu ) {
		for(var item in this.items) {
			var curItem = this.items[item];
			var visible = curItem.isOutSide();
			var enable = curItem.enable;
			if(_XML_NODE_NAME_SEPARATOR != curItem.type) {

				var submenuItemUniqueID = this.submenuMap[item];
				var submenuItem = this.submenu.items[submenuItemUniqueID];
				submenuItem.visible = visible;
				submenuItem.enable = enable;

				var absLeft = Element.absLeft(this.btMore);
				var absTop = Element.absTop(this.btMore);
				var offsetHeight = this.btMore.offsetHeight;
				var offX = this.btMore.offsetWidth;
				this.submenu.show(offsetLeft,offsetTop+offsetHeight,true,offX);
			}
		}
	}
}

/*
 *	停用按钮
 */
ToolBar.prototype.disable = function(id) {
	this.enable(id, false);
}

/*
 *	启用按钮
 */
ToolBar.prototype.enable = function(id, enable) {
	var curItem = this.items[id];
	if( curItem ) {
		curItem.enable = (null == enable ? true : enable);
		curItem.refresh();
	}
}

/*
 *	设置按钮是否可见
 */
ToolBar.prototype.setVisible = function(id, visible) {
	var curItem = this.items[id];
	if( curItem ) {
		curItem.visible = ( null == visible ? true : visible);
		curItem.refresh();
	}
}

/*
 *	以文本方式输出对象信息
 */
ToolBar.prototype.toString = function() {
	var str = [];
	str[str.length] = "[ToolBar 对象]";
	str[str.length] = "uniqueID:" + this.uniqueID;
	str[str.length] = "items:" + this.count();
	return str.join("\r\n");
}

 
 
 
/*
 *	对象名称：ToolBarItem
 *	职责：负责工具条按钮/分隔线等的展示
 */
function ToolBarItem(itemObj) {
	this.object = null;
	this.id = itemObj.id;
	this.label = itemObj.label;
	this.icon = itemObj.icon;
	this.cmd = itemObj.cmd;
	this.enable = ("false"==itemObj.enable?false:true);
	this.visible = ("false"==itemObj.visible?false:true);
	this.type = itemObj.type;
	this.subitems = itemObj.subitems;
	this.submenu = null;
 
	this.create();
	this.createListItem();
	this.refresh();
	this.attachEvents();
}

/*
 *	创建界面展示
 */
ToolBarItem.prototype.create = function() {
	switch(this.type) {
		case _XML_NODE_NAME_BUTTON:
			var img = Element.createElement(_TAG_NAME_IMG);
			img.src = this.icon;

			var div = Element.createElement(_TAG_NAME_BUTTON, _TOOLBAR_NAMESPACE);
			div.id = this.id;
			div.title = this.label;
			div._instance = this;

			div.appendChild(img);

			this.object = div;
			break;
		case _XML_NODE_NAME_LISTBUTTON:
			var img = Element.createElement(_TAG_NAME_IMG);
			img.src = this.icon;

			var arrow = Element.createElement(_TAG_NAME_IMG); // 箭头
			arrow.src = _FILE_IMG_LISTBUTTON_ARROW;
			arrow.className = _STYLE_NAME_TOOLBAR_LISTBUTTON_ARROW;

			var div = Element.createElement(_TAG_NAME_LISTBUTTON, _TOOLBAR_NAMESPACE);
			div.id = this.id;
			div.title = this.label;
			div._instance = this;

			div.appendChild(img);
			div.appendChild(arrow);

			this.object = div;
			break;
		case _XML_NODE_NAME_SEPARATOR:
			this.object = Element.createElement(_TAG_NAME_SEPARATOR, _TOOLBAR_NAMESPACE);;
			break;
		case _XML_NODE_NAME_TXTBUTTON:

			var div = Element.createElement(_TAG_NAME_TXTBUTTON, _TOOLBAR_NAMESPACE);
			div.id = this.id;
			div.title = this.label;
			div.innerText = this.label;
			div._instance = this;

			this.object = div;
			break;
	}
}

/*
 *	刷新按钮状态
 */
ToolBarItem.prototype.refresh = function() {
	if(false == this.enable) {
		this.disable();
	} else {
		this.inactive();
	}
	
	if(false == this.visible) {
		this.hide();
	} else {
		this.show();
	}
}

/*
 *	绑定事件
 */
ToolBarItem.prototype.attachEvents = function() {
	this.object.onmouseover = _toolbar_bt_onmouseover;
	this.object.onmouseout  = _toolbar_bt_onmouseout;
	this.object.onmousedown = _toolbar_bt_onmousedown;
	this.object.onmouseup   = _toolbar_bt_onmouseup;
	this.object.onclick     = _toolbar_bt_onclick;
}

/*
 *	将对象定位到指定容器
 *	参数：  object:container    HTML容器对象
 */
ToolBarItem.prototype.dockTo = function(container) {
	container.appendChild(this.object);
}

/*
 *	按钮高亮效果
 */
ToolBarItem.prototype.active = function() {
	switch(this.type) {
		case _XML_NODE_NAME_BUTTON:
			this.object.className = _STYLE_NAME_TOOLBAR_BUTTON_ACTIVE;
			break;
		case _XML_NODE_NAME_LISTBUTTON:
			this.object.className = _STYLE_NAME_TOOLBAR_LISTBUTTON_ACTIVE;
			break;
		case _XML_NODE_NAME_TXTBUTTON:
			this.object.className = _STYLE_NAME_TOOLBAR_TXTBUTTON_ACTIVE;
			break;
	}
}

/*
 *	按钮低亮效果
 */
ToolBarItem.prototype.inactive = function() {
	switch(this.type) {
		case _XML_NODE_NAME_BUTTON:
		case _XML_NODE_NAME_LISTBUTTON:
		case _XML_NODE_NAME_TXTBUTTON:
			this.object.className = "";
			break;
	}
}

/*
 *	按钮反白效果
 */
ToolBarItem.prototype.invert = function() {
	switch(this.type) {
		case _XML_NODE_NAME_BUTTON:
			this.object.className = _STYLE_NAME_TOOLBAR_BUTTON_INVERT;
			break;
		case _XML_NODE_NAME_LISTBUTTON:
			this.object.className = _STYLE_NAME_TOOLBAR_LISTBUTTON_INVERT;
			break;
		case _XML_NODE_NAME_TXTBUTTON:
			this.object.className = _STYLE_NAME_TOOLBAR_TXTBUTTON_INVERT;
			break;
	}
}

/*
 *	按钮禁止效果
 */
ToolBarItem.prototype.disable = function() {
	switch(this.type) {
		case _XML_NODE_NAME_BUTTON:
			this.object.className = _STYLE_NAME_TOOLBAR_BUTTON_DISABLE;
			break;
		case _XML_NODE_NAME_TXTBUTTON:
			this.object.className = _STYLE_NAME_TOOLBAR_TXTBUTTON_DISABLE;
			break;
	}
}

/*
 *	按钮隐藏
 */
ToolBarItem.prototype.hide = function() {
	switch(this.type) {
		case _XML_NODE_NAME_BUTTON:
		case _XML_NODE_NAME_TXTBUTTON:
			this.object.style.display = "none";
			break;
	}
}

/*
 *	按钮显示
 */
ToolBarItem.prototype.show = function() {
	switch(this.type) {
		case _XML_NODE_NAME_BUTTON:
		case _XML_NODE_NAME_TXTBUTTON:
			this.object.style.display = "";
			break;
	}
}

/*
 *	执行按钮方法
 */
ToolBarItem.prototype.execCallBack = function() {
	switch(this.type) {
		case _XML_NODE_NAME_LISTBUTTON:
			this.showListItem();
			break;
		case _XML_NODE_NAME_BUTTON:
		case _XML_NODE_NAME_TXTBUTTON:
			Public.execCommand(this.cmd);
			break;
	}
}

/*
 *	创建ListButton的下拉列表项(利用Menu控件生成)
 */
ToolBarItem.prototype.createListItem = function() {
	if(this.type == _XML_NODE_NAME_LISTBUTTON && window.Menu) {
		var submenu = new Menu();
		for(var i=0; i < this.subitems.length; i++) {
			var subItem = this.subitems[i];
			var menuSubItem = {};
			menuSubItem.label = subItem.label;
			menuSubItem.callback = subItem.cmd;
			menuSubItem.icon = subItem.icon;

			submenu.addItem(menuSubItem);
		}
		this.submenu = submenu;
	}
}

/*
 *	显示ListButton的下拉列表项(利用Menu控件生成)
 */
ToolBarItem.prototype.showListItem = function() {
	if(this.type == _XML_NODE_NAME_LISTBUTTON && window.Menu) {
		var absLeft = Element.absLeft(this.object);
		var absTop  = Element.absTop(this.object);
		var h = this.object.offsetHeight;
		var offX = this.object.offsetWidth;
		this.submenu.show(absLeft, absTop + h, true, offX);
	}
}

/*
 *	获取按钮是否不在滚动显示区内
 */
ToolBarItem.prototype.isOutSide = function() {
	var flag = false;
	switch(this.type) {
		case _XML_NODE_NAME_SEPARATOR:
			break;
		case _XML_NODE_NAME_BUTTON:
		case _XML_NODE_NAME_LISTBUTTON:
		case _XML_NODE_NAME_TXTBUTTON:
			var refLeft = this.object.offsetLeft + this.object.offsetWidth / 2;
			var rightBound = this.object.parentNode.parentNode.offsetWidth;
			flag = (refLeft > rightBound);
			break;
	}
	return flag;
}

/*
 *	释放实例
 */
ToolBarItem.prototype.dispose = function() {
	Element.removeNode(this.object);

	for(var item in this) {
		delete this[item];
	}
}

/*
 *	以文本方式输出对象信息
 */
ToolBarItem.prototype.toString = function() {
	var str = [];
	str[str.length] = "[ToolBarItem 对象]";
	str[str.length] = "id:" + this.id;
	str[str.length] = "label:" + this.label;
	str[str.length] = "type:" + this.type;
	str[str.length] = "icon:" + this.icon;
	str[str.length] = "cmd:" + this.cmd;
	return str.join("\r\n");
}



/*
 *	鼠标离开更多按钮
 *	参数：  event:eventObj    事件对象
 */
function _toolbar_more_onmouseout() {		
	var srcElement = this;
	var _instance = srcElement._instance;
	if( _instance && _instance.checkMore() ) {
		_instance.inactive();
	}
}

/*
 *	鼠标按下更多按钮
 */
function _toolbar_more_onmousedown() {		
	var srcElement = this;
	var _instance = srcElement._instance;
	if( _instance && _instance.checkMore() ) {
		_instance.invert();
	}
}

/*
 *	鼠标悬停更多按钮 or 鼠标松开更多按钮
 */
function _toolbar_more_onmouseover() {		
	var srcElement = this;
	var _instance = srcElement._instance;
	if( _instance && _instance.checkMore() ) {
		_instance.active();
	}
}

var _toolbar_more_onmouseup = _toolbar_more_onmouseover;

/*
 *	鼠标点击更多按钮
 */
function _toolbar_more_onclick() {		
	this._instance.fireOnShowMore();
}
/*
 *	鼠标悬停按钮
 */
function _toolbar_bt_onmouseover() {		
	var srcElement = this;
	var _instance = srcElement._instance;
	if(_instance && _instance.enable) {
		_instance.active();
	}
}

/*
 *	鼠标离开按钮
 */
function _toolbar_bt_onmouseout() {		
	var srcElement = this;
	var _instance = srcElement._instance;
	if(_instance && _instance.enable) {
		_instance.inactive();
	}
}

/*
 *	鼠标按下按钮
 */
function _toolbar_bt_onmousedown() {		
	var srcElement = this;
	var _instance = srcElement._instance;
	if(_instance && _instance.enable) {
		_instance.invert();
	}
}

/*
 *	鼠标松开按钮
 */
function _toolbar_bt_onmouseup() {		
	var srcElement = this;
	var _instance = srcElement._instance;
	if( _instance &&  _instance.enable) {
		_instance.active();
	}
}

/*
 *	鼠标点击按钮
 */
function _toolbar_bt_onclick() {		
	var srcElement = this;
	var _instance = srcElement._instance;
	if( _instance && _instance.enable) {
		_instance.execCallBack();
	}
}

/*
 *	鼠标拖动选择文字
 */
function _toolbar_onselectstart(eventObj) {		
	Event.cancel(eventObj || window.event);
}
