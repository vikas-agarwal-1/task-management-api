import nodemailer from 'nodemailer';

// Setup email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Function to send welcome email
export const sendWelcomeEmail = async (email, username) => {
  try {
    // Email content
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Welcome to Task Management System',
      html: `
        <h1>Welcome ${username}!</h1>
        <p>Thank you for registering.</p>
        <p>You can now login and manage your tasks.</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully');
  } catch (error) {
    // Just log error, don't stop the application
    console.log('Email error:', error.message);
  }
};

// Function to send task assignment email
export const sendTaskAssignmentEmail = async (email, taskTitle, assignerName) => {
  try {
    // Email content
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'New Task Assigned',
      html: `
        <h2>You have a new task!</h2>
        <p><strong>Task:</strong> ${taskTitle}</p>
        <p><strong>Assigned by:</strong> ${assignerName}</p>
        <p>Please login to see details.</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log('Assignment email sent successfully');
  } catch (error) {
    // Just log error, don't stop the application
    console.log('Email error:', error.message);
  }
};