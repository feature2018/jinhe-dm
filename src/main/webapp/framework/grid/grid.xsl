<?xml version="1.0"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/TR/WD-xsl" version="1.0">
    <xsl:template match="/">
        <div id="gridTable">
            <xsl:attribute name="style">
                height:260px;
                overflow:hidden;
                position:absolute;
                display:inline;
            </xsl:attribute>
            <table border="0" cellspacing="0" cellpadding="0" style="table-layout:fixed">
                <colgroup>
				    <xsl:if test="//declare[@header!='']">
                        <col align="center"/>
                    </xsl:if>
                    <xsl:if test="//declare[(@sequence='true') or not(@sequence)]">
                        <col align="center" class="sequence"/>
                    </xsl:if>
                    <xsl:for-each select=".//column[not(@display) or not(@display='none')]">
						<col>
							<xsl:attribute name="align">
								<xsl:choose>
									<xsl:when test="@align"><xsl:value-of select="@align"/></xsl:when>
									<xsl:otherwise><xsl:eval>getAlign()</xsl:eval></xsl:otherwise>
								</xsl:choose>
							</xsl:attribute>
						</col>
                    </xsl:for-each>
                </colgroup>
				
                <thead>
					<xsl:eval>void(isHead=true)</xsl:eval>
                    <xsl:apply-templates select="//declare"/>
                </thead>
				
                <tbody class="cell">
					<xsl:eval>void(isHead=false)</xsl:eval>
                    <xsl:for-each select="//data/row">
                        <tr>
                            <xsl:apply-templates select="@*"/>
							<xsl:attribute name="_index"><xsl:eval>childNumber(this)</xsl:eval></xsl:attribute>
                            <xsl:attribute name="height"><xsl:eval>cellHeight</xsl:eval></xsl:attribute>
                            <xsl:attribute name="class"><xsl:value-of select="@class"/></xsl:attribute>
                            <xsl:eval>void(curRow=childNumber(this))</xsl:eval>
							<xsl:if test="//declare[@header!='']">
                                <td mode="cellheader" name="cellheader">
                                    <xsl:attribute name="style">border-width:<xsl:eval>getBorderWidth("cellheader")</xsl:eval>;</xsl:attribute>
                                    <nobr>
										<input class="selectHandle">
											<xsl:attribute name="name"><xsl:eval>gridId</xsl:eval>_header</xsl:attribute>
											<xsl:attribute name="type"><xsl:value-of select="//declare/@header"/></xsl:attribute>
										</input>
									</nobr>
								</td>
                            </xsl:if>
                            <xsl:if test="//declare[(@sequence='true') or not(@sequence)]">
                                <td mode="cellsequence" name="cellsequence">
                                    <xsl:attribute name="style">border-width:<xsl:eval>getBorderWidth("cellsequence")</xsl:eval>;</xsl:attribute>
                                    <nobr><xsl:eval>childNumber(this)</xsl:eval></nobr>
								</td>
                            </xsl:if>
                            <xsl:for-each select="//declare/*[(@display!='none')  or not(@display)]">
								<td>
									<xsl:attribute name="style">border-width:<xsl:eval>getBorderWidth("cell")</xsl:eval>;</xsl:attribute>								
									<xsl:attribute name="name"><xsl:eval>getColumnName()</xsl:eval></xsl:attribute>	
									<xsl:if expr="isHighlightCol()==true">
										<xsl:attribute name="class">highlightCol</xsl:attribute>
									</xsl:if>
									<nobr>&amp;nbsp;</nobr>
								</td>
                            </xsl:for-each>
                        </tr>
                    </xsl:for-each>
                </tbody>
            </table>
        </div>
    </xsl:template>
	
    <xsl:template match="//declare">
        <tr>
            <xsl:attribute name="height"><xsl:eval>cellHeight</xsl:eval></xsl:attribute>
            <xsl:if test=".[@header!='']">
                <td>
                    <xsl:attribute name="class">column</xsl:attribute>
                    <xsl:attribute name="style">border-width:<xsl:eval>getBorderWidth("header")</xsl:eval>;</xsl:attribute>
                    <nobr>
						<xsl:if test=".[@header='checkbox']">
							<input type="checkbox" id="headerCheckAll"/>
						</xsl:if>
						<xsl:if test=".[@header='radio']">
							<input type="radio" id="grid_radio"/>
						</xsl:if>
					</nobr>
				</td>
            </xsl:if>
            <xsl:if test=".[(@sequence='true') or not(@sequence)]">
                <td>
                    <xsl:attribute name="class">column</xsl:attribute>
                    <xsl:attribute name="style">border-width:<xsl:eval>getBorderWidth("sequence")</xsl:eval>;</xsl:attribute>
                    <nobr>序号</nobr></td>
            </xsl:if>
            <xsl:for-each select=".//*">
				<xsl:apply-templates select="."/>
            </xsl:for-each>
        </tr>
    </xsl:template>
	
    <xsl:template match="column[not(@display) or not(@display='none')]">
        <td>
            <xsl:attribute name="class">column</xsl:attribute>
            <xsl:attribute name="style">border-width:<xsl:eval>getBorderWidth()</xsl:eval>;height:<xsl:eval>cellHeight</xsl:eval>px;</xsl:attribute>
            <xsl:attribute name="name"><xsl:value-of select="@name"/></xsl:attribute>            
			<xsl:if test=".[@sortable='true']" expr="isHead==true">
				<xsl:attribute name="sortable">true</xsl:attribute>
			</xsl:if>
            <nobr>
				<xsl:eval>getCaption()</xsl:eval>
			</nobr>
		</td>
    </xsl:template>
	
    <xsl:template match="@*">
        <xsl:copy><xsl:value-of/></xsl:copy>
    </xsl:template>
	
    <xsl:script>
		var cellHeight = 22;
		var isHead = false;
		var gridId;
	</xsl:script>
    <xsl:script>
        var curRow;
        var declare = this.selectSingleNode("//declare");

        function getBorderWidth(s){
            var top = 1;
            var right = 1;
            var bottom = 1;
            var left = 1;

            return top + " " + right + " " + bottom + " " + left;
        }
		
        function getAllColumn() {
            return this.selectNodes(".//column[not(@display) or not(@display='none')]").length;
        }
		
        function getAlign() {
            switch(this.getAttribute("mode")) {
                case "number":
                    return "right";
                    break;
                case "boolean":
                case "date":
                    return "center";
                    break;
                default:
                    return "left";
                    break;

            }
        }
		
        function getCaption() {
            return this.getAttribute("caption") || "&amp;nbsp;";
        }
		
		function getColumnName() {
            return this.getAttribute("name") || "&amp;nbsp;";
        }
		
		function isHighlightCol() {
            return this.getAttribute("highlightCol") == "true";
        }
	

    </xsl:script>
</xsl:stylesheet>
