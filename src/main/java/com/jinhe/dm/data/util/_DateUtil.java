package com.jinhe.dm.data.util;

import java.util.Calendar;
import java.util.Date;

public class _DateUtil {
	
    /**
     * 获取今天零点。
     */
    public static Date today() {
        return noHMS(new Date());
    }
    
    /**
     * 去掉时分秒
     */
    public static Date noHMS(Date pointedDate) {
    	Calendar c = Calendar.getInstance();
    	c.setTime(pointedDate);
    	
        c.set(Calendar.HOUR_OF_DAY, 0);
        c.set(Calendar.MINUTE, 0);
        c.set(Calendar.SECOND, 0);
        c.set(Calendar.MILLISECOND, 0);
        return c.getTime();
    }
    
    public static Date addDays(Date now, double days) {
        long nowLong = now.getTime(); // 将参考日期转换为毫秒时间
        Date time = new Date(nowLong + (long) (days * 24 * 60 * 60 * 1000)); // 加上时间差毫秒数
        return time;
    }
    
    public static Date subDays(Date now, double days) {
        return addDays(now, days * -1);
    }
}
