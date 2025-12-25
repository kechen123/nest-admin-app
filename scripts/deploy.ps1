# Git + Server Build Deployment Script (Windows PowerShell)
# Usage: .\scripts\deploy.ps1 [backend|web|all]

param(
    [string]$Service = "all"
)

$ErrorActionPreference = "Continue"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Starting deployment for service: $Service" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Check if in project directory
if (-not (Test-Path "docker-compose.prod.yml")) {
    Write-Host "Error: Please run this script from project root directory" -ForegroundColor Red
    exit 1
}

# Pull latest code
Write-Host "1. Pulling latest code..." -ForegroundColor Yellow
if (Test-Path ".git") {
    $currentBranch = $null
    try {
        $currentBranch = git branch --show-current 2>$null
        if (-not $currentBranch) {
            $currentBranch = git rev-parse --abbrev-ref HEAD 2>$null
        }
    } catch {
        # Ignore errors
    }
    
    if ($currentBranch) {
        Write-Host "   Current branch: $currentBranch" -ForegroundColor Gray
        try {
            $null = git pull origin $currentBranch 2>&1
            if ($LASTEXITCODE -ne 0) {
                $null = git pull origin main 2>&1
                if ($LASTEXITCODE -ne 0) {
                    $null = git pull origin master 2>&1
                }
            }
        } catch {
            Write-Host "   Warning: Git pull failed, skipping" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   Warning: Cannot get current branch, skipping git pull" -ForegroundColor Yellow
    }
} else {
    Write-Host "   Warning: Not a Git repository, skipping git pull" -ForegroundColor Yellow
}

# Check for uncommitted changes
try {
    $gitStatus = git status -s 2>$null
    if ($gitStatus) {
        Write-Host "   Warning: Working directory has uncommitted changes" -ForegroundColor Yellow
    }
} catch {
    # Ignore errors
}

# Deploy based on service parameter
if ($Service.ToLower() -eq "backend") {
    Write-Host "2. Rebuilding backend service..." -ForegroundColor Yellow
    docker-compose -f docker-compose.prod.yml up -d --build backend
    Write-Host "3. Waiting for service to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    Write-Host "4. Viewing backend logs..." -ForegroundColor Yellow
    docker-compose -f docker-compose.prod.yml logs --tail=50 backend
}
elseif ($Service.ToLower() -eq "web") {
    Write-Host "2. Rebuilding web service..." -ForegroundColor Yellow
    docker-compose -f docker-compose.prod.yml up -d --build web
    Write-Host "3. Waiting for service to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    Write-Host "4. Viewing web logs..." -ForegroundColor Yellow
    docker-compose -f docker-compose.prod.yml logs --tail=50 web
}
else {
    Write-Host "2. Rebuilding all services..." -ForegroundColor Yellow
    docker-compose -f docker-compose.prod.yml up -d --build
    Write-Host "3. Waiting for services to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    Write-Host "4. Viewing service status..." -ForegroundColor Yellow
    docker-compose -f docker-compose.prod.yml ps
    Write-Host "5. Viewing latest logs..." -ForegroundColor Yellow
    docker-compose -f docker-compose.prod.yml logs --tail=50
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Deployment completed!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "View logs: docker-compose -f docker-compose.prod.yml logs -f"
Write-Host "View status: docker-compose -f docker-compose.prod.yml ps"
Write-Host "Restart services: docker-compose -f docker-compose.prod.yml restart"
