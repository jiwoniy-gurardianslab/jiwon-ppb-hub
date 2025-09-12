FROM node:18-alpine

WORKDIR /app

# 패키지 파일들 복사
COPY package*.json ./
COPY pnpm-lock.yaml ./

# pnpm 설치 및 의존성 설치
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# 소스 코드 복사
COPY . .

# 빌드
RUN pnpm run build

# 포트 노출
EXPOSE 3000

# 실행 명령어 (기본: 스케줄러)
CMD ["node", "dist/scheduler.js"]