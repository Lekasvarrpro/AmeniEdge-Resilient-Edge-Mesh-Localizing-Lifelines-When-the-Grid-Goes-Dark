#!/usr/bin/env bash
# Dev-only reset script: Wipes data and re-runs Flyway from clean slate
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
DATA_DIR="$DIR/../backend/data"

echo "--- AmeniEdge Database Reset ---"
if [ -d "$DATA_DIR" ]; then
    echo "Removing embedded edge database files from $DATA_DIR..."
    rm -f "$DATA_DIR"/*.db
    echo "Local H2 edge database files cleared."
else
    mkdir -p "$DATA_DIR"
fi

echo "Database wiped clean. On next run, Flyway will run all migrations from fresh zero state."

