// ------------------------------------------------- 定制的函数 ------------------------------------------------
function getSites(companys) {
	if(companys == null || companys == "") return;

	$.ajax({
		url : '../../display/json/SiteList?param1=' + companys,
		method: "GET",
		type : "json",
		ondata : function() { 
			var result =  this.getResponseJSON();
			if( result && result.length > 0) {
				var sEl = $1("param2");
				sEl.options.length = 0; // 先清空
				for(var i = 0; i < result.length; i++) {
					sEl.options[i] = $.createOption(result[i]);
				}

				// 设置为默认选中第一个
				$.F("searchForm").updateDataExternal("param2", sEl.options[0].value);
			}					
		}
	});
}