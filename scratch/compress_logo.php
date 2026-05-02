<?php
$source = 'c:/xampp/htdocs/role-based-OIMS/frontend/Logo_n.jpg';
$dest = 'c:/xampp/htdocs/role-based-OIMS/frontend/Logo_n.jpg'; // Overwrite

if (!file_exists($source)) {
    die("Source file not found\n");
}

$size_before = filesize($source);
echo "Size before: " . ($size_before / 1024) . " KB\n";

$img = imagecreatefromjpeg($source);
if (!$img) {
    die("Failed to create image from JPEG\n");
}

// Compress to 70% quality
imagejpeg($img, $dest, 70);
imagedestroy($img);

$size_after = filesize($dest);
echo "Size after: " . ($size_after / 1024) . " KB\n";
?>
