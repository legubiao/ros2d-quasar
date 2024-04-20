FROM nginx:latest
EXPOSE 80
COPY dist/spa  /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
