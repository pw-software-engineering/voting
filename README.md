# Example how to deploy project to cluster

[![FrontApp-deploy](https://github.com/pw-software-engineering/voting/workflows/DeployFrontApp/badge.svg?branch=main)](https://github.com/pw-software-engineering/voting/actions/workflows/voting-app-deployment.yml?query=workflow%3ADeployFrontApp)
[![BackendApp-deploy](https://github.com/pw-software-engineering/voting/workflows/DeployBackendApp/badge.svg?branch=main)](https://github.com/pw-software-engineering/voting/actions/workflows/voting-api-deployment.yml?query=workflow%3ADeployBackendApp)

## Introduction

Platform to host your project is set up on [Azure Kubernetes Service](https://azure.microsoft.com/en-us/services/kubernetes-service/)  
There is separate project (not accessible) by you that deploys `platform`.  
From `platform` workflow some `secrets` are set up for organization
Your workflows in your repositories have an access to this secrets. They will be used in your github `workflows` to deploy packages to platform.

## How to deploy your project to platform

In the current project you can find two `workflows` for backend and frontend.  
Over there looking for example you should find probably all answers how to deploy your project.

In general two things need to be done deployment and workflow adoption.  
So you need to add `Deployment-file` file for each project separately.  
And adopt your github `workflow` to build and deploy application to platform.

## Deployment file

In current application deployment files are located in `deployment` directory.
Each separate service should contains its' deployment file.
Below there is example of `deployment-file` of `voting-api` backend solution.

Please put attention that very often it contains `voting-api` as the name.  
`This need to be replaced in your application deployments`  
In your case it will be {server, client or hotel}.

Deployment file contains few sections: `namespace`, `deployment`, `service` and `ingress`.  

Short explanation of some resources in deployment file:

- `Namespace` is logical divider of platform to smaller clusters, scoped your project  
- `Deployment` is responsible to host and keep running your application  
- `Service` is responsible to build network abstraction to your application  
- `Ingress` build accessibility to your application from web  

> Example of deployment file for application
```yml
apiVersion: v1
kind: Namespace
metadata:
   name: ${NAMESPACE}
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: voting-api
  namespace: ${NAMESPACE}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: voting-api
  template:
    metadata:
      labels:
        app: voting-api
    spec:
      nodeSelector:
        "beta.kubernetes.io/os": linux
      containers:
      - name: voting-api
        image: ${IMAGE_ID}
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 250m
            memory: 256Mi
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: voting-api
  namespace: ${NAMESPACE}
spec:
  type: ClusterIP
  ports:
  - port: 80
  selector:
    app: voting-api
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: voting-api
  namespace: ${NAMESPACE}
  labels:
    name: voting-api
  annotations:
    kubernetes.io/ingress.class: addon-http-application-routing
spec:
  rules:
  - host: ${NAMESPACE}.${DOMAIN}
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service: 
            name: voting-api
            port: 
              number: 80
```

## Workflow adoption

Second thing that need to be modified is github workflow.  
You will find examples of workflow in this repository for both services.

Crucial is to adapt environment variables to your project:
```yml
env:
  ACR_URL: 'powoeuwacr.azurecr.io'     # The same for all
  NAMESPACE: '{b, j, n}'               # Name of your team {b, j, n}
  APP_NAME: '{client, server, hotel}'  # Name of your application {client, server, hotel}
  DEPLOYMENT_DIRECTORY: 'deployment'   # Path to directory where DEPLOYMENT_FILE_NAME is located
  DEPLOYMENT_FILE_NAME: 'voting-app.yml' # Name of deployment file for application in deployment DEPLOYMENT_DIRECTORY location
  PATH_TO_DOCKER_FILE: 'VotingApp.Dockerfile' # Location of Dockerfile for app
  PATH_TO_APP_SRC: 'src/VotingApp/.'          # Path to App sources
```

Below you will find complete workflow to deploy single project:

```yml
name: DeployBackendApp

on:
  repository_dispatch:
    types: [build]
  
  workflow_dispatch:

  push:
    branches: [ main ]
    paths:
    - 'src/VotingApi/**'
    - 'VotingApi.Dockerfile'
    - 'deployment/voting-api.yml'

env:
  ACR_URL: 'powoeuwacr.azurecr.io'
  NAMESPACE: 'voting'                         # Name of your team {b, j, n}
  APP_NAME: 'voting-api'                      # Name of your application {client, server, hotel}
  DEPLOYMENT_DIRECTORY: 'deployment'          # Path to directory where DEPLOYMENT_FILE_NAME is located
  DEPLOYMENT_FILE_NAME: 'voting-api.yml'      # Name of deployment file for application in deployment location
  PATH_TO_DOCKER_FILE: 'VotingApi.Dockerfile' # Location of Dockerfile for app
  PATH_TO_APP_SRC: 'src/VotingApi/.'          # Path to App sources

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Set IMAGE_ID as env variable
      run: echo "IMAGE_ID=${{ env.ACR_URL }}/${{ env.APP_NAME }}:v${{ github.run_number }}" >> $GITHUB_ENV
    - name: Print IMAGE_ID
      run: echo "IMAGE_ID:${{ env.IMAGE_ID }}"
    - name: Login to ACR
      uses: docker/login-action@v1
      with:
        registry: ${{ env.ACR_URL }}
        username: ${{ secrets.ACR_USER_ID }}
        password: ${{ secrets.ACR_USER_PASSWORD }}
    - name: Build docker image
      run: docker build -f ${{ env.PATH_TO_DOCKER_FILE }} ${{ env.PATH_TO_APP_SRC }} -t ${{ env.IMAGE_ID }}
    - name: Push docker image
      run: docker push ${{ env.IMAGE_ID }}
  deploy:
    runs-on: ubuntu-latest
    needs: build
    steps:
    - uses: actions/checkout@v2
    - uses: azure/login@v1
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}
    - uses: azure/setup-kubectl@v1
      with:
        version: 'v1.18.8'
    - uses: azure/aks-set-context@v1
      with:
        creds: '${{ secrets.AZURE_CREDENTIALS }}'
        cluster-name: ${{ secrets.AKS_NAME }}
        resource-group: ${{ secrets.AKS_RG_NAME }}
    - name: Set IMAGE_ID as env variable
      run: echo "IMAGE_ID=${{ env.ACR_URL }}/${{ env.APP_NAME }}:v${{ github.run_number }}" >> $GITHUB_ENV
    - name: Set DOMAIN env variable
      run: echo "DOMAIN=$(az aks show -g ${{ secrets.AKS_RG_NAME }} -n ${{ secrets.AKS_NAME }} --query addonProfiles.httpApplicationRouting.config.HTTPApplicationRoutingZoneName -o tsv)" >> $GITHUB_ENV
    - name: Print DOMAIN and IMAGE_ID
      run: |
        echo "${{ env.DOMAIN }}"
        echo "${{ env.IMAGE_ID }}"
    - name: Substitute environment variables in app deployment file
      run: envsubst < "${{ env.DEPLOYMENT_DIRECTORY }}/${{ env.DEPLOYMENT_FILE_NAME }}" > "${{ env.DEPLOYMENT_DIRECTORY }}/out-${{ env.DEPLOYMENT_FILE_NAME }}"
    - name: Deploy app to the cluster
      run: kubectl apply -f ${{ env.DEPLOYMENT_DIRECTORY }}/out-${{ env.DEPLOYMENT_FILE_NAME }} --wait
```

## [IMPORTANT] What is not done - remarks

- Currently `domain` that is assign to platform is unstable.  
What does it mean? -> It changes between platform deployments.
You can find current one in pipeline step `Print Domain`

- Just remember that after deploying your app it need some time to propagate `Domain` to your service so it can be maximum `1h` unavailable.

- Last thing is that it is run on my own account -> I am paying for that.  
So if the monthly cost will be higher than `$100` unfortunately platform will shut down :(