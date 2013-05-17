
    /*
     *	核心包相对路径
     */
    URL_CORE = "../../";
    
    /*
     *	后台响应数据节点名称
     */
    XML_MAIN_TREE = "AppTree";
    XML_LOG_LIST = "LogList";
    XML_OPERATION = "Operation";
    XML_PAGE_LIST = "PageList";

    XML_LOG_INFO = "LogInfo";
    /*
     *	默认唯一编号名前缀
     */
    CACHE_GRID_ROW_DETAIL = "row__id";
    CACHE_VIEW_GRID_ROW_DETAIL = "viewRow__id";
    CACHE_TREE_NODE_DETAIL = "treeNode__id";
    CACHE_TREE_NODE_GRID = "treeNodeGrid__id";
    CACHE_MAIN_TREE = "tree__id";
    CACHE_TOOLBAR = "toolbar__id";
    CACHE_SEARCH_LOG = "searchLog__id";
    /*
     *	名称
     */
    OPERATION_ADD = "新建$label";
    OPERATION_VIEW = "查看\"$label\"";
    OPERATION_DEL = "删除\"$label\"";
    OPERATION_EDIT = "编辑\"$label\"";
    OPERATION_SEARCH = "查询\"$label\"";
    /*
     *	XMLHTTP请求地址汇总
     */
    URL_INIT = "data/log_init.xml";
    URL_LOG_LIST = "data/loglist.xml";
    URL_LOG_DETAIL = "data/log1.xml";
    URL_GET_OPERATION = "data/operation.xml";
    URL_GET_LOG_OPERATION = "data/operation.xml";
    URL_SEARCH_LOG = "data/loglist.xml";

    URL_INIT = "../../../log/log!getAllApps4Tree.action";
    URL_LOG_LIST = "../../../log/log!queryLogs4Grid.action";
    URL_LOG_DETAIL = "../../../log/log!getLogInfo.action";
    URL_GET_OPERATION = "data/operation.xml";
    URL_GET_LOG_OPERATION = "data/operation.xml";
    URL_SEARCH_LOG = "../../../log/log!queryLogs4Grid.action";
    /*
     *	延时
     */
    TIMEOUT_TAB_CHANGE = 200;
    TIMEOUT_GRID_SEARCH = 200;
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
        initListContainerResize();
        //initUserInfo();
        initToolBar();
        initNaviBar("mod.3");
        initMenus();
        initBlocks();
        initWorkSpace();
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

            //应用
            str[str.length] = "    <button id=\"b1\" code=\"plog1\" icon=\"" + ICON + "view_list.gif\" label=\"浏览日志\" cmd=\"showLogList()\" enable=\"'_rootId'!=getTreeId()\"/>";
            str[str.length] = "    <button id=\"b2\" code=\"plog2\" icon=\"" + ICON + "search.gif\" label=\"搜索日志\" cmd=\"searchLog()\" enable=\"'_rootId'!=getTreeId()\"/>";

            //日志
