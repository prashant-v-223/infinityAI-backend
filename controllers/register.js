var bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
var ejs = require("ejs");
const jwt = require("jsonwebtoken");
const {
  decodeUris,
  cloneDeep,
  findOneRecord,
  updateRecord,
  hardDeleteRecord,
  updateRecordValue,
} = require("../library/commonQueries");
const {
  successResponse,
  badRequestResponse,
  errorResponse,
  notFoundResponse,
  validarionerrorResponse,
} = require("../middleware/response");
const Usermodal = require("../models/user");
const Walletmodal = require("../models/Wallet");
const Token = require("../models/Token");
const {
  token,
  tokenverify,
  Forgetpasswordtoken,
} = require("../middleware/token");
const Ticket = require("../models/Ticket");

const { ticketsend } = require("../services/sendOTP");
const e = require("express");
let transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

exports.register = {
  signUp: async (req, res) => {
    try {
      let uniqueRefid = await Date.now().toString(16).slice(2);
      req.body.refferalId = uniqueRefid;
      req.body = decodeUris(req.body);
      console.log(req.body);
      const refferalBygetdata = await findOneRecord(Usermodal, {
        username: req.body.refferalBy,
      });
      if (refferalBygetdata !== null) {
        var digits = "0123456789";
        let OTP = "";
        for (let i = 0; i < 5; i++) {
          OTP += digits[Math.floor(Math.random() * 10)];
        }
        let usernumber = OTP;
        let finalusename = "IAT" + usernumber;
        const isCreated = await Usermodal({
          ...req.body,
          username: finalusename,
        }).save();
        if (!isCreated) {
          return badRequestResponse(res, {
            message: "Failed to create register!",
          });
        } else {
          const profile = await Usermodal.findById(isCreated._id).select({
            password: 0,
          });
          const accessToken = jwt.sign(
            { profile },
            "3700 0000 0000 002",
            {
              expiresIn: "1hr",
            }
          );
          ejs.renderFile(
            __dirname + "/mail.ejs",
            {
              name: "infinityai759@gmail.com",
              username: finalusename,
              action_url: `https://njn-ev7u.onrender.com/api/registration/signUp/varify:${accessToken}`,
            },
            async function (err, data) {
              const mailOptions = {
                from: "infinityai759@gmail.com", // Sender address
                to: req.body.email, // List of recipients
                subject: "verification by Infinity.AI", // Subject line
                html: data,
              };
              transport.sendMail(mailOptions, async function (err, info) {
                if (err) {
                  return badRequestResponse(res, {
                    message: `Email not send error something is wrong ${err}`,
                  });
                } else {
                  return successResponse(res, {
                    message:
                      "Verification link has been sent successfully on your email!",
                  });
                }
              });
            }
          );
        }

      } else {
        return validarionerrorResponse(res, {
          message: `please enter valid  RefferalId.`,
        });
      }
    } catch (error) {
      return errorResponse(error, res);
    }
  },
  mailVarify: async (req, res) => {
    try {
      const { Token } = req.params;
      if (Token) {
        let { err, decoded } = await tokenverify(Token.split(":")[1]);
        if (err) {
          return notFoundResponse(res, {
            message: "user not found",
          });
        }
        if (decoded) {
          decoded = await cloneDeep(decoded);
          updateRecord(
            Usermodal,
            { username: decoded.profile.username },
            {
              isValid: true,
            }
          );
          ejs.renderFile(
            __dirname + "/welcome.ejs",
            {
              name: "infinityai759@gmail.com",
            },
            async function (err, data) {
              const DOMAIN = "donotreply.v4x.org";
              const mailOptions = {
                from: "infinityai759@gmail.com", // Sender address
                to: decoded.profile.email, // List of recipients
                subject: "verification by Infinity.AI", // Subject line
                html: data,
              };
              transport.sendMail(mailOptions, async function (err, info) {
                if (err) {
                  return badRequestResponse(res, {
                    message: `Email not send error something is wrong ${error}`,
                  });
                } else {
                  res.redirect("https://infinityiat.io/login?login");
                }
              });
            }
          );
        }
      } else {
        badRequestResponse(res, {
          message: "No token provided.",
        });
      }
    } catch (error) {
      return errorResponse(error, res);
    }
  },
  profile: async (req, res) => {
    try {
      const { Token } = req.params;
      if (Token) {
        let { err, decoded } = await tokenverify(Token.split(":")[1]);
        if (err) {
          return notFoundResponse(res, {
            message: "user not found",
          });
        }
        if (decoded) {
          decoded = await cloneDeep(decoded);
          const user = await findOneRecord(Usermodal, { _id: decoded.profile._id });

          const accessToken = await token(Usermodal, user);
          return successResponse(res, {
            message: "Login successfully",
            token: accessToken.token,
            profile: user,
          });

        }
      } else {
        badRequestResponse(res, {
          message: "No token provided.",
        });
      }
    } catch (error) {
      return errorResponse(error, res);
    }
  },
  signIn: async (req, res) => {
    try {
      req.body = decodeUris(req.body);
      const user = await findOneRecord(Usermodal, { username: req.body.email });
      if (!user) {
        return notFoundResponse(res, { message: "User Not Found!" });
      } else {
        const match = await bcrypt.compare(req.body.password, user.password);
        if (
          !match &&
          user.password.toString() !== req.body.password.toString()
        ) {
          return badRequestResponse(res, { message: "Password is incorrect!" });
        } else {
          if (!user.isActive) {
            return badRequestResponse(res, {
              message: "Account is disabled. please contact support!",
            });
          } else {
            if (!user.isValid) {
              badRequestResponse(res, {
                message: "please verify your account",
              });
            } else {
              console.log(user);
              const accessToken = await token(Usermodal, user);

              const Wallet = await findOneRecord(Walletmodal, {
                userId: user._id,
              });
              if (!Wallet) {
                await Walletmodal({ userId: user._id }).save();
              }
              return successResponse(res, {
                message: "Login successfully",
                token: accessToken.token,
                profile: user,
              });
            }
          }
        }
      }
    } catch (error) {
      return errorResponse(error, res);
    }
  },
  forgotPassword: async (req, res) => {
    try {
      req.body = decodeUris(req.body);
      const user = await findOneRecord(Usermodal, { username: req.body.email });
      if (!user) {
        return notFoundResponse(res, { message: "User Not Found!", user: user });
      } else {
        decoded = await cloneDeep(user);
        const accessToken = await Forgetpasswordtoken(Usermodal, decoded);
        let token = await Token.findOne({ userId: decoded._id });
        if (!token) {
          token = await new Token({
            userId: decoded._id,
            token: accessToken.token,
          }).save();
        } else {
          await updateRecord(
            Token,
            {
              userId: decoded._id,
            },
            {
              token: accessToken.token,
            }
          );
        }
        console.log(user);
        ejs.renderFile(
          __dirname + "/Forgetpassword.ejs",
          {
            from: "infinityai759@gmail.com",
            action_url: accessToken.token,
          },
          async function (err, data) {
            const mailOptions = {
              from: "infinityai759@gmail.com", // Sender address
              to: user.email, // List of recipients
              subject: "verification by Infinity.AI", // Subject line
              html: data,
            };
            transport.sendMail(mailOptions, async function (err, info) {
              console.log(err);
              if (err) {
                badRequestResponse(res, {
                  message: `Email not send error something is wrong ${err}`,
                });
              } else {
                successResponse(res, {
                  message:
                    "Verification link has been send to your email address..!!",
                });
              }
            });
            // transport.sendMail(mailOptions, async function (err, info) {
            //   if (err) {
            //     return badRequestResponse(res, {
            //       message: `Email not send error something is wrong ${error}`,
            //     });
            //   } else {
            //     return successResponse(res, {
            //       message:
            //         "varification link has been send to your email address..!!",
            //     });
            //   }
            // });
          }
        );
      }
    } catch (error) {
      return errorResponse(error, res);
    }
  },
  profileupdate: async (req, res) => {
    try {
      if (req.headers.authorization) {
        let { err, decoded } = await tokenverify(
          req.headers.authorization.split(" ")[1]
        );
        if (err) {
          return notFoundResponse(res, {
            message: err,
          });
        }
        if (decoded) {
          decoded = await cloneDeep(decoded);
          await hardDeleteRecord(Token, {
            userId: decoded.profile._id,
          });
          updateRecord(
            Usermodal,
            { _id: decoded.profile._id },
            {
              ...req.body
              // Nominee: req.body.Nominee,
              // address: req.body.address,
              // profileimg: req.body.profileimg
            })
          return successResponse(res, {
            message: "profile update successfully",
          });

        }
      }
    } catch (error) {
      return errorResponse(error, res);
    }
  },
  changePassword: async (req, res) => {
    try {
      if (req.headers.authorization) {
        let { err, decoded } = await tokenverify(
          req.headers.authorization.split(" ")[1]
        );
        if (err) {
          return notFoundResponse(res, {
            message: "user not found",
          });
        }
        if (decoded) {
          let token = await Token.findOne({ userId: decoded.profile._id });
          if (!token) {
            return badRequestResponse(res, {
              message: "token is expires.",
            });
          }
          const { password } = req.body;
          decoded = await cloneDeep(decoded);
          await hardDeleteRecord(Token, {
            userId: decoded.profile._id,
          });
          await bcrypt.hash(password, 8).then((pass) => {
            updateRecord(
              Usermodal,
              { _id: decoded.profile._id },
              {
                password: pass,
              }
            );
            hardDeleteRecord(Token, { _id: decoded.profile._id });
            return successResponse(res, {
              message: "password change successfully",
            });
          });
        }
      } else {
        badRequestResponse(res, {
          message: "No token provided.",
        });
      }
    } catch (error) {
      return errorResponse(error, res);
    }
  },
  addTicket: async (req, res) => {
    try {
      if (req.headers.authorization) {
        let { err, decoded } = await tokenverify(
          req.headers.authorization.split(" ")[1]
        );
        if (err) {
          return notFoundResponse(res, {
            message: "user not found",
          });
        }
        if (decoded) {
          const data = {
            userId: decoded.profile._id,
            description: req.body.description,
            img: req.body.img,
          };
          await Ticket(data)
            .save()
            .then(async (r) => {
              console.log(r._id.toString());
              await ticketsend(
                decoded.profile.email,
                decoded.profile.username,
                decoded.profile._id.toString()
              );
              return successResponse(res, {
                message: "Support Ticket generate successfully",
              });
            });
        }
      }
    } catch (error) {
      return badRequestResponse(res, {
        message: "something went wrong",
      });
    }
  },
};
