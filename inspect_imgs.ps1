$html = Get-Content -Path index.html -Raw

# Try to find some framerusercontent links
$matches = [regex]::Matches($html, "<img[^>]+src=`"([^`"]+)`"[^>]*>")
$count = 0
foreach ($m in $matches) {
    if ($count -lt 15) {
        Write-Host $m.Groups[0].Value
        $count++
    }
}
