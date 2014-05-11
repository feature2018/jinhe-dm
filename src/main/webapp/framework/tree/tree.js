/* 树类型 */
var _TREE_TYPE_SINGLE = "single";
var _TREE_TYPE_MULTI  = "multi";
var _TREE_TYPE_MENU   = "menu";

/* 树控件属性名称 */
var _TREE_BASE_URL         = "baseurl";
var _TREE_TREE_TYPE        = "treeType";     // 树的类型 : multi / single
var _TREE_CAN_MOVE_NODE    = "canMoveNode";  // 是否可以移动树节点，默认为false
var _TREE_JUST_SELECT_SELF = "selectSelf";	          // 选中节点时只改变自己的选择状态，与父、子节点无关
var _TREE_FOCUS_NEW_NODE   = "focusNewTreeNode";	  // 新增节点焦点不自动移到新节点上

/* 节点属性名称 */
var _TREE_NODE_ID          = "id";
var _TREE_NODE_NAME        = "name";
var _TREE_NODE_CANSELECTED = "canselected";
var _TREE_NODE_CHECKTYPE   = "checktype";
var _TREE_NODE_STATE       = "disabled"; // 启用/停用

var _TREE_NODE         = "treeNode";  /* 节点名称 */
var _TREE_ROOT_NODE    = "actionSet"; /* 根节点名称 */
var _TREE_ROOT_NODE_ID = "_rootId";   /* “全部”节点的ID值  */

/* 选中状态图标地址（控件所在目录为根目录，起始不能有“/” */
var _MULTI_NO_CHECKED_IMAGE   = "images/no_checked.gif";
var _MULTI_CHECKED_IMAGE      = "images/checked.gif";
var _MULTI_HALF_CHECKED_IMAGE = "images/half_checked.gif";
var _SINGLE_NO_SELECTED_IMAGE = "images/no_selected.gif";
var _SINGLE_SELECTED_IMAGE    = "images/selected.gif";
var _MULTI_CAN_NOT_CHECK_IMAGE  = "images/checkbox_disabled.gif";
var _RADIO_CAN_NOT_SELECT_IMAGE = "images/radio_disabled.gif";

/* 伸缩状态图标地址 */
var _TREE_NODE_CONTRACT_IMAGE = "images/contract.gif";
var _TREE_NODE_EXPAND_IMAGE   = "images/expand.gif";
var _TREE_NODE_LEAF_IMAGE     = "images/leaf.gif";
var _TREE_ROOT_CONTRACT_IMAGE = "images/root_contract.gif";
var _TREE_ROOT_EXPAND_IMAGE   = "images/root_expand.gif";
var _TREE_ROOT_NODE_LEAF_IMAGE= "images/root_leaf.gif";

/* Tree相关样式名称 */
var _TREE_WAIT_LOAD_DATA_MSG = '<span style="margin:5 0 0 8;font-size:12px;color:#666">正在加载数据...</span>';
var _TREE_NODE_MOVE_TO_LINE_STYLE = "1px solid #333399"; // 目标节点划线样式
var _TREE_NODE_MOVE_TO_HIDDEN_LINE_STYLE = "1px solid #ffffff"; // 目标节点隐藏划线样式

var _TREE_STYLE = "Tree"; // 控件样式名
var _TREE_NODE_OVER_STYLE       = "hover";    // 鼠标移到节点上方样式
var _TREE_NODE_MOVED_STYLE      = "moved";    // 节点移动样式名称
var _TREE_NODE_FINDED_STYLE     = "finded";   // 查询结果节点样式名称
var _TREE_NODE_SELECTED_STYLE   = "selected"; // 节点选中样式名称
var _TREE_NODE_ICON_STYLE       = "icon";     // 节点自定义图标样式名称
var _TREE_NODE_FOLDER_STYLE     = "folder";   // 节点伸缩图标样式名称
var _TREE_NODE_CHECK_TYPE_STYLE = "checkType";// 节点选择状态图标样式名称

/*
 * 节点显示的行高（象素），只用于计算显示的行数，不能控制显示时行的高度
 * 如果要修改显示的行高，修改样式文件
 */
var _TREE_NODE_HEIGHT = 21;	
var _TREE_SCROLL_BAR_WIDTH = 18;  // 滚动条的宽度（象素）
var _TREE_BOX_MIN_WIDTH  = 200;   // 树控件显示区最小宽度（象素）
var _TREE_BOX_MIN_HEIGHT = 400;   // 树控件显示区最小高度（象素）

var _TREE_SCROLL_DELAY_TIME = 0;          // 滚动条的滚动事件延迟时间（毫妙）
var _TREE_SCROLL_REPEAT_DELAY_TIME = 300; // 拖动节点到最上、下行时循环滚动事件每次延迟时间（毫妙）

/* 节点自定义图标尺寸 */
var _TREE_NODE_ICON_WIDTH = 16;
var _TREE_NODE_ICON_HEIGHT = 16;
var _TREE_NODE_ICON_ATTRIBUTE = "icon"; // 节点自定义图标属性名


var TreeCache = new Collection();

function $T(treeId, dataXML) {
	var tree = TreeCache.get(treeId);
	if( tree == null || dataXML ) {
		var element = $$(treeId);
		element._dataXML = (typeof(dataXML) == 'string') ? dataXML : dataXML.toXml();

		var _treeType = element.getAttribute(_TREE_TREE_TYPE);
		if(_treeType == _TREE_TYPE_MULTI) {
			tree = new MultiCheckTree(element);
		} 
		else {
			tree = new SingleCheckTree(element);
		}
		
		TreeCache.add(element.id, tree);
	}

	return tree;
}


/*
 * 对象名称：Tree	
 */
