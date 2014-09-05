package com.jinhe.dm.data.util;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

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
    
	public static List<Date> daysBetweenFromAndTo(Date fromDate, Date toDate) {
		List<Date> rltList = new ArrayList<Date>();
		while (fromDate.before(toDate)) {
			rltList.add(fromDate);
			fromDate = addDays(fromDate, 1);
		}
		rltList.add(toDate);

		return rltList;
	}
	
    public static int getYear(Date now) {
    	Calendar pointedDay = Calendar.getInstance();
    	pointedDay.setTime(now);
        return pointedDay.get(Calendar.YEAR);
    }
    
    public static int getMonth(Date now) {
    	Calendar pointedDay = Calendar.getInstance();
    	pointedDay.setTime(now);
    	return pointedDay.get(Calendar.MONTH) + 1; // 获取月份，0表示1月份
    }
    
    public static int getDay(Date now) {
    	Calendar pointedDay = Calendar.getInstance();
    	pointedDay.setTime(now);
        return pointedDay.get(Calendar.DAY_OF_MONTH);
    }
    
    public static int getHour(Date date) {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);
        return calendar.get(Calendar.HOUR_OF_DAY);
    }
    
    /**
     * 判断是否是月末
     */
    public static boolean isMonthEnd(Date day){
        Calendar c = Calendar.getInstance();
        c.setTime(day);
        return c.get(Calendar.DATE) == c.getActualMaximum(Calendar.DAY_OF_MONTH);
    }
    
    public static String toYYYYMM(Object year, int monthOfYear){
    	return year + (monthOfYear < 10 ? "0" : "") + monthOfYear;
    }
    
    public static String toYYYYMM(Date time){
    	return toYYYYMM(getYear(time), getMonth(time));
    }
}
