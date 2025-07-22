# Initialize git repository
git init

# Configure git (if not already configured)
$userName = Read-Host "Enter your GitHub username"
$userEmail = Read-Host "Enter your GitHub email"
git config user.name $userName
git config user.email $userEmail

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit"

# Create and push to GitHub repository
gh repo create personal-finance-game --public --source=. --push

Write-Host "Repository created and files pushed successfully!" 