var Tree = function(element) {	
	this._baseUrl    = element.getAttribute(_TREE_BASE_URL);
	this._treeType    = element.getAttribute(_TREE_TREE_TYPE) ||  _TREE_TYPE_SINGLE;
	this._canMoveNode = element.getAttribute(_TREE_CAN_MOVE_NODE) || "false";
	this._justSelectSelf = element.getAttribute(_TREE_JUST_SELECT_SELF) || "false";
	this._focusNewNode   = element.getAttribute(_TREE_FOCUS_NEW_NODE) || "true";
		
	/*  自定义事件 */
	var eventTreeReady       = new EventFirer(element, "onLoad");
	var eventTreeChange      = new EventFirer(element, "onChange");
	var eventNodeActived     = new EventFirer(element, "onTreeNodeActived"); 
	var eventNodeDoubleClick = new EventFirer(element, "onTreeNodeDoubleClick");
	var eventNodeRightClick  = new EventFirer(element, "onTreeNodeRightClick");
	var eventNodeMoved       = new EventFirer(element, "onTreeNodeMoved");
	
	this.element = element;
	this.element.className = _TREE_STYLE;	

	var _treeXMLDom;
	this.activedNode;
		
	this.init = function() {	
		this.loadData(this.element._dataXML);
	
		this.display   = new TreeDisplay();
		this.searchObj = new Search();		
		
		this.reload();
	
		this.element._dataXML = "";
		this.element.isLoaded = true; // 增加isLoaded属性表示是否初始化完成	

		eventTreeReady.fire(createEventObject()); // 触发载入完成事件		
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
	
	this.isMenu = function() {
		return element.getAttribute(_TREE_TREE_TYPE) == _TREE_TYPE_MENU;
	}
	
	/* 获取数据的根节点 */
	this.getXmlRoot = function () {
		return _treeXMLDom || loadXmlToNode("<actionSet/>");
	}

	/* 设定当前高亮（激活）的节点 */
	this.setActiveNode = function (treeNode) {
	    this.activedNode = treeNode.getXmlNode();

		var eventObj = createEventObject();
		eventObj.treeNode = treeNode;
		eventNodeActived.fire(eventObj);  // 触发事件	
	}
 
	this.setTreeType = function(value) {
		_treeType = value;
	}
	
	/* 判断节点是否高亮（激活） */
	this.isActiveNode = function (node) {
	    return this.activedNode == node;
	}

	/* 判断节点是否为被拖动的节点 */
	this.isMovedNode = function (node) {
	    return this.movedNode == node;
	}

	/* 判断节点是否为查选结果节点 */
	this.isFindedNode = function (node) {
	    return this.findedNode == node;
	}

	/* 获取节点文字链接的样式名  */
	this.getStyleClass = function (node, defaultStyle) {
		if(this.isMovedNode(node)) {
			return _TREE_NODE_MOVED_STYLE;
		} else if(this.isActiveNode(node)) {
			return _TREE_NODE_SELECTED_STYLE;
		} else if(this.isFindedNode(node)) {
			return _TREE_NODE_FINDED_STYLE;
		}
		return defaultStyle;
	}
	
	/* 设定被拖动的节点 */
	this.setMovedNode = function (node) {
	    this.movedNode = node;
	}

	/* 树是否可以移动节点 */
	this.isCanMoveNode = function () {
	    return this._canMoveNode == "true";
	}

	/*
	 * 新增节点后，是否需要将焦点移到新节点上
	 * 返回值：	true	需要移到新节点上
	 *			false	不需要移到新节点上
	 */
	this.isFocusNewTreeNode = function() {
		return this._focusNewNode == "true";
	}

	/* 设定查询结果中的当前节点为特殊高亮显示 */
	this.setFindedNode = function (node) {
	    this.findedNode = node;
	}

	var treeThis = this;


	/********************************  对象名称：Row *********************************************************
			  职责：负责页面上tr对象中显示节点。 只要给定一个xml节点，此对象负责将节点显示到对应的tr中
	*********************************************************************************************************/
 
	var Row = function(tr) {
		this.row = tr;

		/*
		 * 重新展示树节点
		 * 参数：	node	树节点的xml节点
		 */
		this.initRow = function (node) {
			this.node = node;
		
			if(this.nobr == null) {
				var tdCell = this.row.cells[0];
				if(tdCell.firstChild) {
					Element.removeNode(tdCell.firstChild);
				}
				this.nobr = createObjByTagName("nobr");
				tdCell.appendChild(this.nobr);				
				
				this.line   = this.nobr.appendChild(createObjByTagName("span"));
				this.folder = this.nobr.appendChild(createObjByTagName("img", _TREE_NODE_FOLDER_STYLE));
				this.icon   = this.nobr.appendChild(createObjByTagName("img", _TREE_NODE_ICON_STYLE));
				this.label  = this.nobr.appendChild(createObjByTagName("a")); 
				if( !treeThis.isMenu() ) {
					this.checkType = this.nobr.appendChild(createObjByTagName("img", _TREE_NODE_CHECK_TYPE_STYLE));
				}	
			}
			
			if(node == null) {
				this.setClassName();
				Element.removeNode(this.nobr);			
				this.nobr = this.line = this.folder = this.icon = this.checkType = this.label = this.node = null;
				return;
			}
			
			this.line.innerHTML = getFrontStr(this.row, node, treeThis.getXmlRoot());
			
			/* 设置伸缩图标 */
			var hasChild = node.hasChildNodes() || node.getAttribute("hasChild") == "1";
			var isOpen = node.getAttribute("_open") == "true";
			
			var folderImage;
			if( node.parentNode && treeThis.getXmlRoot() == node.parentNode) { // 是第一层树节点
				folderImage = hasChild ? (isOpen ? _TREE_ROOT_CONTRACT_IMAGE : _TREE_ROOT_EXPAND_IMAGE) : _TREE_ROOT_NODE_LEAF_IMAGE;
			} 
			else {
				folderImage = hasChild ? (isOpen ? _TREE_NODE_CONTRACT_IMAGE : _TREE_NODE_EXPAND_IMAGE) : _TREE_NODE_LEAF_IMAGE;		
			}
			this.folder.src = treeThis._baseUrl  + folderImage;

			/* 设置自定义图标 */
			var iconSrc = node.getAttribute(_TREE_NODE_ICON_ATTRIBUTE);
			if( !isNullOrEmpty(iconSrc) ) {
				this.icon.src    = iconSrc;
				this.icon.width  = _TREE_NODE_ICON_WIDTH;
				this.icon.height = _TREE_NODE_ICON_HEIGHT;
				this.icon.style.display = "";
			} else {
				this.icon.style.display = "none";
			}

			/* 设定文字链接 */
			var name        = node.getAttribute(_TREE_NODE_NAME);
			var disabled    = node.getAttribute(_TREE_NODE_STATE);
			var canSelected = node.getAttribute(_TREE_NODE_CANSELECTED);
			
			this.label.innerText = name;
			this.label.title = name;
			this.label.setAttribute(_TREE_NODE_STATE, (disabled == '1' || canSelected == '0'));
			
			this.setClassName(treeThis.getStyleClass(node));

			if( !treeThis.isMenu() ) {
				this.checkType.src = treeThis.getCheckTypeImageSrc(node);
			}
		}
	 
		/*
		 * 创建页面显示的元素
		 * 参数：	name	对象标记名(小写)
		 *			className	样式类型名
		 * 返回值：页面元素对象
		 */
		function createObjByTagName(name, className) {
			var obj = Element.createElement(name, className);
			if( name == "a" ) {
				obj.setAttribute("hideFocus", "1");
				obj.setAttribute("href", "");
			}
			return obj;
		}
 
		/* 设定文字链接的样式 */
		this.setClassName = function (className) {
			if( isNullOrEmpty(className) ) {
				this.row.className = this.label.className = "";
			} 
			else {
				this.row.className = this.label.className = className;
			}
		}

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
	}

	/********************* 对象名称：TreeDisplay ************************************************															   //
	 *************** 职责：负责处理将用户可视部分的节点显示到页面上。						  
	 ***************       控件一切页面上的元素都有此对象生成和调度（tr对象有Row对象专门处理）****/
	 
	var TreeDisplay = function() {
		var _windowHeight = Math.max(element.offsetHeight - _TREE_SCROLL_BAR_WIDTH, _TREE_BOX_MIN_HEIGHT);
		var _windowWidth  = Math.max(element.offsetWidth  - _TREE_SCROLL_BAR_WIDTH, _TREE_BOX_MIN_WIDTH);
		var _pageSize     = Math.floor(_windowHeight / _TREE_NODE_HEIGHT);

		var _totalTreeNodes = treeThis.getXmlRoot().selectNodes(".//treeNode[../@_open='true' or @id='_rootId']");
		var _totalTreeNodesNum = _totalTreeNodes.length;
		
		var _startNum;
		var _scrollTimer;
		
		element.style.overflow = 'hidden'; // 溢出部分会被隐藏
		element.innerHTML = "";
		
		var treeId = element.id;
		var _vScrollBoxName = treeId + "VScrollBox"; 
		var _vScrollDivName = treeId + "VScrollDiv"; 
		var _hScrollBoxName = treeId + "HScrollBox"; 
		var _hScrollDivName = treeId + "HScrollDiv"; 
		var _rootBoxName    = treeId + "RootBox"; 
		var _rootTableName  = treeId + "RootTable"; 

		// 生成滚动条
		var vScrollStr = '<div class="VScrollBox" id="' + _vScrollBoxName + '"><div id="' + _vScrollDivName + '" style="width:1px"></div></div>';
		var hScrollStr = '<div class="HScrollBox" id="' + _hScrollBoxName + '"><div id="' + _hScrollDivName + '" style="height:1px"></div></div>';
		element.insertAdjacentHTML('afterBegin', vScrollStr + hScrollStr);
 
		// 生成页面上显示节点的table对象。
		var tableStr = '<div class="RootBox" id="' + _rootBoxName + '"><table id="' + _rootTableName + '"></table></div>';
		element.insertAdjacentHTML('afterBegin', tableStr);

		var _vScrollBox = $$(_vScrollBoxName);
		var _vScrollDiv = $$(_vScrollDivName);
		var _hScrollBox = $$(_hScrollBoxName);
		var _hScrollDiv = $$(_hScrollDivName);
		var _rootBox   = $$(_rootBoxName);
		var _rootTable = $$(_rootTableName);

		var _Rows = new Array(_pageSize);
		for(var i = 0; i < _pageSize; i++) {
			var tr = _rootTable.insertRow(i);
			var cell = tr.insertCell();

			_Rows[i] = new Row(tr, treeThis);
		}
		
		/*
		 * 纵向滚动事件触发后，延时执行reload，如果第二次触发时，上次的事件还没有执行，
		 * 则取消上次事件，触发本次事件。为的是防止多次触发，屏幕抖动。
		 */
		_vScrollBox.onscroll = function() {
			if (_scrollTimer) {
				window.clearTimeout(_scrollTimer);
			}
			_scrollTimer = window.setTimeout(refresh, _TREE_SCROLL_DELAY_TIME);
		};
		_vScrollBox.style.height = _windowHeight; // 设置滚动条的长度
		_vScrollDiv.style.height = (_totalTreeNodesNum - _pageSize) * _TREE_NODE_HEIGHT + _windowHeight;
		
		/* 横向滚动事件 */
		_hScrollBox.onscroll = function() {
			_rootBox.scrollLeft = this.scrollLeft;
		};
		_hScrollBox.style.width = _windowWidth;
		_hScrollDiv.style.width = _rootTable.style.width; 
		
		// 设置显示节点的table对象的大小
		_rootBox.style.height = _windowHeight;
		_rootBox.style.width  = _windowWidth;
		element.style.display = "inline-block"; // TODO 

		/* 当窗口大小改变后，初始化所有相关参数，并且重新计算所要显示的节点。*/
		element.onresize = function () {
			// 增加延时，避免极短时间内重复触发多次
			clearTimeout(this._resizeTimeout);
			
			this._resizeTimeout = setTimeout( function() {
				var tempWindowHeight = Math.max(element.offsetHeight - _TREE_SCROLL_BAR_WIDTH, _TREE_BOX_MIN_HEIGHT);
				var tempWindowWidth  = Math.max(element.offsetWidth  - _TREE_SCROLL_BAR_WIDTH, _TREE_BOX_MIN_WIDTH);
				if(_windowHeight == tempWindowHeight && _windowWidth == tempWindowWidth) {
					return ; // 触发前后尺寸无变化
				}

				_windowHeight = tempWindowHeight;
				_windowWidth = tempWindowWidth;
					
				var pageSize = Math.floor(_windowHeight / _TREE_NODE_HEIGHT);
				_vScrollBox.style.height = _windowHeight;
				_hScrollBox.style.width  = _windowWidth;

				_rootBox.style.height = _windowHeight;
				_rootBox.style.width  = _windowWidth;
				
				if(pageSize == _pageSize) {
					refreshUI();
					return;
				}

				// 修正尺寸变化时行数显示错误问题
				_Rows = new Array(pageSize);
				if(pageSize > _pageSize) { // 高度增加时
					for(var i = 0; i < pageSize; i++) {
						if(i < _pageSize) {
							var tr = _rootTable.rows[i];
						} else {
							var tr = _rootTable.insertRow();
							tr.insertCell();
						}
						_Rows[i] = new Row(tr);
					}
				}
				else if (pageSize < _pageSize) { // 高度减少时				
					for(var i = 0; i < pageSize; i++) {
						var tr = _rootTable.rows[i];
						_Rows[i] = new Row(tr, treeThis);
					}
					for(var i = pageSize; i < _pageSize; i++) {
						_rootTable.deleteRow(pageSize);
					}
				}
				_pageSize = pageSize;
				refresh();
			}, 100);
		}
		
		element.onmousewheel = function() {
			_vScrollBox.scrollTop += -Math.round(window.event.wheelDelta / 120) * _TREE_NODE_HEIGHT;
		}
		
		element.onkeydown = function() {
			switch (event.keyCode) {
				case 33:	//PageUp
					_vScrollBox.scrollTop -= _pageSize * _TREE_NODE_HEIGHT; 
					return false;
				case 34:	//PageDown
					_vScrollBox.scrollTop += _pageSize * _TREE_NODE_HEIGHT;
					return false;
				case 35:	//End
					_vScrollBox.scrollTop = _vScrollDiv.offsetHeight - _windowHeight;
					return false;
				case 36:	//Home
					_vScrollBox.scrollTop = 0;
					return false;
				case 37:	//Left
					_hScrollBox.scrollLeft -= 10;
					return false;
				case 38:	//Up
					_vScrollBox.scrollTop -= _TREE_NODE_HEIGHT;
					return false;
				case 39:	//Right
					_hScrollBox.scrollLeft += 10;
					return false;
				case 40:	//Down
					_vScrollBox.scrollTop += _TREE_NODE_HEIGHT;
					return false;
			}
		}
	 
		/* 根据滚动状态，显示可视范围内的树节点。*/
		function refresh() {
			var startTime = new Date();
			if(_totalTreeNodesNum <= _pageSize) {
				_startNum = 0;
			} else {
				_startNum = Math.ceil(_vScrollBox.scrollTop  / _TREE_NODE_HEIGHT);
			}
			//显示节点
			for(var i = 0; i < _pageSize; i++) {
				var nodeIndex = i + _startNum;
				if(nodeIndex < _totalTreeNodesNum) {
					_Rows[i].initRow(_totalTreeNodes[nodeIndex]);
				} else {
					_Rows[i].initRow();
				}
			}
			//同步横向滚动条的大小
			_hScrollDiv.style.width = _rootTable.offsetWidth;

			refreshUI();

			window.status = new Date() - startTime;  // 看看效率如何
		}

		this.reload = refresh;
		
		/*
		 * 根据页面上的行数，获取相应的Row对象
		 * 参数：	index	行序号
		 * 返回值：	Row对象/null
		 */
		this.getRowByIndex = function (index) {
			if(index >= _pageSize || index < 0) {
				alert("Tree.Display对象：行序号[" + index + "]超出允许范围[0 - " + _pageSize + "]！");
				return null;
			}
			return _Rows[index];
		}
		
		/* 重新获取所有可以显示的节点数组 */
		this.resetTotalTreeNodes = function() {
			_totalTreeNodes = treeThis.getXmlRoot().selectNodes(".//treeNode[../@_open='true' or @id='_rootId']");
			_totalTreeNodesNum = _totalTreeNodes.length;

			_vScrollDiv.style.height = Math.max(1, (_totalTreeNodesNum - _pageSize) * _TREE_NODE_HEIGHT + _windowHeight);
		}

		/* 将节点滚动到可视范围之内 */
		this.scrollTo = function(node) {
			var nodeIndex = null;
			for(var i = 0; i < _totalTreeNodesNum; i++) {
				if(_totalTreeNodes[i] == node) {
					nodeIndex = i;
					break;
				}
			}
			if(nodeIndex == null) return;

			var childNums = node.selectNodes(".//treeNode[../@_open = 'true']").length;
			if(childNums + 1 > _pageSize || nodeIndex < _startNum  || nodeIndex >= _startNum + _pageSize) {
				_vScrollBox.style.display = 'inline';
				_vScrollBox.scrollTop = nodeIndex * _TREE_NODE_HEIGHT;
			}
			else if (nodeIndex + childNums + 1 - _pageSize > _startNum) {
				_vScrollBox.style.display = 'inline';
				_vScrollBox.scrollTop = (nodeIndex + childNums + 1 - _pageSize) * _TREE_NODE_HEIGHT;
			} 
			else {
				this.reload();
			}
		}
		
		/* 向上滚动一个节点 */
		this.scrollUp = function() {
			_vScrollBox.scrollTop -= _TREE_NODE_HEIGHT;
		}
		
		/* 向下滚动一个节点 */
		this.scrollDown = function() {
			_vScrollBox.scrollTop += _TREE_NODE_HEIGHT;
		}
		
		/* 获取滚动条的位置 */
		this.getScrollTop = function() {
			return _vScrollBox.scrollTop;
		}
		
		/* 刷新页面展示：数据展示框、滚动条等 */
		function refreshUI() {
			if(_totalTreeNodesNum > _pageSize) {
				_vScrollBox.style.display = 'inline';
				_hScrollBox.style.width = _windowWidth;
				_rootBox.style.width = _windowWidth;
			} else {
				_vScrollBox.style.display = 'none';
				_hScrollBox.style.width = _windowWidth + _TREE_SCROLL_BAR_WIDTH;
				_rootBox.style.width = _windowWidth + _TREE_SCROLL_BAR_WIDTH;
			}
			if(_rootTable.offsetWidth > _windowWidth) {
				_hScrollBox.style.display = 'inline-block';
				_vScrollBox.style.height = _windowHeight;
				_rootBox.style.height = _windowHeight;
			}else{
				_hScrollBox.style.display = 'none';
				_vScrollBox.style.height = _windowHeight + _TREE_SCROLL_BAR_WIDTH;
				_rootBox.style.height = _windowHeight + _TREE_SCROLL_BAR_WIDTH;
			}
		}
		
		/* 获取页面上所能展示的行数 */
		this.getPageSize = function () {
			return _pageSize;
		}
	}
 
	/*
	 * 对象说明：负责查询树节点对象的对象
	 * 职责：	 查询树上节点
	 */
	var Search = function() {
		var _findedNodes = new Array();
		var _findedIndex;
		var _findedNode;
		
		/*
		 * 查询得到所有符合要求的结果
		 * 参数：	searchStr	查询的字符串
		 *			exact	    false(模糊)/true(精确)
		 */	
		this.search = function(searchStr, exact) {
			_findedNodes = new Array();
			if(isNullOrEmpty(searchStr)) {
				alert("查询条件不能为空！");
				return false;
			}
			
			if(exact) {
				var xpath = ".//treeNode[@" + _TREE_NODE_NAME + "='" + searchStr + "']";
				_findedNodes = treeThis.getXmlRoot().selectNodes(xpath);
			} else {
				var allNodes = treeThis.getXmlRoot().selectNodes(".//treeNode" );
				for(var i = 0; i < allNodes.length; i++) {	// 模糊查询所有节点
					var fieldValue = allNodes[i].getAttribute(_TREE_NODE_NAME);
					if( fieldValue && fieldValue.indexOf(searchStr) != -1) {
						_findedNodes[_findedNodes.length] = allNodes[i];
					}
				}
			}
			_findedIndex = -1;
			return true;
		}

		/* 是否拥有查询结果 */	
		this.hasResult = function() {
			return _findedNodes.length > 0;
		}

		/* 获取查询得到的第一个结果 */	
		this.first = function () {
			showFindedTreeNode(0);
		}

		/* 获取查询结果的下一个结果 */	
		this.next = function () {
			_findedIndex += 1;
			if(_findedNodes.length <= _findedIndex) {
				_findedIndex = _findedNodes.length - 1;
			}
			showFindedTreeNode(_findedIndex);
		}

		/* 展示查询结果，将查询得到的节点以查询结果特定的样式高亮 */
		function showFindedTreeNode(index) {
			if(_findedNodes.length == 0) {
				this.setFindedNode(null);
				alert("没有查询到相应的结果！");
				return;
			}
			
			_findedNode = _findedNodes[index];
			treeThis.setFindedNode(_findedNode);
			treeNode = instanceTreeNode(_findedNode, treeThis);
			if( treeNode instanceof TreeNode ) {
				treeNode.focus();
				return;
			}
			
			// 没找到则刷新树
			treeThis.reload();
		}
	}				
	
	/********************************************* 以下定义树事件 *********************************************/
	
	/* 鼠标双击响应函数，触发自定义双击事件。 */
	this.element.ondblclick = function() {
		var srcElement = window.event.srcElement;
		var row = getRow(srcElement);
		if(row instanceof Row) {
			var treeNode = instanceTreeNode(row.node, treeThis);
		}
		if( (treeNode instanceof TreeNode) && treeNode.isCanSelected() && (srcElement == row.label || srcElement == row.icon)) {	
			var eventObj = createEventObject();
			eventObj.treeNode = treeNode;
			eventNodeDoubleClick.fire(eventObj);  // 触发双击事件
		}		
	}

	/*
	 * 	鼠标右键单击事件响应函数。
	 *	如果点击的是文字连接，则激活该节点，同时触发右键单击事件。
	 */
	this.element.oncontextmenu = function() {
		var srcElement = window.event.srcElement;
		preventDefault(event);

		var row = getRow(srcElement);
		if(row instanceof Row) {
			var treeNode = instanceTreeNode(row.node, treeThis);
		}
		if( treeNode instanceof TreeNode ) {
			// 设置节点为激活
			if(treeNode.isCanSelected()) {
				treeThis.setActiveNode(treeNode);
			}

			// 触发右键激活节点事件
			var eventObj = createEventObject();
			eventObj.treeNode = treeNode;
			eventObj.clientX = event.clientX;
			eventObj.clientY = event.clientY;
			eventNodeRightClick.fire(eventObj); 

			treeThis.display.reload();  
		}
	}

	/*
	 * 	鼠标单击事件响应函数
	 *			如果点击的是选择状态图标，则改变选择状态，同时根据treeNodeSelectAndActive属性，确定是否同时激活该节点。
	 *			如果点击的是伸缩状态图标，则打开或收缩当前节点的直系子节点。
	 *			如果点击的是文字连接，则激活该节点，同时根据treeNodeSelectAndActive属性，确定是否同时改变节点选择状态。
	 */
	this.element.onclick = function() {
		var srcElement = window.event.srcElement;
		preventDefault(event);

		var row = getRow(srcElement);
		if(row instanceof Row) {
			var treeNode = instanceTreeNode(row.node, treeThis);
		}
		if( treeNode && (treeNode instanceof TreeNode) ) {
			if(srcElement == row.checkType) {		// 根据不同的treeType，改变相应的选择状态
				treeNode.changeSelectedState(window.event.shiftKey); // 是否按下shift键
			}
			else if(srcElement == row.folder) {
				treeNode.changeFolderState();	//展开、收缩节点的直系子节点
			}
			else if(srcElement == row.label || srcElement == row.icon) {
				treeNode.setActive(window.event.shiftKey); //激活节点
			}
			treeThis.display.reload();
		}
	}

	/*  鼠标移到元素上。*/
	this.element.onmouseover = function() {
		var srcElement = window.event.srcElement;
		var row = getRow(srcElement);
		if( (row instanceof Row) && row.label == srcElement) {
			row.setClassName(treeThis.getStyleClass(row.node, _TREE_NODE_OVER_STYLE));
		}
	}

	/* 鼠标离开元素时。*/
	this.element.onmouseout = function() {
		var srcElement = window.event.srcElement;
		var row = getRow(srcElement);
		if( (row instanceof Row) && row.label == srcElement) {
			row.setClassName(treeThis.getStyleClass(row.node));
		}	
	}

	/********************************************* 节点拖动相关事件 *********************************************/

	/* 开始拖动事件响应，设定拖动节点 */
	this.element.ondragstart = function() {
		if( !treeThis.isCanMoveNode() ) return;

		var srcElement = window.event.srcElement;
		var row = getRow(srcElement);
		if( (row instanceof Row) && row.label == srcElement) {
			var node = row.node;	
			treeThis.setMovedNode(node); //设定拖动节点
			
			var tempData = {};
			tempData.moveTree = element;
			tempData.movedNode = node;
			tempData.movedNodeScrollTop = treeThis.display.getScrollTop() + getTop(srcElement, treeThis.element);
			tempData.movedRow = srcElement;
			window._dataTransfer = tempData;

			row.setClassName(_TREE_NODE_MOVED_STYLE);
			window.event.dataTransfer.effectAllowed = "move";
		}
	}

	/* 拖动完成，触发自定义节点拖动事件 */
	this.element.ondrop = function() { 		
		if( !treeThis.isCanMoveNode() || window._dataTransfer == null) return;
		
		var srcElement = window.event.srcElement;
		stopScrollTree(srcElement, treeThis);
		
		srcElement.runtimeStyle.borderBottom = _TREE_NODE_MOVE_TO_HIDDEN_LINE_STYLE;
		srcElement.runtimeStyle.borderTop = _TREE_NODE_MOVE_TO_HIDDEN_LINE_STYLE;
		
		//触发自定义事件
		var eObj = createEventObject();
		eObj.movedTreeNode = instanceTreeNode(window._dataTransfer.movedNode, treeThis);
		eObj.toTreeNode    = instanceTreeNode(window._dataTransfer.toNode, treeThis);
		eObj.moveState = window._dataTransfer.moveState;
		eObj.moveTree  = window._dataTransfer.moveTree; // 增加被拖动的节点所在树
		eventNodeMoved.fire(eObj); 
	}

	/* 拖动结束，去除拖动时添加的样式 */
	this.element.ondragend = function() {
		if( !treeThis.isCanMoveNode() ) return;	
		
		var srcElement = window.event.srcElement;
		stopScrollTree(srcElement, treeThis);
		
		var row = getRow(srcElement);
		if( (row instanceof Row) && srcElement == row.label) {
			srcElement.runtimeStyle.borderBottom = _TREE_NODE_MOVE_TO_HIDDEN_LINE_STYLE;
			srcElement.runtimeStyle.borderTop    = _TREE_NODE_MOVE_TO_HIDDEN_LINE_STYLE;
			treeThis.setMovedNode(null);
			treeThis.display.reload();
		}	
	}

	/* 拖动时，鼠标进入节点，设定目标节点和拖动状态  */
	this.element.ondragenter = function() {
		if(!treeThis.isCanMoveNode() || window._dataTransfer == null) return;
		
		var srcElement = window.event.srcElement;	
		startScrollTree(srcElement); //判断是否需要滚动树，如是则相应的滚动
		
		var row = getRow(srcElement);
		if(row instanceof Row) {
			var node = row.node;
		}

		// 拖动的不是文字链接，则无效
		if(!(row instanceof Row) || srcElement != row.label) {	
			return;
		}
		
		// 区分是否同一棵树
		if( window._dataTransfer.moveTree == this ) {
			if(node.parentNode != window._dataTransfer.movedNode.parentNode	// 不是兄弟节点无效
				|| srcElement == window._dataTransfer.movedRow) {	// 目标节点相同无效
				return;
			}
		}

		window._dataTransfer.toNode = node;
		if(treeThis.display.getScrollTop() + getTop(srcElement, treeThis.element) > window._dataTransfer.movedNodeScrollTop) {
			window._dataTransfer.moveState = 1;
			srcElement.runtimeStyle.borderBottom = _TREE_NODE_MOVE_TO_LINE_STYLE;
		} else {
			window._dataTransfer.moveState = -1;
			srcElement.runtimeStyle.borderTop = _TREE_NODE_MOVE_TO_LINE_STYLE;
		}
		preventDefault(event);
		window.event.dataTransfer.dropEffect = "move";
	}
	
	/* 拖拽元素在目标元素头上移动的时候 */
	this.element.ondragover = function() { 		
		preventDefault(event);
	}

	/* 拖动时，鼠标离开节点 */
	this.element.ondragleave = function() {
		if(!treeThis.isCanMoveNode()) return;
		
		var srcElement = window.event.srcElement;
		stopScrollTree(srcElement, treeThis);
		
		var row = getRow(srcElement);
		if( (row instanceof Row) && srcElement != row.label) {
			srcElement.runtimeStyle.borderBottom = _TREE_NODE_MOVE_TO_HIDDEN_LINE_STYLE;
			srcElement.runtimeStyle.borderTop = _TREE_NODE_MOVE_TO_HIDDEN_LINE_STYLE;
			window.event.dataTransfer.dropEffect = "none";
		}	
	}

	/********************************************* 节点拖动结束 *********************************************/
	
	/********************************************* 事件相关函数 *********************************************/
	
	/*
	 * 根据显示的对象，获取相应的Row对象
	 * 参数：	obj	节点显示在页面上的对象
	 * 返回值：	Row对象
	 */
	function getRow(obj) {
		if(!/^(a|img)$/.test(obj.tagName.toLowerCase())) {
			return null;
		}
		 
		try{
			var index = getRowIndex(obj);
			return treeThis.display.getRowByIndex(index);
		} catch(e) {		
		}	
	}
	
	/*
	 * 获取对象在树控件可视区域中的位置（对象上边缘距可视区域上边缘的距离）, 获取对象相对于控件顶部的距离。
	 * 参数：	obj	对象
	 * 返回：	int
	 */
	function getTop(obj, element) {
		var top = 0;
		while (obj && obj != element && obj != document.body) {
			top = top + obj.offsetTop;
			obj = obj.offsetParent;
		}
		return top;
	}

	/*
	 * 如果拖到页面的最上、下方，相应的滚动树
	 * 参数：	obj	事件触发对象
	 */
	function startScrollTree(obj) {
		if(obj == null) return;
		
		if(isLastLine(obj, treeThis.display)) {
			scrollDown(treeThis.element);
		}
		if(isFirstLine(obj)) {
			scrollUp(treeThis.element);
		}
	}

	/* 定时向上滚动 */
	function scrollUp(element) {
		if(element.scroller) {
			clearTimeout(element.scroller);
			element.scroller = null;
		}
		treeThis.display.scrollUp();
		
		element.scroller = setTimeout(scrollUp, _TREE_SCROLL_REPEAT_DELAY_TIME);
	}

	/* 定时向下滚动 */
	function scrollDown(element, display) {
		if(element.scroller ) {
			clearTimeout(element.scroller);
			element.scroller=null;
		}
		display.scrollDown();
		
		element.scroller = setTimeout(scrollDown, _TREE_SCROLL_REPEAT_DELAY_TIME);
	}

	/*
	 * 如果拖到的不是页面的最上、下方，或者停止拖动，则停止滚动树
	 * 参数：	obj	事件触发对象
	 */
	function stopScrollTree(obj) {
		if(obj && (isLastLine(obj, treeThis.display) || isFirstLine(obj))) {
			return;
		}
		
		if (treeThis.element.scroller) {
			window.clearTimeout(treeThis.element.scroller);
			treeThis.element.scroller = null;
		}
	}
	
}

/* 根据id返回TreeNode对象，如果对象不存在，则返回null  */
Tree.prototype.getTreeNodeById = function(id) {
	var node = this.getXmlRoot().selectSingleNode(".//treeNode[@id='" + id + "']");
	return instanceTreeNode(node, this);
}

/*
 * 获取当前高亮（激活）的节点（被激活的节点一次只有一个）。如果没有激活的节点，则返回null。
 */
Tree.prototype.getActiveTreeNode = function () {
	return instanceTreeNode(this.activedNode, this);
}

/*
 * 设定相应id的节点为激活状态。如果相应id的节点尚未被打开，也就是其父节点或父节点的父节点等没有被打开，那么先打开此节点。
 * 参数：id 字符串，所要激活的节点的id，必须提供，否则会报错。
 */
Tree.prototype.setActiveTreeNode = function(id) {
	var treeNode = this.getTreeNodeById(id);
	if(treeNode instanceof TreeNode) {
		treeNode.setActive(); // 激活节点，同时根据treeNodeSelectAndActive属性，确定是否同时改变节点选择状态。
		this.setActiveNode(treeNode); 
		treeNode.focus(); // 打开节点，让节点出现在可视区域内。
	}
}
 
/*
 * 新增子节点，同时激活新节点
 * 参数：	newNodeXML	新节点的xml
 *			parent	    父节点（TreeNode对象）
 * 返回：	true/false
 */
Tree.prototype.insertTreeNodeXml = function(newNode, parent) {
	if( !(parent instanceof TreeNode) ) {
		return false;
	}
	
	var treeNode = parent.appendChild(newNode);	// 新增子节点
	if( !(treeNode instanceof TreeNode) ) {
		return false;
	}
	
	if(this.isFocusNewTreeNode()) {
		treeNode.setActive();	// 激活节点，同时根据treeNodeSelectAndActive属性，确定是否同时改变节点选择状态。
		treeNode.focus();		// 打开节点，让节点出现在可视区域内。
	} else {
		parent.setActive();
		parent.open();
	}
	return true;
}

/* 删除节点  */
Tree.prototype.removeTreeNode = function(treeNode) {
	if( !(treeNode instanceof TreeNode) ) {
		return false;
	}
	
	var result = treeNode.remove();
	this.display.reload();
	return result;
}

/*
 * 跟据目标节点和移动状态，移动节点位置。
 * 参数：	movedTreeNode	移动节点TreeNode对象
 *			toTreeNode		目标节点TreeNode对象
 *			moveState		移动状态，-1为目标节点上方，1为目标节点下方
 */
Tree.prototype.moveTreeNode = function(movedTreeNode, toTreeNode, moveState) {
	if( !this.isCanMoveNode() 
	    || !(movedTreeNode instanceof TreeNode)
		|| !(toTreeNode instanceof TreeNode) ) {
		return false;
	}

	var result = movedTreeNode.moveTo(toTreeNode, moveState);
	this.display.reload();
	return result;
}
		
/*
 * 通过xml字符串，重新载入数据源
 */
Tree.prototype.load = function (dataXML) {
	this.loadData(dataXML);
	this.reload();
	
	//触发载入完成事件
	eventTreeReady.fire(createEventObject()); 
}

Tree.prototype.reload = function () {
	this.display.resetTotalTreeNodes();
	this.display.reload();
}
 
/*
 * 根据给定的数据，处理树节点的默认选中状态
 * 参数: selectedIds	默认选中的数据(id字符串，多个id用“,”隔开)
 *		 clearOldSelected	是否清除原先选中节点
 */
Tree.prototype.loadDefaultCheckedByIds = function(selectedIds, clearOldSelected) {
	if(isNullOrEmpty(selectedIds)) return;
		
	if(this._treeType == _TREE_TYPE_SINGLE) { // 单选树
		eval("var singleID = '" + selectedIds + "';");
		var node = this.getXmlRoot().selectSingleNode("//treeNode[@id='" + singleID + "']");
		var treeNode = instanceTreeNode(node, this);
		if( treeNode ) {
			treeNode.setSelectedState(1, false, true);
			treeNode.focus();
		}
	} else {
		if(clearOldSelected) {
			clearSelected(this.getXmlRoot());
		}
	 
		var checkedNodeIds = selectedIds.split(',');
		for(var i = 0; i < checkedNodeIds.length; i++) {
			var fNode = this.getXmlRoot().selectSingleNode("//treeNode[@id='" + checkedNodeIds[i] + "']");
			if( fNode ) {
				setNodeState(fNode, 1);
			}
		}
	}

	this.reload();
}

/*
 * 获取ids，默认为所有选中状态(全选、半选)的节点id字符串
 * 参数：includeHalfChecked	是否包含半选状态的节点
 * 返回：字符串：id1,id2,id3
 */
Tree.prototype.getIds = function(includeHalfChecked) {
	if(includeHalfChecked) {
		var path = ".//treeNode[@checktype='1' or @checktype='2']";
	} else {
		var path = ".//treeNode[@checktype='1']";
	}

	var idArray = getTreeNodeIds(this.getXmlRoot(), path);
	return idArray.join(",");
}

/* 查询得到所有符合要求的结果 */	
Tree.prototype.searchNode = function(searchStr, exact) {
	if(this.searchObj.search(searchStr, exact)) {
		this.searchObj.first();
	}
}

/* 获取查询结果的下一个结果 */	
Tree.prototype.searchNext = function() {
	this.searchObj.next();
}



var SingleCheckTree = function(element) {
	Tree.call(this, element);
	
	this.setTreeType(_TREE_TYPE_SINGLE);
		
	/* 获取节点的下一选中状态（单选）*/
	this.getNextState = function() {
		return 1;
	};
	
	/* 根据节点选择状态，获取图标地址（单选树）*/
	this.getCheckTypeImageSrc = function(node) {
		var checkType   = node.getAttribute(_TREE_NODE_CHECKTYPE);
		var canSelected = node.getAttribute(_TREE_NODE_CANSELECTED);
		if(canSelected == 0) {
			return this._baseUrl + _RADIO_CAN_NOT_SELECT_IMAGE;
		}
		if(checkType == 1) {
			return this._baseUrl + _SINGLE_SELECTED_IMAGE;
		}
		return this._baseUrl + _SINGLE_NO_SELECTED_IMAGE;
	};

	/* 清除特定节点以外的其他节点的选中状态 */
	this.refreshStates = function(treeNode) {
		var childNodes = this.getXmlRoot().selectNodes(".//treeNode[@checktype='1']");
		for(var i = 0; i < childNodes.length; i++) {
			if(childNodes[i] != treeNode.getXmlNode()) {
				setNodeState(childNodes[i], "0");
			}
		}
	};
	
	/* 获取选中节点的TreeNode对象（单选树） */
	this.getSelectedTreeNode = function(includeHalfChecked) {
		var node = this.getSelectedXmlNode(includeHalfChecked);
		return instanceTreeNode(node, this);
	};
	
	/* 获取选中节点的Xml对象（单选树） */
	this.getSelectedXmlNode = function(includeHalfChecked) {
		return this.getXmlRoot().selectSingleNode(".//treeNode[@checktype='1']");
	};
	
	this.init();
}
SingleCheckTree.prototype = Tree.prototype;


var MultiCheckTree = function(element) {
	Tree.call(this, element);
	
	this.setTreeType(_TREE_TYPE_MULTI);

	/* 获取节点的下一选中状态（多选1、2 -> 0; 0 -> 1）*/
	this.getNextState = function (treeNode) {
		if(/^(2|1)$/.test(treeNode.getSelectedState())) {	// 半选、全选时，置为不选
			return 0;
		}	
		return 1;	// 不选时，置为全选
	};		
	
	/* 根据节点选择状态，获取图标地址（多选树） */
	this.getCheckTypeImageSrc = function(node) {
		var checkType   = node.getAttribute(_TREE_NODE_CHECKTYPE);
		var canSelected = node.getAttribute(_TREE_NODE_CANSELECTED);
		if(canSelected == 0) {
			return this._baseUrl + _MULTI_CAN_NOT_CHECK_IMAGE;
		}
		if(checkType == 1) {
			return this._baseUrl + _MULTI_CHECKED_IMAGE;
		}
		if(checkType == 2) {
			return this._baseUrl + _MULTI_HALF_CHECKED_IMAGE;
		}
		return this._baseUrl + _MULTI_NO_CHECKED_IMAGE;
	};
	
	/*
	 * 刷新相关节点的选中状态（多选树），同时根据参数决定是否激活当前节点
	 * 参数：	treeNode	TreeNode节点对象
	 *			noChildren	选中节点时，不包含子节点
	 */
	this.refreshStates = function (treeNode, noChildren) {
		if (this._justSelectSelf == "true") {
			return;
		}

		refreshParentNodeState(treeNode.getXmlNode(), this);

		if(noChildren && treeNode.getSelectedState() == 2) {
			return;
		}
		refreshChildrenNodeState(treeNode.getXmlNode());
	}
	
	/*
	 * 获取选中节点的TreeNode对象数组（多选树）
	 * 参数：	includeHalfChecked	是否包含半选节点
	 * 返回值：	TreeNode对象数组，数组对象还提供toElement方法，将数组直接转换成xml字符串。
	 */
	this.getSelectedTreeNode = function (includeHalfChecked) {	
		var treeNodeArray = this.getSelectedXmlNode(includeHalfChecked);			
		for(var i = 0; i < treeNodeArray.length; i++) {
			treeNodeArray[i] = instanceTreeNode(treeNodeArray[i], this);
		}
			
		return treeNodeArray;
	}
	
	/*
	 * 获取选中节点的Xml对象数组（多选树）
	 * 参数：	includeHalfChecked	是否包含半选节点
	 * 返回值：	xmlNode对象数组，数组对象还提供toElement方法，将数组直接转换成xml字符串。
	 */
	this.getSelectedXmlNode  = function (includeHalfChecked) {	
		var treeNodes;
		if(includeHalfChecked) { // 包括半选状态
			treeNodes = this.getXmlRoot().selectNodes(".//treeNode[@checktype='1' or @checktype='2']");
		} else { // 不包括半选状态
			treeNodes = this.getXmlRoot().selectNodes(".//treeNode[@checktype='1']");
		}
		
		var treeNodeArray = new Array();
		for(var i = 0; i < treeNodes.length; i++) {
			treeNodeArray[i] = treeNodes[i];
		}
		try{
			treeNodeArray.rootNode = this.getXmlRoot().cloneNode(false); // 获取actionSet节点
		} catch(e) {
			throw(e);
		}
		
		/* 
		 * 给数组提供toElement方法，根据是否包括半选状态，分别以不同的方式返回xml节点。
		 * 如果不包括半选状态的节点，生成的xml将所有TreeNode都放到根节点actionSet节点下；		 
		 * 否则将给出包括全选、半选的所有节点，并按原有的节点层次关系给出xml字符串。
		 */
		treeNodeArray.includeHalfChecked = includeHalfChecked;
		treeNodeArray.toElement = function() {
			for(var i = 0; i < this.length; i++) {				
				var xmlNode = (this[i] instanceof TreeNode) ? this[i].getXmlNode() : this[i];
				var parentNode = this.includeHalfChecked ? xmlNode.parentNode : this.rootNode;
				parentNode.appendChild(xmlNode.cloneNode(false));
			}
			return this.rootNode;
		};
		
		return treeNodeArray;
	}
	
	this.init();
}
MultiCheckTree.prototype = Tree.prototype;

  
///////////////////////////////////////////////////////////////////////////
//	对象名称：TreeNode											         //
//	参数：	node	xml节点                                              //
//  职责：	树节点对象接口。负责处理节点状态变化。	                     //
///////////////////////////////////////////////////////////////////////////
 
/*
 * 根据xml节点获取TreeNode对象的一个实例
 * 参数：	xmlNode	xml节点
 * 返回值：	TreeNode
 */
function instanceTreeNode(xmlNode, treeObj) {
	return xmlNode ? new TreeNode(xmlNode, treeObj) : null;
}


var TreeNode = function (xmlNode, treeObj) {
	this.node = xmlNode;
	this.treeObj = treeObj;
}

TreeNode.prototype = new function() {

	/* 获取xml节点 */
	this.getXmlNode = function() {
		return this.node;
	}

	/* 是否为子节点已经打开的节点 */
	this.isOpened = function() {
		return this.node.getAttribute("_open") == "true";
	}

	/* 是否为可选择节点 */
	this.isCanSelected = function() {
		return this.node.getAttribute(_TREE_NODE_CANSELECTED) != "0";
	}
 
	/* 是否为激活节点 */
	this.isActive = function() {
		return this.treeObj.isActiveNode(this.node);
	}

	/*
	 * 获取节点的选择状态
	 * 返回：	多选树：0/1/2；单选数：1/0
	 */
	this.getSelectedState = function() {
		var state = this.node.getAttribute(_TREE_NODE_CHECKTYPE);
		if(/^(1|2)$/.test(state)) {
			return parseInt(state);
		} 
		return 0;
	}

	/*
	 * 根据现有状态改成下一个选择状态，如为1，2则返回0，否则返回1
	 * 参数：noChildren	选中节点时不包含子节点（按住shift键）
	 */
	this.changeSelectedState = function(noChildren) {
		this.setSelectedState(this.treeObj.getNextState(this), noChildren);
	}
	/*
	 * 设置选中状态，同时刷新相关节点的选择状态
	 * 参数：	state	选择状态
	 *			noChildren	只选中自己节点（不选中子节点）
	 */
	this.setSelectedState = function(state, noChildren) {
		if( !this.isCanSelected() ) {	// 不可选择
			return;
		}

		justSelected(this, state, noChildren);
		
		if( !this.isActive() && state == 1 && (this.treeObj instanceof SingleCheckTree) ) {
			justActive(this);
		}
	}

	/* 获取父节点的TreeNode对象 */
	this.getParent = function() {
		return instanceTreeNode(this.node.parentNode, this.treeObj);
	}
	
	this.getId = function() {
		return this.node.getAttribute(_TREE_NODE_ID);
	}

	this.getName = function() {
		return this.node.getAttribute(_TREE_NODE_NAME);
	}
 
	/*
	 * 激活节点
	 * 参数：noChildren		选中节点时，是否不包含子节点
	 */
	this.setActive = function(noChildren) {
		if( !this.isCanSelected() ) {
			return;
		}
		
        justActive(this);
		justSelected(this, this.treeObj.getNextState(this), noChildren);
	}

	/* 打开节点，让节点出现在可视区域内。*/
	this.focus = function() {
		// 打开未被打开的父节点，父节点的父节点，以此类推。
		openNode(this.node.parentNode);

		var display = this.treeObj.display;
		display.resetTotalTreeNodes();	
		display.scrollTo(this.node); // 如果节点没有在可视区域内，则滚动节点到可是区域
	}
 
	/* 点击文字标签时，改变节点伸缩状态 */
	this.changeFolderStateByActive = function() {
		this.treeObj.changeOpenStateByActive(this);
	}

	/* 改变节点的伸缩状态 */
	this.changeFolderState = function() {
		if(this.isOpened()) {	
			this.close();	// 关闭子节点
		} 
		else {
			this.open();	// 打开子节点
		}
	}

	/* 打开子节点, 如果节点或其打开的子节点没有在可视区域内，则滚动节点使其及其子节点全部出现在可视区或使其在最上端 */
	this.open = function() {
		this.node.setAttribute("_open", "true");	// 标记当前节点为打开状态

		// 此节点打开，打开因此节点关闭而关闭的子枝节点，同时去除标记。
		openChildNodesCloseByThisNode(this.node);

		var display = this.treeObj.display;
		display.resetTotalTreeNodes();	
		display.scrollTo(this.node);
		
	}

	/* 关闭子节点 */
	this.close = function() {
		this.node.setAttribute("_open", "false");	//标记当前节点为关闭状态

		//此节点关闭，关闭此节点的打开的子枝节点，同时标记关闭的原因。
		closeOpendChildNodes(this.node);

		this.treeObj.display.resetTotalTreeNodes();
	}

	/* 删除当前节点  */
	this.remove = function() {
		this.node.parentNode.removeChild(this.node); // 删除xml中的此节点
		this.treeObj.display.resetTotalTreeNodes();
		return true;
	}
 
	this.appendChild = function(newNode) {	
		return this._appendChild(newNode, this.node);
	}
 
	this.appendRoot = function(newNode) {
		return this._appendChild(newNode, this.getXmlRoot());
	}
	
	this._appendChild = function(newNode, parent) {	
		if( newNode == null || newNode.nodeName != _TREE_NODE ) {
			alert("TreeNode对象：新增节点xml数据不能正常解析！");
			return null;
		}

		if(newNode instanceof XmlNode) {
			newNode = newNode.node;
		}
		
		parent.appendChild(newNode); // 添加子节点
		var treeNode = instanceTreeNode(newNode, this.treeObj);
		if(treeNode instanceof TreeNode) {
			refreshStatesByNode(treeNode);		// 根据新节点的选择状态刷新相关节点
		}
		this.treeObj.display.resetTotalTreeNodes();

		return treeNode;
	}
	
	/*
	 * 移动当前节点
	 * 参数：	toTreeNode	目标节点的TreeNode对象
	 *			moveState	移动状态：-1，移动到目标节点的上面，1，移动到目标节点的下面，1为缺省状态
	 * 返回：	true/false	是否移动节点成功
	 */
	this.moveTo = function(toTreeNode, moveState) {
		if( !(toTreeNode instanceof TreeNode) || this.node.parentNode == null ) {
			return false;
		}
		
		var beforeNode = (moveState == -1) ? toTreeNode.getXmlNode() : toTreeNode.getXmlNode().nextSibling;
		toTreeNode.getXmlNode().parentNode.insertBefore(this.node, beforeNode);
		
		this.treeObj.display.resetTotalTreeNodes();
		return true;
	}

	/* 获取当前节点的XML节点对象，该对象是一个浅拷贝对象（不包含当前节点子节点）。*/
	this.toElement = function() {
		return this.node.cloneNode(false);
	}
 
	this.toString = function() {
		return this.toElement().xml;
	}

	/* 获取节点属性值 */
	this.getAttribute = function(name) {
		return this.node.getAttribute(name);
	}

	/* 设置节点属性值 */
	this.setAttribute = function(name, value) {
		value = value || "";

		if(name == _TREE_NODE_CHECKTYPE) { //修改checkType
			this.setSelectedState(value);
		} 
		else {	// 修改其他属性
			this.node.setAttribute(name, value);
		}
	}

	/* 打开因此节点关闭而关闭的节点，即子节点本身是打开的，只是此节点关闭才不显示的 */
	function openChildNodesCloseByThisNode(node) {
		var nodes = node.selectNodes(".//treeNode[@_closeBy = '" + node.getAttribute(_TREE_NODE_ID) + "']");
		for(var i = 0; i < nodes.length; i++) {
			nodes[i].setAttribute("_open", "true");
			nodes[i].removeAttribute("_closeBy");	//去除因父节点关闭而不显示的标记
		}
	}

	/* 关闭此节点下已经打开的子节点，即此节点关闭的话，打开的字节点也应关闭 */
	function closeOpendChildNodes(node) {
		var nodes = node.selectNodes(".//treeNode[@_open = 'true']");
		for(var i = 0; i < nodes.length; i++) {
			nodes[i].setAttribute("_open", "false");
			nodes[i].setAttribute("_closeBy", node.getAttribute(_TREE_NODE_ID));	// 因此节点关闭而不显示
		}
	}

	/* 激活节点，触发相应事件 */
	function justActive(treeNode) {
		treeNode.treeObj.setActiveNode(treeNode);	
	}

	/* 选中节点 */
	function justSelected(treeNode, state, noChildren) {
        if( !treeNode.treeObj.isMenu() ) {
            if(state == 1 && noChildren && treeNode.node.hasChildNodes()) {
                setNodeState(treeNode.node, 2);
            } else {
                setNodeState(treeNode.node, state);
            }
			
			// 刷新相应节点的选中状态
            refreshStatesByNode(treeNode, noChildren);	 
        }
	}
	
	/*
	 * 根据给定的节点的选中状态，刷新相应节点的选中状态
	 * 参数：	TreeNode节点对象
	 *			noChildren	选中节点时，只选中自己节点，不影响子节点
	 */
	function refreshStatesByNode(treeNode, noChildren) {
		treeNode.treeObj.refreshStates(treeNode, noChildren);
	}
}

//////////////////////////////////////////////////////////////////////////////
//		                       公用函数	   	                                //
//////////////////////////////////////////////////////////////////////////////

/*
 * 判断节点是否为父节点的最后一个节点
 * 参数：node	xml节点对象
 * 返回值：true/false
 */
function isLastChild(node) {
	return node == node.parentNode.lastChild;
}

/*
 * 打开默认打开节点
 * 参数：	openedNode	xml对象中需要打开的节点
 */
function openNode(openedNode) {
	while( openedNode ) {
		openedNode.setAttribute("_open", "true");
		if(openedNode.getAttribute(_TREE_NODE_ID) == _TREE_ROOT_NODE_ID || openedNode.tagName != _TREE_NODE) {
			return;
		}
		openedNode = openedNode.parentNode;
	}
}

/*
 * 设定节点的选择状态。
 * 参数：	node			节点的xml对象
 *			state			选择状态
 */
function setNodeState(node, state) {
	if(node == null) return;

	if( state ) {
		node.setAttribute(_TREE_NODE_CHECKTYPE, state);	//在xml节点中标记选择状态
	} else { 
		node.removeAttribute(_TREE_NODE_CHECKTYPE);
	}
}

/* 刷新所有子节点 */
function refreshChildrenNodeState(node) {
	var childNodes = node.selectNodes(".//treeNode" );
	for(var i = 0; i < childNodes.length; i++) {
		setNodeState(childNodes[i], node.getAttribute(_TREE_NODE_CHECKTYPE));
	}
}

/* 去除所有选中节点的选中状态(包括半选和全选) */
function clearSelected(node) {
	var nodes = node.selectNodes(".//treeNode[@checktype='1' or @checktype='2']");
	for(var i = 0; i < nodes.length; i++) {
		setNodeState(nodes[i], 0);
	}
}

/* 刷新所有父节点的选择状态 */
function refreshParentNodeState(node, treeObj) {
	var parent = node.parentNode;
	while (parent != treeObj.getXmlRoot()) {		
		var nodeChildNum   = parent.childNodes.length;	// 总子节点数
		var checkedNum     = parent.selectNodes("./treeNode[@checktype='1']").length; // 全选子节点数
		var halfCheckedNum = parent.selectNodes("./treeNode[@checktype='2']").length; //半选子节点数
		
		var state;
		if(checkedNum == 0 && halfCheckedNum == 0) {	
			state = 0;	// 所有子节点都没有选中，则parent节点标记为未选中
		}else if(nodeChildNum == checkedNum) {
			state = 1;	// 所有子节点都被全选，则parent节点标记全选
		} else {
			state = 2;  // 否则为半选
		}
	
		setNodeState(parent, state);
		parent = parent.parentNode;
	}
}

/* 获取对象所在行序号 */
function getRowIndex(obj) {
    while( obj.tagName && obj.tagName.toLowerCase() != "tr" ) {
		obj = obj.parentNode;
	}
	return obj.rowIndex;
}

/* 对象是否在最下面的行中 */
function isLastLine(obj, display) {
	return getRowIndex(obj) == (display.getPageSize() - 1);
}

/* 对象是否在最上面的行中 */
function isFirstLine(obj) {
	return getRowIndex(obj) == 0;
}



function getActiveTreeNode(treeName) {
	var tree = $T(treeName || "tree");
	var treeNode = tree.getActiveTreeNode();
	return treeNode; 
}

/*
 *	获取树节点属性
 *	参数：	string:name         属性名
 *	返回值：string:value        属性值
 */
function getTreeAttribute(name, treeName) {
	var treeNode = getActiveTreeNode();
	if( treeNode ) {
		return treeNode.getAttribute(name);
	}
	return null;   
}

function getTreeNodeId() {
	return getTreeAttribute(_TREE_NODE_ID);
}

function getTreeNodeName() {
	return getTreeAttribute(_TREE_NODE_NAME);
}

function isTreeNodeDisabled() {
	return getTreeAttribute(_TREE_NODE_STATE) == "1";
}

function isTreeRoot() {
	return "_rootId" == getTreeNodeId();
}

/*
 *	修改树节点属性
 *	参数：  string:id               树节点id
			string:attrName         属性名
			string:attrValue        属性值
			string:refresh          是否刷新树
 *	返回值：
 */
function modifyTreeNode(id, attrName, attrValue, refresh, treeName) {
	var tree = $T(treeName || "tree");
	var treeNode = tree.getTreeNodeById(id);
	if( treeNode ) {
		treeNode.setAttribute(attrName, attrValue);
	}
	if( refresh ) {
		tree.reload();
	}
}

/*
 *	添加子节点
 *	参数：	string:id           树节点id
			XmlNode:xmlNode     XmlNode实例
 */
function appendTreeNode(id, xmlNode, treeName) {
	var tree = $T(treeName || "tree");
	var treeNode = tree.getTreeNodeById(id);
	if( treeNode && xmlNode ) {
		tree.insertTreeNodeXml(xmlNode, treeNode);
	}
}

/*
 *	获取树全部节点id数组
 *	参数：	XmlNode:xmlNode         XmlNode实例
			string:xpath            选取节点xpath
 *	返回值：Array:Ids               节点id数组
 */
function getTreeNodeIds(xmlNode, xpath) {
	  var idArray = [];
	  var treeNodes = xmlNode.selectNodes(xpath || "./treeNode//treeNode");
	  for(var i=0; i < treeNodes.length; i++) {
		  var curNode = treeNodes[i];
		  var id = curNode.getAttribute(_TREE_NODE_ID);
		  if( id ) {
			  idArray.push(id);
		  }
	  }
	  return idArray;
}
 
/*
 *	清除tree数据
 *	参数：	Element:treeObj         tree控件对象
 */
function clearTreeData(treeObj) {
	var xmlReader = new XmlReader("<actionSet/>");
	var emptyNode = new XmlNode(xmlReader.documentElement);
	treeObj.load(emptyNode.node);
}    

/* 根据条件将部分树节点设置为不可选状态 */
function disableTreeNodes(treeXML, xpath) {
	var nodeLsit = treeXML.selectNodes(xpath);
	if(nodeLsit) {
		for(var i = 0; i < nodeLsit.length; i++) {
			nodeLsit[i].setAttribute("canselected", "0");
		}
	}
}

function disableSingleTreeNode(treeXML, xpath) {
	var node = treeXML.selectSingleNode(xpath);
	if(node) {
		node.setAttribute("canselected", "0");
	}
}
			
/*
 *	删除树选中节点
 *	参数：	Element:treeObj         tree控件对象
			Array:exceptIds         例外的id
 */
function removeTreeNode(treeObj, exceptIds) {
	exceptIds = exceptIds || ["_rootId"];

	var selectedNodes = treeObj.getSelectedTreeNode();
	for(var i=0; i < selectedNodes.length; i++) {
		var curNode = selectedNodes[i];
		var id = curNode.getId();

		var flag = true;
		for(var j=0; j < exceptIds.length; j++) {
			if(id == exceptIds[j]) {
				flag = false;
				break;
			}
		}

		if(flag) {
			treeObj.removeTreeNode(curNode);
		}
	}
}

/*
 *	将树选中节点添加到另一树中(注：过滤重复id节点，并且结果树只有一层结构)
 *	参数：	Element:fromTree         树控件
			Element:toTree           树控件
			Function:checkFunction      检测单个节点是否允许添加
 */
function addTreeNode(fromTree, toTree, checkFunction) {	
	var reload = false;
	var selectedNodes = fromTree.getSelectedTreeNode(false);	
	for(var i=0; i < selectedNodes.length; i++) {
		var curNode = selectedNodes[i];

		if("0" == curNode.getAttribute("canselected")) {
			continue;  // 过滤不可选择的节点
		}

		curNode.setSelectedState(0, true, true);

		if( checkFunction ) {
			var result = checkFunction(curNode);
			if( result && result.error ) {
				// 显示错误信息
				if( result.message ) {
					var balloon = Balloons.create(result.message);
					balloon.dockTo(toTree.element);
				}

				if( result.stop ) {
					return;
				}
				continue;
			}
		}

		var groupName = curNode.getName();
		var id = curNode.getId();

		var sameAttributeTreeNode = hasSameAttributeTreeNode(toTree, _TREE_NODE_ID, id);
		if("_rootId" != id && false == sameAttributeTreeNode) {
			// 至少有一行添加才刷新Tree
			reload = true;

			// 排除子节点
			var treeNode = toTree.getTreeNodeById("_rootId");
			if( treeNode ) {
				var cloneNode = curNode.node.cloneNode(false);
				toTree.insertTreeNodeXml(cloneNode, treeNode);
			}
		}
	}

	if( reload ) {
		toTree.reload();
	}
	fromTree.reload();
}

/*
 *	检测是否有相同属性节点
 *	参数：	Element:treeObj         tree控件对象
			string:attrName         属性名
			string:attrValue        属性值
 */
function hasSameAttributeTreeNode(treeObj, attrName, attrValue) {
	var flag = false;
	var root = treeObj.getTreeNodeById("_rootId").node;
	var treeNode = root.selectSingleNode(".//treeNode[@" + attrName + "='" + attrValue + "']");
	if( treeNode ) {
		flag = true;
		flag.treeNode = treeNode;
	}
	return flag;
}

// 删除选中节点，适用于多层结构树
function delTreeNode(url, treeName) {
	if( !confirm("您确定要删除该节点吗？") )  return;

	var tree = $T(treeName || "tree");
	var treeNode = tree.getActiveTreeNode();
	Ajax({
		url : (url || URL_DELETE_NODE) + treeNode.getId(),
		method : "DELETE",
		onsuccess : function() { 
			var parentNode = treeNode.getParent();
			if( parentNode ) {
				tree.setActiveTreeNode(parentNode.getId());
			}
			tree.removeTreeNode(treeNode);
		}
	});	
}

/*
 *	停用启用节点
 *	参数：	url      请求地址
			state    状态
 */
function stopOrStartTreeNode(state, url, treeName) {		
	var tree = $T(treeName || "tree");
	var treeNode = tree.getActiveTreeNode();
	Ajax({
		url : (url || URL_STOP_NODE) + treeNode.getId() + "/" + state,
		onsuccess : function() { 
			// 刷新父子树节点停用启用状态: 启用上溯，停用下溯
			var curNode = new XmlNode(treeNode.node);
			refreshTreeNodeState(curNode, state);
	
			if("1" == state) {
				var childNodes = curNode.selectNodes(".//treeNode");
				for(var i=0; i < childNodes.length; i++) {                
					refreshTreeNodeState(childNodes[i], state);
				}
			} else if ("0" == state) {
				while( curNode && curNode.getAttribute(_TREE_NODE_ID) > 0 ) {
					refreshTreeNodeState(curNode, state);
					curNode = curNode.getParent();
				}            
			}
			
			tree.reload(); 
		}
	});
}

function refreshTreeNodeState(xmlNode, state) {
	xmlNode.setAttribute(_TREE_NODE_STATE, state);

	var iconPath = xmlNode.getAttribute("icon");
	iconPath = iconPath.replace( /_[0,1].gif/gi, "_" + state + ".gif");
	xmlNode.setAttribute("icon", iconPath); 
}

// 对同层的树节点进行排序
function sortTreeNode(url, eventObj, treeName) {
	var movedNode  = eventObj.movedTreeNode;
	var targetNode = eventObj.toTreeNode;
	var direction  = eventObj.moveState; // -1: 往上, 1: 往下
	var movedNodeID = movedNode.getId();
 
	if(targetNode) {
		Ajax({
			url : url + movedNodeID + "/" + targetNode.getId() + "/" + direction,
			onsuccess : function() { 
				 $T(treeName || "tree").moveTreeNode(movedNode, targetNode, direction);
			}
		});
	}
}

// 移动树节点
function moveTreeNode(tree, id, targetId, url) {
	Ajax({
		url : (url || URL_MOVE_NODE) + id + "/" + targetId,
		onsuccess : function() {  // 移动树节点					
			var treeNode = tree.getTreeNodeById(id);
			var xmlNode = new XmlNode(treeNode.node);
			var parentNode = tree.getTreeNodeById(targetId);

			// 父节点停用则下溯
			var parentNodeState = parentNode.node.getAttribute(_TREE_NODE_STATE);
			if("1" == parentNodeState) {
				refreshTreeNodeState(xmlNode, "1");
			}
			parentNode.node.appendChild(treeNode.node);
			parentNode.node.setAttribute("_open", "true");

			clearOperation(xmlNode);

			tree.reload();
		}
	});
}