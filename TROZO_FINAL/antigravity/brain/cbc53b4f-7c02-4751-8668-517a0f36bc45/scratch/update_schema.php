<?php
require 'c:/xampp/htdocs/TROZO_FINAL/TROZO_FINAL/TROZO_FINAL/DB/conn.php';
$queries = [
    "ALTER TABLE infos ADD COLUMN profile_pic VARCHAR(255) DEFAULT NULL AFTER email",
    "ALTER TABLE infos ADD COLUMN phone VARCHAR(20) DEFAULT NULL AFTER profile_pic"
];

foreach ($queries as $q) {
    if ($conn->query($q)) {
        echo "Executed: $q\n";
    } else {
        echo "Error: " . $conn->error . "\n";
    }
}
