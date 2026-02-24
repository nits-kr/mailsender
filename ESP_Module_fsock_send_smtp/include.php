<?php
$sql = mysql_connect("localhost", "root", "dvfersefag243435") or die ("Mysql Error : ".myql_error());
mysql_select_db("svml") or die ("Mysql Error : ".myql_error());
mysql_query("CREATE TABLE IF NOT EXISTS `svml`.`ESP_admin_data` (
	`entity_id` INT(100) NOT NULL AUTO_INCREMENT,
	`body` LONGTEXT,
	`date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`entity_id`)
) ENGINE=InnoDB");
?>