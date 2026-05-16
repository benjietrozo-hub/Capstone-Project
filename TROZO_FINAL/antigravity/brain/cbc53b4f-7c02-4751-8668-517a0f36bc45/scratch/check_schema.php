<?php
require 'c:/xampp/htdocs/TROZO_FINAL/TROZO_FINAL/TROZO_FINAL/DB/conn.php';
$res = $conn->query("DESCRIBE infos");
while($row = $res->fetch_assoc()) {
    echo $row['Field'] . " - " . $row['Type'] . "\n";
}
