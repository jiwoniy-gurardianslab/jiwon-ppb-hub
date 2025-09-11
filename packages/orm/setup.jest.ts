// Jest에서 test를 위한 환경 변수
// 반드시 Local 환경(민감하지 않은) 정보만 저장해둘 것
// TODO ENV에서 가져오도록

process.env.PPB_DATABASE_TYPE = 'postgresql';
process.env.PPB_DATABASE_USERNAME = 'guardians';
process.env.PPB_DATABASE_PASSWORD = '1q2w3e$R';
// process.env.PPB_DATABASE_HOST = 'localhost';
// process.env.PPB_DATABASE_HOST = 'ppb-development.cohpkveydrp3.ap-northeast-2.rds.amazonaws.com';
process.env.PPB_DATABASE_HOST = 'ppb-production-v2-cluster.cluster-cpda7oqtfybw.ap-northeast-2.rds.amazonaws.com';


process.env.PPB_DATABASE_PORT = '5432';
// process.env.PPB_DATABASE_NAME = 'ppb-development';
process.env.PPB_DATABASE_NAME = 'ppb-production';
process.env.PPB_DATABASE_SCHEMA = 'public';