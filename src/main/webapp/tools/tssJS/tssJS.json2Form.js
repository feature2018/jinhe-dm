;(function($) {

	var 

		// item的类型允许为[id, code, name] or [pk, id, text] or {id:'xx', code:'yy', name:'zz'}
		createOption = function(item) {
			var option = new Option();
			option.value = item.pk   || item.id   || item[0];
			option.text  = item.text || item.name || item[2];
			return option;
		},

	Field = function(info) {
		this.name  = info.name;
		this.label = info.label;
		this.type  = info.type || "string";
		this.nullable = (info.nullable == null ? true : info.nullable);
		this.checkReg = info.checkReg;
		this.options = info.options;
		this.jsonUrl = info.jsonUrl;
		this.multiple = (info.multiple == "true") || false;
		this.onchange = info.onchange;
		this.width  = info.width || "250px";
		this.height = info.height;	
		this.defaultValue = info.defaultValue;

		switch(this.type.toLowerCase()) {
			case "number":
				this.mode = "number";
				this.checkReg = this.checkReg || "/^[0-9]*[1-9][0-9]*$/";
				break;
			case "string":
				this.mode = "string";
				break;
			case "date":
				this.mode = "date";
				var defaultValue = this.defaultValue;
				if( defaultValue && (/today[\s]*-/gi).test(defaultValue) ) {
					var deltaDays = parseInt(defaultValue.split("-")[1]);
					var today = new Date();
					today.setDate(today.getDate() - deltaDays);
					this.defaultValue = today.format('yyyy-MM-dd');
				} 
				break;
		}
	};

	Field.prototype = {
		createColumn: function() {
			var column = "<column name='" +this.name+ "' caption='" +this.label+ "' mode='" +this.mode+ "' empty='" +this.nullable+ "' ";
			if(this.checkReg) {
				column += " inputReg='" +this.checkReg+ "' ";
			}
			if(this.multiple) {
				column += " multiple='multiple' ";
			}
			if(this.onchange) {
				column += " onchange='" + this.onchange + "' ";
			}
			if(this.height) {
				column += " height='" + this.height + "' ";
			}

			if(this.options) {
				if (this.options.codes == "year") {
					this.options.codes = '2010|2011|2012|2013|2014|2015|2016|2017|2018|2019|2020';
					this.options.names = '2010|2011|2012|2013|2014|2015|2016|2017|2018|2019|2020';
				}
				if (this.options.codes == "month") {
					this.options.codes = '1|2|3|4|5|6|7|8|9|10|11|12';
					this.options.names = '一月|二月|三月|四月|五月|六月|七月|八月|九月|十月|十一月|十二月';
				}
				column += " editor='comboedit' editorvalue='" + this.options.codes + "' editortext='" + this.options.names + "'";
			}

			if(this.jsonUrl) {
				column += " editor='comboedit' editorvalue='' editortext=''"; // editorvalue='1|2|3' editortext='1|2|3'
				var fThis = this;
				$.ajax({
					url : fThis.jsonUrl,
					method: "GET",
					type : "json",
					ondata : function() { 
						var result = this.getResponseJSON();
						if( result ) {
							var sEl = $1(fThis.name);
							result.each(function(i, value){
								sEl.options[sEl.options.length] = createOption(value);
							});
						}				
					}
				});
			}	 

			return column + "/>";
		},

		createLayout: function() {
			var layout = [];
			layout[layout.length] = " <TR>";
			layout[layout.length] = "    <TD width='88'><label binding='" + this.name + "'/></TD>";
			layout[layout.length] = "    <TD><input binding='" + this.name + "' style='width:" + this.width + ";height:" + (this.height||'18px') + ";'/></TD>";
			layout[layout.length] = " </TR>";

			return layout.join("");
		},		

		createDataNode: function() {
		 	if(this.defaultValue) {
		 		return "<" + this.name + "><![CDATA[" + this.defaultValue + "]]></" + this.name + ">";
		 	}
			return "";
		}
	}

	$.json2Form = function(formId, jsonTemplate, buttonBox) {
		var infos = jsonTemplate ? eval(jsonTemplate) : [];

		var columns = [];
		var layouts = [];
		var datarow = [];
		infos.each(function(i, info) {
			info.name = info.name || "param" + (i+1);
			var item = new Field(info);
			columns.push(item.createColumn());
			layouts.push(item.createLayout());
			datarow.push(item.createDataNode());
		});
		
		var str = [];
		str[str.length] = "<xform>";
		str[str.length] = "    <declare>";
		str[str.length] = columns.join("");
		str[str.length] = "    </declare>";
		str[str.length] = "    <layout>";
		str[str.length] = layouts.join("") + (buttonBox || "");
		str[str.length] = "    </layout>";
		str[str.length] = "    <data><row>" + datarow.join("") + "</row></data>";
		str[str.length] = "</xform>";
		
		return $.F(formId, $.XML.toNode(str.join("")));
	};

	// ---------------------------- 多级下拉选择联动 ------------------------------------------------
	$.getNextLevelOption = function(form, currLevel, currLevelValue, service, nextLevel) {
		if(currLevel == null || currLevelValue == null || service == null || nextLevel == "") return;
		
		var params = {};
		params[currLevel] = currLevelValue;
 
		$.ajax({
			url : service,
			method: "POST",
			params : params,
			type : "json",
			ondata : function() { 
				var result = this.getResponseJSON();
				if( result && result.length > 0) {
					var sEl = $1(nextLevel);
					sEl.options.length = 0; // 先清空
					for(var i = 0; i < result.length; i++) {
						sEl.options[i] = createOption(result[i]);
					}

					// 设置为默认选中第一个
					form.updateDataExternal(nextLevel, sEl.options[0].value);
				}				
			}
		});
	};

	/* 判断方法是否相等 */
	$.funcCompare = function(func1, func2) {
		if(func1 == null && func2 != null) {
			return false;
		}
		if(func2 == null && func1 != null) {
			return false;
		}
		if(func2 == null && func1 == null) {
			return true;
		}

		var fn = /^(function\s*)(\w*\b)/;
		return func1.toString().replace(fn,'$1') === func2.toString().replace(fn,'$1'); 
	}

	$.createOption = createOption;

}) (tssJS);