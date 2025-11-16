# check whether OS is macos or not, if os is macos PYTHON_HOME="/opt/homebrew/opt/python@3.11/bin/python3.11", else PYTHON_HOME="/opt/homebrew/opt/python@3.11/bin/python3.11"
if [ "$(uname)" == "Darwin" ]; then
    PYTHON_HOME="/opt/homebrew/opt/python@3.11/bin/python3.11"
else
    PYTHON_HOME="/home/azureuser/.local/share/pypoetry/venv/bin/python"
fi

${PYTHON_HOME} -u statistics_logs.py

# git check whether statistics_logs_by_hour.txt is changed, if changed git add and git commit -m "update statistics_logs_by_hour.txt" and git push

git pull origin main
if git diff --quiet ./statistics_logs_by_hour.txt; then
    echo "No changes in statistics_logs_by_hour.txt"
else
    git add ./statistics_logs_by_hour.txt
    git commit -m "update statistics_logs_by_hour.txt"
    git push origin main
fi
