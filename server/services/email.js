const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
  }

  getTransporter() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    }
    return this.transporter;
  }

  async sendEmail(to, subject, html) {
    try {
      const transporter = this.getTransporter();
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@golfcharity.com',
        to,
        subject,
        html
      });
      console.log(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      console.error('Email send error:', error.message);
      // Don't throw - email failures shouldn't break the app
    }
  }

  async sendWelcome(user) {
    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0a0f1c; color: #e2e8f0; padding: 40px; border-radius: 16px;">
        <h1 style="color: #34d399; margin-bottom: 8px;">Welcome to GolfCharity! 🏌️</h1>
        <p>Hi ${user.name},</p>
        <p>Thank you for joining our community. Together, we're making a difference through the sport we love.</p>
        <p>Get started by subscribing to enter monthly draws and start tracking your scores!</p>
        <a href="${process.env.CLIENT_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #34d399, #059669); color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">Go to Dashboard</a>
      </div>
    `;
    await this.sendEmail(user.email, 'Welcome to GolfCharity! 🏌️', html);
  }

  async sendSubscriptionConfirmed(user, plan) {
    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0a0f1c; color: #e2e8f0; padding: 40px; border-radius: 16px;">
        <h1 style="color: #34d399;">Subscription Confirmed! ✅</h1>
        <p>Hi ${user.name},</p>
        <p>Your <strong>${plan}</strong> subscription is now active. You're all set to enter monthly draws!</p>
        <p>Don't forget to enter your golf scores and select a charity to support.</p>
        <a href="${process.env.CLIENT_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #34d399, #059669); color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">View Dashboard</a>
      </div>
    `;
    await this.sendEmail(user.email, 'Subscription Confirmed! ✅', html);
  }

  async sendDrawResults(user, drawMonth, drawYear, matched) {
    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0a0f1c; color: #e2e8f0; padding: 40px; border-radius: 16px;">
        <h1 style="color: #f59e0b;">Draw Results - ${drawMonth}/${drawYear} 🎯</h1>
        <p>Hi ${user.name},</p>
        ${matched ? `
          <p style="color: #34d399; font-size: 18px; font-weight: bold;">🎉 Congratulations! You matched ${matched.matchCount} numbers!</p>
          <p>Prize amount: <strong>$${(matched.prizeAmount / 100).toFixed(2)}</strong></p>
          <p>Please upload your score verification proof to claim your winnings.</p>
        ` : `
          <p>Unfortunately, you didn't match enough numbers this month. Keep playing!</p>
        `}
        <a href="${process.env.CLIENT_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #34d399, #059669); color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">View Results</a>
      </div>
    `;
    await this.sendEmail(user.email, `Draw Results - ${drawMonth}/${drawYear}`, html);
  }

  async sendWinnerNotification(user, prizeAmount, matchCount) {
    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0a0f1c; color: #e2e8f0; padding: 40px; border-radius: 16px;">
        <h1 style="color: #f59e0b;">🏆 You're a Winner!</h1>
        <p>Hi ${user.name},</p>
        <p style="font-size: 24px; color: #34d399; font-weight: bold;">You matched ${matchCount} numbers!</p>
        <p>Your prize: <strong>$${(prizeAmount / 100).toFixed(2)}</strong></p>
        <p>Please upload a screenshot of your golf scores as verification proof.</p>
        <a href="${process.env.CLIENT_URL}/dashboard/winnings" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">Upload Proof</a>
      </div>
    `;
    await this.sendEmail(user.email, '🏆 You\'re a Winner!', html);
  }

  async sendPayoutConfirmation(user, amount) {
    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0a0f1c; color: #e2e8f0; padding: 40px; border-radius: 16px;">
        <h1 style="color: #34d399;">Payout Processed! 💰</h1>
        <p>Hi ${user.name},</p>
        <p>Your payout of <strong>$${(amount / 100).toFixed(2)}</strong> has been processed.</p>
        <p>Thank you for being part of the GolfCharity community!</p>
      </div>
    `;
    await this.sendEmail(user.email, 'Payout Processed! 💰', html);
  }
}

module.exports = new EmailService();
