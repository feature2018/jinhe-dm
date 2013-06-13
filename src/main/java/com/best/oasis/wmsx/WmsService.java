package com.best.oasis.wmsx;

import java.util.List;
import java.util.Map;

import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("/wms")
@Produces( { MediaType.APPLICATION_JSON } )
public interface WmsService {

	@POST
	@Path("/login/{loginName}/{password}")
	Object[] login(@PathParam("loginName") String loginName, 
			@PathParam("password") String password);

	@GET
	@Path("/warehouseList")
	List<Object[]> getWarehouseList();

	@GET
	@Path("/kanban/{whId}")
	Map<String, Object> kanban(@PathParam("whId") Long whId);

}
