package com.jinhe.dm.data.util;

import java.util.ArrayList;
import java.util.List;

import junit.framework.Assert;

import org.junit.Test;

import com.jinhe.dm.data.InvSnapshotVO;

public class GroupByUtilTest {
 
	@Test
	public void testGroupBy() {

		List<InvSnapshotVO> voList = new ArrayList<InvSnapshotVO>();

		InvSnapshotVO temp = new InvSnapshotVO();
		temp.setWhCode("W1");
		temp.setCustomerCode("C1");
		temp.setLocationCode("L1");
		temp.setSkuCode("SKU1");
		temp.setQtyUom(10D);
		voList.add(temp);

		temp = new InvSnapshotVO();
		temp.setWhCode("W1");
		temp.setCustomerCode("C1");
		temp.setLocationCode("L1");
		temp.setSkuCode("SKU2");
		temp.setQtyUom(10D);
		voList.add(temp);

		temp = new InvSnapshotVO();
		temp.setWhCode("W1");
		temp.setCustomerCode("C1");
		temp.setLocationCode("L2");
		temp.setSkuCode("SKU1");
		temp.setQtyUom(1D);
		voList.add(temp);

		temp = new InvSnapshotVO();
		temp.setWhCode("W1");
		temp.setCustomerCode("C1");
		temp.setLocationCode("L2");
		temp.setSkuCode("SKU3");
		temp.setQtyUom(1D);
		voList.add(temp);

		temp = new InvSnapshotVO();
		temp.setWhCode("W1");
		temp.setCustomerCode("C2");
		temp.setLocationCode("L1");
		temp.setSkuCode("SKU1");
		temp.setQtyUom(100D);
		voList.add(temp);

		temp = new InvSnapshotVO();
		temp.setWhCode("W1");
		temp.setCustomerCode("C2");
		temp.setLocationCode("L1");
		temp.setSkuCode("SKU2");
		temp.setQtyUom(1D);
		voList.add(temp);

		temp = new InvSnapshotVO();
		temp.setWhCode("W1");
		temp.setCustomerCode("C2");
		temp.setLocationCode("L2");
		temp.setSkuCode("SKU1");
		temp.setQtyUom(1D);
		voList.add(temp);

		temp = new InvSnapshotVO();
		temp.setWhCode("W1");
		temp.setCustomerCode("C2");
		temp.setLocationCode("L2");
		temp.setSkuCode("SKU3");
		temp.setQtyUom(1D);
		voList.add(temp);

		temp = new InvSnapshotVO();
		temp.setWhCode("W1");
		temp.setCustomerCode("C2");
		temp.setLocationCode("L2");
		temp.setSkuCode("SKU4");
		temp.setQtyUom(1D);
		voList.add(temp);
		
		Assert.assertTrue(GroupByUtil.getCount(null, "skuCode", "customerCode", "whCode").isEmpty());
		Assert.assertTrue(GroupByUtil.getSum(null, "qtyUom", "customerCode", "whCode").isEmpty());
		
		try {
			GroupByUtil.getSum(voList, "qtyUom");
		} catch(Exception e) {
			Assert.assertTrue(e.getMessage(), true);
		}
		
		try {
			GroupByUtil.getCount(voList, "qtyUom");
		} catch(Exception e) {
			Assert.assertTrue(e.getMessage(), true);
		}

   	 	Assert.assertEquals("{W1=126.0}", GroupByUtil.getSum(voList, "qtyUom", "whCode").toString());
   	 	Assert.assertEquals("{W1=4}",     GroupByUtil.getCount(voList, "skuCode", "whCode").toString());
   	 
        Assert.assertEquals("{W1={C1=22.0, C2=104.0}}", 
        		GroupByUtil.getSum(voList, "qtyUom", "whCode", "customerCode").toString());
        
        Assert.assertEquals("{C1={W1=22.0}, C2={W1=104.0}}", 
        		GroupByUtil.getSum(voList, "qtyUom", "customerCode", "whCode").toString());
        
        Assert.assertEquals("{W1={C1={L1=20.0, L2=2.0}, C2={L1=101.0, L2=3.0}}}", 
        		GroupByUtil.getSum(voList, "qtyUom", "whCode", "customerCode", "locationCode").toString());
        
        Assert.assertEquals("{W1={C1={L1={SKU2=10.0, SKU1=10.0}, L2={SKU1=1.0, SKU3=1.0}}, C2={L1={SKU2=1.0, SKU1=100.0}, L2={SKU1=1.0, SKU4=1.0, SKU3=1.0}}}}", 
        		GroupByUtil.getSum(voList, "qtyUom", "whCode", "customerCode", "locationCode", "skuCode").toString());

        Assert.assertEquals("{W1={C1=3, C2=4}}", 
        		GroupByUtil.getCount(voList, "skuCode", "whCode", "customerCode").toString());
        
        Assert.assertEquals("{C1={W1=3}, C2={W1=4}}", 
        		GroupByUtil.getCount(voList, "skuCode", "customerCode", "whCode").toString());
        
        Assert.assertEquals("{W1={C1={L1=2, L2=2}, C2={L1=2, L2=3}}}", 
        		GroupByUtil.getCount(voList, "skuCode", "whCode", "customerCode", "locationCode").toString());
   
	}

}
