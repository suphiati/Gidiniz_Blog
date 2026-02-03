Param(
    [Parameter(Mandatory=$true, ValueFromRemainingArguments=$true)]
    [string[]]$Paths
)

$replacementMap = @{
    'Ãœ' = 'Ü';
    'Ã¼' = 'ü';
    'Ã–' = 'Ö';
    'Ã¶' = 'ö';
    'Ã‡' = 'Ç';
    'Ã§' = 'ç';
    'Ä°' = 'İ';
    'Ä±' = 'ı';
    'Åž' = 'Ş';
    'ÅŸ' = 'ş';
    'Äž' = 'Ğ';
    'ÄŸ' = 'ğ';
    'Å' = 'Ş';
    'Å' = 'ş'
}

foreach ($path in $Paths) {
    if (-not (Test-Path -LiteralPath $path)) {
        Write-Warning "Path not found: $path"
        continue
    }

    $content = Get-Content -LiteralPath $path -Raw
    foreach ($key in $replacementMap.Keys) {
        $content = $content -replace [regex]::Escape($key), $replacementMap[$key]
    }
    Set-Content -LiteralPath $path -Value $content -Encoding UTF8
    Write-Host "Fixed Turkish characters in: $path"
}


