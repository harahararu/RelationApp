# Next.js プロジェクト立ち上げ

## ディレクトリ構成
```
.
└── application/
    ├── front/
    │   ├── src/
    │   └── Dockerfile
    └── docker-compose.yml
```

## Dockerfileの記載
```Dockerfile
FROM node:23
WORKDIR /app
```

## docker-compose.ymlの記載
```Dockerfile
version: '1'
services:
    [servciceName]:
        build: ./front
        container_name: [containerName]
        tty: true
        volumes:
        - ./front/src:/app
        ports:
        - "5173:3000"
```

## Dockerのbuild
```
docker compose build
```

## Next.jsプロジェクトの作成
1. dockerに入る
```
docker compose run --rm [serviseName] /bin/bash
```
2. プロジェクト作成
```
npx create-next-app@latest
```

## Next.jsの起動
1. Dockerfileに起動コマンド追記
```diff
+ CMD ["npm", "run", "dev"]
```
2. docker-compose.ymlのvolumesを作成したプロジェクトに変更する
```diff
volumes:
-        - ./front/src/:/app
+        - ./front/src/data_relation/:/app
```
3. dockerを再build
4. dockerの起動
```
docker compose up -d
```
5. dockerの起動確認
```
docker ps
```
6. URLにアクセスし、Next.jsのページが表示されることを確認する。


# PostgreSQLとの連携
## ProstgreSQL構築
docker-compose.ymlにpostgresqlの記述を追加
1. PostgreSQLの公式イメージの使用
2. データベースへの変更を永続化するための、ボリュームのマウント
3. .envファイルの読み込み
4. PostgreSQLのデフォルトのポートとの接続
```diff
+    db_data_relation:
+        image: postgres:15
+        container_name: db_data_relation
+        volumes:
+           - ./db/data:/var/lib/postgresql/data
+       env_file:
+           - .env
+        ports:
+        - "5432:5432"
```
環境設定ファイル(.env)を用意する
```.env
POSTGRES_PASSWORD="password"
POSTGRES_USER="postgres"
DATABASE_URL="postgresql://postgres:password@db:5432/postgres?schema=public"
```

dfocker-composeを再起動

♯♯ Next.jsとの連携
docker-compose.ymlに追記
```diff
+   env_file:
+       - .env
+   depends_on:
+       - db_data_relation
```

# Prismaのセットアップ
prismaのinstall
```
docker compose exec [serviceName] npm install prisma --save-dev
```
prismaセットアップ
```
docker compose exec [serviceName] npx prisma init
```

prisma/schema.prismaを編集
```
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
モデルを定義し、DBに反映
```sh
npx prisma db push
```
