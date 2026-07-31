import QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';

const PRODUCTION_URL = 'https://alfa-postventa-90.vercel.app/prototipo';

async function main() {
  const qrDir = path.join(process.cwd(), 'public', 'qr');

  if (!fs.existsSync(qrDir)) {
    fs.mkdirSync(qrDir, { recursive: true });
  }

  // Generate PNG (1024x1024)
  await QRCode.toFile(
    path.join(qrDir, 'alfa-postventa-90-qr.png'),
    PRODUCTION_URL,
    {
      type: 'png',
      width: 1024,
      margin: 4,
      color: { dark: '#0B2A55', light: '#FFFFFF' },
      errorCorrectionLevel: 'H',
    }
  );

  // Generate SVG
  const svgContent = await QRCode.toString(PRODUCTION_URL, {
    type: 'svg',
    width: 1024,
    margin: 4,
    color: { dark: '#0B2A55', light: '#FFFFFF' },
    errorCorrectionLevel: 'H',
  });
  fs.writeFileSync(path.join(qrDir, 'alfa-postventa-90-qr.svg'), svgContent);

  console.log('✅ QR codes generated:');
  console.log('   - public/qr/alfa-postventa-90-qr.png (1024x1024)');
  console.log('   - public/qr/alfa-postventa-90-qr.svg');
  console.log(`   URL: ${PRODUCTION_URL}`);
}

main().catch(console.error);
