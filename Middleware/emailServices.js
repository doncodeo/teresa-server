const nodemailer = require('nodemailer');

// Set up the Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email service
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Function to send registration confirmation email

const registrationConfirmation = async (user) => {
    const currentYear = new Date().getFullYear(); // Get the current year
  
    // URL to the externally hosted logo
    const logoUrl = 'https://static.vecteezy.com/system/resources/thumbnails/005/544/708/small_2x/profile-icon-design-free-vector.jpg'; 
  
    const mailOptions = {
      from: `"Teresa" <${process.env.EMAIL_USERNAME}>`,
      to: user.email,
      subject: 'Registration Confirmation',
      html: `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f0f0f0;
                color: #333;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.1);
              }
              .header {
                background-color: #4CAF50;
                color: white;
                padding: 20px;
                text-align: center;
                border-top-left-radius: 8px;
                border-top-right-radius: 8px;
              }
              .header img {
                max-width: 150px; /* You can adjust the size of the logo here */
                margin-bottom: 10px;
              }
              .header h2 {
                margin: 0;
              }
              .highlight {
                color: #4CAF50;
                font-weight: bold;
              }
              .content {
                padding: 20px;
                text-align: left;
              }
              .login-button {
                display: inline-block;
                padding: 12px 24px;
                background-color: #4CAF50;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                font-size: 16px;
                margin-top: 20px;
              }
              .footer {
                margin-top: 20px;
                text-align: center;
                color: #666;
                font-size: 12px;
              }
              .footer p {
                margin: 5px 0;
              }
              /* Responsive Design */
              @media (max-width: 600px) {
                .container {
                  padding: 15px;
                }
                .login-button {
                  padding: 10px 20px;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <img src="${logoUrl}" alt="Teresa Logo"> <!-- Logo linked here -->
                <h2>Welcome to <span class="highlight">Teresa</span>!</h2>
              </div>
              <div class="content">
                <p>Dear ${user.username},</p>
                <p>Thank you for registering with <span class="highlight">Teresa</span>! We're excited to have you on board.</p>
                <p>Please click on the button below to log in to your account:</p>
                <a class="login-button" href="http://localhost:3000/login" target="_blank">Login to Your Account</a>
              </div>
              <div class="footer">
                <p>Best regards,</p>
                <p>The <span class="highlight">Teresa</span> Team</p>
                <p>&copy; ${currentYear} Teresa, All Rights Reserved</p>
              </div>
            </div>
          </body>
        </html>
      `
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log('Registration email sent successfully');
    } catch (error) {
      console.error('Error sending registration email:', error);
    }
};

