/*
 *	函数说明：大数据显示进度
 *	参数：	string:url                      同步进度请求地址
			xmlNode:data                    XmlNode实例
 *	返回值：
 */
var Progress = function(url, data, cancelUrl) {
	this.progressUrl = url;
	this.cancelUrl = cancelUrl;
	this.id = UniqueID.generator();
	this.refreshData(data);
}

/*
 *	函数说明：更新数据
 */
Progress.prototype.refreshData = function(data) {
	this.percent      = data.selectSingleNode("./percent").text;
	this.delay        = data.selectSingleNode("./delay").text;
	this.estimateTime = data.selectSingleNode("./estimateTime").text;
	this.code         = data.selectSingleNode("./code").text;

	var feedback = data.selectSingleNode("./feedback");
	if(feedback != null) {
		alert(feedback.text);
	}
}

/*
 *	开始执行
 */
Progress.prototype.start = function() {
	this.show();
	this.next();
}

/*
 *	停止执行
 */
Progress.prototype.stop = function() {
	var p = new HttpRequestParams();
	p.url = this.cancelUrl;
	p.setContent("code", this.code);

	var thisObj = this;
	var request = new HttpRequest(p);
	request.onsuccess = function() {
		thisObj.hide();
		clearTimeout(thisObj.timeout);
	}
	request.send();
}

/*
 *	函数说明：显示进度
 *	参数：
 *	返回值：
 */
Progress.prototype.show = function() {
	var thisObj = this;
	var barObj = $(this.id);
	if(null == barObj) {
		barObj = Element.createElement("div");
		barObj.id = this.id;
		barObj.style.width = "200px";
		barObj.style.height = "50px";
		barObj.style.paddingRight = "3px";
		barObj.style.paddingTop = "8px";
		barObj.style.position = "absolute";
		barObj.style.color = "#5276A3";
		barObj.style.textAlign = "center";
		barObj.style.visibility = "hidden";
		document.body.appendChild(barObj);

		barObj.innerHTML = "<object classid=\"clsid:d27cdb6e-ae6d-11cf-96b8-444553540000\" codebase=\"http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=7,0,0,0\" width=\"140\" height=\"30\" id=\"loadingbar\" align=\"middle\">"
			 + "<param name=\"allowScriptAccess\" value=\"sameDomain\" />"
			 + "<param name=\"movie\" value=\"../images/loadingbar.swf\" />"
			 + "<param name=\"quality\" value=\"high\" />"
			 + "<param name=\"wmode\" value=\"transparent\" />"
			 + "<embed src=\"../images/loadingbar.swf\" quality=\"high\" wmode=\"transparent\" width=\"140\" height=\"30\" name=\"loadingbar\" align=\"middle\" allowScriptAccess=\"sameDomain\" type=\"application/x-shockwave-flash\" pluginspage=\"http://www.macromedia.com/go/getflashplayer\" />"
			 + "</object><div/>";
	}
	barObj.style.left = (document.body.offsetWidth - 200) / 2 + "px";
	barObj.style.top  = (document.body.offsetHeight - 50) / 2 + "px";

	var str = [];
	str[str.length] = "<div style=\"height:3px;font-size:1px;background-color:#FFFFFF;width:100%;text-align:left\">";
	str[str.length] = "<div style=\"height:3px;font-size:1px;background-color:#5276A3;width:" + this.percent + "%\"/>";
	str[str.length] = "</div>";
	str[str.length] = "<div style=\"padding-top:5px\">";
	str[str.length] = "<span style=\"font-size:16px;font-family:Arial;font-weight:bold\">" + this.percent + "%</span>";
	str[str.length] = "&nbsp;&nbsp;剩余时间:<span style=\"font-size:16px;font-family:Arial;font-weight:bold\">" + this.estimateTime + "</span>秒";
	str[str.length] = "</div>";
	str[str.length] = "<div style=\"padding-top:5px\">";
	str[str.length] = "<a href=\"#\" style=\"margin-top:30px;color:#5276A3;text-decoration:underline\">取 消</a>";
	str[str.length] = "</div>";
	barObj.childNodes[1].innerHTML = str.join("");
	barObj.style.visibility = "visible";

	var link = barObj.getElementsByTagName("a")[0];
	link.onclick = function() {
		thisObj.stop();
	}
}

/*
 *	函数说明：隐藏进度
 */
Progress.prototype.hide = function() {
	var barObj = $(this.id);
	if(null != barObj) {
		barObj.style.visibility = "hidden";
	}
}

/*
 *	函数说明： 同步进度
 */
Progress.prototype.sync = function() {
	var p = new HttpRequestParams();
	p.url = this.progressUrl;
	p.setContent("code", this.code);
	p.ani = false;

	var thisObj = this;
	var request = new HttpRequest(p);
	request.onexception = function() {
		thisObj.hide();
	}
	request.onresult = function() {
		var data = this.getNodeValue("ProgressInfo");
		thisObj.refreshData(data);
		thisObj.show();
		thisObj.next();
	}
	request.send();
}

/*
 *	函数说明： 延时进行下一次同步
 */
Progress.prototype.next = function() {
	var thisObj = this;

	var percent = parseInt(this.percent);
	var delay   = parseInt(this.delay) * 1000;
	if(100 > percent) {
		this.timeout = setTimeout(function() {
			thisObj.sync();
		}, delay);
	}
	else if(null != this.oncomplete) {
		setTimeout(function() {
			thisObj.hide();
			thisObj.oncomplete();
		}, 200);
	}
}
