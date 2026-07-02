import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

console.log('SMTP Config:', process.env.SMTP_HOST, process.env.SMTP_PORT, process.env.SMTP_USER);

const transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 465,
  secure: true,
  auth: { user: 'economiacomhistoria@outlook.pt', pass: 'Malange3#' },
  tls: { rejectUnauthorized: false },
  connectionTimeout: 15000,
});

try {
  const info = await transporter.sendMail({
    from: '"EconomiaJA" <economiacomhistoria@outlook.pt>',
    to: 'economiacomhistoria@outlook.pt',
    subject: 'Teste SMTP - EconomiaJA',
    html: '<h1>Funcionou!</h1><p>Email de teste enviado com sucesso.</p>'
  });
  console.log('EMAIL ENVIADO:', info.messageId);
} catch(e) {
  console.log('ERRO:', e.code || e.message);
}
process.exit(0);
