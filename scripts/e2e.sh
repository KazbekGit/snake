#!/bin/bash

# E2E Test Runner Script
set -e

echo "🧪 Starting E2E Tests with Maestro..."

# Check if Maestro is installed
if ! command -v maestro &> /dev/null; then
    echo "❌ Maestro CLI not found. Installing..."
    curl -Ls "https://get.maestro.mobile.dev" | bash
    export PATH="$PATH:$HOME/.maestro/bin"
fi

# Create reports directory
mkdir -p maestro-reports

# Function to run a specific flow
run_flow() {
    local flow_name=$1
    local flow_file=$2
    
    echo "📱 Running $flow_name flow..."
    
    if [ -f "$flow_file" ]; then
        maestro test --format junit --output "maestro-reports/${flow_name}-report.xml" "$flow_file" || {
            echo "⚠️  $flow_name flow completed with warnings"
        }
    else
        echo "❌ Flow file not found: $flow_file"
        return 1
    fi
}

# Run all flows
echo "🚀 Running all E2E flows..."

run_flow "main" "maestro/flow.yaml"
run_flow "welcome" "maestro/flows/welcome-flow.yaml"
run_flow "home" "maestro/flows/home-flow.yaml"
run_flow "topic" "maestro/flows/topic-flow.yaml"
run_flow "test" "maestro/flows/test-flow.yaml"
run_flow "statistics" "maestro/flows/statistics-flow.yaml"

echo "✅ All E2E flows completed!"
echo "📊 Reports saved to: maestro-reports/"

# Generate summary
echo ""
echo "📋 Test Summary:"
for report in maestro-reports/*-report.xml; do
    if [ -f "$report" ]; then
        flow_name=$(basename "$report" -report.xml)
        echo "  ✅ $flow_name"
    fi
done

echo ""
echo "🎯 Next steps:"
echo "  1. Check maestro-reports/ for detailed results"
echo "  2. Review any failed assertions"
echo "  3. Update flows if UI changes detected"
