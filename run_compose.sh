#!/bin/bash

docker-compose down

export NODE_ENV="development"

export MONGO_INIT_USERNAME="root"
export MONGO_INIT_PASSWORD="root_pw"

docker-compose up --build -d
