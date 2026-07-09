param(
  [string]$AppId = "a7fabd80-117e-4683-8ca7-2636b2a48c93",
  [string]$Domain = "zerocool-development.com",
  [switch]$RunLiveLeadCheck
)

$ErrorActionPreference = "Stop"

function New-CheckResult {
  param(
    [string]$Name,
    [bool]$Passed,
    [string]$Details
  )

  return [PSCustomObject]@{
    Check = $Name
    Passed = $Passed
    Details = $Details
  }
}

if (-not (Get-Command doctl -ErrorAction SilentlyContinue)) {
  throw "doctl is not installed or not available in PATH."
}

$results = [System.Collections.Generic.List[object]]::new()

$appRaw = doctl apps get $AppId -o json | ConvertFrom-Json
if (-not $appRaw -or -not $appRaw[0]) {
  throw "Unable to retrieve app details for $AppId"
}

$app = $appRaw[0]
$activePhase = $app.active_deployment.phase
$results.Add((New-CheckResult -Name "Deployment phase" -Passed ($activePhase -eq "ACTIVE") -Details "Current active deployment phase: $activePhase"))

$requiredEnvKeys = @(
  "NODE_ENV",
  "NEXT_PUBLIC_SITE_URL",
  "RESEND_API_KEY",
  "CONTACT_EMAIL",
  "LEAD_FROM_EMAIL",
  "HUBSPOT_ACCESS_TOKEN",
  "NEXT_PUBLIC_HUBSPOT_PORTAL_ID",
  "OPENAI_API_KEY"
)

$envEntries = @($app.spec.services[0].envs)
$envMap = @{}
foreach ($entry in $envEntries) {
  $envMap[$entry.key] = $entry.value
}

$missingEnv = @()
foreach ($key in $requiredEnvKeys) {
  if (-not $envMap.ContainsKey($key) -or [string]::IsNullOrWhiteSpace($envMap[$key])) {
    $missingEnv += $key
  }
}

$results.Add((New-CheckResult -Name "Required env keys" -Passed ($missingEnv.Count -eq 0) -Details ($(if ($missingEnv.Count -eq 0) { "All required env values present" } else { "Missing: " + ($missingEnv -join ", ") }))))

$urls = @(
  "https://$Domain",
  "https://www.$Domain"
)

foreach ($url in $urls) {
  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri $url -MaximumRedirection 0 -TimeoutSec 25
    $statusCode = [int]$response.StatusCode
    $location = $response.Headers["Location"]
    $ok = ($statusCode -ge 200 -and $statusCode -lt 400)
    $details = if ($location) { "Status $statusCode -> $location" } else { "Status $statusCode" }
    $results.Add((New-CheckResult -Name "HTTP check: $url" -Passed $ok -Details $details))
  }
  catch {
    $webResponse = $_.Exception.Response
    if ($webResponse) {
      $statusCode = [int]$webResponse.StatusCode
      $location = $webResponse.Headers["Location"]
      $ok = ($statusCode -ge 300 -and $statusCode -lt 400)
      $details = if ($location) { "Status $statusCode -> $location" } else { "Status $statusCode" }
      $results.Add((New-CheckResult -Name "HTTP check: $url" -Passed $ok -Details $details))
    }
    else {
      $results.Add((New-CheckResult -Name "HTTP check: $url" -Passed $false -Details $_.Exception.Message))
    }
  }
}

try {
  $wwwProbe = Invoke-WebRequest -UseBasicParsing -Uri "https://www.$Domain" -MaximumRedirection 0 -TimeoutSec 25
  $wwwStatus = [int]$wwwProbe.StatusCode
  $wwwLocation = $wwwProbe.Headers["Location"]
  $wwwCanonical = (
    $wwwStatus -ge 300 -and
    $wwwStatus -lt 400 -and
    -not [string]::IsNullOrWhiteSpace($wwwLocation) -and
    (
      $wwwLocation -eq "https://$Domain" -or
      $wwwLocation -eq "https://$Domain/" -or
      $wwwLocation.StartsWith("https://$Domain/")
    )
  )
  $results.Add((New-CheckResult -Name "Canonical redirect (www -> apex)" -Passed $wwwCanonical -Details "Status $wwwStatus -> $wwwLocation"))
}
catch {
  $webResponse = $_.Exception.Response
  if ($webResponse) {
    $wwwStatus = [int]$webResponse.StatusCode
    $wwwLocation = $webResponse.Headers["Location"]
    $wwwCanonical = (
      $wwwStatus -ge 300 -and
      $wwwStatus -lt 400 -and
      -not [string]::IsNullOrWhiteSpace($wwwLocation) -and
      (
        $wwwLocation -eq "https://$Domain" -or
        $wwwLocation -eq "https://$Domain/" -or
        $wwwLocation.StartsWith("https://$Domain/")
      )
    )
    $results.Add((New-CheckResult -Name "Canonical redirect (www -> apex)" -Passed $wwwCanonical -Details "Status $wwwStatus -> $wwwLocation"))
  }
  else {
    $results.Add((New-CheckResult -Name "Canonical redirect (www -> apex)" -Passed $false -Details $_.Exception.Message))
  }
}

