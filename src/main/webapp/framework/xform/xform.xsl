<?xml version="1.0"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/TR/WD-xsl" version="1.0">
	
<xsl:template match="/">
	<xsl:apply-templates select="*" />
</xsl:template>

<xsl:template match="/*">
	<form>
		<xsl:if test = ".[not(@class) or @class='']">
			<xsl:attribute name="class">xform</xsl:attribute>
		</xsl:if>
		<xsl:if expr="this.getAttribute('method') == null">
			<xsl:attribute name="method">post</xsl:attribute>
		</xsl:if>
		<xsl:if expr="this.getAttribute('name') == null">
			<xsl:attribute name="name">actionForm</xsl:attribute>
		</xsl:if>

		<xsl:apply-templates select="@*" />
		<xsl:apply-templates select="layout" />
	</form>
</xsl:template>

<xsl:template match="//layout">
	<table border="0" bordercolor="#D5E1F0" cellspacing="0" cellpadding="0" width="100%" style="border-collapse:collapse;">
		<tr><td><div class="contentBox">
				<table border="0" cellspacing="0" cellpadding="0" width="100%">
					<xsl:apply-templates select="//declare/column[@mode='hidden']" />
					<xsl:for-each select="TR">
					<tr>
						<xsl:for-each select="TD">
						<td> 
							<xsl:apply-templates select="@*"/>
							<xsl:apply-templates select="node()"/>
						</td>
						</xsl:for-each>
					</tr>
					</xsl:for-each>
				</table>
		</div></td></tr>
	</table>
	<input type="hidden" name="xml" id="xml"/>
</xsl:template>

<xsl:template match="@*">
	<xsl:choose>
		<xsl:when expr="this.nodeName != 'style' || this.selectSingleNode('..').getAttribute('binding') == null">
			<xsl:copy><xsl:value-of/></xsl:copy>
		</xsl:when>
		<xsl:when expr="this.nodeName == 'style' &amp;&amp; this.selectSingleNode('..').getAttribute('binding') != null">
			<xsl:attribute name="defaultStyle"><xsl:value-of/></xsl:attribute>
		</xsl:when>
	</xsl:choose>
</xsl:template>

<xsl:template match="//declare/column[@mode='hidden']">
	<input type="hidden">
		<xsl:attribute name="id">
			<xsl:value-of select = "@name"/>
		</xsl:attribute>
		<xsl:attribute name="value">
			<xsl:eval>getValue(this.getAttribute('name'))</xsl:eval>
		</xsl:attribute>
	</input>
</xsl:template>

