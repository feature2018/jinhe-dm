package com.jinhe.dm.data.sqlquery;

import java.util.Arrays;

import org.junit.Test;

import com.jinhe.dm.data.InvSnapshotVO;

public class AbstractVOTest {
	
	@Test
	public void test() {
		InvSnapshotVO vo = new InvSnapshotVO();
		vo.setWhCode("仓库");
		vo.setCustomerCode("货主");
		vo.setSkuCode("1234");
		vo.setQtyUom(100D);
		
		System.out.println(vo.displayHeaderNames());
		System.out.println(Arrays.asList(vo.displayFieldValues()));
	}

}
