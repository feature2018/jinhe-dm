package com.jinhe.dm.data.util;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import com.jinhe.tss.framework.exception.BusinessException;
import com.jinhe.tss.util.BeanUtil;
import com.jinhe.tss.util.EasyUtils;

public class GroupByUtil {
	
    /** 
     * 按指定维度，将数据总和汇总。
     */
    @SuppressWarnings("unchecked")
	public static Map<String, ?> getSum(List<?> voList, String field, String...dimensions) {
    	if (EasyUtils.isNullOrEmpty(voList)) {
            return new HashMap<String, Object>();
        }
    	if(dimensions == null || dimensions.length < 1) {
    		throw new BusinessException("参数个数不对。" + dimensions);
    	}
    	
    	Map<String, Object> resultMap = new HashMap<String, Object>();
        for (Object vo : voList) {
            Double value = EasyUtils.convertObject2Double(BeanUtil.getPropertyValue(vo, field));
            
            Map<String, Object> parentMap = resultMap;
            Map<String, Object> sonMap = resultMap;
            for( int i = 0; i < dimensions.length - 1; i++) {
            	String dimension = dimensions[i];
            	String key = (String) BeanUtil.getPropertyValue(vo, dimension);
            	
            	sonMap = (Map<String, Object>) parentMap.get(key);
            	if(sonMap == null) {
            		parentMap.put(key, sonMap = new HashMap<String, Object>());
                }
            	
            	parentMap = sonMap;
            }
            
            String lastDimension = dimensions[dimensions.length - 1];
            String lastKey = BeanUtil.getPropertyValue(vo, lastDimension).toString();
			Double sumValue = (Double) sonMap.get(lastKey);
            if(sumValue == null) {
            	sumValue = 0d;
            }
            
            sumValue += value;
            sonMap.put(lastKey, sumValue);
        }
    	
    	return resultMap;
    }
    
    /** 
     * 按指定维度，将数据个数汇总。
     */
    @SuppressWarnings("unchecked")
	public static Map<String, ?> getCount(List<?> voList, String field, String...dimensions) {
    	if (EasyUtils.isNullOrEmpty(voList)) {
            return new HashMap<String, Object>();
        }
    	if(dimensions == null || dimensions.length < 1) {
    		throw new BusinessException("参数个数不对。" + dimensions);
    	}
    	
    	Map<String, Object> resultMap = new HashMap<String, Object>();
    	Set<String> keyPathSet = new HashSet<String>();
        for (Object vo : voList) {
            Object value = BeanUtil.getPropertyValue(vo, field);
            
            Map<String, Object> parentMap = resultMap;
            Map<String, Object> sonMap = resultMap;
            String keyPath = "";
            for( int i = 0; i < dimensions.length - 1; i++) {
            	String dimension = dimensions[i];
            	String key = (String) BeanUtil.getPropertyValue(vo, dimension);
            	
            	sonMap = (Map<String, Object>) parentMap.get(key);
            	if(sonMap == null) {
            		parentMap.put(key, sonMap = new HashMap<String, Object>());
                }
            	
            	parentMap = sonMap;
            	
            	if(keyPath.length() > 0) {
            		keyPath += ",";
            	}
            	keyPath += key;
            }
            
            String lastDimension = dimensions[dimensions.length - 1];
            String lastKey = (String) BeanUtil.getPropertyValue(vo, lastDimension);
            Set<Object> valuesSet = (Set<Object>) sonMap.get(lastKey);
            if(valuesSet == null) {
            	sonMap.put(lastKey, valuesSet = new HashSet<Object>());
            }
            
            if(keyPath.length() > 0) {
        		keyPath += ",";
        	}
            keyPath += lastKey;
            keyPathSet.add(keyPath);
    	
            valuesSet.add(value);
        }
        
        for(String keyPath : keyPathSet) {
        	// 默认加一个",end"，防止keypath最后一个值为空字符串
        	String[] keys = (keyPath + ",end").split(",");
        	
        	Map<String, Object> sonMap = resultMap;
        	
        	for( int i = 0; i < keys.length - 2; i++) {
            	String key = keys[i];
        		sonMap = (Map<String, Object>) sonMap.get(key);
        	}
        	
        	String lastKey = keys[keys.length - 2];
        	Set<Object> valuesSet = (Set<Object>) sonMap.get(lastKey);
			sonMap.put(lastKey, valuesSet.size());
        }
    	
    	return resultMap;
    }
    
    /**
     * 对数据按指定维护和值域进行汇总求和后，按大小分别取最大的和最小的topX个
     * 
     * @param voList
     * @param topx
     * @param field
     * @param dimension
     * @return
     */
    public static Object getSumTopx(List<?> voList, int topx, String field, String dimension) {
    	// 按 Field 进行数量汇总，汇总后再按从多到少进行排序
    	Map<String, ?> skuQtys = GroupByUtil.getSum(voList, field, dimension);
    	List<Object[]> list = new ArrayList<Object[]>();
    	for(Entry<String, ?> entry : skuQtys.entrySet()) {
    		list.add(new Object[] { entry.getKey(), entry.getValue() });
    	}

		Collections.sort(list, new Comparator<Object[]>() {   
		    public int compare(Object[] o1, Object[] o2) {      
		        Double value1 = EasyUtils.convertObject2Double(o1[1]);
				Double value2 = EasyUtils.convertObject2Double(o2[1]);
				return value2.intValue() - value1.intValue(); 
		    }
		});
		
		int total = list.size();
		int topX = Math.min(topx, total);
		return new Object[] { list.subList(0, topX), list.subList(total - topX, total) };
    }
}
