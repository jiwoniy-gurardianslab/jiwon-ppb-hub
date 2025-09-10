# PPB-HUB

## Setup

```
pnpm install
// typescript + jest 설정을 위해서
pnpm run build:config
```


### Init (처음부터 셋팅이 궁금하다면)
[설치하기](https://pnpm.io/ko/installation)

[작업공간](https://pnpm.io/ko/workspaces)
```
corepack enable pnpm
corepack use pnpm@latest-10
nvm install v22.19.0 // (이시점 LTS)
pnpm init
// 기본
pnpm install -wD typescript tsx @types/node
// 테스트 환경(전역으로)
pnpm install -wD jest ts-jest @types/jest
pnpm dlx tsx --init
```

- workspace 설정
- .npmrc설정

### 주요 모듈
[jest](https://jestjs.io/)

[prisma](https://www.prisma.io/docs/getting-started/quickstart-sqlite)