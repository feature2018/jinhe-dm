package com.jinhe.dm.customizer.wms;

import java.util.List;
import java.util.Map;

import com.jinhe.tss.framework.component.cache.Cached;

public interface KanbanService {

	@Cached
	List<Map<String, Object>> statisticsWorkAmount(Long whId);

}
