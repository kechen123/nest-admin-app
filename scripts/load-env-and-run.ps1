# 从 backend/.env 读取环境变量并运行 docker-compose 命令
# 用法: .\scripts\load-env-and-run.ps1 <docker-compose命令>
# 例如: .\scripts\load-env-and-run.ps1 "docker-compose -f docker-compose.dev.yml up -d"

param(
    [Parameter(Mandatory=$true)]
    [string]$Command
)

$envFile = "backend\.env"

if (Test-Path $envFile) {
    # 读取 .env 文件并设置环境变量
    $lines = Get-Content $envFile
    foreach ($line in $lines) {
        $line = $line.Trim()
        # 跳过空行
        if (-not $line) { continue }
        
        # 处理包含 # 的行：可能是注释行，也可能包含变量定义
        # 先尝试提取 KEY=VALUE 部分（即使前面有注释）
        if ($line -match '(?:^[^#]*#.*?)?([A-Z_][A-Z0-9_]*)\s*=\s*([^#]+?)(?:\s*#.*)?$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            # 移除引号（如果有）
            if ($value.StartsWith('"') -and $value.EndsWith('"')) {
                $value = $value.Substring(1, $value.Length - 2)
            } elseif ($value.StartsWith("'") -and $value.EndsWith("'")) {
                $value = $value.Substring(1, $value.Length - 2)
            }
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
} else {
    Write-Host "Warning: $envFile not found" -ForegroundColor Yellow
}

# 执行命令
Invoke-Expression $Command
