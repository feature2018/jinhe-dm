var serviceUrlTransQ = Query.get("service") || "../display/json/193";
	
	function queryTransQ() {

		var selectedDate = $$("selectedDate").value;

		Ajax({
			url : serviceUrlTransQ,
			method : "POST",
			params : {"param1": selectedDate,"param2": selectedDate}, 
			type : "json",
			waiting : true,
			ondata : function() {
				var data = eval(this.getResponseText());
				showTransQ(data);
			}
		});	  
	}

	var COLORS = ['red', 'green', '#f76864', 'yellow', 'blue', '#555555', '#4444444'];

	function showTransQ(originData) {
		var total = 0;
		var data = [];
		for(var i = 0; i < originData.length; i++) {
			var weight = originData[i]["重量"];
			var province = originData[i]["省份"];

			total += weight;
			data[i] = {name: province, value: weight, color: COLORS[i] };
		}
				
	    $(function(){
				var chart = new iChart.Donut2D({
					render : 'canvasDivTransQ',
					data: data,
					title : {
						text : '各省货量分布',
						color : '#3e576f'
					},
					footnote : {
						text : '单位：T',
						color : '#486c8f',
						fontsize : 20,
						padding : '0 38'
					},
					center : {
						text:'总量:' + total,
						color:'#3e576f',
						shadow:true,
						shadow_blur : 0,
						shadow_color : '#557797',
						shadow_offsetx : 0,
						shadow_offsety : 0,
						fontsize : 40
					},
					sub_option : {
						label : {
							background_color:null,
							sign:false,//设置禁用label的小图标
							padding:'0 3',
							border:{
								enable:false,
								color:'#666666'
							},
							fontsize:20,
							fontweight:600,
							color : '#4572a7'
						},
						border : {
							width : 2,
							color : '#ffffff'
						}
					},
					shadow : false,
					shadow_blur : 0,
					shadow_color : '#aaaaaa',
					shadow_offsetx : 0,
					shadow_offsety : 0,
					background_color:'#FFF8DC',
					offset_angle:-120,//逆时针偏移120度
					showpercent:false,
					decimalsnum:2,
					width : 1900,
					height : 600,
					radius:200
				});
				
				chart.draw();
			});
	}