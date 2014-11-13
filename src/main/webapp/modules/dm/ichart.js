
// 画各种图

function drawColumn3D(canvasName, data, labels, max, title, unitName, width, height, fontsize) {
	var columnWidth =  width / (labels.length*2.2);
	fontsize = fontsize || 18; // 字体大小
	var chart = new iChart.ColumnStacked3D({
			render : canvasName,
			data: data,
			labels: labels,
			title : {
				text: title,
				color:'#254d70'
			},
			width: width,
			height: height,
			column_width:columnWidth,
			background_color : '#ffffff',
			shadow : true,
			shadow_blur : 3,
			shadow_color : '#aaaaaa',
			shadow_offsetx : 1,
			shadow_offsety : 0, 
			sub_option:{
				label:{color:'#f9f9f9',fontsize:fontsize,fontweight:600},
				border : {
					width : 2,
					color : '#ffffff'
				} 
			},
			label:{color:'#254d70',fontsize:12,fontweight:600},
			legend:{
				enable:true,
				background_color : null,
				line_height:25,
				color:'#254d70',
				fontsize:12,
				fontweight:600,
				border : {
					enable : false
				}
			},
			tip:{
				enable :true,
				listeners:{
					// tip: 提示框对象、name:数据名称、value:数据值、text:当前文本、i:数据点的索引
					parseText:function(tip,name,value,text,i){
						return name +":" + value + unitName;
					}
				} 
			},
			text_space : 16,//坐标系下方的label距离坐标系的距离。
			zScale:0.5,
			xAngle : 50,
			bottom_scale:1.1, 
			coordinate:{
				width:'98%',
				height:'98%',
				board_deep:10,      // 背面厚度
				pedestal_height:10, // 底座高度
				left_board:false,   // 取消左侧面板 
				shadow:true,        // 底座的阴影效果
				grid_color:'#6a6a80', // 网格线
				// 坐标系的各个面样式
				wall_style:[{color: '#6a6a80'}, {color: '#b2b2d3'}, {color: '#a6a6cb'}, {color: '#6a6a80'}, {color: '#74749b'}, {color: '#a6a6cb'}], 
				axis : {
					color : '#c0d0e0',
					width : 0
				}, 
				scale:[{
					 position:'left',	
					 scale_enable : false,
					 start_scale:0,
					 scale_space:max/10,
					 end_scale:max,
					 label:{color:'#254d70', fontsize:11, fontweight:600}
				}]
			}
	});

	// 利用自定义组件构造左上侧单位
	chart.plugin(new iChart.Custom({
			drawFn:function(){
				// 计算位置
				var coo = chart.getCoordinate(),
					x = coo.get('originx'),
					y = coo.get('originy');
				// 在左上侧的位置，渲染一个单位的文字
				chart.target.textAlign('end')
				.textBaseline('bottom')
				.textFont('600 12px 微软雅黑')
				.fillText('单位(' + unitName + ')', x+10, y-20, false, '#254d70');
				
			}
	}));
	
	chart.draw();
}

function drawColumn2D(canvasName, data, title, width, height) {
	new iChart.Column2D({
		render : canvasName,
		data: data,
		title : title,
		decimalsnum:2,
		width : width,
		height : height,
		sub_option : {
			label : {
				fontsize:11,
				fontweight:600,
				color : '#4572a7'
			},
			border : {
				width : 2,
				radius : '5 5 0 0', //上圆角设置
				color : '#ffffff'
			}
		},
		coordinate:{
			background_color:'#fefefe',
			scale:[{
				 position:'left',	
				 start_scale:0
			}]
		}
	}).draw();
}

function drawBar2D(canvasName, data, title, width, height, onclickfn) {
	new iChart.Bar2D({
		render : canvasName,
		data: data,
		title : title,
		width : width,
		height : height,
		coordinate:{
			width : width * 0.6,
			height : height * 0.8,
			axis:{
				width:[0,0,1,1]
			},
			scale:[{
				 position:'bottom',	
				 start_scale:0
			}]
		},
		shadow:true,
		shadow_color:'#8d8d8d',
		shadow_blur:2,
		shadow_offsety:1,
		shadow_offsetx:1,
		background_color : '#fcfcfc',
		sub_option:{
			border:{
				enable : true,
				color:'#fcfcfc' 
			},
			listeners:{
				parseText:function(r,t){
					return t;
				},
				click : onclickfn || function(){}
			}
		} 
	}).draw();
}

