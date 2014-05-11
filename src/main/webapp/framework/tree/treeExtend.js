
/* 扩展内容复选框类型样式  */
var _TREE_EXTEND_CHECK_ICON_STYLE  = "extendCheckIcon"
var _TREE_EXTEND_CHECK_LABEL_STYLE = "extendCheckLabel";

/* options相关节点名称 */
var _TREE_OPTIONS_NODE = "options";
var _TREE_OPTION_NODE  = "option";
var _TREE_OPTION_ID_NODE = "operationId";
var _TREE_OPTION_TEXT_NODE = "operationName";
var _TREE_OPTION_DEPENDID_NODE = "dependId";

/* 权限选项图标路径文件名前缀  */
var _EXTEND_NODE_ICON = "images/multistate";

function $ET(treeId, dataXML) {
	var tree = TreeCache.get(treeId);

	if( tree == null && dataXML == null ) return;

	if( tree == null || dataXML ) {
		var element = $$(treeId);
		element._dataXML = (typeof(dataXML) == 'string') ? dataXML : dataXML.toXml();
		
		TreeCache.add(element.id, tree = new ExtendTree(element));
	}

	return tree;
}

var ExtendTree = function(element) {
	this._baseUrl = element.getAttribute(_TREE_BASE_URL); 
	
	this.element = element;
	this.element.className = _TREE_STYLE;	

	var _treeXMLDom;
		
	this.init = function() {	
		this.loadData(this.element._dataXML);
	
		this.display = new TreeDisplay();
		this.display.reload();

		this.element._dataXML = "";
	}	
	
	/* 设定控件的数据，数据来源为xml字符串 */
	this.loadData = function (dataXML) {
		_treeXMLDom = loadXmlToNode(dataXML);
		if(_treeXMLDom) {			
			var openedNode = _treeXMLDom.selectSingleNode(".//treeNode[@canselected='1' or not(@canselected)]");
			var defaultOpenedNode = (openedNode ? openedNode : _treeXMLDom.firstChild);  // 默认打开第一个子节点
			openNode(defaultOpenedNode);
		}
	}
	
	/* 获取数据的根节点 */
	this.getXmlRoot = function () {
		return _treeXMLDom || loadXmlToNode("<actionSet/>");
	}
	
	this._options = [];

	this.getOptions = function() {
		return this._options;
	}

	this.getOptionById = function(id) {
		if(this.getXmlRoot()) {
			var option = this.getXmlRoot().selectSingleNode("./options/option[./operationId='" + id + "']")
			return option;
		}
		return null;
	}

	/* 设置option节点集合 */
	this.setOptions = function() {
		if( this.getXmlRoot() ) {
			this._options = this.getXmlRoot().selectNodes("./" + _TREE_OPTIONS_NODE + "/" + _TREE_OPTION_NODE);

            // 增加被依赖项节点方便反向查询
            var dependedMap = {};
			for(var i=0; i < this._options.length; i++) {
				var curOption = this._options[i];
				var operationId = getNodeText(curOption.selectSingleNode("./operationId"));
				var dependIds = getNodeText(curOption.selectSingleNode("./dependId")) || "";
				dependIds = dependIds.replace(/^\s*|\s*$/g, "");
				
				if(dependIds == null || dependIds == "") continue;

				dependIds = dependIds.split(",");
				for(var j=0; j < dependIds.length; j++) {
					var dependId = dependIds[j];
					if(dependId == null || dependId == "") continue;

					if( dependedMap[dependId] == null ) {
						dependedMap[dependId] = [];
					}
					dependedMap[dependId][dependedMap[dependId].length] = operationId;
				}
			}
			for(var dependId in dependedMap) {				
				var node = this.getXmlRoot().ownerDocument.createElement("dependedId");
				node.text = dependedMap[dependId].join(",");
				
				var option = this.getOptionById(dependId);
				option.appendChild(node);
			}
		}	
	}


	var treeThis = this;

	/********************************  对象名称：Row *********************************************************
			  职责：负责页面上tr对象中显示节点。 只要给定一个xml节点，此对象负责将节点显示到对应的tr中
	*********************************************************************************************************/
 
	var Row = function(tr, node) {
		this.row = tr;
		this.node = node;
	
		var tdCell = this.row.cells[0];
		this.nobr = Element.createElement("nobr");
		tdCell.appendChild(this.nobr);				
		
		this.line   = this.nobr.appendChild(Element.createElement("span"));
		this.line.innerHTML = getFrontStr(this.row, node, treeThis.getXmlRoot());

		/* 设置伸缩图标 */
		this.folder = this.nobr.appendChild(Element.createElement("img", _TREE_NODE_FOLDER_STYLE));
		var hasChild = node.hasChildNodes() || node.getAttribute("hasChild") == "1";
		var isOpen = node.getAttribute("_open") == "true";
		var folderImage = hasChild ? (isOpen ? _TREE_NODE_CONTRACT_IMAGE : _TREE_NODE_EXPAND_IMAGE) : _TREE_NODE_LEAF_IMAGE;;
		this.folder.src = treeThis._baseUrl  + folderImage;

		/* 设定文字链接 */
		this.label  = this.nobr.appendChild(Element.createElement("span")); 
		var name = node.getAttribute(_TREE_NODE_NAME);			
		this.label.innerText = this.label.title = name;

		/*
		 * 获取节点前面的制表符字符串
		 * 参数：	node	节点
		 *			rootNode	根节点
		 * 返回值：	string	制表符字符串
		 */
		function getFrontStr(row, node, rootNode) {
			if(node.parentNode == rootNode) {
				node.setAttribute("_childFrontStr", '');
				return '<span class="rootSpace"></span>';
			}
			
			if(isFirstLine(row) || node.parentNode.getAttribute("_childFrontStr") == null) {
				getFrontStr(row, node.parentNode, rootNode);
			}

			var parentFrontStr = node.parentNode.getAttribute("_childFrontStr");
			
			if( isLastChild(node) ) {
				node.setAttribute("_childFrontStr", parentFrontStr + '<span class="space"></span>');
				return parentFrontStr + '<span class="vHalfLine"></span>';
			}  

			node.setAttribute("_childFrontStr", parentFrontStr + '<span class="onlyVLine"></span>');
			return parentFrontStr + '<span class="vline"></span>';
		}

		/* 鼠标单击事件响应函数, 如果点击的是伸缩状态图标，则打开或收缩当前节点的直系子节点。*/
		this.folder.onclick = function() {
			var srcElement = window.event.srcElement;
			preventDefault(event);

			var index = getRowIndex(srcElement);
			var row = treeThis.display.getRowByIndex(index);
			if(row instanceof Row) {
				var treeNode = instanceTreeNode(row.node, treeThis);
				if(srcElement == row.folder) {
					treeNode.changeFolderState();	//展开、收缩节点的直系子节点
				}
				treeThis.display.reload();
			}
		}
	}

	var ExtendRow = function(tr, node) {
	    this.row = tr;
	    this.row.style.height = _TREE_NODE_HEIGHT;
	    this.node = node;
	    this.node.setAttribute("baseUrl", treeThis._baseUrl + _EXTEND_NODE_ICON);
		
	    /* 创建扩展内容的所有列内容  */
	    var _options = treeThis.getOptions();
        for(var i = 0; i < _options.length; i++) {
            var curOption   = _options[i];
            var curOptionID = getNodeText(curOption.selectSingleNode(_TREE_OPTION_ID_NODE));
            var value = this.node.getAttribute(curOptionID);

            // 无属性则设置默认值0
            if(value == null) {
                this.node.setAttribute(curOptionID, "0");
            }
	 		
			var cell = this.row.insertCell(i);
            cell.appendChild(getCloneCellCheckbox());
            cell.align = "center";
            cell.id = this.row.id + "-" + curOptionID;
			
	        var checkType = cell.firstChild.firstChild;
	        checkType.id  = curOptionID;

	        this.node.setAttribute(curOptionID + "-img", cell.id);
			setCellCheckType(node, curOptionID, value);
        }
	 
	    /* 加速创建扩展内容checkbox列内容，获取副本对象 */
	    function getCloneCellCheckbox() {
	        if(window._tempCloneCellCheckbox == null) {		
	            var checkType = Element.createElement("img", _TREE_EXTEND_CHECK_ICON_STYLE);
	            checkType.align = "absmiddle";
				var nobr = Element.createElement("nobr");
	            nobr.appendChild(checkType);
	            window._tempCloneCellCheckbox = nobr;
	        }
	        return window._tempCloneCellCheckbox.cloneNode(true); // 缓存起来
	    }

	    this.getXmlNode = function () {
	        return this.node;
	    }
	}

	function TreeDisplay() {
		element.style.overflow = 'hidden'; // 溢出部分会被隐藏
		treeThis.setOptions();

		var _windowHeight = Math.max(element.offsetHeight, 600);
		var _windowWidth  = Math.max(element.offsetWidth, 800);
		
		element.innerHTML = "";
		
		// 生成页面上显示节点的table对象 + 扩展内容。 */
		var treeId = element.id;
		var _rootBoxName   = treeId + "RootBox"; 
		var _rootTableName = treeId + "RootTable"; 
		var tableStr = '<div class="RootBox" id="' + _rootBoxName + '" style="left:10px;top:-6px;"><table id="' + _rootTableName + '"></table></div>' +
		    '<div id="treeExtendBox" style="position:relative;display:inline-block;"><table id="treeExtendTable" class="extendTable"></table></div>';
		element.innerHTML = tableStr;
		element.style.overflow = "auto";

		var _rootBox   = $$(_rootBoxName);
		var _rootTable = $$(_rootTableName);
		var _extendBox = $$("treeExtendBox");
		var _extendTable = $$("treeExtendTable");

		// 设置显示节点的table对象的大小
		_rootBox.style.width  = 240;

		var _Rows, _ExtendRows;

		/*  根据页面上的行数，获取相应的Row对象 */
		this.getRowByIndex = function (index) {
			return _Rows[index];
		}
		
		/* 根据页面上的行数，获取相应的ExtendRow对象 */
		this.getExtendRowByIndex = function (index) {
			return _ExtendRows[index];
		}
	 
		/* 根据滚动状态，显示可视范围内的树节点。*/
		function refresh() {
			var startTime = new Date();

			/* 获取所有可以显示的节点数组 */
			var _totalTreeNodes = treeThis.getXmlRoot().selectNodes(".//treeNode[../@_open='true' or @id='_rootId']");
			var _totalTreeNodesNum = _totalTreeNodes.length;
			
			// 先清空老的数据
			_Rows       = [];
			_ExtendRows = [];
			_rootTable.innerHTML = _extendTable.innerHTML = "";

			/* 生成页面上显示节点扩展内容的表头的行对象。*/
			var thead = new Array();
			thead.push("<thead><tr style='height:27px;'>");

	        var _options = treeThis.getOptions();
	        for(var i=0; i < _options.length; i++) {
	            var text = getNodeText(_options[i].selectSingleNode(_TREE_OPTION_TEXT_NODE));
	            thead.push("<td align=\"center\" title=\"" + text + "\">" + text + "</td>");
	        }	
	        thead.push("</tr></thead><tbody></tbody>");

	        _extendTable.innerHTML = thead.join("");

			for(var i = 0; i < _totalTreeNodesNum; i++) {
				var newNode = _totalTreeNodes[i];

				var tr = _rootTable.insertRow(i);
				tr.insertCell();
				_Rows[i] = new Row(tr, newNode);

				var etr = _extendTable.lastChild.insertRow(i);
				etr.insertCell();
				etr.id = i;
				_ExtendRows[i] = new ExtendRow(etr, newNode);
			}

			window.status = new Date() - startTime;  // 看看效率如何
		}

		this.reload = refresh;

		var oThis = this;
		_extendTable.onclick = function() {
			var eventObj = window.event.srcElement;
			preventDefault(window.event)
		 
			var row = getExtendRow(oThis, eventObj);
			if(row instanceof ExtendRow) {
				var treeNode = instanceTreeNode(row.getXmlNode(), treeThis);
				treeNode.changeExtendSelectedState(eventObj.id, event.shiftKey);				
			} 
		}
	}

	this.init();
}

