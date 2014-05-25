package com.jinhe.dm.analyse.wms;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.jinhe.dm.data.sqlquery.SQLExcutor;
import com.jinhe.dm.data.sqlquery.SqlConfig;
import com.jinhe.tss.util.EasyUtils;

@Service("KanbanService")
public class KanbanServiceImp implements KanbanService {
	
	public List<Map<String, Object>> statisticsWorkAmount(Long whId) {
		Long allocateTypeId = 2427L; // 分配单据日志
        Long pickTypeId     = 557L;  // 拣货单据日志
        Long checkTypeId    = 2600L; // 验货单据日志
        Long sendTypeId     = 548L;  // 发货单据日志
        Long weightTypeId   = 2616L; // 称重单据日志

        Long allocateCancelTypeId = 2552L; // 分配取消单据日志
        Long pickCancelTypeId     = 2551L; // 拣货取消单据日志
        Long checkCancelTypeId    = 2601L; // 验货取消单据日志
        Long sendCancelTypeId     = 1107L; // 发货取消单据日志
        
        String script = SqlConfig.getWMSSQL("statisticsWorkAmount", 1);
        
        Map<Integer, Object> paramsMap = new HashMap<Integer, Object>();
        paramsMap.put(1, whId);
        
        SQLExcutor excutor = new SQLExcutor();
        excutor.excuteQuery(script, paramsMap);

        Map<String, List<Long>> docOperations = new HashMap<String, List<Long>>();
        
        // 把每个单据做的操作以map的形式先统计出来
        for (Map<String, Object> row : excutor.result) {
            String docNo = (String) row.get("docno");
            Long optTypeId = EasyUtils.convertObject2Long(row.get("opType"));

            List<Long> optTypeIdList = docOperations.get(docNo);
            if (optTypeIdList == null) {
                docOperations.put(docNo, optTypeIdList = new ArrayList<Long>());
            }

            if (optTypeId.equals(allocateCancelTypeId)) { // 预分配（ 可能是昨天做的分配，今天做的取消 ）
                optTypeIdList.remove(allocateTypeId);
                continue;
            }
            if (optTypeId.equals(pickCancelTypeId)) { // 拣货
                optTypeIdList.remove(pickTypeId);
                continue;
            }
            if (optTypeId.equals(checkCancelTypeId)) { // 验货
                optTypeIdList.remove(checkTypeId);
                continue;
            }
            if (optTypeId.equals(sendCancelTypeId)) { // 发货
                optTypeIdList.remove(sendTypeId);
                continue;
            }

            optTypeIdList.add(optTypeId);
        }
        
        Integer[] kanban = new Integer[6];
        
        /** 获取各个环节执行数量 */
        for (int i = 0; i < 6; i++) {
            kanban[i] = 0;
        }

        // 当天到目前为止的下单数
        script = SqlConfig.getWMSSQL("statisticsWorkAmount", 2);
        excutor = new SQLExcutor();
        excutor.excuteQuery(script, paramsMap);
        
        kanban[0] = EasyUtils.convertObject2Integer(excutor.result.get(0).get("total"));
        
        for (Map.Entry<String, List<Long>> entry : docOperations.entrySet()) {
            List<Long> operations = entry.getValue();
            if (operations.contains(allocateTypeId)) {
                kanban[1]++;
            }
            if (operations.contains(pickTypeId)) {
                kanban[2]++;
            }
            if (operations.contains(checkTypeId)) {
                kanban[3]++;
            }
            if (operations.contains(weightTypeId)) {
                kanban[4]++;
            }
            if (operations.contains(sendTypeId)) {
                kanban[5]++;
            }
        }
   
        List<Map<String, Object>> result = new ArrayList<Map<String,Object>>();
        List<String> names  = Arrays.asList("今日下单数", "分配订单数", "拣货订单数", "验货订单数", "称重订单数", "发运订单数");
        List<String> colors = Arrays.asList("red", "#3F5C71", "#a6bfd2", "#d6ffd2", "#3883bd", "green");
        
        for(int i = 0; i < kanban.length; i++) {
            Map<String, Object> map = new HashMap<String, Object>();
            map.put("name", names.get(i));
            map.put("value", kanban[i]);
            map.put("color", colors.get(i));
            
            result.add(map);
        }
        
		return result;
	}
}