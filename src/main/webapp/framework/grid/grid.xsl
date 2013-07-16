<?xml version="1.0"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/TR/WD-xsl" version="1.0">
    <xsl:template match="/">
		<table border="0" cellspacing="0" cellpadding="0" style="table-layout:fixed">
			<colgroup>
				<xsl:if test="//declare[@header!='']">
					<col align="center"/>
				</xsl:if>
				<xsl:if test="//declare[(@sequence='true') or not(@sequence)]">
					<col align="center" class="sequence" id="sequence"/>
				</xsl:if>
				<xsl:for-each select=".//column">
					<col>
						<xsl:attribute name="align">
							<xsl:choose>
								<xsl:when test="@align"><xsl:value-of select="@align"/></xsl:when>
								<xsl:otherwise><xsl:eval>getAlign()</xsl:eval></xsl:otherwise>
							</xsl:choose>
						</xsl:attribute>
						<xsl:attribute name="caption"><xsl:value-of select="@caption"/></xsl:attribute>
						<xsl:if test=".[@display='none']">
							<xsl:attribute name="class">hidden</xsl:attribute>
						</xsl:if>       
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
					<xsl:eval>void(curRow=childNumber(this) + startNum)</xsl:eval>
					<tr>
						<xsl:apply-templates select="@*"/>						
						<xsl:attribute name="_index"><xsl:eval>curRow</xsl:eval></xsl:attribute>
						<xsl:attribute name="class"><xsl:value-of select="@class"/></xsl:attribute>
						<xsl:if test="//declare[@header!='']">
							<td mode="cellheader" name="cellheader">
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
								<nobr><xsl:eval>curRow</xsl:eval></nobr>
							</td>
						</xsl:if>
						<xsl:for-each select="//declare/*">
							<td>	
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
    </xsl:template>
	
    <xsl:template match="//declare">
        <tr>
            <xsl:if test=".[@header!='']">
                <td width="50px">
                    <xsl:attribute name="class">column</xsl:attribute>
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
                <td width="50px">
                    <xsl:attribute name="class">column</xsl:attribute>
                    <nobr>序号</nobr>
				</td>
            </xsl:if>
            <xsl:for-each select=".//*">
				<xsl:apply-templates select="."/>
            </xsl:for-each>
        </tr>
    </xsl:template>
	
    <xsl:template match="column">
        <td>
            <xsl:attribute name="class">column</xsl:attribute>
            <xsl:attribute name="name"><xsl:value-of select="@name"/></xsl:attribute>            
			<xsl:if test=".[@sortable='true']" expr="isHead==true">
				<xsl:attribute name="sortable">true</xsl:attribute>
			</xsl:if>       
			<xsl:attribute name="width"><xsl:value-of select="@width"/></xsl:attribute>      
            <nobr>
				<xsl:eval>getCaption()</xsl:eval>
			</nobr>
		</td>
    </xsl:template>
	
    <xsl:template match="@*">
        <xsl:copy><xsl:value-of/></xsl:copy>
    </xsl:template>
	
    <xsl:script>
		var isHead = false;
		var gridId = "";
		var startNum = 0;
	</xsl:script>
    <xsl:script>
        var curRow = 0;
 
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