/* 根据id返回TreeNode对象，如果对象不存在，则返回null  */
ExtendTree.prototype.getTreeNodeById = function(id) {
	var node = this.getXmlRoot().selectSingleNode(".//treeNode[@id='" + id + "']");
	return instanceTreeNode(node, this);
}

TreeNode.prototype.open = function() {
	this.node.setAttribute("_open", "true");	// 标记当前节点为打开状态

	var nodes = this.node.selectNodes(".//treeNode[@_closeBy = '" + this.node.getAttribute(_TREE_NODE_ID) + "']");
	for(var i = 0; i < nodes.length; i++) {
		nodes[i].setAttribute("_open", "true");
		nodes[i].removeAttribute("_closeBy");	//去除因父节点关闭而不显示的标记
	}
}

TreeNode.prototype.close = function() {
	this.node.setAttribute("_open", "false");	//标记当前节点为关闭状态

	//此节点关闭，关闭此节点的打开的子枝节点，同时标记关闭的原因。
	var nodes = this.node.selectNodes(".//treeNode[@_open = 'true']");
	for(var i = 0; i < nodes.length; i++) {
		nodes[i].setAttribute("_open", "false");
		nodes[i].setAttribute("_closeBy", this.node.getAttribute(_TREE_NODE_ID));	// 因此节点关闭而不显示
	}
}

