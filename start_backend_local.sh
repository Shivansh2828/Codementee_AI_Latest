#!/bin/bash
cd backend
export PATH=$PATH:/Users/shivanshbajpai/Library/Python/3.9/bin
uvicorn server:app --reload --host 0.0.0.0 --port 8002