import nodemailer from 'nodemailer';

const transport = nodemailer.createTransport({
    host: '127.0.0.1',
    port: 1025,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'your_email@example.com',
        pass: 'your_email_password'
    },
    tls: {
        rejectUnauthorized: false
    }
});

export default transport;