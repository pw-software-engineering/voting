# Build locally with:
# docker build --file VotingApp.Dockerfile --tag "voting/votingapp:dev" .

FROM nginx:1.19-alpine
RUN apk update

COPY ./ /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]