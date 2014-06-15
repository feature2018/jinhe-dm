// ------------------------------------------------- 定制的函数 ------------------------------------------------
function getSites(companys) {
	if(companys == null || companys == "") return;

	Ajax({
		url : '../display/json/SiteList?param1=' + companys,
		method: "GET",
		type : "json",
		ondata : function() { 
			var result = eval(this.getResponseText());
			if( result ) {
				var selectObj = $$("param2");
				selectObj.options.length = 0; // 先清空
				for(var i = 0; i < result.length; i++) {
					var option = createOption(result[i]);
					selectObj.options[selectObj.options.length] = option;

					// 设置为默认选中第一个
					if(i == 0) {
						$X("searchForm").updateDataExternal("param2", option.value); 
					}	
				}
			}				
		}
	});
}