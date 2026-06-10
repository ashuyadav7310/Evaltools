# ComCoach EC2 Deployment Guide

This project is now prepared to run on:

- EC2 for app hosting
- RDS PostgreSQL for database
- S3 for audio uploads and Excel reports

## Company AWS details already wired into templates

- AWS region: `ap-south-1`
- S3 bucket: `comcoach-app-646593226527-ap-south-1-an`
- RDS endpoint: `comcoach-db.czgqnp6ru8hk.ap-south-1.rds.amazonaws.com`
- RDS instance name: `comcoach-db`
- EC2 private IP: `172.20.2.253`
- Security group id mentioned: `sg-039fa1b53827205dd`
- IAM role available on EC2: `comcoach-app-limited-role`

## What this code now expects

- PostgreSQL connection string in `.env`
- OpenAI API key in `.env`
- Admin token in `.env`
- EC2 instance IAM role must have S3 permissions for the bucket
- `ffmpeg` installed on EC2

## Files added for deployment

- `.env.example`
- `deploy/systemd/comcoach-backend.service`
- `deploy/systemd/comcoach-frontend.service`
- `deploy/nginx/comcoach.conf`

## Amazon Linux EC2 steps

1. Copy the project to EC2, for example into `/opt/comcoach/ComCoachAI_V3`.
2. Install packages:

```bash
sudo dnf update -y
sudo dnf install -y python3 python3-pip ffmpeg nginx gcc gcc-c++ make postgresql15-devel nodejs npm
```

3. Create virtual environment and install dependencies:

```bash
cd /opt/comcoach/ComCoachAI_V3
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cd frontend-next
npm install
npm run build
cd ..
```

4. Create the production env file:

```bash
cp .env.example .env
nano .env
```

5. Fill the missing values in `.env`:

- `<RDS_USERNAME>`
- `<RDS_PASSWORD>`
- `<YOUR_OPENAI_API_KEY>`
- `<SET_A_STRONG_ADMIN_TOKEN>`
- `<EC2_PUBLIC_IP_OR_DOMAIN>`
- Optional: `<YOUR_DOMAIN>`

6. Install systemd services:

```bash
sudo cp deploy/systemd/comcoach-backend.service /etc/systemd/system/
sudo cp deploy/systemd/comcoach-frontend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable comcoach-backend
sudo systemctl enable comcoach-frontend
sudo systemctl start comcoach-backend
sudo systemctl start comcoach-frontend
```

7. Install Nginx config:

```bash
sudo cp deploy/nginx/comcoach.conf /etc/nginx/sites-available/comcoach
sudo ln -s /etc/nginx/sites-available/comcoach /etc/nginx/sites-enabled/comcoach
sudo nginx -t
sudo systemctl restart nginx
```

## AWS security and network checks

Make sure these are allowed:

- EC2 inbound `80` from users
- EC2 inbound `22` from your admin IP
- EC2 inbound `3000` and `8000` only if you want direct access; otherwise keep closed and use Nginx on `80`
- RDS inbound `5432` from the EC2 security group
- EC2 IAM role permission for:
  - `s3:PutObject`
  - `s3:GetObject`
  - `s3:ListBucket`
  - optionally `s3:DeleteObject`

## Important behavior in this build

- Audio is processed locally on EC2 first, then uploaded to S3 when `S3_ENABLED=true`
- Reports are generated locally, uploaded to S3, then downloaded using a presigned S3 URL
- Frontend API target is environment-driven using `COMCOACH_API_BASE_URL`
- Linux filename case issue for the logo has been fixed

## Things still needed from your side

- RDS database username
- RDS database password
- OpenAI API key
- EC2 public IP or domain name
- Confirmation of the EC2 OS
- Confirmation that the IAM role can access the S3 bucket

## Recommended next AWS checks

- Confirm the RDS engine is PostgreSQL
- Confirm the database name is really `comcoach_db` or tell me the exact DB name if different
- Confirm the EC2 box is Ubuntu or Amazon Linux
- Confirm whether SSL is required for the RDS connection
