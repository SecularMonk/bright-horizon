# bright-horizon

A small API for interacting with a recruitment platform

# Overview

This project generates job recommendations for candidates sourced from the bright network API.

# Running the project

## Setup

Create a .env file at the root level. Add in values for the following keys:
BRIGHT_NETWORK_URL

## Using Docker

Use this command:
make recommendations

## Using npm (not recommended)

Use these commands, in this order:
npm ci
npm run recommendations
