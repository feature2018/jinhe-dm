
    /*
     *	核心包相对路径
     */
    URL_CORE = "../../";

    /*
     *	后台响应数据节点名称
     */
    XML_MAIN_FORM = "SearchLog";
    /*
     *	默认唯一编号名前缀
     */
    CACHE_MAIN_FORM = "xform__id";
    /*
     *	XMLHTTP请求地址汇总
     */
    URL_INIT = "data/searchlog_init.xml";

    URL_INIT = "config/LogSearchXForm.xml";

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
        var p = new HttpRequestParams();
        p.url = URL_INIT;

        var request = new HttpRequest(p);
        request.onresult = function(){
            var searchLogFormNode = this.getNodeValue(XML_MAIN_FORM);
            var searchLogFormNodeID = CACHE_MAIN_FORM;

            var row = searchLogFormNode.selectSingleNode("./data/row");
            var args = window.dialogArguments;
            for(var item in args){
                if("title"!=item){
                    row.setCDATA(item,args[item]);
                }
            }

            Cache.XmlIslands.add(searchLogFormNodeID,searchLogFormNode);

            initTree(searchLogFormNodeID);
        }
        request.send();
    }
    /*
     *	函数说明：搜索用户xform初始化
     *	参数：	string:cacheID      缓存数据ID
     *	返回值：
     */
    function initTree(cacheID){
        var xformObj = $("searchForm");
        Public.initHTC(xformObj,"isLoaded","oncomponentready",function(){
            initXFormData(cacheID);
        });
    }
    /*
     *	函数说明：搜索用户xform初始化
     *	参数：	string:cacheID      缓存数据ID
     *	返回值：
     */
    function initXFormData(cacheID){
        var xmlIsland = Cache.XmlIslands.get(cacheID);
        if(null!=xmlIsland){
            var xformObj = $("searchForm");
            xformObj.load(xmlIsland.node,null,"node");
        }
    }
    /*
     *	函数说明：获得搜索条件
     *	参数：	
     *	返回值：
     */
    function getCondition(){
        var condition = {};

        //搜索信息
        var searchInfoNode = Cache.XmlIslands.get(CACHE_MAIN_FORM);
        if(null!=searchInfoNode){
            var searchInfoDataNode = searchInfoNode.selectSingleNode(".//data");
            if(null!=searchInfoDataNode){
                condition.prefix = searchInfoNode.selectSingleNode("./declare").getAttribute("prefix");
                condition.dataXml = searchInfoDataNode.toXml();
            }
        }
        window.returnValue = condition;
        window.close();
    }

    window.onload = init;