function drawLine2D(canvasName, _data, labels, max, min, title, width, height) {

	labels = processLabelSize(labels, width/120);

	if(labels.length == 0) return;

	var data = [
	        	{
	        		name : '',
	        		value: _data,
	        		color:'#1f7e92',
	        		line_width:2
	        	}
	       ];
	var chart = new iChart.LineBasic2D({
				render : canvasName,
				data: data,
				title : title,
				width : width,
				height : height,
				sub_option:{
					smooth : true, //平滑曲线
					label:false,
					hollow:false,
					hollow_inside:false,
					point_size:2
				},
				tip:{
					enable:true,
					shadow:true
				},
				legend: {
					enable : false
				},
				crosshair:{
					enable:true,
					line_color:'#62bce9'
				},
				coordinate:{
					height:'95%',
                                        width:'100%',
					axis:{
						color:'#9f9f9f',
						width:[0,0,2,2]
					},
					grids:{
						vertical:{
							way:'share_alike',
					 		value:12
						}
					},
					scale:[{
						 position:'left',	
						 start_scale:min,
						 end_scale:max,
						 scale_color:'#9f9f9f'
					},{
						 position:'bottom',	
						 labels:labels
					}]
				}
			});
	chart.draw();
}

function drawPie2D(canvasName, data, title, width, height) {
	new iChart.Pie2D({
		render : canvasName,
		data: data,
		title : title,
		legend : {
			enable : true
		},
		showpercent:true,
		decimalsnum:2,
		width : width,
		height : height,
		radius: height / 2.5
	}).draw();
}

function drawPie3D(canvasName, data, title, width, height, onclick) {  
	var chart = new iChart.Pie3D({
		render : canvasName,
		title:{
			text:title,
			color:'#e0e5e8',
			height:40,
			border:{
				enable:true,
				width:[0,0,2,0],
				color:'#343b3e'
			}
		},
		padding:'2 10',
		footnote:{
			text:'TSS数据分析系统',
			color:'#e0e5e8',
			height:30,
			border:{
				enable:true,
				width:[2,0,0,0],
				color:'#343b3e'
			}
		},
		width : width,
		height : height,
		data:data,
		shadow:true,
		shadow_color:'#15353a',
		shadow_blur:8,
		background_color : '#3b4346',
		gradient:true,
		color_factor:0.28,
		gradient_mode:'RadialGradientOutIn',
		showpercent:true,
		decimalsnum:2,
		legend:{
			enable:true,
			padding:30,
			color:'#e0e5e8',
			border:{
				width:[0,0,0,2],
				color:'#343b3e'
			},
			background_color : null,
		},
		sub_option:{
			offsetx:-40,
			border:{
				enable:false
			},
			label : {
				background_color:'#fefefe',
				sign:false, // 设置禁用label的小图标
				line_height:10,
				padding:4,
				border:{
					enable:true,
					radius : 4,//圆角设置
					color:'#e0e5e8'
				},
				fontsize:11,
				fontweight:600,
				color : '#444444'
			},
			listeners : {
				click : onclick || function(){}
			}
		},
		border:{
			width:[0,20,0,20],
			color:'#1e2223'
		}
	});
	
	chart.bound(0);
}

// 环形图
function drawDonut2D(canvasName, data, title, width, height) {
	var chart = new iChart.Donut2D({
		render : canvasName,
		data: data,
		footnote : {
			text : 'TSS数据分析系统',
			color : '#486c8f',
			fontsize : 12,
			padding : '0 38'
		},
		sub_option : {
			label : false,
			border : false
		},
		legend:{
			enable:true,
			padding:150,
			offsetx:-86,
			color:'#3e576f',
			fontsize:20,    //文本大小
			sign_size:20,   //小图标大小
			line_height:24, //设置行高
			sign_space:10,  //小图标与文本间距
			border:false,
			valign:'bottom',
			background_color : null //透明背景
		},
		align : 'left',
		offsetx:50,
		separate_angle:10, //分离角度
		shadow : true,
		shadow_blur : 2,
		shadow_color : '#aaaaaa',
		shadow_offsetx : 0,
		shadow_offsety : 0,
		background_color:'#f3f3f3',
		width : width,
		height : height,
		radius: height / 2.5
	});

	//利用自定义组件构造右侧说明文本
	chart.plugin(new iChart.Custom({
			drawFn:function(){
				chart.target.textAlign('start')
				.textBaseline('top')
				.textFont('600 22px 微软雅黑')
				.fillText(title, width*0.66, 100, false, '#3e576f');	
			}
	}));
	
	chart.draw();
}
 
// 更多图形：柱状对比图、组合图等
// 允许添加事件