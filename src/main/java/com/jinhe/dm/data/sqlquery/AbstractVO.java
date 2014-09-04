package com.jinhe.dm.data.sqlquery;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import com.jinhe.tss.util.BeanUtil;
import com.jinhe.tss.util.DateUtil;

public abstract class AbstractVO {
	
	/**
	 * 展示用表头上各列名称
	 */
	public abstract List<String> displayHeaderNames();

	/**
	 * 直接返回属性值列表
	 */
	public Object[] displayFieldValues() {
		Field[] fields = this.getClass().getDeclaredFields();
		Object[] values = new Object[fields.length];
		
		int index = 0;
		for(Field field : fields) {
			try {
				Object value = BeanUtil.getPropertyValue(this, field.getName());
				if(value != null && field.getType().equals(Date.class)) {
					value = DateUtil.format((Date) value);
				}
				
				values[index] = value;
				index++;
			} catch (Exception e) {
			}
		}
		return values;
	}
	
    public static List<Object[]> voList2Objects(List<? extends AbstractVO> voList) {
        List<Object[]> rlt = new ArrayList<Object[]>();
        for (int i = 0; i < voList.size(); i++) {
            rlt.add(voList.get(i).displayFieldValues());
        }

        return rlt;
    }
}
