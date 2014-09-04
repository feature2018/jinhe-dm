package com.jinhe.dm.log;

import java.io.Serializable;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

import com.jinhe.tss.framework.persistence.IEntity;

@Entity
@Table(name = "dm_access_log")
@SequenceGenerator(name = "access_log_sequence", sequenceName = "access_log_sequence", initialValue = 10000, allocationSize = 10)
public class AccessLog implements IEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "access_log_sequence")
    private Long id; 

    @Column(nullable = false)
    private String className; // 类名
    
    @Column(length = 100, nullable = false)
    private String methodName; // 方法名
    
    @Column(nullable = false)
    private String methodCnName; // 方法中文名
    
    @Column(length = 1000)
    private String params; // 参数
    
    private Date accessTime;  // 访问时间
    private Long runningTime; // 运行时长
    
    private Long userId;      // 登录用户
    private String ip;        // 访问者IP地址

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getMethodName() {
        return methodName;
    }

    public void setMethodName(String methodName) {
        this.methodName = methodName;
    }

    public String getMethodCnName() {
        return methodCnName;
    }

    public void setMethodCnName(String methodCnName) {
        this.methodCnName = methodCnName;
    }

    public Date getAccessTime() {
        return accessTime;
    }

    public void setAccessTime(Date accessTime) {
        this.accessTime = accessTime;
    }

    public Long getRunningTime() {
        return runningTime;
    }

    public void setRunningTime(Long runningTime) {
        this.runningTime = runningTime;
    }

    public String getParams() {
        return params;
    }

    public void setParams(String params) {
        this.params = params;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

	public String getIp() {
		return ip;
	}

	public void setIp(String ip) {
		this.ip = ip;
	}
	
	public Serializable getPK() {
		return this.id;
	}
}
