IS_TEST = false;

REQUEST_METHOD = IS_TEST ? "GET" : "POST";

var COLORS = ["#FFD700", "#90EE90", "#9370DB", "#9ACD32", "#AFEEEE", "#FF6347", "#00BFFF", "#228B22", "gray", "green", "red", "blue", "yellow", "silver", "orange", "olive"];

// 14345 返回 15000，坐标展示用 
function $round(intNum) {
	intNum = Math.round(intNum);

	if(intNum <= 10) return 10;
	if(intNum <= 100) return 100;

	var toString = intNum.toString();
	var length = toString.length;

	var result = parseInt(toString.charAt(0) + toString.charAt(1)) + 1;
	for(var i = 0; i < length - 2; i++) {
		result = result + "0";
	}

	return parseInt(result);
}

// 14345 返回 14000，坐标展示用 
function $ceil(intNum) {
	intNum = Math.ceil(intNum);

	if(intNum <= 10) return 0;
	if(intNum <= 100) return 10;

	var toString = intNum.toString();
	var length = toString.length;

	var result = parseInt(toString.charAt(0) + toString.charAt(1)) ;
	for(var i = 0; i < length - 2; i++) {
		result = result + "0";
	}

	return parseInt(result);
}

/*
 * 读取给定数组指定字段的最大值、最小值、平均值、总和
 * 参数1  dataArray 数组（一维数组 或 二维数组 或 一维对象数组）
 * 参数2  fieldIndex 字段的下标或Key值，为空则是一维数组
 */
function selectEdge(dataArray, fieldIndex) {
	if( dataArray == null ||　dataArray.length == 0 ) {
		return {"max" : 0, "min" : 0, "avg" : 0, "total" : 0};
	}
	var length = dataArray.length;

	var maxValue = 0, minValue = 999999999, total = 0, avgValue = 0;
	for(var i = 0; i < length; i++) {

		var value = fieldIndex ? dataArray[i][fieldIndex] : dataArray[i];

		maxValue = Math.max(maxValue, value);
		minValue = Math.min(minValue, value);
		total += value;
	}
	avgValue = Math.round(total / length);

	return {"max" : maxValue, "min" : minValue, "avg" : avgValue, "total" : total};
}


/*
 * 处理图表横轴坐标个数（太多了显示难看）。
 * 如果大于12个，则截取n + 1个
 */
function processLabelSize(labels, n) {
	n = n || 6;

	var _length = labels.length;
	if(_length > 12) {
		var labels2 = [];

		for(var i = 0; i < n; i++) {
			labels2.push(labels[Math.round(_length * i / n)]);
		}
		labels2.push(labels[_length - 1]);

		labels = labels2;
	}

	return labels;
}

/*
 * 给定数据，按数据大小划定为N个区间，并计算出每个区间值的频度。
 */
function delimitScope(dataArray, n, fieldIndex) {
	var edge = selectEdge(dataArray, fieldIndex);
	var max = $round(edge.max);
	var min = $ceil(edge.min);

	var scopes = [];
	if(max <= 100) {
		n = 5;
		scopes = [0, 10, 30, 50, 80, 100];
	}
	else {
		for(var i = 0; i <= n; i++) {
			scopes.push( $round( min + ((max - min) * i / n)) );
		}
	}

	var result = {};
	for(var j = 1; j <= n; j++) {
		var key =  scopes[j - 1] + " ~ " +  scopes[j];
		result[key] = 0;
	}

	var _length = dataArray.length;
	for(var i = 0; i < _length; i++) {
		var value = fieldIndex ? dataArray[i][fieldIndex] : dataArray[i];

		for(var j = 1; j <= n; j++) {
			if(value < scopes[j]) {
				var key =  scopes[j - 1] + " ~ " +  scopes[j];
				result[key] = result[key] + 1;
				break;
			}
		}
	}

	return result;
}


// 合并两个对象的属性
function combine(obj1, obj2) {
	if(obj1 == null) return obj2;
    if(obj2 == null) return obj1;

    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
}

/*
 * 过滤参数集，剔除掉为空的参数项。
 * PASS: 因JQuery的ajax会发送空字符串，而TSS的ajax不发送，导致数据缓存条件失效。
 */
function filterEmptyParams(params) {
	for(var key in params) {
		if(params[key] == null || params[key] == "") {
			delete params[key];
		}
	}
}

// 读取画布上一级element的大小，以自动调整画布的大小
function autoAdjustSize(elementID) {
	var parentNode;
	if($$(elementID).parentNode) {
		parentNode = $$(elementID).parentNode;
	}
	else {
		parentNode = document.body;
	} 

	var _width  = parentNode.offsetWidth - 5;
    var _height = parentNode.offsetHeight - 5;

    return [ Math.max(600, _width), Math.max(300, _height)];
}

function getLastFlushTime() {
	var today = new Date();
	return today.format('yyyy-MM-dd hh:mm:ss');  
}


URL_DOWNLOAD = 'download/';

/*
 * 导出数据为CSV文件。
 * 由数据服务先行生成CSV文件放在服务器的固定目录上，返回文件名称，再以http连接上去下载。
 *
 * 参数1  dataUrl 数据服务地址
 * 参数2  queryParams 数据服务参数
 */
function $exportCSV(dataUrl, queryParams) {
	tss.ajax({
		url: dataUrl,
		method: 'POST',
		params: queryParams, 
		type: 'json',
		ondata : function() {
			// 根据返回的导出文件名（压缩后的），生成下载链接。
			var fileName = this.getResponseText();
			if (fileName) {
				var frameName = createExportFrame();
    			$1(frameName).setAttribute("src", URL_DOWNLOAD + fileName);
			}
		}
	});
}

/* 创建导出用iframe */
function createExportFrame() {
	var frameName = "exportFrame";
	var frameObj = $$(frameName);
	if( frameObj == null ) {
		var exportDiv = document.createElement("div"); 
		exportDiv.innerHTML = "<div><iframe id='" + frameName + "' src='about:blank' style='display:none'></iframe></div>";
		document.body.appendChild(exportDiv);
	}
	return frameName;
}