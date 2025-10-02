#!/bin/bash
cd /home/azureuser/miners/backend
export ADMIN_EMAIL=mjash028@gmail.com
export ADMIN_PASSWORD_HASH='$2b$12$umPOE.ueb8h98p95vJCJFeZpeJgEc9Ie0PqPNrANYFYGnA4/VxSYW'
export SESSION_SECRET='3chdPqI9PB5hDFVyJrBWbyG0J3_xgW3VH0NppmpN-z_RpXwl9v2s3qQ7eO1Ohuw2OhiaraXQJbZl2e0lXoSeFw'
python3 admin_server.py
