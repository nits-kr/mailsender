<?php
                      include "include.php";
                        $query = mysql_query("select affliate, count(1) count from supp group by affliate");
                        while($fetch = mysql_fetch_array($query))
                        {
