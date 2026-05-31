// Teste de upload para o Telegram via sendDocument
const TELEGRAM_BOT_TOKEN = '8944322068:AAF_4EPVkJpbMFhg_9XirGXl1EhWnxSa0D0';
const TELEGRAM_CHAT_ID = '6695102150';

const fileBuffer = Buffer.from('Teste de upload - Economia com Historia');

const boundary = '----TestBoundary' + Date.now();
const CRLF = '\r\n';

const fieldPart = [
  '--' + boundary,
  'Content-Disposition: form-data; name="chat_id"',
  '',
  TELEGRAM_CHAT_ID,
].join(CRLF);

const filePart = [
  '--' + boundary,
  'Content-Disposition: form-data; name="document"; filename="test.txt"',
  'Content-Type: text/plain',
  '',
  '',
].join(CRLF);

const endPart = CRLF + '--' + boundary + '--';

const body = Buffer.concat([
  Buffer.from(fieldPart + CRLF),
  Buffer.from(filePart),
  fileBuffer,
  Buffer.from(endPart),
]);

fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`, {
  method: 'POST',
  headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
  body: body,
})
  .then(r => r.json())
  .then(d => {
    if (d.ok) {
      const fileId = d.result.document.file_id;
      console.log('✅ Upload OK! file_id:', fileId);
      console.log('URL proxy:', `/api/media/${fileId}`);
    } else {
      console.log('❌ Erro Telegram:', JSON.stringify(d, null, 2));
    }
  })
  .catch(err => console.error('❌ Erro:', err));
