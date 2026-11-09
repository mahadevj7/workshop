param(
    [string]$LoginCommand = ""
)

$oc = "$PSScriptRoot\oc-client\oc.exe"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   Red Hat Developer Sandbox Automated OpenShift Deploy   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Login
if ($LoginCommand) {
    Write-Host "Executing login command..." -ForegroundColor Yellow
    Invoke-Expression "& $oc $($LoginCommand -replace '^oc\s+', '')"
} else {
    $whoami = & $oc whoami 2>$null
    if (-not $whoami) {
        Write-Host "You are not logged in to OpenShift." -ForegroundColor Red
        Write-Host ""
        Write-Host "To log in:" -ForegroundColor Yellow
        Write-Host "1. Open your OpenShift Sandbox Console (https://developers.redhat.com/developer-sandbox)"
        Write-Host "2. Click on your profile at top-right -> 'Copy login command' -> 'Display Token'"
        Write-Host "3. Paste the login command below:"
        Write-Host ""
        $LoginCommand = Read-Host "Paste 'oc login --token=... --server=...' here"
        if ($LoginCommand) {
            Invoke-Expression "& $oc $($LoginCommand -replace '^oc\s+', '')"
        } else {
            Write-Host "Login aborted." -ForegroundColor Red
            exit 1
        }
    }
}

$currentUser = & $oc whoami 2>$null
$currentProject = & $oc project -q 2>$null

Write-Host "Logged in as:    $currentUser" -ForegroundColor Green
Write-Host "Active Project:  $currentProject" -ForegroundColor Green
Write-Host ""

# 2. Apply Secrets
Write-Host "1. Creating secrets (MongoDB Atlas & JWT keys)..." -ForegroundColor Yellow
& $oc apply -f "$PSScriptRoot\openshift\secret.yaml"

# 3. Create Binary BuildConfig if not exists
Write-Host "2. Preparing container build pipeline in OpenShift..." -ForegroundColor Yellow
$bcExists = & $oc get bc classroom-portal 2>$null
if (-not $bcExists) {
    & $oc new-build --binary --name=classroom-portal --strategy=docker
}

# 4. Stream local workspace directly to OpenShift Builder
Write-Host "3. Uploading workspace and building container in OpenShift (Streaming logs)..." -ForegroundColor Yellow
& $oc start-build classroom-portal --from-dir="$PSScriptRoot" --follow

# 5. Apply Service and Route
Write-Host "4. Exposing Service & Public HTTPS Route..." -ForegroundColor Yellow
& $oc apply -f "$PSScriptRoot\openshift\service.yaml"
& $oc apply -f "$PSScriptRoot\openshift\route.yaml"

# 6. Apply Deployment
Write-Host "5. Deploying application pod..." -ForegroundColor Yellow
& $oc apply -f "$PSScriptRoot\openshift\deployment.yaml"

# 7. Fetch Route URL
Start-Sleep -Seconds 3
$routeHost = & $oc get route classroom-portal -o jsonpath='{.spec.host}' 2>$null

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "   DEPLOYMENT COMPLETE!                                   " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host ""
if ($routeHost) {
    Write-Host "🚀 Live URL: https://$routeHost" -ForegroundColor Cyan
} else {
    Write-Host "Run: & .\oc-client\oc.exe get route classroom-portal" -ForegroundColor Yellow
}
Write-Host ""