//            str[str.length] = "    <button id=\"c1\" code=\"pld1\" icon=\"" + ICON + "view.gif\" label=\"查看\" cmd=\"editLogInfo(false)\" enable=\"true\"/>";
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
        initGridMenu();
    }
    /*
     *	函数说明：树菜单初始化
     *	参数：	
     *	返回值：
     */
    function initTreeMenu(){
        var item1 = {
            label:"浏览日志",
            callback:showLogList,
            icon:ICON + "view_list.gif",
            enable:function(){return true;},
            visible:function(){return "_rootId"!=getTreeId() && true==getOperation("plog1");}
        }
        var item2 = {
            label:"搜索日志",
            callback:searchLog,
            icon:ICON + "search.gif",
            enable:function(){return true;},
            visible:function(){return "_rootId"!=getTreeId() && true==getOperation("plog2");}
        }

        var treeObj = $("tree");

        var menu1 = new Menu();
        menu1.addItem(item1);
        menu1.addItem(item2);

        //menu1.attachTo(treeObj,"contextmenu");
        treeObj.contextmenu = menu1;
    }
    /*
     *	函数说明：Grid菜单初始化
     *	参数：	
     *	返回值：
     */
    function initGridMenu(){
        var gridObj = $("grid");
        var item1 = {
            label:"查看",
            callback:function(){
                editLogInfo(false);
            },
            icon:ICON + "view.gif",
            enable:function(){return true;},
            visible:function(){return true==getLogOperation("pld1");}
        }
        var item2 = {
            label:"搜索日志",
            callback:searchLog,
            icon:ICON + "search.gif",
            enable:function(){return true;},
            visible:function(){return "_rootId"!=getTreeId() && true==getOperation("plog2");}
        }
        var item3 = {
            label:"隐藏列...",
            callback:function(){gridObj.hideCols();},
            icon:ICON + "hide_col.gif",
            enable:function(){return true;},
            visible:function(){return true;}
        }
        var item4 = {
            label:"搜索...",
            callback:function(){gridObj.search();},
            enable:function(){return true;},
            visible:function(){return true;}
        }

        var menu1 = new Menu();
        menu1.addItem(item1);
        menu1.addItem(item2);
        menu1.addSeparator();
        menu1.addItem(item3);
        menu1.addItem(item4);
        //menu1.attachTo(gridObj,"contextmenu");
        gridObj.contextmenu = menu1;
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
     *	函数说明：grid初始化
     *	参数：	string:id                   grid数据相关树节点id
     *	返回值：
     */
    function initGrid(id){
        var gridObj = $("grid");
        Public.initHTC(gridObj,"isLoaded","onload",function(){
            loadGridEvents();
            loadGridData(id,"1");//默认第一页
        });
    }
    /*
     *	函数说明：grid绑定事件
     *	参数：	
     *	返回值：
     */
    function loadGridEvents(){
        var gridObj = $("grid");

        gridObj.onclickrow = function(){
            onClickRow(event);
        }
        gridObj.ondblclickrow = function(){
            onDblClickRow(event);
        }
        gridObj.onrightclickrow = function(){
            onRightClickRow(event);
        }
        gridObj.oninactiverow = function() {
            onInactiveRow(event);
        }
        gridObj.onsortrow = function() {
            onSortRow(event);
        }
    
    }
    /*
     *	函数说明：grid加载数据
     *	参数：	string:treeID       grid数据相关树节点id
                string:page         页码
                string:sortName     排序字段
                string:direction    排序方向
     *	返回值：
     */
    function loadGridData(treeID,page,sortName,direction){
        var cacheID = CACHE_TREE_NODE_GRID + treeID;
        var treeGrid = Cache.Variables.get(cacheID);
        if(null==treeGrid){
            var p = new HttpRequestParams();
            p.url = URL_LOG_LIST;
            p.setContent("condition.appCode", treeID);
            p.setContent("page", page);
            if(null!=sortName && null!=direction){
                p.setContent("field", sortName);
                p.setContent("orderType", direction);
            }

            var request = new HttpRequest(p);
            request.onresult = function(){
                var sourceListNode = this.getNodeValue(XML_LOG_LIST);
                var sourceListNodeID = cacheID+"."+XML_LOG_LIST;

                var pageListNode = this.getNodeValue(XML_PAGE_LIST);
                var pageListNodeID = cacheID+"."+XML_PAGE_LIST;

                //给用户grid数据根节点增加applicationId等属性
                sourceListNode.setAttribute("applicationId",treeID);

                //给当前排序列加上_direction属性
                if(null!=sortName && null!=direction){
                    var column = sourceListNode.selectSingleNode("//column[@name='" + sortName + "']");
                    if(null!=column){
                        column.setAttribute("_direction",direction);
                    }
                }

                Cache.XmlIslands.add(sourceListNodeID,sourceListNode);
                Cache.XmlIslands.add(pageListNodeID,pageListNode);
                Cache.Variables.add(cacheID,[sourceListNodeID,pageListNodeID]);

                loadGridDataFromCache(cacheID);
            }
            request.send();
        }else{        
            loadGridDataFromCache(cacheID);
        }
    }
    /*
     *	函数说明：grid从缓存加载数据
     *	参数：	string:cacheID   grid数据相关树节点id
     *	返回值：
     */
    function loadGridDataFromCache(cacheID){
        //重新创建grid工具条
        createGridToolBar(cacheID);

        var xmlIsland = Cache.XmlIslands.get(cacheID+"."+XML_LOG_LIST);
        if(null!=xmlIsland){
            var gridObj = $("grid");
            gridObj.load(xmlIsland.node,null,"node");

            Focus.focus("gridTitle");
        }
    }
    /*
     *	函数说明：创建grid工具条
     *	参数：	string:cacheID   grid数据相关树节点id
     *	返回值：
     */
    function createGridToolBar(cacheID){
        var toolbarObj = $("gridToolBar");

        var xmlIsland = Cache.XmlIslands.get(cacheID+"."+XML_PAGE_LIST);
        if(null==xmlIsland){
            toolbarObj.innerHTML = "";
        }else{
            initGridToolBar(toolbarObj,xmlIsland,function(page){
                var gridBtRefreshObj = $("gridBtRefresh");
                var gridObj = $("grid");

                if(true==gridObj.hasData_Xml()){
                    var tempXmlIsland = new XmlNode(gridObj.getXmlDocument());
                    var tempAppId = tempXmlIsland.getAttribute("applicationId");
                    var sortName = tempXmlIsland.getAttribute("sortName");
                    var direction = tempXmlIsland.getAttribute("direction");
                    if("search"!=tempAppId){
                        //清除该应用日志grid缓存
                        delCacheData(CACHE_TREE_NODE_GRID + tempAppId);

                        loadGridData(tempAppId,page,sortName,direction);

                        //刷新工具条
                        onInactiveRow();
                    }else{
                        loadSearchGridData(cacheID,page,sortName,direction);
                    }
                }
            });
        }
    }
    /*
     *	函数说明：显示日志状态信息
     *	参数：	number:rowIndex     grid数据行号
     *	返回值：
     */
    function showLogStatus(rowIndex){
        if(null==rowIndex){
            var rowID = "-";
            var operatorName = "-";
            var operateTime = "-";
        }else{
            var gridObj = $("grid");
            var rowNode = gridObj.getRowNode_Xml(rowIndex);
            var rowID = rowNode.getAttribute("id");
            var operatorName = rowNode.getAttribute("operatorName");
            var operateTime = rowNode.getAttribute("operateTime");
        }

        var block = Blocks.getBlock("statusContainer");
        if(null!=block){
            block.open();
            block.writeln("ID",rowID);
            block.writeln("操作人",operatorName);
            block.writeln("操作时间",operateTime);
            block.close();
        }
    }
    /*
     *	函数说明：显示日志详细信息
     *	参数：	boolean:editable            是否可编辑(默认true)
     *	返回值：
     */
    function editLogInfo(editable){
        var gridObj = $("grid");
        var rowIndex = gridObj.getCurrentRowIndex_Xml()[0];
        var rowNode = gridObj.getRowNode_Xml(rowIndex);
        var rowName = gridObj.getNamedNodeValue_Xml(rowIndex,"id");
        var rowID = rowNode.getAttribute("id");
        var applicationId = gridObj.getXmlDocument().getAttribute("applicationId");
        if("search"==applicationId){
            groupID = rowNode.getAttribute("applicationId");
        }

        var callback = {};
        callback.onTabClose = function(eventObj){
            delCacheData(eventObj.tab.SID);
        };
        callback.onTabChange = function(){
            setTimeout(function(){
                loadLogDetailData(rowID,editable);
            },TIMEOUT_TAB_CHANGE);
        };

        var inf = {};
        if(false==editable){
            inf.label = OPERATION_VIEW.replace(/\$label/i,rowName);
            inf.SID = CACHE_VIEW_GRID_ROW_DETAIL + rowID;
        }else{
            inf.label = OPERATION_EDIT.replace(/\$label/i,rowName);
            inf.SID = CACHE_GRID_ROW_DETAIL + rowID;
        }
        inf.defaultPage = "page1";
        inf.phases = null;
        inf.callback = callback;
        var tab = ws.open(inf);
        
    }
    /*
     *	函数说明：日志详细信息加载数据
     *	参数：	string:logId                日志id
                boolean:editable            是否可编辑(默认true)
     *	返回值：
     */
    function loadLogDetailData(logId,editable){
        if(false==editable){
            var cacheID = CACHE_VIEW_GRID_ROW_DETAIL + logId;
        }else{
            var cacheID = CACHE_GRID_ROW_DETAIL + logId;
        }
        var cacheID = CACHE_GRID_ROW_DETAIL + logId;
        var userDetail = Cache.Variables.get(cacheID);
        if(null==userDetail){
            var p = new HttpRequestParams();
            p.url = URL_LOG_DETAIL;
            p.setContent("id", logId);

            var request = new HttpRequest(p);
            request.onresult = function(){
                var logInfoNode = this.getNodeValue(XML_LOG_INFO);

                var logInfoNodeID = cacheID+"."+XML_LOG_INFO;

                Cache.XmlIslands.add(logInfoNodeID,logInfoNode);

                Cache.Variables.add(cacheID,[logInfoNodeID]);

                initLogPages(cacheID,editable);
            }
            request.send();
        }else{
            initLogPages(cacheID,editable);
        }
    }
    /*
     *	函数说明：日志相关页加载数据
     *	参数：	string:cacheID              缓存数据id
                boolean:editable            是否可编辑(默认true)
     *	返回值：
     */
    function initLogPages(cacheID,editable){
        var page1FormObj = $("page1Form");
        Public.initHTC(page1FormObj,"isLoaded","oncomponentready",function(){
            loadLogInfoFormData(cacheID,editable);
        });

        //设置翻页按钮显示状态
        var page1BtPrevObj = $("page1BtPrev");
        var page1BtNextObj = $("page1BtNext");
        page1BtPrevObj.style.display = "none";
        page1BtNextObj.style.display = "none";

        //设置保存按钮操作
        var page1BtSaveObj = $("page1BtSave");
        page1BtSaveObj.disabled = editable==false?true:false;
    }
    /*
     *	函数说明：日志信息xform加载数据
     *	参数：	string:cacheID              缓存数据id
                boolean:editable            是否可编辑(默认true)
     *	返回值：
     */
    function loadLogInfoFormData(cacheID,editable){
        var xmlIsland = Cache.XmlIslands.get(cacheID+"."+XML_LOG_INFO);
        if(null!=xmlIsland){
            var page1FormObj = $("page1Form");
            page1FormObj.editable = editable==false?"false":"true";
            page1FormObj.load(xmlIsland.node,null,"node");
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
    /*
     *	函数说明：聚焦初始化
     *	参数：	
     *	返回值：
     */
    function initFocus(){
        var treeTitleObj = $("treeTitle");
        var statusTitleObj = $("statusTitle");
        var gridTitleObj = $("gridTitle");

        Focus.register(treeTitleObj.firstChild);
        Focus.register(statusTitleObj.firstChild);
        Focus.register(gridTitleObj);
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
        var gridTitleObj = $("gridTitle");
        
        Event.attachEvent(treeBtRefreshObj,"click",onClickTreeBtRefresh);
        Event.attachEvent(treeTitleBtObj,"click",onClickTreeTitleBt);
        Event.attachEvent(statusTitleBtObj,"click",onClickStatusTitleBt);
        Event.attachEvent(paletteBtObj,"click",onClickPaletteBt);

        Event.attachEvent(treeTitleObj,"click",onClickTreeTitle);
        Event.attachEvent(statusTitleObj,"click",onClickStatusTitle);
        Event.attachEvent(gridTitleObj,"click",onClickGridTitle);
    }
    /*
     *	函数说明：点击树节点
     *	参数：	Object:eventObj     模拟事件对象
     *	返回值：
     */
    function onTreeNodeActived(eventObj){
        var treeTitleObj = $("treeTitle");
        Focus.focus(treeTitleObj.firstChild.id);

        showTreeNodeStatus({id:"ID",name:"名称",creator:"创建者",creatorTime:"创建时间",lastModifyUserName:"修改者",lastdate:"修改时间"});

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
        if("_rootId"!=getTreeId()){
            showLogList();
        }
    }
    /*
     *	函数说明：右击树节点
     *	参数：	Object:eventObj     模拟事件对象
     *	返回值：
     */
    function onTreeNodeRightClick(eventObj){
        var treeObj = $("tree");
        var treeNode = eventObj.treeNode;

        showTreeNodeStatus({id:"ID",name:"名称",creator:"创建者",creatorTime:"创建时间",lastModifyUserName:"修改者",lastdate:"修改时间"});

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
     *	函数说明：拖动树节点
     *	参数：	Object:eventObj     模拟事件对象
     *	返回值：
     */
    function onTreeNodeMoved(eventObj){
        sortGroupTo(eventObj);
    }
    /*
     *	函数说明：单击grid行
     *	参数：	event:eventObj     事件对象
     *	返回值：
     */
    function onClickRow(eventObj){    
        Focus.focus("gridTitle");

        var rowIndex = eventObj.result.rowIndex_Xml;
        showLogStatus(rowIndex);

        //防止因为载入工具条数据而导致不响应双击事件
        clearTimeout(window._toolbarTimeout);
        window._toolbarTimeout = setTimeout(function(){
            loadLogToolBarData(rowIndex);
        },0);
    }
    /*
     *	函数说明：双击grid行
     *	参数：	event:eventObj     事件对象
     *	返回值：
     */
    function onDblClickRow(eventObj){
        var rowIndex = eventObj.result.rowIndex_Xml;
        getGridOperation(rowIndex,function(_operation){
            //检测编辑权限
            var code = "pld1";
            var editable = checkOperation(code,_operation);

            editLogInfo(editable);
        });
    }
    /*
     *	函数说明：右击grid行
     *	参数：	event:eventObj     事件对象
     *	返回值：
     */
    function onRightClickRow(eventObj){
        var gridObj = $("grid");

        var rowIndex = eventObj.result.rowIndex_Xml;
        var rowNode = gridObj.getRowNode_Xml(rowIndex);

        var id = rowNode.getAttribute("id");
        var _operation = rowNode.getAttribute("_operation");
        var x = event.clientX;
        var y = event.clientY;

        if(null==_operation || ""==_operation){//如果节点上还没有_operation属性，则发请求从后台获取信息
            var p = new HttpRequestParams();
            p.url = URL_GET_LOG_OPERATION;
            p.setContent("applicationId",id);

            var request = new HttpRequest(p);
            request.onresult = function(){
                _operation = this.getNodeValue(XML_OPERATION);
                rowNode.setAttribute("_operation",_operation);

                gridObj.contextmenu.show(x,y);
                loadToolBar(_operation);
            }
            request.send();
            
        }else{
            gridObj.contextmenu.show(x,y);
            loadToolBar(_operation);
        }
    }
    /*
     *	函数说明：单击grid空白处
     *	参数：	event:eventObj     事件对象
     *	返回值：
     */
    function onInactiveRow(eventObj){
        var treeTitleObj = $("treeTitle");
        Focus.focus(treeTitleObj.firstChild.id);

        showTreeNodeStatus({id:"ID",name:"名称",creator:"创建者",creatorTime:"创建时间",lastModifyUserName:"修改者",lastdate:"修改时间"});

        var treeObj = $("tree");
        var treeNode = treeObj.getActiveTreeNode();
        //防止因为载入工具条数据而导致不响应双击事件
        clearTimeout(window._toolbarTimeout);
        window._toolbarTimeout = setTimeout(function(){
            loadToolBarData(treeNode);
        },0);
    }
    /*
     *	函数说明：单击grid表头排序
     *	参数：	event:eventObj     事件对象
     *	返回值：
     */
    function onSortRow(eventObj){
        var name = eventObj.result.name;
        var direction = eventObj.result.direction;

        eventObj.returnValue = false;

        var gridObj = $("grid");
        var xmlIsland = new XmlNode(gridObj.getXmlDocument());
        xmlIsland.setAttribute("sortName",name);
        xmlIsland.setAttribute("direction",direction);

        var toolbarObj = $("gridToolBar");
        var curPage = toolbarObj.getCurrentPage();
        toolbarObj.gotoPage(curPage);
    }
    /*
     *	函数说明：显示用户列表
     *	参数：	                
     *	返回值：
     */
    function showLogList(){
        var treeObj = $("tree");
        var treeNode = treeObj.getActiveTreeNode();
        if(null!=treeNode){
            var id = treeNode.getId();
            initGrid(id);
        }
    }
    /*
     *	函数说明：获取节点ID
     *	参数：	
     *	返回值：
     */
    function getTreeId(){
        var treeNodeState = null;
        var treeObj = $("tree");
        var treeNode = treeObj.getActiveTreeNode();
        if(null!=treeNode){
            treeNodeState = treeNode.getId();
        }
        return treeNodeState;   
    }
   /*
     *	函数说明：搜索日志
     *	参数：	
     *	返回值：
     */
    function searchLog(){

        var treeObj = $("tree");
        var treeNode = treeObj.getActiveTreeNode();
        if(null!=treeNode){
            var treeID = treeNode.getId();
            var treeName = treeNode.getName();
            var cacheID = CACHE_SEARCH_LOG + treeID;

            var condition = window.showModalDialog("searchlog.htm",{applicationId:treeID,title:"搜索\""+treeName+"\"下的日志"},"dialogWidth:250px;dialogHeight:250px;");
            if(null!=condition){
                Cache.Variables.add("condition",condition);
                loadSearchGridData(cacheID,1);
            }
        }
    }
    /*
     *	函数说明：根据条件获取搜索结果
     *	参数：	string:cacheID      缓存数据id
                string:page         页码
                string:sortName     排序字段
                string:direction    排序方向
     *	返回值：
     */
    function loadSearchGridData(cacheID,page,sortName,direction){
        var condition = Cache.Variables.get("condition");
        if(null!=condition){
            var p = new HttpRequestParams();
            p.url = URL_SEARCH_LOG;

            var xmlReader = new XmlReader(condition.dataXml);
            var dataNode = new XmlNode(xmlReader.documentElement);
            p.setXFormContent(dataNode,condition.prefix);
            p.setContent("page",page);
            if(null!=sortName && null!=direction){
                p.setContent("field", sortName);
                p.setContent("orderType", direction);
            }

            var request = new HttpRequest(p);
            request.onresult = function(){
                var logListNode = this.getNodeValue(XML_LOG_LIST);
                var logListNodeID = cacheID+"."+XML_LOG_LIST;

                var pageListNode = this.getNodeValue(XML_PAGE_LIST);
                var pageListNodeID = cacheID+"."+XML_PAGE_LIST;

                //给日志grid数据根节点增加applicationId等属性
                logListNode.setAttribute("applicationId","search");

                //给当前排序列加上_direction属性
                if(null!=sortName && null!=direction){
                    var column = logListNode.selectSingleNode("//column[@name='" + sortName + "']");
                    if(null!=column){
                        column.setAttribute("_direction",direction);
                    }
                }

                Cache.XmlIslands.add(logListNodeID,logListNode);
                Cache.XmlIslands.add(pageListNodeID,pageListNode);
                Cache.Variables.add(cacheID,[logListNodeID,pageListNodeID]);

                
                initSearchGrid(cacheID);
            }
            request.send();
        }
    }
    /*
     *	函数说明：初始化搜索用户grid
     *	参数：	string:cacheID      缓存数据id
     *	返回值：
     */
    function initSearchGrid(cacheID){
        var gridObj = $("grid");
        Public.initHTC(gridObj,"isLoaded","onload",function(){
            loadGridDataFromCache(cacheID);
            loadGridEvents();

            //刷新工具条
            onInactiveRow();
        });
    
    }
    /*
     *	函数说明：检测日志列表右键菜单项是否可见
     *	参数：	string:code     操作码
     *	返回值：
     */
    function getLogOperation(code){
        var flag = false;
        var gridObj = $("grid");
        var curRowIndex = gridObj.getCurrentRowIndex_Xml()[0];
        if(null!=curRowIndex){
            var curRowNode = gridObj.getRowNode_Xml(curRowIndex);
            var _operation = curRowNode.getAttribute("_operation");

            var reg = new RegExp("(^"+code+",)|(^"+code+"$)|(,"+code+",)|(,"+code+"$)","gi");
            if(true==reg.test(_operation)){
                flag = true;
            }
        }
        return flag;
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
     *	函数说明：载入日志工具条
     *	参数：	
     *	返回值：
     */
    function loadLogToolBarData(rowIndex){
        if(null==rowIndex){
            loadToolBar("p1,p2");
            return;
        }

        getGridOperation(rowIndex,function(_operation){
            loadToolBar(_operation);
        });
    
    }
    /*
     *	函数说明：获取grid操作权限
     *	参数：	number:rowIndex         grid行号
                function:callback       回调函数
     *	返回值：
     */
    function getGridOperation(rowIndex,callback){
        var gridObj = $("grid");
        var rowNode = gridObj.getRowNode_Xml(rowIndex);
        var id = rowNode.getAttribute("id");
        var _operation = rowNode.getAttribute("_operation");

        if(null==_operation || ""==_operation){//如果节点上还没有_operation属性，则发请求从后台获取信息
            var p = new HttpRequestParams();
            p.url = URL_GET_LOG_OPERATION;
            p.setContent("logId",id);

            var request = new HttpRequest(p);
            request.onresult = function(){
                _operation = this.getNodeValue(XML_OPERATION);
                rowNode.setAttribute("_operation",_operation);

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
            p.setContent("applicationId",id);

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