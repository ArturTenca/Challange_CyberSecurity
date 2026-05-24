$files = Get-ChildItem -Path 'C:\Users\artur\Desktop\Challenge_Mobile\src' -Recurse -Include '*.jsx','*.css','*.js','*.html','*.ts','*.tsx'
foreach ($f in $files) {
    $content = Get-Content -Path $f.FullName -Raw -Encoding UTF8
    # Replace rgba variants of the old yellow (200, 146, 42) with the new orange (245, 75, 46)
    $newContent = $content -replace 'rgba\(\s*200\s*,\s*146\s*,\s*42\s*,', 'rgba(245, 75, 46,'
    $newContent = $newContent -replace 'rgba\(200,146,42,', 'rgba(245, 75, 46,'
    if ($content -ne $newContent) {
        Set-Content -Path $f.FullName -Value $newContent -Encoding UTF8 -NoNewline
        Write-Host "Updated: $($f.Name)"
    }
}
Write-Host "Done!"