/*
 * 改变权限项选中状态为下一状态
 * 参数：	optionId                    权限项id
			boolean: shiftKey           是否同时按下shiftKey
			nextState                   指定的click后的状态，可选
 * 返回：	nextState                   click后的状态，不能超过pState
 */
TreeNode.prototype.changeExtendSelectedState = function(optionId, shiftKey, nextState) {
	var curState = this.node.getAttribute(optionId);
	var pState   = this.node.getAttribute("pstate");
	
	// nextState 不能超过pState
	if("2" == nextState && "2" != pState) {
		nextState = "1";
	}        

	if("3" == curState || "4" == curState) { // 当前若是禁用状态则不变
		nextState = curState;
	}
	else if(null == nextState) { // 自动切换状态
		switch(curState || "") {            
			case "0":
			case "":
				nextState = "1";
				break;
			case "1":
				if("2" == pState) {
					nextState = "2";
				} else {
					nextState = "0";
				}
				break;
			case "2":
				nextState = "0";
				break;
		}        
	}

	// 扩展项（权限项）状态改变（该事件在serpermission.js里响应）
	var eventExtendNodeChange = new EventFirer($$("tree"), "onExtendNodeChange"); 
	var eventObj = createEventObject();
	eventObj.treeNode = this;
	eventObj.returnValue = true;
	eventObj.optionId = optionId;
	eventObj.defaultValue = curState || "0";
	eventObj.newValue = nextState;
	eventObj.shiftKey = shiftKey;
	eventObj.type = "_ExtendNodeChange";
	eventExtendNodeChange.fire(eventObj);

	var flag = true;
	if(false == eventObj.returnValue) { 
		flag = false; // 调用语句取消该事件
	}
	else {
		if(nextState != curState) {
			this.node.setAttribute(optionId, nextState);
		}
	}

	// 修改权限项显示图标(只修改open状态的节点)
	setCellCheckType(this.node, optionId, nextState);

	return {flag:flag, state: flag ? nextState : curState};
}

