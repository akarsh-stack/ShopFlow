import nodemailer from "nodemailer";

const MAIL_USER = process.env.GOOGLE_MAIL_USER;
const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME ?? "ShopFlow";

if (!MAIL_USER) {
  throw new Error(
    "GOOGLE_MAIL_USER is not set. Add the Gmail address that owns the OAuth2 credentials to apps/email-service/.env",
  );
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: MAIL_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
});

const sendMail = async ({
  email,
  subject,
  text,
}: {
  email: string;
  subject: string;
  text: string;
}) => {
  const res = await transporter.sendMail({
    from: `"${MAIL_FROM_NAME}" <${MAIL_USER}>`,
    to: email,
    subject,
    text,
  });

  console.log("MESSAGE SENT:", res);
};

export default sendMail;
