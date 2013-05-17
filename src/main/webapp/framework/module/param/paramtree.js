
    /*
     *	核心包相对路径
     */
    URL_CORE = "../../";

    

    /*
     *	后台响应数据节点名称
     */
    XML_MAIN_TREE = "ParamTree";
    /*
     *	默认唯一编号名前缀
     */
    CACHE_MAIN_TREE = "tree__id";
    /*
     *	XMLHTTP请求地址汇总
     */
	URL_ALL = "data/paramtree_init.xml";

    /*
     *	函数说明：页面初始化
     *	参数：	
     *	返回值：
     */
    function init(){
        loadInitData();
    }
    /*
     *	函数说明：页面初始化加载数据(包括工具条、树)
     *	参数：	
     *	返回值：
     */
    function loadInitData(){
        var xmlIsland = window.dialogArguments.xmlIsland;
        if(null!=xmlIsland){//如果已经传进来数据岛，则不必去后台取
            var paramTreeNode = xmlIsland;
            var paramTreeNodeID = CACHE_MAIN_TREE;

            Cache.XmlIslands.add(paramTreeNodeID,paramTreeNode);

            initTree(paramTreeNodeID);
        }else{
            var params = window.dialogArguments.params;
            var action = window.dialogArguments.action;

            var p = new HttpRequestParams();
            p.url = action;
            for(var item in params){
                p.setContent(item,params[item]);            
            }

            var request = new HttpRequest(p);
            request.onresult = function(){
                var paramTreeNode = this.getNodeValue(XML_MAIN_TREE);
                var paramTreeNodeID = CACHE_MAIN_TREE;
				
				var curNode = paramTreeNode.selectSingleNode(".//treeNode[@id='"+params.id+"']");
				if(null!=curNode){
					curNode.setAttribute("canselected","0");
					var sameIdTreeNodeChilds = curNode.selectNodes(".//treeNode");
					for(var i=0,iLen=sameIdTreeNodeChilds.length;i<iLen;i++){
						sameIdTreeNodeChilds[i].setAttribute("canselected","0");
					}
				}
				var curParentNode = paramTreeNode.selectSingleNode(".//treeNode[@id='"+params.parentID+"']");
				if(null!=curParentNode)
					curParentNode.setAttribute("canselected","0");

                Cache.XmlIslands.add(paramTreeNodeID,paramTreeNode);

                initTree(paramTreeNodeID);
            }
            request.send();
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
        }    
    }
    /*
     *	函数说明：点击树节点
     *	参数：	Object:eventObj     模拟事件对象
     *	返回值：
     */
    function onTreeNodeActived(eventObj){
    }
    /*
     *	函数说明：双击树节点
     *	参数：	Object:eventObj     模拟事件对象
     *	返回值：
     */
    function onTreeNodeDoubleClick(eventObj){
        getGroup();
    }
    /*
     *	函数说明：获得组节点
     *	参数：	Object:eventObj     模拟事件对象
     *	返回值：
     */
    function getGroup(){        
        var treeObj = $("tree");
        var treeNode = treeObj.getActiveTreeNode();
        if(null!=treeNode){
            var returnValue = {};
            var attributes = treeNode.node.attributes;
            for(var i=0,iLen=attributes.length;i<iLen;i++){
                var name = attributes[i].nodeName;
                var value = attributes[i].nodeValue;
                returnValue[name] = value;
            }
            window.returnValue = returnValue;
            window.close();
        }
    }

    window.onload = init;