/* 
 * public方法：根据显示的对象，获取相应的ExtendRow对象
 * 参数：	obj	 节点显示在页面上的扩展内容对象
 * 返回值：	ExtendRow对象
 */
function getExtendRow(display, obj) {
	if(!/^(a|img)$/.test(obj.tagName.toLowerCase())) {
		return null;
	}

	var index = getRowIndex(obj) - 1;  // 去掉表头那一行
	return display.getExtendRowByIndex(index);
}

/*
 * 设定选中状态
 *			 0 未选中
 *			 1 仅此节点有权限
 *			 2 所有子节点有权限
 *			 3 未选中禁用
 *			 4 选中禁用
 */
function setCellCheckType (node, optionId, value) {
	var cellIndex = node.getAttribute(optionId + "-img");
	if (cellIndex == null || $$(cellIndex) == null) return;

	var checkType = $$(cellIndex).firstChild.firstChild;
    checkType.state = value;

    value = value || "0";
    if("0" == value ) {
        var checkedChild = node.selectSingleNode(".//treeNode[@" + optionId + "='1' or @" + optionId + "='2' or @" + optionId + "='4']");
        if( checkedChild ) {
            value = "0_2";
        }
    }
    checkType.src = node.getAttribute("baseUrl") + value + ".gif"; // 设定扩展内容checkbox图片地址
}