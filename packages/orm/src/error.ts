export type DBErrorCode =
  'DB_UNKNOWN'
  | 'DB_INTERNAL_SERVER' 
  | 'DB_NOT_FOUND' 
  | 'DB_DUPLICATE' 
  | 'DB_INVALID' 
  | 'DB_EMPTY_PARAM' 
  | 'DB_NO_PERMISSION' ;


import { Prisma as PrismaPpb } from '../generated/ppb';

export const DBErrorCode: Record<DBErrorCode, DBErrorCode> = {
  /* Unknown */
  DB_UNKNOWN: 'DB_UNKNOWN',
  DB_INTERNAL_SERVER: 'DB_INTERNAL_SERVER',

  /* Invalid */
  DB_NOT_FOUND: 'DB_NOT_FOUND',
  DB_DUPLICATE: 'DB_DUPLICATE',
  DB_INVALID: 'DB_INVALID',
  DB_EMPTY_PARAM: 'DB_EMPTY_PARAM',

  /* Auth */
  DB_NO_PERMISSION: 'DB_NO_PERMISSION'
} as const;

// https://www.prisma.io/docs/orm/reference/error-reference
export class DBError extends Error {
  code: keyof typeof DBErrorCode;
  details?: {
    message?: string;
    error?: string;
  };

  constructor(code: keyof typeof DBErrorCode, details?: { message?: string, error?: string }) {
    super(code);
    this.name = 'DBError';
    this.code = code;
    if (details) {
      this.details = details;
    }
  }
}

// PrismaClientUnknownRequestError: 알려지지 않은 데이터베이스 에러
// PrismaClientInitializationError: Prisma Client 초기화 중 발생하는 에러데이터베이스 연결 실패
// PrismaClientRustError: Rust 엔진에서 발생하는 에러 (패닉이 아닌)

// Prisma 에러 타입
// P2002 => 유니크 제약 조건 위반 (중복 키)
// P2003 => 외래키 제약 조건 위반
// P2025 => 레코드 찾을 수 없음
// P2000 => 칼럼타입이 맞지 않음

/**
  * Prisma Error을 받아서 적절한 서비스 에러로 변환
  */
export function handlePrismaError(error: unknown): DBError {
  console.log(error);
  // Prisma 에러 타입에 따른 적절한 서비스 에러 변환
  if (error instanceof PrismaPpb.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return new DBError(
        DBErrorCode.DB_DUPLICATE,
        {
          message: error.message,
          error: JSON.stringify(error),
        },
      );
    } else if (error.code === 'P2003') {
      return new DBError(
        DBErrorCode.DB_INVALID,
        {
          message: error.message,
          error: JSON.stringify(error),
        },
      );
    } else if (error.code === 'P2025') {
      return new DBError(
        DBErrorCode.DB_NOT_FOUND,
        {
          message: error.message,
          error: JSON.stringify(error),
        },
      );
    } else if (error.code === 'P2000') {
      return new DBError(
        DBErrorCode.DB_INTERNAL_SERVER,
        {
          message: error.message,
          error: JSON.stringify(error),
        },
      );
    }
  } else if (error instanceof PrismaPpb.PrismaClientValidationError) {
    return new DBError(
      DBErrorCode.DB_INVALID,
      {
        message: error.message,
        error: JSON.stringify(error),
      },
    );
  } else if (error instanceof PrismaPpb.PrismaClientRustPanicError) {
    return new DBError(
      DBErrorCode.DB_INTERNAL_SERVER,
      {
        message: error.message,
        error: JSON.stringify(error),
      },
    );
  } else if (error instanceof DBError) {
    return error;
  }

  // 기타
  return new DBError(
    DBErrorCode.DB_UNKNOWN,
    {
      error: JSON.stringify(error),
    },
  );
}
