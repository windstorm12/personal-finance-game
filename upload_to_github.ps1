# GitHub API token will be prompted
$token = Read-Host "Enter your GitHub Personal Access Token" -AsSecureString
$tokenText = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($token))

# Repository details
$repoName = "personal-finance-game"
$description = "A personal finance simulation game"

# Create repository
$createRepoBody = @{
    name = $repoName
    description = $description
    private = $false
    auto_init = $false
} | ConvertTo-Json

$headers = @{
    Authorization = "token $tokenText"
    Accept = "application/vnd.github.v3+json"
}

# Create the repository
$response = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method Post -Body $createRepoBody -Headers $headers -ContentType "application/json"
Write-Host "Repository created: $($response.html_url)"

# Get all files in the current directory (excluding those in .gitignore)
$files = Get-ChildItem -Recurse -File | 
    Where-Object { 
        $path = $_.FullName.Replace($PWD.Path + "\", "")
        # Exclude common files/folders we don't want to upload
        -not ($path -like "node_modules/*" -or 
              $path -like "*/node_modules/*" -or 
              $path -like "*.db" -or 
              $path -like "dist/*" -or 
              $path -like "*/dist/*" -or 
              $path -like ".env*" -or 
              $path -like "*.log")
    }

# Upload each file
foreach ($file in $files) {
    $relativePath = $file.FullName.Replace($PWD.Path + "\", "")
    Write-Host "Uploading: $relativePath"
    
    # Read file content
    $content = [System.Convert]::ToBase64String([System.IO.File]::ReadAllBytes($file.FullName))
    
    $uploadBody = @{
        message = "Add $relativePath"
        content = $content
    } | ConvertTo-Json

    try {
        $uploadResponse = Invoke-RestMethod -Uri "https://api.github.com/repos/$($response.full_name)/contents/$relativePath" -Method Put -Headers $headers -Body $uploadBody
        Write-Host "Uploaded successfully"
    }
    catch {
        Write-Host "Error uploading $relativePath : $_"
    }
}

Write-Host "`nAll files uploaded! Your repository is available at: $($response.html_url)" 