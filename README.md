# Guntrader API Sync

A Bun application that syncs your advert data from the Guntrader API, stores it in a Postgresql database, and manages images by uploading them to to any S3 compatible storage. The application uses a cron job to update the database periodically and ensures that obsolete data is removed, including deleting related images from storage.

## Features

- Fetches gun data from the Guntrader API.
- Upserts gun records into a database using Prisma.
- Uploads gun images to DigitalOcean Spaces.
- Deletes old/obsolete guns and corresponding images from both the database and DigitalOcean.
- Runs periodically using `node-cron`.

## Install

Clone this repository.

Install dependencies:

```sh
bun install
```

To run:

```sh
bun run dev
```

Provide the following env variables in your own .env file:

### Guntrader API key

GUNTRADER_API_KEY=your_guntrader_api_key

### DigitalOcean Spaces credentials

S3_ACCESS_KEY=your_S3_access_key
S3_SECRET_KEY=your_S3_secret_key
S3_SPACE_NAME=your_space_name
S3_REGION=your_space_region
S3_ENDPOINT=https://your_space_name.your_region.digitaloceanspaces.com

### Database credentials

DATABASE_URL=postgresql://username:password@localhost:5432/dbname
