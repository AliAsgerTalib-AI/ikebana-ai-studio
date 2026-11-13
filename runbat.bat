Get-ChildItem -Path "C:\AIProjects\ikebana-ai-studio" -File -Include postcss.config.*,next.config.*,tsconfig.json,package.json |
  ForEach-Object {
    $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
    $hex = ($bytes[0..([Math]::Min(5, $bytes.Length - 1))] | ForEach-Object { $_.ToString("X2") }) -join " "
    $firstLine = (Get-Content $_.FullName -TotalCount 1)
    Write-Host "$($_.Name) | Bytes: [$hex] | Line 1: $firstLine"
  }
