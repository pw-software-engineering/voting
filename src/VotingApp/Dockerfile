# Build locally with:
# docker build --file VotingApp.Dockerfile --tag "voting/votingapp:dev" .

FROM nginx:1.19-alpine
RUN apk update

COPY VotingApp/ /usr/share/nginx/html