try {
  $headerResponse = Invoke-WebRequest -UseBasicParsing -Uri "https://$Domain" -TimeoutSec 25
  $requiredHeaders = @(
    "content-security-policy",
    "strict-transport-security",
    "x-content-type-options",
    "x-frame-options",
    "referrer-policy",
    "permissions-policy"
  )

  foreach ($headerName in $requiredHeaders) {
    $headerValue = $headerResponse.Headers[$headerName]
    $present = -not [string]::IsNullOrWhiteSpace($headerValue)
    $details = if ($present) { "$headerName present" } else { "$headerName missing" }
    $results.Add((New-CheckResult -Name "Security header: $headerName" -Passed $present -Details $details))
  }
}
catch {
  $results.Add((New-CheckResult -Name "Security headers check" -Passed $false -Details $_.Exception.Message))
}

if ($RunLiveLeadCheck) {
  $testEmail = "leadcheck+" + [DateTime]::UtcNow.ToString("yyyyMMddHHmmss") + "@zerocool-development.com"
  $leadPayload = @{
    name = "Production Verify"
    email = $testEmail
    projectType = "Verification"
    source = "organic"
    utmSource = "terminal"
    utmCampaign = "prod-health-check"
    message = "Automated production verification lead."
  } | ConvertTo-Json

  try {
    $leadResponse = Invoke-RestMethod -UseBasicParsing -Method Post -Uri "https://$Domain/api/lead" -ContentType "application/json" -Body $leadPayload
    $leadOk = ($leadResponse.ok -eq $true)
    $results.Add((New-CheckResult -Name "Live lead API" -Passed $leadOk -Details "Submitted test lead for $testEmail"))

    if ($envMap.ContainsKey("HUBSPOT_ACCESS_TOKEN") -and -not [string]::IsNullOrWhiteSpace($envMap["HUBSPOT_ACCESS_TOKEN"])) {
      try {
        $hubspotToken = $envMap["HUBSPOT_ACCESS_TOKEN"]
        $headers = @{ Authorization = "Bearer $hubspotToken"; "Content-Type" = "application/json" }
        $searchBody = @{
          filterGroups = @(
            @{
              filters = @(
                @{
                  propertyName = "email"
                  operator = "EQ"
                  value = $testEmail
                }
              )
            }
          )
          properties = @("email", "lifecyclestage")
          limit = 1
        } | ConvertTo-Json -Depth 6

        $searchResponse = Invoke-RestMethod -Method Post -Uri "https://api.hubapi.com/crm/v3/objects/contacts/search" -Headers $headers -Body $searchBody
        $found = ($searchResponse.results.Count -gt 0)
        $results.Add((New-CheckResult -Name "HubSpot contact lookup" -Passed $found -Details ($(if ($found) { "Contact found for $testEmail" } else { "Contact not found for $testEmail" }))))
      }
      catch {
        $results.Add((New-CheckResult -Name "HubSpot contact lookup" -Passed $false -Details $_.Exception.Message))
      }
    }
    else {
      $results.Add((New-CheckResult -Name "HubSpot contact lookup" -Passed $false -Details "Skipped: HUBSPOT_ACCESS_TOKEN not available in app spec."))
    }
  }
  catch {
    $results.Add((New-CheckResult -Name "Live lead API" -Passed $false -Details $_.Exception.Message))
  }
}

$results | Format-Table -AutoSize | Out-Host

$failedCount = @($results | Where-Object { -not $_.Passed }).Count
if ($failedCount -gt 0) {
  Write-Host "`nVerification completed with $failedCount failed check(s)." -ForegroundColor Yellow
  exit 1
}

Write-Host "`nAll checks passed." -ForegroundColor Green
exit 0
