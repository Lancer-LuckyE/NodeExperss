const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
	// create transport
	const transport = nodemailer.createTransport({
		host: process.env.EMAIL_HOST,
		port: process.env.EMAIL_PORT,
		auth:{
			user: process.env.EMAIL_USERNAME,
			pass: process.env.EMAIL_PASSWORD
		}
	});
	// setup email content and options
	const emailOptions = {
		from: 'Natours Dev <hliu107@uottawa.ca>',
		to: options.email,
		subject: options.subject,
		text: options.text
	};
	// send the email
	await transport.sendMail(emailOptions);
};

module.exports = sendEmail;
