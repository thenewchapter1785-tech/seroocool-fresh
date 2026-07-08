param(
  [string]$Domain = "zerocool-development.com",
  [string]$AppId = "a7fabd80-117e-4683-8ca7-2636b2a48c93",
  [switch]$RunAuthIfMissing
)

$ErrorActionPreference = "Stop"

function Write-Step {
  param([string]$Message)
  Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Get-NodeCommand {
  if (Get-Command node -ErrorAction SilentlyContinue) {
    return "node"
  }

  $fallback = "C:\Program Files\nodejs\node.exe"
  if (Test-Path $fallback) {
    return $fallback
  }

  throw "Node.js is not available in PATH and fallback path was not found."
}

function Assert-Url200 {
  param(
    [string]$Url,
    [string]$Name
  )

  try {
    $resp = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 25
    if ($resp.StatusCode -ne 200) {
      throw "$Name returned status $($resp.StatusCode)"
    }

    Write-Host "$Name OK (200): $Url" -ForegroundColor Green
    return $resp.Content
  }
  catch {
    throw "$Name check failed for $Url. $($_.Exception.Message)"
  }
}

Write-Step "Checking DigitalOcean deployment phase"
$appRaw = doctl apps get $AppId -o json | ConvertFrom-Json
if (-not $appRaw -or -not $appRaw[0]) {
  throw "Unable to read deployment phase for app $AppId"
}
$deployment = $appRaw[0].active_deployment.phase
if (-not $deployment) {
  $deployment = "unknown"
}
Write-Host "Active deployment phase: $deployment"

Write-Step "Validating crawl endpoints"
$robotsUrl = "https://$Domain/robots.txt"
$sitemapUrl = "https://$Domain/sitemap.xml"

$robotsBody = Assert-Url200 -Url $robotsUrl -Name "robots.txt"
$sitemapBody = Assert-Url200 -Url $sitemapUrl -Name "sitemap.xml"

if ($robotsBody -notmatch [regex]::Escape($sitemapUrl)) {
  Write-Host "Warning: robots.txt does not include the expected sitemap URL: $sitemapUrl" -ForegroundColor Yellow
}

if ($sitemapBody -notmatch [regex]::Escape("https://$Domain")) {
  Write-Host "Warning: sitemap.xml does not include expected domain URLs." -ForegroundColor Yellow
}

Write-Step "Submitting sitemap to Google Search Console when token exists"
$tokenPath = Join-Path $PSScriptRoot "..\.secrets\google-oauth-token.json"
$gscScript = Join-Path $PSScriptRoot "google-search-console.mjs"
$nodeCmd = Get-NodeCommand

if (Test-Path $tokenPath) {
  & $nodeCmd $gscScript submit-sitemap --site "https://$Domain/" --sitemap $sitemapUrl
  if ($LASTEXITCODE -ne 0) {
    throw "Search Console sitemap submission failed."
  }
  Write-Host "Search Console sitemap submission completed." -ForegroundColor Green
}
elseif ($RunAuthIfMissing) {
  Write-Host "OAuth token missing. Starting interactive auth flow..." -ForegroundColor Yellow
  & $nodeCmd $gscScript auth
  if ($LASTEXITCODE -ne 0) {
    throw "OAuth authorization failed."
  }
}
else {
  Write-Host "OAuth token missing at $tokenPath" -ForegroundColor Yellow
  & $nodeCmd $gscScript doctor --site "https://$Domain/"
  if ($LASTEXITCODE -ne 0) {
    throw "OAuth diagnostics reported an error."
  }
  Write-Host "Run this to start auth:"
  Write-Host "  powershell -ExecutionPolicy Bypass -File .\scripts\run-search-indexing.ps1 -RunAuthIfMissing"
}

Write-Step "Done"
Write-Host "Search indexing checks completed for $Domain." -ForegroundColor Green
