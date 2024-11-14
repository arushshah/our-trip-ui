Instructions to build and deploy

BUILD IMAGE:
docker buildx build --platform linux/amd64 -t our-trip-ui .

PUSH TO ECR:
docker tag our-trip-ui:latest 043309356556.dkr.ecr.us-east-1.amazonaws.com/our-trip:our-trip-ui
docker push 043309356556.dkr.ecr.us-east-1.amazonaws.com/our-trip:our-trip-ui

Then to run on EC2
docker pull 043309356556.dkr.ecr.us-east-1.amazonaws.com/our-trip:our-trip-ui
docker run -d -p 80:80 --name our-trip-ui-container 043309356556.dkr.ecr.us-east-1.amazonaws.com/our-trip:our-trip-ui