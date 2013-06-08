 
  drop table TBL_TEMP;
  
  create temporary table TBL_TEMP
    (
      ID INTEGER not null, 
      udf1 varchar(255), 
      udf2 varchar(255), 
      udf3 varchar(255)
    );
    
  alter table TBL_TEMP add primary key (ID);

truncate table component_param;
insert into component_param 
	(id, code, name, value, text, decode, hidden, lockVersion) 
values
	(0, '0', '0', '0', '0', '00000', 1, 0);
commit;
