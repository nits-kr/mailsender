<?php
 
/*
 * DataTables example server-side processing script.
 *
 * Please note that this script is intentionally extremely simple to show how
 * server-side processing can be implemented, and probably shouldn't be used as
 * the basis for a large complex system. It is suitable for simple use cases as
 * for learning.
 *
 * See http://datatables.net/usage/server-side for full details on the server-
 * side processing requirements of DataTables.
 *
 * @license MIT - http://datatables.net/license_mit
 */
 
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Easy set variables
 */
 
// DB table to use
$table = 'all_links';
 
// Table's primary key
$primaryKey = 'sno';
 
// Array of database columns which should be read and sent back to DataTables.
// The `db` parameter represents the column name in the database, while the `dt`
// parameter represents the DataTables column identifier. In this case simple
// indexes
$columns = array(
    array( 'db' => 'offer_master_id', 'dt' => 0 ),
    array( 'db' => 'offer_master_id', 'dt' => 1 ),
    array( 'db' => 'own_offerid',  'dt' => 2 ),
    array( 'db' => 'sender_name',   'dt' => 3 ),
    array( 'db' => 'domain',     'dt' => 4 ),
    array( 'db' => 'link_type',     'dt' => 5 ),
    array( 'db' => 'pattern',     'dt' => 6 ),
    array( 'db' => 'main_link',     'dt' => 7 ),
    array( 'db' => 'generated_link',     'dt' => 8 ),
    array( 'db' => 'created_at',     'dt' => 9 ),
    array( 'db' => '',     'dt' => 10 ),
    array( 'db' => '',     'dt' => 11 ),
);
 
// SQL server connection information
$sql_details = array(
    'user' => 'root',
    'pass' => 'dvfersefag243435',
    'db'   => 'offer_module',
    'host' => 'localhost'
);
 
 
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * If you just want to use the basic configuration for DataTables with PHP
 * server-side, there is no need to edit below this line.
 */
 
require( 'ssp.class.php' );
 
echo json_encode(SSP::simple( $_GET, $sql_details, $table, $primaryKey, $columns ));