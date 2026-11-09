#!/bin/bash
# ==========================================================
# Red Hat OpenShift Developer Sandbox - Automated Deploy
# ==========================================================

echo "Deploying Classroom Portal to Red Hat OpenShift..."

# 1. Apply Secret
oc apply -f openshift/secret.yaml

# 2. Apply ImageStream
oc apply -f openshift/imagestream.yaml

# 3. Apply BuildConfig
oc apply -f openshift/buildconfig.yaml

# 4. Apply Service & Route
oc apply -f openshift/service.yaml
oc apply -f openshift/route.yaml

# 5. Apply Deployment
oc apply -f openshift/deployment.yaml

echo "All OpenShift resources applied successfully!"
echo "Check build status with: oc logs -f bc/classroom-portal"
echo "Check route URL with:    oc get route classroom-portal"
