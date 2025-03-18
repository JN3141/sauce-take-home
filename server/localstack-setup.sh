#!/bin/sh
awslocal sqs create-queue --queue-name event-queue
awslocal sqs create-queue --queue-name event-dlq

awslocal sqs set-queue-attributes \
--queue-url http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/event-queue \
--attributes '{
  "RedrivePolicy": "{\"deadLetterTargetArn\":\"arn:aws:sqs:us-east-1:000000000000:event-dlq\",\"maxReceiveCount\":\"3\"}"
}'
