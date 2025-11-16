// lib/email.ts
import nodemailer from "nodemailer";

export async function sendWinnerEmail(data: {
  to: string;
  winnerName: string;
  raffleTitle: string;
  skinName: string;
  skinValue: number;
  winnerNumber: number;
  totalEntries: number;
  drawDate: Date;
  sponsorName: string;
  raffleId: string;
}) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Formatar data
  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(data.drawDate);

  // Calcular chance de vitória
  const winChance = ((1 / data.totalEntries) * 100).toFixed(2);

  // Formatar valor
  const formattedValue = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(data.skinValue);

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Vencedor do Sorteio</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .certificate {
          background: white;
          border-radius: 20px;
          padding: 60px 40px;
          max-width: 800px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .certificate::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent 30%, rgba(255,215,0,0.1) 50%, transparent 70%);
          animation: shine 3s infinite;
        }

        @keyframes shine {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }

        .trophy {
          font-size: 120px;
          animation: bounce 1s infinite;
          margin-bottom: 20px;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        h1 {
          color: #667eea;
          font-size: 48px;
          margin-bottom: 10px;
          font-weight: bold;
        }

        .subtitle {
          color: #666;
          font-size: 18px;
          margin-bottom: 40px;
        }

        .winner-box {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 15px;
          margin: 30px 0;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
        }

        .winner-name {
          font-size: 36px;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .winner-email {
          font-size: 18px;
          opacity: 0.9;
        }

        .prize-info {
          background: #f8f9fa;
          padding: 25px;
          border-radius: 10px;
          margin: 30px 0;
          border-left: 5px solid #667eea;
        }

        .prize-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 0;
          border-bottom: 1px solid #e0e0e0;
        }

        .prize-item:last-child {
          border-bottom: none;
        }

        .prize-label {
          color: #666;
          font-size: 16px;
          font-weight: 500;
        }

        .prize-value {
          color: #333;
          font-size: 20px;
          font-weight: bold;
        }

        .winning-number {
          font-size: 80px;
          font-weight: bold;
          color: #667eea;
          margin: 20px 0;
          text-shadow: 3px 3px 0 rgba(102, 126, 234, 0.2);
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin: 30px 0;
        }

        .stat-box {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 10px;
        }

        .stat-number {
          font-size: 32px;
          font-weight: bold;
          color: #667eea;
          margin-bottom: 5px;
        }

        .stat-label {
          color: #666;
          font-size: 14px;
        }

        .footer {
          margin-top: 40px;
          color: #999;
          font-size: 14px;
        }

        .sponsor-badge {
          display: inline-block;
          background: #ffd700;
          color: #333;
          padding: 8px 20px;
          border-radius: 20px;
          font-weight: bold;
          margin-top: 20px;
        }

        @media (max-width: 768px) {
          .certificate {
            padding: 40px 20px;
          }

          h1 {
            font-size: 32px;
          }

          .winner-name {
            font-size: 28px;
          }

          .stats {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .winning-number {
            font-size: 60px;
          }
        }
      </style>
    </head>
    <body>
      <div class="certificate">
        <div class="trophy">🏆</div>
        
        <h1>PARABÉNS!</h1>
        <p class="subtitle">Você é o grande vencedor do sorteio!</p>

        <div class="winner-box">
          <div class="winner-name">${data.winnerName}</div>
          <div class="winner-email">${data.to}</div>
        </div>

        <div class="prize-info">
          <div class="prize-item">
            <span class="prize-label">🎮 Prêmio</span>
            <span class="prize-value">${data.skinName}</span>
          </div>
          <div class="prize-item">
            <span class="prize-label">💰 Valor</span>
            <span class="prize-value">${formattedValue}</span>
          </div>
          <div class="prize-item">
            <span class="prize-label">📅 Data do Sorteio</span>
            <span class="prize-value">${formattedDate}</span>
          </div>
        </div>

        <p style="color: #666; font-size: 18px; margin: 20px 0;">Número da Sorte</p>
        <div class="winning-number">🎲 ${data.winnerNumber}</div>

        <div class="stats">
          <div class="stat-box">
            <div class="stat-number">${data.totalEntries}</div>
            <div class="stat-label">Total de Bilhetes</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">${data.winnerNumber}</div>
            <div class="stat-label">Bilhete Vencedor</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">${winChance}%</div>
            <div class="stat-label">Sua Chance</div>
          </div>
        </div>

        <div class="sponsor-badge">
          Patrocinado por ${data.sponsorName} 🎯
        </div>

        <div class="footer">
          <p>Sorteio ID: ${data.raffleId}</p>
          <p style="margin-top: 10px;">Sistema de Sorteios v1.0</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: data.to,
    subject: `🎉 Parabéns! Você ganhou: ${data.raffleTitle}`,
    html,
  });
}
