#!/bin/bash
# ====================================================
# LAUKI PLATFORM STARTUP & DIAGNOSTIC CHECK
# ====================================================

echo "===================================================="
echo "⚡ Lauki Customer Care Platform Diagnostic Check..."
echo "===================================================="

# 1. Environment file check
if [ ! -f .env ]; then
    echo "⚠️  WARNING: .env active environment file not found!"
    echo "Creating .env by copying .env.example..."
    cp .env.example .env
else
    echo "✓ Active .env environment parameters resolved."
fi

# 2. Port conflict check (3000, 8000, 5432, 6379, 9200)
declare -a ports=("3000" "8000" "5432" "6379" "9200")
for port in "${ports[@]}"; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  WARNING: Port $port is already in use by another local process!"
    fi
done

# 3. Launching containers
echo ""
echo "🚀 Booting up unified multi-container Docker compose stack..."
docker-compose up --build -d

echo ""
echo "===================================================="
echo "✓ Operational stack successfully started in background!"
echo "----------------------------------------------------"
echo "🌐 Frontend Portal:    http://localhost:3000"
echo "📂 Backend API Docs:   http://localhost:8000/docs"
echo "📂 OpenSearch Node:    http://localhost:9200"
echo "===================================================="
echo "To view live streaming logs, run: docker-compose logs -f"