const familyCreationMail = async (user, family, joinLink) => {
    const currentYear = new Date().getFullYear();
    const mailOptions = {
      from: `"Teresa App" <${process.env.EMAIL_USERNAME}>`,
      to: user.email,
      subject: 'Your Family Group Has Been Created!',
      html: `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f9f9f9;
                margin: 0;
                padding: 0;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 20px auto;
                background: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
              }
              .header {
                background-color: #4CAF50;
                color: #ffffff;
                text-align: center;
                padding: 20px;
                border-top-left-radius: 8px;
                border-top-right-radius: 8px;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
              }
              .content {
                margin: 20px 0;
                line-height: 1.6;
              }
              .content h2 {
                color: #4CAF50;
                font-size: 20px;
                margin-bottom: 10px;
              }
              .content p {
                margin: 5px 0;
              }
              .content .family-info {
                background: #f7f7f7;
                padding: 10px;
                border-radius: 5px;
                border: 1px solid #ddd;
                margin-bottom: 20px;
              }
              .content .family-info p {
                margin: 8px 0;
                font-weight: bold;
                color: #333;
              }
              .copy-link {
                background: #f7f7f7;
                border: 1px solid #ddd;
                padding: 10px;
                font-family: monospace;
                border-radius: 5px;
                margin: 10px 0;
                word-wrap: break-word;
                color: #333;
              }
              .footer {
                margin-top: 20px;
                font-size: 12px;
                color: #666;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to Your Family Group!</h1>
              </div>
              <div class="content">
                <h2>Family Information:</h2>
                <div class="family-info">
                  <p><strong>Family Name:</strong> ${family.name}</p>
                  <p><strong>Family Code:</strong> ${family.familyCode}</p>
                  <p><strong>Description:</strong> ${family.description || 'No description provided.'}</p>
                  <p><strong>Family Link:</strong> ${joinLink}</p>
                  </div>
                <p>You can invite other members to join your family group using the options below:</p>
                <p><strong>Option 1:</strong> Share the Family Code above, and members can use it to join manually.</p>
                <p><strong>Option 2:</strong> Share the unique join link below:</p>
                <div class="copy-link">
                  ${joinLink}
                </div>
                <p>To copy the link, simply select it above and use <strong>Ctrl+C</strong> (or <strong>Cmd+C</strong> on Mac).</p>
              </div>
              <div class="footer">
                <p>&copy; ${currentYear} Teresa App. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log('Family creation email sent successfully');
    } catch (error) {
      console.error('Error sending family creation email:', error);
    }
};

const familyWelcomeMail = async (user, family, familyLink) => {
    const currentYear = new Date().getFullYear();
    const mailOptions = {
        from: `"Teresa App" <${process.env.EMAIL_USERNAME}>`,
        to: user.email,
        subject: `Welcome to the ${family.name} Family Group!`,
        html: `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f9f9f9;
                margin: 0;
                padding: 0;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 20px auto;
                background: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
              }
              .header {
                background-color: #4CAF50;
                color: #ffffff;
                text-align: center;
                padding: 20px;
                border-top-left-radius: 8px;
                border-top-right-radius: 8px;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
              }
              .content {
                margin: 20px 0;
                line-height: 1.6;
                text-align: center;
              }
              .content h2 {
                color: #4CAF50;
                font-size: 20px;
                margin-bottom: 10px;
              }
              .content p {
                margin: 10px 0;
              }
              .button {
                display: inline-block;
                background-color: #4CAF50;
                color: #ffffff;
                text-decoration: none;
                padding: 10px 20px;
                font-size: 16px;
                border-radius: 5px;
                margin-top: 20px;
              }
              .button:hover {
                background-color: #45a049;
              }
              .footer {
                margin-top: 20px;
                font-size: 12px;
                color: #666;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to the ${family.name} Family Group!</h1>
              </div>
              <div class="content">
                <p>Hi ${user.username},</p>
                <p>Congratulations! You have successfully joined the <strong>${family.name}</strong> family group.</p>
                <p>Click the button below to access your family group, where you can connect with other family members and start exploring:</p>
                <a href="${familyLink}" class="button">Access Family Group</a>
              </div>
              <div class="footer">
                <p>&copy; ${currentYear} Teresa App. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Welcome email sent successfully');
    } catch (error) {
        console.error('Error sending welcome email:', error);
    }
};  

const familyLeaveMail = async (user, family, familyLink, familyCode) => {
    const currentYear = new Date().getFullYear();
    const mailOptions = {
        from: `"Teresa App" <${process.env.EMAIL_USERNAME}>`,
        to: user.email,
        subject: `You have left the ${family.name} Family Group`,
        html: `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f9f9f9;
                margin: 0;
                padding: 0;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 20px auto;
                background: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
              }
              .header {
                background-color: #f44336;
                color: #ffffff;
                text-align: center;
                padding: 20px;
                border-top-left-radius: 8px;
                border-top-right-radius: 8px;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
              }
              .content {
                margin: 20px 0;
                line-height: 1.6;
                text-align: center;
              }
              .content h2 {
                color: #f44336;
                font-size: 20px;
                margin-bottom: 10px;
              }
              .content p {
                margin: 10px 0;
              }
              .button {
                display: inline-block;
                background-color: #f44336;
                color: #ffffff;
                text-decoration: none;
                padding: 10px 20px;
                font-size: 16px;
                border-radius: 5px;
                margin-top: 20px;
              }
              .button:hover {
                background-color: #e53935;
              }
              .footer {
                margin-top: 20px;
                font-size: 12px;
                color: #666;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>You have left the ${family.name} Family Group</h1>
              </div>
              <div class="content">
                <p>Hi ${user.username},</p>
                <p>We're sorry to see you go! You have successfully left the <strong>${family.name}</strong> family group.</p>
                <p>If you ever want to rejoin, you can either use the link below or enter the family code:</p>
                <p><strong>Family Code: ${familyCode}</strong></p>
                <p>Click the button below to rejoin the group using the link:</p>
                <a href="${familyLink}" class="button">Rejoin Family Group</a>
                <p>Or simply use the family code to join again anytime.</p>
              </div>
              <div class="footer">
                <p>&copy; ${currentYear} Teresa App. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Leave email sent successfully');
    } catch (error) {
        console.error('Error sending leave email:', error);
    }
};



  

module.exports = {
    registrationConfirmation,
    familyCreationMail,
    familyWelcomeMail,
    familyLeaveMail,
};