<xsl:template match="TD//*">
	<xsl:choose>
		<xsl:when expr = "this.tagName=='label' &amp;&amp; this.getAttribute('binding') != null &amp;&amp; this.getAttribute('binding') != ''">
			<label>
				<xsl:attribute name="id">label_<xsl:eval>getProperty("name")</xsl:eval></xsl:attribute>
				<xsl:attribute name="for"><xsl:eval>getProperty("name")</xsl:eval></xsl:attribute>
				<xsl:eval>getProperty("caption")</xsl:eval>
			</label>
		</xsl:when>
		<xsl:when expr="getMode()=='string' &amp;&amp; getProperty('editor')=='radio'">
			<xsl:apply-templates select="@*" />
			<xsl:attribute name="value"><xsl:eval>getValue(this.getAttribute("binding"))</xsl:eval></xsl:attribute>
			<xsl:attribute name="editable"><xsl:eval>getEditable()</xsl:eval></xsl:attribute>
			<xsl:attribute name="editorvalue"><xsl:eval>getProperty('editorvalue')</xsl:eval></xsl:attribute>
			<xsl:attribute name="editortext"><xsl:eval>getProperty('editortext')</xsl:eval></xsl:attribute>
			<xsl:attribute name="id"><xsl:eval>getProperty("name")</xsl:eval></xsl:attribute>
		</xsl:when>
		<xsl:when expr="getMode()=='string' &amp;&amp; getProperty('editor')=='comboedit'">
			<select>
				<xsl:apply-templates select="@*" />
				<xsl:attribute name="editable"><xsl:eval>getEditable()</xsl:eval></xsl:attribute>
				<xsl:attribute name="editorvalue"><xsl:eval>getProperty('editorvalue')</xsl:eval></xsl:attribute>
				<xsl:attribute name="editortext"><xsl:eval>getProperty('editortext')</xsl:eval></xsl:attribute>
				<xsl:attribute name="id"><xsl:eval>getProperty("name")</xsl:eval></xsl:attribute>
				<xsl:attribute name="style"><xsl:value-of select="@style"/></xsl:attribute>
				<xsl:attribute name="value"><xsl:eval>getValue(this.getAttribute("binding"))</xsl:eval></xsl:attribute>
				&amp;nbsp;
			</select>
		</xsl:when>
		<xsl:when expr="getMode()=='string' &amp;&amp; (getProperty('editor')=='textarea' || this.tagName=='textarea' || this.getAttribute('type')=='textarea')">
			<textarea>
				<xsl:apply-templates select="@*" />
				<xsl:attribute name="caption"><xsl:eval>getProperty("caption")</xsl:eval></xsl:attribute>
				<xsl:attribute name="editable"><xsl:eval>getEditable()</xsl:eval></xsl:attribute>                    
				<xsl:attribute name="empty"><xsl:eval>getProperty("empty")</xsl:eval></xsl:attribute>
				<xsl:attribute name="errorInfo"><xsl:eval>getProperty("errorInfo")</xsl:eval></xsl:attribute>
				<xsl:attribute name="id"><xsl:eval>getProperty("name")</xsl:eval></xsl:attribute>
				<xsl:attribute name="inputReg"><xsl:eval>getProperty("inputReg")</xsl:eval></xsl:attribute>
				<xsl:attribute name="maxLength"><xsl:eval>getProperty("maxLength")</xsl:eval></xsl:attribute>
				<xsl:attribute name="style"><xsl:value-of select="@style"/></xsl:attribute>
				<xsl:attribute name="submitReg"><xsl:eval>getProperty("submitReg")</xsl:eval></xsl:attribute>
				<xsl:attribute name="value"><xsl:eval>getValue(this.getAttribute("binding"))</xsl:eval></xsl:attribute>	
				<xsl:eval>getValue(this.getAttribute("binding"))</xsl:eval>
			</textarea>
		</xsl:when>
		<xsl:when expr="getMode()=='string' &amp;&amp; getProperty('editor')=='password'">
			<input>
				<xsl:apply-templates select="@*[nodeName()!='type']" />
				<xsl:attribute name="type">password</xsl:attribute>
				<xsl:attribute name="caption"><xsl:eval>getProperty("caption")</xsl:eval></xsl:attribute>
				<xsl:attribute name="editable"><xsl:eval>getEditable()</xsl:eval></xsl:attribute>                    
				<xsl:attribute name="empty"><xsl:eval>getProperty("empty")</xsl:eval></xsl:attribute>
				<xsl:attribute name="errorInfo"><xsl:eval>getProperty("errorInfo")</xsl:eval></xsl:attribute>
				<xsl:attribute name="id"><xsl:eval>getProperty("name")</xsl:eval></xsl:attribute>
				<xsl:attribute name="inputReg"><xsl:eval>getProperty("inputReg")</xsl:eval></xsl:attribute>
				<xsl:attribute name="maxLength"><xsl:eval>getProperty("maxLength")</xsl:eval></xsl:attribute>
				<xsl:attribute name="style"><xsl:value-of select="@style"/></xsl:attribute>
				<xsl:attribute name="submitReg"><xsl:eval>getProperty("submitReg")</xsl:eval></xsl:attribute>
				<xsl:attribute name="value"><xsl:eval>getValue(this.getAttribute("binding"))</xsl:eval></xsl:attribute>
			</input>
		</xsl:when>
		<xsl:when expr="getMode()=='string'">
			<input>
				<xsl:apply-templates select="@*" />
				<xsl:attribute name="caption"><xsl:eval>getProperty("caption")</xsl:eval></xsl:attribute>
				<xsl:attribute name="editable"><xsl:eval>getEditable()</xsl:eval></xsl:attribute>                    
				<xsl:attribute name="empty"><xsl:eval>getProperty("empty")</xsl:eval></xsl:attribute>
				<xsl:attribute name="errorInfo"><xsl:eval>getProperty("errorInfo")</xsl:eval></xsl:attribute>
				<xsl:attribute name="id"><xsl:eval>getProperty("name")</xsl:eval></xsl:attribute>
				<xsl:attribute name="inputReg"><xsl:eval>getProperty("inputReg")</xsl:eval></xsl:attribute>
				<xsl:attribute name="maxLength"><xsl:eval>getProperty("maxLength")</xsl:eval></xsl:attribute>
				<xsl:attribute name="style"><xsl:value-of select="@style"/></xsl:attribute>
				<xsl:attribute name="submitReg"><xsl:eval>getProperty("submitReg")</xsl:eval></xsl:attribute>
				<xsl:attribute name="value"><xsl:eval>getValue(this.getAttribute("binding"))</xsl:eval></xsl:attribute>
			</input>
		</xsl:when>
		<xsl:when expr="getMode()=='number'">
			<input>
				<xsl:apply-templates select="@*" />
				<xsl:attribute name="ancestor"><xsl:eval>uniqueID</xsl:eval></xsl:attribute>
				<xsl:attribute name="caption"><xsl:eval>getProperty("caption")</xsl:eval></xsl:attribute>
				<xsl:attribute name="editable"><xsl:eval>getEditable()</xsl:eval></xsl:attribute>
				<xsl:attribute name="empty"><xsl:eval>getProperty("empty")</xsl:eval></xsl:attribute>
				<xsl:attribute name="errorInfo"><xsl:eval>getProperty("errorInfo")</xsl:eval></xsl:attribute>
				<xsl:attribute name="id"><xsl:eval>getProperty("name")</xsl:eval></xsl:attribute>
				<xsl:attribute name="inputReg"><xsl:eval>getProperty("inputReg")</xsl:eval></xsl:attribute>
				<xsl:attribute name="maxLength"><xsl:eval>getProperty("maxLength")</xsl:eval></xsl:attribute>
				<xsl:attribute name="pattern"><xsl:eval>getProperty("pattern")</xsl:eval></xsl:attribute>
				<xsl:attribute name="style"><xsl:value-of select="@style"/></xsl:attribute>
				<xsl:attribute name="submitReg"><xsl:eval>getProperty("submitReg")</xsl:eval></xsl:attribute>
				<xsl:attribute name="value"><xsl:eval>getValue(this.getAttribute("binding"))</xsl:eval></xsl:attribute>
			</input>
		</xsl:when>
		<xsl:when expr="getMode()=='function'">
			<input type="text">
				<xsl:apply-templates select="@*" />
				<xsl:attribute name="ancestor"><xsl:eval>uniqueID</xsl:eval></xsl:attribute>
				<xsl:attribute name="caption"><xsl:eval>getProperty("caption")</xsl:eval></xsl:attribute>
				<xsl:attribute name="clickOnly"><xsl:eval>getProperty("clickOnly")</xsl:eval></xsl:attribute>
				<xsl:attribute name="cmd"><xsl:eval>getProperty("cmd")</xsl:eval></xsl:attribute>
				<xsl:attribute name="editable"><xsl:eval>getEditable()</xsl:eval></xsl:attribute>
				<xsl:attribute name="empty"><xsl:eval>getProperty("empty")</xsl:eval></xsl:attribute>
				<xsl:attribute name="inputReg"><xsl:eval>getProperty("inputReg")</xsl:eval></xsl:attribute>
				<xsl:attribute name="id"><xsl:eval>getProperty("name")</xsl:eval></xsl:attribute>
				<xsl:attribute name="style"><xsl:value-of select="@style"/></xsl:attribute>
				<xsl:attribute name="submitReg"><xsl:eval>getProperty("submitReg")</xsl:eval></xsl:attribute>
				<xsl:attribute name="value"><xsl:eval>getValue(this.getAttribute("binding"))</xsl:eval></xsl:attribute>
			</input>
		</xsl:when>
		<xsl:otherwise>
			<xsl:copy>
				<xsl:apply-templates select="@*" />
				<xsl:if expr="getEditable()=='false'">
					<xsl:attribute name="disabled">true</xsl:attribute>
				</xsl:if>
				<xsl:apply-templates/>
			</xsl:copy>
		</xsl:otherwise>
	</xsl:choose>
