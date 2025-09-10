import type { CompilerOptions } from 'typescript';
// import { ScriptTarget, ModuleKind, ModuleResolutionKind } from 'typescript';

interface ExtendedCompilerOptions extends Omit<CompilerOptions, 'target' | 'module' | 'moduleResolution'> {
  target?: string | CompilerOptions['target'];
  module?: string | CompilerOptions['module'];
  moduleResolution?: string | CompilerOptions['moduleResolution'];
}

export interface TSConfig {
  compilerOptions: ExtendedCompilerOptions;
}

export const BaseOptions = {
  target: 'ES2020',
  module: 'NodeNext',
  moduleResolution: 'NodeNext',

  composite: true, // reference
  declaration: true,
  declarationMap: true,
  sourceMap: true,
  incremental: true,
  
  strict: true,
  strictNullChecks: true,
  skipLibCheck: true,
  exactOptionalPropertyTypes: true,
  noImplicitReturns: true,
  noImplicitOverride: true,

  // allowSyntheticDefaultImports: true, // CommonJS 모듈을 ES6 default import로 가져올 수 있게 함
  // esModuleInterop: true, // CommonJS와 ES 모듈 간의 상호 운용성 개선
  
  forceConsistentCasingInFileNames: true,
  
  noUnusedLocals: true,
  noUnusedParameters: true,
  noFallthroughCasesInSwitch: true,
} as const;

const baseConfig: TSConfig = {
  compilerOptions: BaseOptions,
};

export default baseConfig;