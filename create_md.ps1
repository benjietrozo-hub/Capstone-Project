$content = Get-Content -Encoding UTF8 c:\xampp\htdocs\role-based-OIMS\tree_output_utf8.txt
$markdown = "# Codebase File Directory Structure`n`n``````text`n" + ($content -join "`n") + "`n``````"
Set-Content -Path c:\xampp\htdocs\role-based-OIMS\codebase_structure.md -Value $markdown -Encoding UTF8
