# Build locally with:
# docker build --file VotingApp.Dockerfile --tag "voting/votingapp:dev" .

FROM nginx:1.21-alpine
EXPOSE 80
ENV API_BASE_URL $API_BASE_URL
RUN apk update

COPY ./ /usr/share/nginx/html
RUN rm /usr/share/nginx/html/run-nginx.sh \
    & rm /usr/share/nginx/html/nginx.conf
COPY ./nginx.conf /etc/nginx/nginx.conf

COPY ./run-nginx.sh /usr/share/nginx/run-nginx.sh
RUN chmod +x /usr/share/nginx/run-nginx.sh

ENTRYPOINT ["/bin/sh", "/usr/share/nginx/run-nginx.sh"]