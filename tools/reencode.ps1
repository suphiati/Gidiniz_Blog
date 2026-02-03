Param(
    [Parameter(Mandatory=$true, ValueFromRemainingArguments=$true)]
    [string[]]$Paths
)

foreach ($path in $Paths) {
    if (-not (Test-Path -LiteralPath $path)) {
        Write-Warning "Path not found: $path"
        continue
    }

    # Read as text (mojibake), get its bytes as ISO-8859-1, then decode as UTF-8
    $wrong = Get-Content -LiteralPath $path -Raw
    $bytes = [Text.Encoding]::GetEncoding('ISO-8859-1').GetBytes($wrong)
    $fixed = [Text.Encoding]::UTF8.GetString($bytes)
    Set-Content -LiteralPath $path -Value $fixed -Encoding UTF8
    Write-Host "Re-encoded as UTF-8: $path"
}


