#!/bin/bash
# Deploy to Vercel
vercel deploy --prod --yes --token=$VERCEL_TOKEN 2>&1
