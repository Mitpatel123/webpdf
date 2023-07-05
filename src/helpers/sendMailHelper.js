const nodemailer = require ("nodemailer")

const sendmail = async (email,otp)=>{
    let testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'lamont.schroeder40@ethereal.email',
            pass: 'ZdS3NrcTQNT2k6zUwd'
        }
    });

    let mailOptions = await transporter.sendMail({
            from: '"mit Dobariya 👻" <mitpatel@gmail.com>', // sender address
            to: email, // list of receivers
            subject: "forgot password✔", // Subject line
            text: "that was easy!", // plain text body
            html:  ` 
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
            </head>
            <body>
                <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2;height: calc(100% - 20px);justify-content: center;align-items: center;display: flex;justify-content: center;">
                    <div style="width:30%;padding:20px 0;background-color: #E1FAFF;box-shadow: 0 0.75rem 1.5rem
                    rgba(18,38,63,.03);padding: 24px;border-radius: 8px;position:
                    relative;">
                        <div style="text-align: center;">
                            <a href="#">
                                <img src="" alt="">
                            </a>
                            <h1 style="margin:0;text-transform: uppercase;letter-spacing: 1;font-weight: bold;color: #70A82C;">Patram kids</h1>
                            <div style="margin-top: 12px; text-align: center;">
                                <h3 style="text-transform: capitalize;margin-bottom: 0; color: #1E1E2D;">Here is your one time otp</h3>
                            <p style="margin-top: 0px; color:#1e1e2d;font-size: 15px;">to validate your email address !</p>
                            <div style="margin-top:38px;gap: 40px;/* text-align: center; */justify-content: center;position: relative;background-color: #fff;padding: px;align-items: center;font-size: 22px;border-radius: 10px;width: 100%;">
                            <h2 style="margin:0 0px 0 0px;color:#70a82c;padding:10px 0;letter-spacing: 18px;text-align: center;">${otp}
                            </h2>
    </div>
    <div style=" padding: 20px 0px 0;">
        <a href="http://localhost:3011/auth/change-password" style="
        text-decoration: none;
        color: #1E1E2D;
        font-size: 16px;
    ">Back to <span style="
        font-size: 16px;
        color: #6CA83C;
        font-weight: 600;
        letter-spacing: 1px;
        text-transform: uppercase;
    ">WEB PDF</span></a>
    </div>
                            </div>
                        </div>
                    </div>
                </div>
            </body>
        </html>`
    , // html body
});
        


   transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
        console.log("error", error);
    } else {
        console.log('Email sent: ' + info.response);
    }
});
};

module.exports = {sendmail};