$base = "c:\xampp\htdocs\role-based-OIMS"
$excludes = @("node_modules", "vendor", ".git", "storage\framework", "storage\logs", "bootstrap\cache", ".phpunit.cache")

function Show-Tree {
    param([string]$Path, [string]$Indent = "")
    
    $items = Get-ChildItem -Path $Path -Force | Where-Object {
        $rel = $_.FullName.Replace($base + "\", "")
        $dominated = $false
        foreach ($ex in $excludes) {
            if ($rel -like "$ex*" -or $rel -like "*\$ex*") {
                $dominated = $true
                break
            }
        }
        -not $dominated
    } | Sort-Object { -not $_.PSIsContainer }, Name

    $count = $items.Count
    $i = 0
    foreach ($item in $items) {
        $i++
        $isLast = ($i -eq $count)
        if ($isLast) { $connector = "+-- " } else { $connector = "|-- " }
        if ($isLast) { $newIndent = "$Indent    " } else { $newIndent = "$Indent|   " }
        
        if ($item.PSIsContainer) {
            Write-Output "$Indent$connector$($item.Name)/"
            Show-Tree -Path $item.FullName -Indent $newIndent
        } else {
            Write-Output "$Indent$connector$($item.Name)"
        }
    }
}

Write-Output "role-based-OIMS/"
Show-Tree -Path $base