</xsl:template>

<xsl:template match="TD//text()"><xsl:copy/></xsl:template>

<xsl:script>
	var uniqueID = "";
	var baseurl  = "";
	var formEditable = "";
</xsl:script>

<xsl:script>
	function getMode() {
		var binding = this.getAttribute("binding");
		if( binding == null) {
			return null;
		} else {
			return this.selectSingleNode("//declare/column[@name='" + binding + "']").getAttribute("mode");
		}
	}
	function getValue(binding) {
		var str = "";
		var tempNode = this.selectSingleNode("//data/row");
		if(tempNode != null) {
			var tempNodeValue = tempNode.selectSingleNode(binding);
			if(tempNodeValue != null) {
				str = tempNodeValue.text.replace(/&amp;nbsp;/g, "&#160;");
			}
		}
		return str;
	}
	function getProperty(propName) {
		var binding = this.getAttribute("binding");
		if(binding == null) {
			return "null";
		} 
		else {
			var propValue = this.selectSingleNode("//declare/column[@name='" + binding + "']").getAttribute(propName);
			if( propValue == null) {
				propValue = "null";
			}
			return propValue;
		}
	}
	function addPrefix() {
		return uniqueID + ".";
	}
	function getEditable() {
		if(formEditable == "false") {
			return "false";
		} else {
			return getProperty('editable');
		}
	}
</xsl:script>

</xsl:stylesheet>