Correct. Each nginx block should proxy directly to its corresponding MinIO bucket:

```nginx
# uploads.ekipma.ir
# Only avatar-staging is exposed.

server {
    listen 443 ssl http2;
    server_name uploads.ekipma.ir;

    ssl_certificate     /etc/letsencrypt/live/uploads.ekipma.ir/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/uploads.ekipma.ir/privkey.pem;

    client_max_body_size 10m;

    location /avatar-staging/ {
        proxy_pass http://127.0.0.1:9000/avatar-staging/;
        proxy_http_version 1.1;

        proxy_set_header Host $http_host;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        proxy_request_buffering off;
        proxy_read_timeout 300s;
    }

    location / {
        return 404;
    }
}


# cdn.ekipma.ir
# Only avatars is exposed.

server {
    listen 443 ssl http2;
    server_name cdn.ekipma.ir;

    ssl_certificate     /etc/letsencrypt/live/cdn.ekipma.ir/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cdn.ekipma.ir/privkey.pem;

    location /avatars/ {
        limit_except GET HEAD {
            deny all;
        }

        rewrite ^/avatars/(.*)$ /avatars/$1 break;
        proxy_pass http://127.0.0.1:9000;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        proxy_hide_header Set-Cookie;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location / {
        return 404;
    }
}
```

The mapping is now explicit:

```text
uploads.ekipma.ir/avatar-staging/... → MinIO avatar-staging/...
cdn.ekipma.ir/avatars/...              → MinIO avatars/...
```

The Go server should generate:

```text
https://uploads.ekipma.ir/...
```

for presigned uploads, and:

```text
https://cdn.ekipma.ir/avatars/...
```

for final avatar URLs.
