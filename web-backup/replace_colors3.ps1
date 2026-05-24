$files = Get-ChildItem -Path 'C:\Users\artur\Desktop\Challenge_Mobile\src' -Recurse -Include '*.jsx','*.css','*.js','*.html','*.ts','*.tsx'
foreach ($f in $files) {
    $content = Get-Content -Path $f.FullName -Raw -Encoding UTF8
    # Replace all remaining yellow/gold hex variants
    $newContent = $content -replace '(?i)#e0a832', '#f54b2e'
    $newContent = $newContent -replace '(?i)#d4922a', '#f54b2e'
    $newContent = $newContent -replace '(?i)#e09820', '#f54b2e'
    $newContent = $newContent -replace '(?i)#c8922a', '#f54b2e'
    # Replace rgba variants with spaces
    $newContent = $newContent -replace 'rgba\(\s*200\s*,\s*146\s*,\s*42\s*,', 'rgba(245, 75, 46,'
    $newContent = $newContent -replace 'rgba\(\s*224\s*,\s*168\s*,\s*50\s*,', 'rgba(245, 75, 46,'
    $newContent = $newContent -replace 'rgba\(200,146,42,', 'rgba(245, 75, 46,'
    $newContent = $newContent -replace 'rgba\(224,168,50,', 'rgba(245, 75, 46,'
    if ($content -ne $newContent) {
        Set-Content -Path $f.FullName -Value $newContent -Encoding UTF8 -NoNewline
        Write-Host "Updated: $($f.Name)"
    }
}
Write-Host "Done!"
