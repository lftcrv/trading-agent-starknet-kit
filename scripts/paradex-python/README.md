python3.9 -m venv .venv # create Python 3.9 virtual env
source .venv/bin/activate
pip install -r requirements.txt # (.venv)
ETHEREUM_PRIVATE_KEY=private_key python onboarding.py # (.venv)