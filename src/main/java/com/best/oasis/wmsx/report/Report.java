package com.best.oasis.wmsx.report;

import java.util.HashMap;
import java.util.Map;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

import com.jinhe.tss.framework.component.param.ParamConstants;
import com.jinhe.tss.framework.persistence.entityaop.IDecodable;
import com.jinhe.tss.framework.persistence.entityaop.OperateInfo;
import com.jinhe.tss.framework.web.dispaly.tree.ILevelTreeNode;
import com.jinhe.tss.framework.web.dispaly.tree.TreeAttributesMap;
import com.jinhe.tss.framework.web.dispaly.xform.IXForm;
import com.jinhe.tss.util.BeanUtil;

@Entity
@Table(name = "wmsx_report")
@SequenceGenerator(name = "report_sequence", sequenceName = "report_sequence", initialValue = 1, allocationSize = 10)
public class Report extends OperateInfo implements ILevelTreeNode, IXForm, IDecodable {
    
    static final int TYPE0 = 0;  // 报表分组
    static final int TYPE1 = 1;  // 业务报表
    
    static final Long DEFAULT_PARENT_ID = 0L;
 
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "report_sequence")
    private Long    id;         // 主键
    
    private String  name;       // 展示名称
    
    @Column(length = 2000)  
    private String  script;     // SQL
    private String  param;      // 参数值
    
    private Integer type;       // 种类  0：报表分组 1: 业务报表
    private String  remark; 
    
    private Long    parentId;  // 父节点
    private Integer seqNo;    // 排序号
    private String  decode;  // 层码，要求唯一
    private Integer levelNo;// 层次值
    
    private Integer disabled = ParamConstants.FALSE; // 停用/启用标记
    private Integer deleted  = ParamConstants.FALSE; // 删除标记
    
    public String toString() {
        return "报表【id = " + this.id + ", name = " + this.name + "】";
    }
    
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getParam() {
        return param;
    }
    public void setParam(String param) {
        this.param = param;
    }
    public Integer getType() {
        return type;
    }
    public void setType(Integer type) {
        this.type = type;
    }
    public Long getParentId() {
        return parentId;
    }
    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }
    public Integer getSeqNo() {
        return seqNo;
    }
    public void setSeqNo(Integer seqNo) {
        this.seqNo = seqNo;
    }
    public String getDecode() {
        return decode;
    }
    public void setDecode(String decode) {
        this.decode = decode;
    }
    public Integer getLevelNo() {
        return levelNo;
    }
    public void setLevelNo(Integer levelNo) {
        this.levelNo = levelNo;
    }
    public Integer getDisabled() {
        return disabled;
    }
    public void setDisabled(Integer disabled) {
        this.disabled = disabled;
    }
    public Integer getDeleted() {
        return deleted;
    }
    public void setDeleted(Integer deleted) {
        this.deleted = deleted;
    }
    public String getRemark() {
        return remark;
    }
    public void setRemark(String remark) {
        this.remark = remark;
    }
    public String getScript() {
        return script;
    }
    public void setScript(String script) {
        this.script = script;
    }

    public TreeAttributesMap getAttributes() {
        TreeAttributesMap map = new TreeAttributesMap(id, name);;
       
        String icon_path;
        if (TYPE0 == type) {
            icon_path = "framework/images/folder.gif";
        } 
        else {
            icon_path = "framework/images/article" + (disabled == ParamConstants.TRUE ? "_2" : "") + ".gif";
        } 
        map.put("icon", icon_path);
        map.put("parentId", parentId);
        map.put("disabled", disabled);
        map.put("type", type);
 
        super.putOperateInfo2Map(map);
        return map;
    }

    public Map<String, Object> getAttributesForXForm() {
        Map<String, Object> map = new HashMap<String, Object>();
        BeanUtil.addBeanProperties2Map(this, map);
        return map;
    }

    public Class<?> getParentClass() {
        return this.getClass();
    }
}
