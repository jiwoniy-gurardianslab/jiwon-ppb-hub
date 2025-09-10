import { readdirSync, mkdirSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// tsc로 빌드된 tsconfig 설정들을 JSON으로 변환
// tsconfig에서 json을 참조해야 하기 때문에
async function generateJsonConfigs() {
  const tsconfigDir = join(__dirname, '../dist/ts-config');
  const outputDir = join(__dirname, '../dist/ts-config');
  
  // 디렉토리 생성
  mkdirSync(outputDir, { recursive: true });

  // TypeScript 설정 파일들 찾기
  const configFiles = readdirSync(tsconfigDir)
    .filter(file => file.endsWith('.js'))
    .map(file => file.replace('.js', ''));

  for (const configName of configFiles) {
    try {
      // 동적으로 설정 로드
      // delete require.cache[join(tsconfigDir, `${configName}.js`)];
      // const config = require(join(tsconfigDir, `${configName}.js`)).default;

      // 캐시 무효화를 위한 타임스탬프 추가
      const configPath = join(tsconfigDir, `${configName}.js`);
      const cacheBuster = `?t=${Date.now()}`;
      const config = (await import(configPath + cacheBuster)).default;
      
      // JSON 파일로 저장
      const jsonPath = join(outputDir, `${configName}.json`);
      writeFileSync(jsonPath, JSON.stringify(config, null, 2));
      
      console.log(`✅ 생성: ts-config/${configName}.json`);
    } catch (error) {
      console.error(`❌ 실패: ts-config/${configName}`, error.message);
    }
  }
}

generateJsonConfigs();