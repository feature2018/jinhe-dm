
    /*
     *	核心包相对路径
     */
    URL_CORE = "../../";

    
    /*
     *	后台响应数据节点名称
     */
    XML_TOOLBAR = "ToolBar";
    XML_MAIN_TREE = "ParamTree";
    XML_PARAM_LIST = "ParamList";
    XML_PARAM_INFO = "ParamInfo";
    XML_OPERATION = "Operation";
    XML_PAGE_LIST = "PageList";
    XML_PROPERTY_INFO = "PropertyInfo";
    /*
     *	默认唯一编号名前缀
     */
    CACHE_GRID_ROW_DETAIL = "row__id";
    CACHE_TREE_NODE_DETAIL = "treeNode__id";
    CACHE_VIEW_TREE_NODE_DETAIL = "viewTreeNode__id";
    CACHE_MAIN_TREE = "tree__id";
    CACHE_TOOLBAR = "toolbar__id";
    CACHE_UPLOAD_DETAIL = "upload__id";
    CACHE_TREE_NODE_GRID = "treeNodeGrid__id";
    /*
     *	名称
     */
    OPERATION_ADD = "新增$label";
    OPERATION_VIEW = "查看\"$label\"";
    OPERATION_DEL = "删除\"$label\"";
    OPERATION_EDIT = "编辑\"$label\"";
    OPERATION_IMPORT ="导入\"$label\"";
    /*
     *	XMLHTTP请求地址汇总
     */
    URL_INIT = "data/param_init.xml";
    URL_PARAM_DETAIL = "data/param1.xml";
    URL_TREENODE_DEL = "data/_success.xml";
    URL_TREENODE_DISABLE = "data/_success.xml";
    URL_SAVE_PARAM = "data/_success.xml";
    URL_SORT_PARAM = "data/_success.xml";
    URL_FLUSH_PARAM_CACHE  = "../../../pms/param!flushParamCache.action";
    URL_COPY_PARAM = "data/_success.xml";
    URL_COPY_PARAM_TO = "data/_success.xml";
    URL_MOVE_PARAM_TO = "data/_success.xml";
    URL_GET_OPERATION = "data/operation.xml";

    URL_INIT = URL_CORE + "../param!get2Tree.action";
    URL_PARAM_DETAIL = URL_CORE + "../param!getParamInfo.action";
    URL_TREENODE_DEL = URL_CORE + "../param!delParam.action";
    URL_TREENODE_DISABLE = "../../../param!startOrStopParam.action";
    URL_SAVE_PARAM = URL_CORE + "../param!saveParam.action";
    URL_SORT_PARAM = "../../../param!sortParam.action";
    URL_FLUSH_PARAM_CACHE  = "../../../pms/param!flushParamCache.action";
    URL_COPY_PARAM = "../../../param!copyParam.action";
    URL_COPY_PARAM_TO = "../../../param!copyParam.action";
    URL_MOVE_PARAM_TO = "../../../param!moveParam.action";
    URL_GET_OPERATION = "data/operation.xml";
    /*
     *	延时
     */
    TIMEOUT_TAB_CHANGE = 200;
    /*
     *	icon路径
     */
    ICON = "images/";

    var toolbar = null;

    /*
     *	函数说明：页面初始化
     *	参数：	
     *	返回值：
     */
    function init(){
        initPaletteResize();
        //initUserInfo();
        initToolBar();
        initNaviBar("mod.4");
        initMenus();
        initBlocks();
        initWorkSpace(false);
        initEvents();
        initFocus();

        loadInitData();
    }
    /*
     *	函数说明：页面初始化加载数据(包括工具条、树)
     *	参数：	
     *	返回值：
     */
    function loadInitData(){
        var p = new HttpRequestParams();
        p.url = URL_INIT;

        var request = new HttpRequest(p);
        request.onresult = function(){
            var _operation = this.getNodeValue(XML_OPERATION);

            var groupTreeNode = this.getNodeValue(XML_MAIN_TREE);
            var groupTreeNodeID = CACHE_MAIN_TREE;

            Cache.XmlIslands.add(groupTreeNodeID,groupTreeNode);

            loadToolBar(_operation);
            initTree(groupTreeNodeID);
        }
        request.send();
    }
    /*
     *	函数说明：工具条加载数据
     *	参数：	string:_operation      操作权限
     *	返回值：
     */
    function loadToolBar(_operation){
        var xmlIsland = Cache.XmlIslands.get(CACHE_TOOLBAR);
        if(null==xmlIsland){//还没有就创建

            var str = [];
            str[str.length] = "<toolbar>";

            //公共
            str[str.length] = "    <button id=\"a1\" code=\"p1\" icon=\"" + ICON + "icon_pre.gif\" label=\"上页\" cmd=\"ws.prevTab()\" enable=\"true\"/>";
            str[str.length] = "    <button id=\"a2\" code=\"p2\" icon=\"" + ICON + "icon_next.gif\" label=\"下页\" cmd=\"ws.nextTab()\" enable=\"true\"/>";
            str[str.length] = "    <separator/>";

            //参数管理
            str[str.length] = "    <button id=\"b1\" code=\"2\" icon=\"" + ICON + "start.gif\" label=\"启用\" cmd=\"enableParam()\" enable=\"'_rootId'!=getTreeNodeId() &amp;&amp; '0'!=getTreeNodeDisabled()\"/>";
            str[str.length] = "    <button id=\"b2\" code=\"2\" icon=\"" + ICON + "stop.gif\" label=\"停用\" cmd=\"disableParam()\" enable=\"'_rootId'!=getTreeNodeId() &amp;&amp; '0'==getTreeNodeDisabled()\"/>";
            str[str.length] = "    <button id=\"b4\" code=\"1\" icon=\"" + ICON + "view.gif\" label=\"查看\" cmd=\"editParamInfo(false)\" enable=\"'_rootId'!=getTreeNodeId()\"/>";
            str[str.length] = "    <button id=\"b5\" code=\"2\" icon=\"" + ICON + "edit.gif\" label=\"编辑\" cmd=\"editParamInfo()\" enable=\"'_rootId'!=getTreeNodeId()\"/>";
            str[str.length] = "    <button id=\"b6\" code=\"2\" icon=\"" + ICON + "del.gif\" label=\"删除\" cmd=\"delParam()\" enable=\"'_rootId'!=getTreeNodeId()\"/>";
            str[str.length] = "    <button id=\"b7\" code=\"2\" icon=\"" + ICON + "copy.gif\" label=\"复制\" cmd=\"copyParam()\" enable=\"'_rootId'!=getTreeNodeId()\"/>";
            str[str.length] = "    <button id=\"b8\" code=\"2\" icon=\"" + ICON + "copy_to.gif\" label=\"复制到...\" cmd=\"copyParamTo()\" enable=\"'_rootId'!=getTreeNodeId()\"/>";
            str[str.length] = "    <button id=\"b9\" code=\"2\" icon=\"" + ICON + "move.gif\" label=\"移动到...\" cmd=\"moveParamTo()\" enable=\"'_rootId'!=getTreeNodeId()\"/>";
            str[str.length] = "    <button id=\"b10\" code=\"2\" icon=\"" + ICON + "new_param_group.gif\" label=\"新建参数组\" cmd=\"addNewParam('0')\" enable=\"'0'==getTreeNodeType() || '_rootId'==getTreeNodeId()\"/>";
//            str[str.length] = "    <button id=\"b11\" code=\"2\" icon=\"" + ICON + "new_param.gif\" label=\"新建参数\" cmd=\"addNewParam('0')\" enable=\"'0'==getTreeNodeType()\"/>";
//            str[str.length] = "    <button id=\"b12\" code=\"2\" icon=\"" + ICON + "new_param_item.gif\" label=\"新建参数项\" cmd=\"addNewParam('0')\" enable=\"'0'==getTreeNodeType()\"/>";
            str[str.length] = "</toolbar>";

            var xmlReader = new XmlReader(str.join("\r\n"));
            var xmlNode = new XmlNode(xmlReader.documentElement);

            Cache.XmlIslands.add(CACHE_TOOLBAR,xmlNode);
            xmlIsland = xmlNode;

            //载入工具条
            toolbar.loadXML(xmlIsland);
        }

        //控制显示
        var buttons = xmlIsland.selectNodes("./button");
        for(var i=0,iLen=buttons.length;i<iLen;i++){
            var curButton = buttons[i];
            var id = curButton.getAttribute("id");
            var code = curButton.getAttribute("code");
            var enableStr = curButton.getAttribute("enable");

            var reg = new RegExp("(^"+code+",)|(^"+code+"$)|(,"+code+",)|(,"+code+"$)","gi");
            var visible = false;
            if("string"==typeof(_operation)){
                visible = (true==reg.test(_operation)?true:false);
            }
            toolbar.setVisible(id,visible);

            if(true==visible){
                var enable = Public.execCommand(enableStr);
                toolbar.enable(id,enable);
            }
        }
    }
    /*
     *	函数说明：菜单初始化
     *	参数：	
     *	返回值：
     */
    function initMenus(){
        initTreeMenu();
    }
    /*
     *	函数说明：树菜单初始化
     *	参数：	
     *	返回值：
     */
    function initTreeMenu(){
        var item1 = {
            label:"新建参数",
            callback:null,
            enable:function(){return true;},
            visible:function(){return "0"==getTreeNodeType() && true==getOperation("2");}
        }
        var item2 = {
            label:"删除",
            callback:delParam,
            icon:ICON + "del.gif",
            enable:function(){return true;},
            visible:function(){return "_rootId"!=getTreeNodeId() && true==getOperation("2");}
        }
        var item3 = {
            label:"编辑",
            callback:editParamInfo,
            icon:ICON + "edit.gif",
            enable:function(){return true;},
            visible:function(){return "_rootId"!=getTreeNodeId() && true==getOperation("2");}
        }
        var item4 = {
            label:"启用",
            callback:enableParam,
            icon:ICON + "start.gif",
            enable:function(){return true;},
            visible:function(){return "_rootId"!=getTreeNodeId() && "0"!=getTreeNodeDisabled() && true==getOperation("2");}
        }
        var item5 = {
            label:"停用",
            callback:disableParam,
            icon:ICON + "stop.gif",
            enable:function(){return true;},
            visible:function(){return "_rootId"!=getTreeNodeId() && "0"==getTreeNodeDisabled() && true==getOperation("2");}
        }
        var item7 = {
            label:"新建参数组",
            callback:function(){
                addNewParam("0");
            },
            enable:function(){return true;},
            visible:function(){return ("0"==getTreeNodeType() || "_rootId"==getTreeNodeId()) && true==getOperation("2");}
        }
        var item9={
            label:"复制",
            callback:copyParam,
            icon:ICON + "copy.gif",
            enable:function(){return true;},
            visible:function(){return "_rootId"!=getTreeNodeId() && true==getOperation("2");}
        }
        var item11={
            label:"复制到...",
            callback:copyParamTo,
            icon:ICON + "copy_to.gif",
            enable:function(){return true;},
            visible:function(){return "_rootId"!=getTreeNodeId() && true==getOperation("2");}
        }
        var item12={
            label:"移动到...",
            callback:moveParamTo,
            icon:ICON + "move.gif",
            enable:function(){return true;},
            visible:function(){return "_rootId"!=getTreeNodeId() && true==getOperation("2");}
        }
        var item13 = {
            label:"查看",
            callback:function(){
                editParamInfo(false);
            },
            icon:ICON + "view.gif",
            enable:function(){return true;},
            visible:function(){return "_rootId"!=getTreeNodeId() && true==getOperation("1");}
        }
        var item14 = {
            label:"新建参数项",
            callback:function(){
                addNewParam("2");
            },
            enable:function(){return true;},
            visible:function(){return (("1"==getTreeNodeMode() && "1"==getTreeNodeType()) || "2"==getTreeNodeMode()) && true==getOperation("2");}
        }
		var item15 = {
            label:"刷新参数缓存",
            callback:function(){
                flushParamCache();
            },
            enable:function(){return true;},
            visible:function(){return "1"==getTreeNodeType();}
        }


        //新建参数子菜单
        var subitem1_1 = {
            label:"简单型",
            callback:function(){
                addNewParam("1","0");
            },
            enable:function(){return true;},
            visible:function(){return true;}
        }
        var subitem1_2 = {
            label:"下拉型",
            callback:function(){
                addNewParam("1","1");
            },
            enable:function(){return true;},
            visible:function(){return true;}
        }
        var subitem1_3 = {
            label:"树型",
            callback:function(){
                addNewParam("1","2");
            },
            enable:function(){return true;},
            visible:function(){return true;}
        }
        var submenu1 = new Menu();
        submenu1.addItem(subitem1_1);
        submenu1.addItem(subitem1_2);
        submenu1.addItem(subitem1_3);
        item1.submenu = submenu1;        

        var menu1 = new Menu();
        menu1.addItem(item4);
        menu1.addItem(item5);
        menu1.addSeparator();
        menu1.addItem(item13);
        menu1.addItem(item3);
        menu1.addItem(item2);
        menu1.addItem(item9);
        menu1.addItem(item11);
        menu1.addItem(item12);
        menu1.addSeparator();
        menu1.addItem(item7);
        menu1.addItem(item1);
        menu1.addItem(item14);

		menu1.addSeparator();
		menu1.addItem(item15);

        var treeObj = $("tree");
        treeObj.contextmenu = menu1;
    }
    /*
     *	函数说明：区块初始化
     *	参数：	
     *	返回值：
     */
    function initBlocks(){
        var paletteObj = $("palette");
        Blocks.create(paletteObj);

        var treeContainerObj = $("treeContainer");
        Blocks.create(treeContainerObj,treeContainerObj.parentNode);

        var statusContainerObj = $("statusContainer");
        Blocks.create(statusContainerObj,statusContainerObj.parentNode,false);

        //状态信息区实例继承WritingBlock可写功能
        var block = Blocks.getBlock("statusContainer");
        if(null!=block){
            block.inherit(WritingBlock);
        }     
    }
    /*
     *	函数说明：显示属性状态信息
     *	参数：	number:rowIndex     grid数据行号
     *	返回值：
     */
    function showPropertyStatus(rowIndex){
        var gridObj = $("grid");
        var rowNode = gridObj.getRowNode_Xml(rowIndex);
        var rowName = gridObj.getNamedNodeValue_Xml(rowIndex,"name");
        var rowID = rowNode.getAttribute("id");
        var block = Blocks.getBlock("statusContainer");
        if(null!=block){
            block.open();
            block.writeln("名称",rowName);
            block.writeln("ID",rowID);
            block.close();
        }
    }
    /*
     *	函数说明：资源树初始化
     *	参数：	string:cacheID      缓存数据ID
     *	返回值：
     */
    function initTree(cacheID){
        var treeObj = $("tree");
        Public.initHTC(treeObj,"isLoaded","oncomponentready",function(){
            initTreeData(cacheID);
        });
    }
    /*
     *	函数说明：资源树加载数据
     *	参数：
     *	返回值：
     */
    function initTreeData(cacheID){
        var xmlIsland = Cache.XmlIslands.get(cacheID);
        if(null!=xmlIsland){
            var treeObj = $("tree");
            treeObj.load(xmlIsland.node);

            treeObj.onTreeNodeActived = function(eventObj){
                onTreeNodeActived(eventObj);
            }
            treeObj.onTreeNodeDoubleClick = function(eventObj){
                onTreeNodeDoubleClick(eventObj);
            }
            treeObj.onTreeNodeMoved = function(eventObj){
                onTreeNodeMoved(eventObj);
            }
            treeObj.onTreeNodeRightClick = function(eventObj){
                onTreeNodeRightClick(eventObj);
            }
        }    
    }
    function sortParamTo(eventObj){
        var treeObj = $("tree");
        var movedTreeNode = eventObj.movedTreeNode;
        var toTreeNode = eventObj.toTreeNode;
        var moveState = eventObj.moveState;
        var moveGroupType = movedTreeNode.getAttribute("parentId");
        var moveParamType = movedTreeNode.getAttribute("groupId");
        var toGroupType = toTreeNode.getAttribute("parentId");
        var toParamType = toTreeNode.getAttribute("groupId");

        var p = new HttpRequestParams();
        p.url = URL_SORT_PARAM;
        p.setContent("targetId",toTreeNode.getId());
        p.setContent("paramId",movedTreeNode.getId());
        p.setContent("direction",moveState);//-1目标上方,1目标下方

        var request = new HttpRequest(p);
        request.onsuccess = function(){
            //移动树节点
            treeObj.moveTreeNode(movedTreeNode, toTreeNode, moveState);
        }
        request.send();
    }
    /*
     *	函数说明：聚焦初始化
     *	参数：	
     *	返回值：
     */
    function initFocus(){
        var treeTitleObj = $("treeTitle");
        var statusTitleObj = $("statusTitle");

        Focus.register(treeTitleObj.firstChild);
        Focus.register(statusTitleObj.firstChild);
    }
    /*
     *	函数说明：事件绑定初始化
     *	参数：	
     *	返回值：
     */
    function initEvents(){
        var treeBtRefreshObj = $("treeBtRefresh");
        var treeTitleBtObj = $("treeTitleBt");
        var statusTitleBtObj = $("statusTitleBt");
        var paletteBtObj = $("paletteBt");

        var treeTitleObj = $("treeTitle");
        var statusTitleObj = $("statusTitle");
        
        Event.attachEvent(treeBtRefreshObj,"click",onClickTreeBtRefresh);
        Event.attachEvent(treeTitleBtObj,"click",onClickTreeTitleBt);
        Event.attachEvent(statusTitleBtObj,"click",onClickStatusTitleBt);
        Event.attachEvent(paletteBtObj,"click",onClickPaletteBt);

        Event.attachEvent(treeTitleObj,"click",onClickTreeTitle);
        Event.attachEvent(statusTitleObj,"click",onClickStatusTitle);
    }
    /*
     *	函数说明：点击树节点
     *	参数：	Object:eventObj     模拟事件对象
     *	返回值：
     */
    function onTreeNodeActived(eventObj){
        var treeTitleObj = $("treeTitle");
        Focus.focus(treeTitleObj.firstChild.id);

        showTreeNodeStatus({id:"ID",name:"名称",user:"创建者",date:"创建时间",lastModifyUserName:"修改者",lastdate:"修改时间"});

        //防止因为载入工具条数据而导致不响应双击事件
        clearTimeout(window._toolbarTimeout);
        window._toolbarTimeout = setTimeout(function(){
            loadToolBarData(eventObj.treeNode);
        },0);
    }
    /*
     *	函数说明：双击树节点
     *	参数：	Object:eventObj     模拟事件对象
     *	返回值：
     */
    function onTreeNodeDoubleClick(eventObj){
        var treeNode = eventObj.treeNode;
        var id = getTreeNodeId();
        getTreeOperation(treeNode,function(_operation){
            var canEdit = checkOperation("2",_operation);
            if("_rootId"!=id){
                editParamInfo(canEdit);
            }
        });
    }
    /*
     *	函数说明：资源树节点移动
     *	参数：
     *	返回值：
     */
    function onTreeNodeMoved(eventObj){
        sortParamTo(eventObj);
    }
    /*
     *	函数说明：资源树单击右键
     *	参数：
     *	返回值：
     */
    function onTreeNodeRightClick(eventObj){
        var treeObj = $("tree");
        var treeNode = eventObj.treeNode;

        showTreeNodeStatus({id:"ID",name:"名称",user:"创建者",date:"创建时间",lastModifyUserName:"修改者",lastdate:"修改时间"});

        var x = eventObj.clientX;
        var y = eventObj.clientY;
        getTreeOperation(treeNode,function(_operation){
            if(null!=treeObj.contextmenu){
                treeObj.contextmenu.show(x,y);                
            }
            loadToolBar(_operation);
        });
    }
    /*
     *	函数说明：工具条载入数据
     *	参数：	treeNode:treeNode       treeNode实例
     *	返回值：
     */
    function loadToolBarData(treeNode){
        if(null!=treeNode){
            getTreeOperation(treeNode,function(_operation){
                loadToolBar(_operation);
            });
        }
    }
    /*
     *	函数说明：编辑参数信息
     *	参数：  boolean:editable            是否可编辑(默认true)
     *	返回值：
     */
    function editParamInfo(editable){
        var treeObj = $("tree");
        var treeNode = treeObj.getActiveTreeNode();
        if(null!=treeNode){
            var treeID = treeNode.getId();
            var treeName = treeNode.getName();
            var type = treeNode.getAttribute("type");
			var mode = treeNode.getAttribute("mode");

            var callback = {};
            callback.onTabClose = function(eventObj){
                delCacheData(eventObj.tab.SID);
            };
            callback.onTabChange = function(){
                setTimeout(function(){
                    loadTreeDetailData(treeID,editable,treeID,type,false,mode);
                },TIMEOUT_TAB_CHANGE);
            };

            var inf = {};
            if(false==editable){
                inf.label = OPERATION_VIEW.replace(/\$label/i,treeName);
                inf.SID = CACHE_VIEW_TREE_NODE_DETAIL + treeID;
            }else{
                inf.label = OPERATION_EDIT.replace(/\$label/i,treeName);
                inf.SID = CACHE_TREE_NODE_DETAIL + treeID;
            }
            inf.defaultPage = "page1";
            inf.phases = null;
            inf.callback = callback;
            var tab = ws.open(inf);
        }
    }
    /*
     *	函数说明：树节点数据详细信息加载数据
     *	参数：	string:treeID               树节点id
                boolean:editable            是否可编辑(默认true)
                string:parentID             父节点id
                boolean:isNew               是否新增
                boolean:type                节点类型(0参数组/1参数/2参数项)
     *	返回值：
     */
    function loadTreeDetailData(treeID,editable,parentID,type,isNew,mode){
        if(false==editable){
            var cacheID = CACHE_VIEW_TREE_NODE_DETAIL + treeID;
        }else{
            var cacheID = CACHE_TREE_NODE_DETAIL + treeID;
        }
        var treeDetail = Cache.Variables.get(cacheID);
        if(null==treeDetail){
            var p = new HttpRequestParams();
            p.url = URL_PARAM_DETAIL;

            p.setContent("paramId", treeID);
            p.setContent("type", type);
            //如果是新增
            if(true==isNew){
                p.setContent("isNew", 1);
				p.setContent("parentId", parentID);
            }
			if("1"==type){
				p.setContent("mode", mode);
			}

            var request = new HttpRequest(p);
            request.onresult = function(){
                var paramInfoNode = this.getNodeValue(XML_PARAM_INFO);
                var paramInfoNodeID = cacheID+"."+XML_PARAM_INFO;

                Cache.XmlIslands.add(paramInfoNodeID,paramInfoNode);
                Cache.Variables.add(cacheID,[paramInfoNodeID]);

                initParamPages(cacheID,editable,parentID,isNew,type);
            }
            request.send();
        }else{
            initParamPages(cacheID,editable,parentID,isNew,type);
        }
    }
    /*
     *	函数说明：参数相关页加载数据
     *	参数：	string:cacheID              缓存数据id
                boolean:editable            是否可编辑(默认true)
                string:parentID             父节点id
                boolean:isNew               是否新增
                boolean:type                节点类型(0参数组/1参数/2参数项)
     *	返回值：
     */
    function initParamPages(cacheID,editable,parentID,isNew,type){
        var page1FormObj = $("page1Form");
        Public.initHTC(page1FormObj,"isLoaded","oncomponentready",function(){
            loadParamInfoFormData(cacheID,editable);
        });

        //设置保存按钮操作
        var page1BtSaveObj = $("page1BtSave");
        page1BtSaveObj.onclick = function(){
            saveParam(cacheID,parentID,isNew,type);
        }
    }
    /*
     *	函数说明：参数信息xform加载数据
     *	参数：	string:cacheID              缓存数据id
                boolean:editable            是否可编辑(默认true)
     *	返回值：
     */
    function loadParamInfoFormData(cacheID,editable){
        var xmlIsland = Cache.XmlIslands.get(cacheID+"."+XML_PARAM_INFO);
        if(null!=xmlIsland){
            var page1FormObj = $("page1Form");
            page1FormObj.editable = editable==false?"false":"true";
            page1FormObj.load(xmlIsland.node,null,"node");

            //2007-3-1 离开提醒
            attachReminder(cacheID,page1FormObj);
        }
    }
    /*
     *	函数说明：保存参数
     *	参数：	string:cacheID          缓存数据id
                string:parentID         父节点id
                boolean:isNew           是否新增
                boolean:type            节点类型(0参数组/1参数/2参数项)
     *	返回值：
     */
    function saveParam(cacheID,parentID,isNew,type){
        var page1FormObj = $("page1Form");	
        if(false==page1FormObj.checkForm()){
            return;
        }

        var p = new HttpRequestParams();
        p.url = URL_SAVE_PARAM;
        p.setContent("type",type);

        //是否提交
        var flag = false;
        
        var groupCache = Cache.Variables.get(cacheID);
        if(null!=groupCache){       

            //参数基本信息
            var paramInfoNode = Cache.XmlIslands.get(cacheID+"."+XML_PARAM_INFO);
            if(null!=paramInfoNode){
                var paramInfoDataNode = paramInfoNode.selectSingleNode(".//data");
                if(null!=paramInfoDataNode){
                    flag = true;

                    var prefix = paramInfoNode.selectSingleNode("./declare").getAttribute("prefix");
                    p.setXFormContent(paramInfoDataNode,prefix);
                }
            }
        }

        if(true==flag){
            var request = new HttpRequest(p);
            //同步按钮状态
            var page1BtSaveObj = $("page1BtSave");
            syncButton([page1BtSaveObj],request);

            request.onresult = function(){
                if(true==isNew){
                    //解除提醒
                    detachReminder(cacheID);

                    var treeNode = this.getNodeValue(XML_MAIN_TREE).selectSingleNode("treeNode");
                    appendTreeNode(parentID,treeNode);

                    var ws = $("ws");
                    ws.closeActiveTab();
                }
            }
            request.onsuccess = function(){
                if(true!=isNew){
                    //解除提醒
                    detachReminder(cacheID);
				
                    //更新树节点名称
					var id = cacheID.trim(CACHE_TREE_NODE_DETAIL);
					if("1" == type){
						var name = page1FormObj.getData("name");
						if("" == name || null==name){
							name = page1FormObj.getData("code");
						}
						modifyTreeNode(id,"name",name,true);
					} else if("2"==type){
                        var text = page1FormObj.getData("text");
						if("" == text || null==text){
							text = page1FormObj.getData("value");
						}
						modifyTreeNode(id,"name",text,true);
                    }
                }
            }
            request.send();
        }
    }
    /*
     *	函数说明：删除参数节点
     *	参数：
     *	返回值：
     */
    function delParam(){
        if(true!=confirm("您确定要删除吗？")){
            return;
        }
        var treeObj = $("tree");
        var treeNode = treeObj.getActiveTreeNode();
        if (null!=treeNode){
            var id = treeNode.getId();
            var type = treeNode.getAttribute("type");

            var p = new HttpRequestParams();
            p.url = URL_TREENODE_DEL;

            p.setContent("paramId",id);
            p.setContent("type",type);

            var request = new HttpRequest(p);
            request.onsuccess = function(){
                var parentNode = treeNode.getParent();
                if(null!=parentNode){
                    treeObj.setActiveTreeNode(parentNode.getId());
                }
                //从树上删除
                treeObj.removeTreeNode(treeNode);
            }
            request.send();
        }
    }
    /*
     *	函数说明：启用
     *	参数：
     *	返回值：
     */
    function enableParam(){
        var treeObj = $("tree");
        var treeNode = treeObj.getActiveTreeNode();
        if(null!=treeNode){
            var id = treeNode.getId();
            var type = treeNode.getAttribute("type");

            var p = new HttpRequestParams();
            p.url = URL_TREENODE_DISABLE;

            p.setContent("paramId",id);
            p.setContent("type",type);
            p.setContent("disabled","0");

            var request = new HttpRequest(p);
            request.onsuccess = function(){
                var xmlNode = new XmlNode(treeNode.node);
                refreshTreeNodeStates(xmlNode,"0");

                //刷新工具条
                loadToolBarData(treeNode);
            }
            request.send();	
        }

    }
	    /*
     *	函数说明：启用
     *	参数：
     *	返回值：
     */
    function flushParamCache(){
        var treeObj = $("tree");
        var treeNode = treeObj.getActiveTreeNode();
        if(null!=treeNode){
            var id = treeNode.getId();

            var p = new HttpRequestParams();
            p.url = URL_FLUSH_PARAM_CACHE;

            p.setContent("paramId",id);

            var request = new HttpRequest(p);
            request.onsuccess = function(){
            }
            request.send();	
        }

    }
    /*
     *	函数说明：停用
     *	参数：
     *	返回值：
     */
    function disableParam(){
        var treeObj = $("tree");
        var treeNode = treeObj.getActiveTreeNode();
        if(null!=treeNode){
            var id = treeNode.getId();
            var type = treeNode.getAttribute("type");

            var p = new HttpRequestParams();
            p.url = URL_TREENODE_DISABLE;

            p.setContent("paramId",id);
            p.setContent("type",type);
            p.setContent("disabled","1");

            var request = new HttpRequest(p);
            request.onsuccess = function(){
                var xmlNode = new XmlNode(treeNode.node);
                refreshTreeNodeStates(xmlNode,"1");

                //刷新工具条
                loadToolBarData(treeNode);
            }
            request.send();	
        }
    }
    /*
     *	函数说明：新建参数
     *	参数：  string:type         节点类型(0参数组/1参数/2参数项)
                string:mode         参数项类型(0简单型/1下拉型/2树型)
     *	返回值：
     */
    function addNewParam(type,mode){
        switch(type){
            case "0":
                var treeName = "参数组";
                break;
            case "1":
                var treeName = "参数";
                break;
            case "2":
                var treeName = "参数项";
                break;
        }
        var treeID = new Date().valueOf();

        var treeObj = $("tree");
        var treeNode = treeObj.getActiveTreeNode();
        if(null!=treeNode){
            var parentID = treeNode.getId();

            var callback = {};
            callback.onTabClose = function(eventObj){
                delCacheData(eventObj.tab.SID);
            };
            callback.onTabChange = function(){
                setTimeout(function(){
                    loadTreeDetailData(treeID,true,parentID,type,true,mode);
                },TIMEOUT_TAB_CHANGE);
            };

            var inf = {};
            inf.defaultPage = "page1";
            inf.label = OPERATION_ADD.replace(/\$label/i,treeName);
            inf.phases = null;
            inf.callback = callback;
            inf.SID = CACHE_TREE_NODE_DETAIL + treeID;
            var tab = ws.open(inf);
        }
    }
    /*
     *	函数说明：创建导出用iframe
     *	参数：  
     *	返回值：
     */
    function createExportFrame(){
        var frameName = "exportFrame";
        var frameObj = $(frameName);
        if(null==frameObj){
            frameObj = document.createElement("<iframe name='"+frameName+"' id='"+frameName+"' src='about:blank' style='display:none'></iframe>");
            document.body.appendChild(frameObj);
        }
        return frameName;
    }
    /*
     *	函数说明：获取节点id
     *	参数：  
     *	返回值：string:id   树节点id
     */
    function getTreeNodeId(){
        return getTreeAttribute("id");
    }
    /*
     *	函数说明：获取节点disabled
     *	参数：  
     *	返回值：string:disabled   树节点disabled
     */
    function getTreeNodeDisabled(){
        return getTreeAttribute("disabled");
    }
    /*
     *	函数说明：获取节点type
     *	参数：  
     *	返回值：string:type   树节点type
     */
    function getTreeNodeType(){
        return getTreeAttribute("type");
    }
    /*
     *	函数说明：获取节点mode
     *	参数：  
     *	返回值：string:mode   树节点mode
     */
    function getTreeNodeMode(){
        return getTreeAttribute("mode");
    }
    /*
     *	函数说明：刷新树节点停用启用状态
     *	参数：	treeNode:treeNode       treeNode实例
                string:state            停/启用状态
     *	返回值：
     */
    function refreshTreeNodeState(treeNode,state){
        if(null==state){
            state = treeNode.getAttribute("disabled");
        }
        var type = treeNode.getAttribute("type");
        var mode = treeNode.getAttribute("mode");
        switch(type){
            case "0":
                var img = "param_group";
                break;
            case "1":
                if("0"==mode){
                    var img = "param_simple";
                }else if("1"==mode){
                    var img = "param_combo";
                }else{
                    var img = "param_tree";
                }
                break;
            case "2":
                var img = "param_item";
                break;
        }
        treeNode.setAttribute("disabled",state);
        treeNode.setAttribute("icon",ICON + img + (state=="1"?"_2":"") + ".gif");       
    }
    /*
     *	函数说明：刷新级联树节点停用启用状态
     *	参数：	XmlNode:curNode         XmlNode实例
                string:state            停/启用状态
     *	返回值：
     */
    function refreshTreeNodeStates(curNode,state){
        refreshTreeNodeState(curNode,state);

        if("0" == state){//启用，上溯
            while(null != curNode && "_rootId" != curNode.getAttribute("id")){
                refreshTreeNodeState(curNode,state);

                curNode = curNode.getParent();
            }        
        }else if("1" == state){//停用，下溯
            var childNodes = curNode.selectNodes(".//treeNode");
            for(var i=0,iLen=childNodes.length;i<iLen;i++){                
                refreshTreeNodeState(childNodes[i],state);
            }
        }

        var treeObj = $("tree");
        treeObj.reload(); 
    }
    /*
     *	函数说明：复制参数
     *	参数：	
     *	返回值：
     */
    function copyParam(){
        var treeObj = $("tree"); 
        var treeNode = treeObj.getActiveTreeNode();
        if(null!=treeNode){
            var id = treeNode.getId();
            var type = treeNode.getAttribute("type");
            var parentID = treeNode.getParent().getId();

            var p = new HttpRequestParams();
            p.url = URL_COPY_PARAM;

            p.setContent("paramId",id);
            p.setContent("type",type);

            var request = new HttpRequest(p);
            request.onresult = function(){
                var treeNode = this.getNodeValue(XML_MAIN_TREE).selectSingleNode("treeNode");
                appendTreeNode(parentID,treeNode);
            }
            request.send();
        }
    }
    /*
     *	函数说明：复制参数到
     *	参数：	
     *	返回值：
     */
    function copyParamTo(){
        var treeObj = $("tree"); 
        var treeNode = treeObj.getActiveTreeNode();
        if(null!=treeNode){
            var id = treeNode.getId();
            var name = treeNode.getName();
            var type = treeNode.getAttribute("type");
            var parentID = treeNode.getParent().getId();
			var parentMode = treeNode.getParent().getAttribute("mode");

//            var action = "data/paramtree_init.xml";
            var action = "../param!getCanAddParamsTree.action";
            var params = {
                id:id,
			    type:type,
				parentID:parentID,
				mode:parentMode,
                action:"copyTo"
            };

            var group = window.showModalDialog("paramtree.htm",{params:params,title:"将\""+name+"\"复制到",action:action},"dialogWidth:300px;dialogHeight:400px;");
            if(null!=group){

                var p = new HttpRequestParams();
                p.url = URL_COPY_PARAM_TO;
                p.setContent("paramId",id);
                p.setContent("toParamId",group.id);

                var request = new HttpRequest(p);
                request.onresult = function(){
                    var newNode = this.getNodeValue(XML_MAIN_TREE).selectSingleNode("treeNode");
                    appendTreeNode(group.id,newNode);
                }
                request.send();
            }
        }
    }
    /*
     *	函数说明：移动参数到
     *	参数：	
     *	返回值：
     */
    function moveParamTo(){
        var treeObj = $("tree"); 
        var treeNode = treeObj.getActiveTreeNode();
        if(null!=treeNode){
            var id = treeNode.getId();
            var name = treeNode.getName();
            var type = treeNode.getAttribute("type");
            var parentID = treeNode.getParent().getId();
			var parentMode = treeNode.getParent().getAttribute("mode");

//            var action = "paramtree_init.xml";
            var action = "../param!getCanAddParamsTree.action";
            var params = {
                id:id,
			    type:type,
				parentID:parentID,
				mode:parentMode,
                action:"moveTo"
            };

            var group = window.showModalDialog("paramtree.htm",{params:params,title:"将\""+name+"\"移动到",action:action},"dialogWidth:300px;dialogHeight:400px;");
            if(null!=group){

                var p = new HttpRequestParams();
                p.url = URL_MOVE_PARAM_TO;
                p.setContent("paramId",id);
                p.setContent("toParamId",group.id);

                var request = new HttpRequest(p);
                request.onsuccess = function(){
                    //移动树节点
                    var parentNode = treeObj.getTreeNodeById(group.id);
                    var parentDisabled = parentNode.getAttribute("disabled");
                    parentNode.node.appendChild(treeNode.node);

                    var xmlNode = new XmlNode(treeNode.node);
                    refreshTreeNodeStates(xmlNode,parentDisabled);
                    clearOperation(xmlNode);

                    treeObj.reload();
                }
                request.send();
            }
        }
    }
    /*
     *	函数说明：获取树操作权限
     *	参数：	treeNode:treeNode       treeNode实例
                function:callback       回调函数
     *	返回值：
     */
    function getTreeOperation(treeNode,callback){
        var id = treeNode.getId();
        var _operation = treeNode.getAttribute("_operation");

        if(null==_operation || ""==_operation){//如果节点上还没有_operation属性，则发请求从后台获取信息
            var p = new HttpRequestParams();
            p.url = URL_GET_OPERATION;
            p.setContent("resourceId",id);

            var request = new HttpRequest(p);
            request.onresult = function(){
                _operation = this.getNodeValue(XML_OPERATION);
                treeNode.setAttribute("_operation",_operation);

                if(null!=callback){
                    callback(_operation);
                }
            }
            request.send();            
        }else{
            if(null!=callback){
                callback(_operation);
            }
        }    
    }



    window.onload = init;

	//关闭页面自动注销
    window.attachEvent("onunload", function(){
        if(10000<window.screenTop || 10000<window.screenLeft){
            logout();
        }
	});