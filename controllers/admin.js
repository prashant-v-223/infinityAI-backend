var bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const Usermodal = require("../models/user");
const wallatemodal = require("../models/Wallet");
const Transactionmodal = require("../models/Transaction");
const V4Xpricemodal = require("../models/V4XLiveRate");
const Adminmodal = require("../models/user");
const Walletmodal = require("../models/Wallet");
const Sopprtmodal = require("../models/Ticket");
const V4XpriceSchemaDetails = require("../models/TokenDetails");
const Stakingmodal = require("../models/Staking");
const Mainwallatesc = require("../models/Mainwallate");
const Ewallateesc = require("../models/Ewallate");
var ejs = require("ejs");
const jwt = require("jsonwebtoken");
const {
  decodeUris,
  cloneDeep,
  findOneRecord,
  updateRecord,
  findAllRecord,
} = require("../library/commonQueries");
const {
  successResponse,
  badRequestResponse,
  errorResponse,
  notFoundResponse,
} = require("../middleware/response");
// const Token = require("../models/Token");
const { tokenverify } = require("../middleware/token");
const token = require("../middleware/token");
const Bannars = require("../models/Bannars");
const Stakingbonus = require("../models/Stakingbonus");
const Staking = require("../models/Staking");
exports.admin = {
  signIn: async (req, res) => {
    try {
      req.body = decodeUris(req.body);
      console.log("req.body", req.body);
      const user = await findOneRecord(Adminmodal, { username: req.body.email });
      if (!user) {
        return notFoundResponse(res, { message: "User Not Found!" });
      } else {
        const match = req.body.password === user.password;
        console.log("user", user);
        console.log("match", match);
        if (!match) {
          badRequestResponse(res, { message: "Password is incorrect!" });
        } else {
          const profile = await Adminmodal.findOne({
            username: req.body.email,
          }).select({
            password: 0,
          });
          const token = jwt.sign({ profile }, "3700 0000 0000 002", {
            expiresIn: "24hr",
          });
          console.log("req.body", token);
          return successResponse(res, {
            message: "Login successfully",
            token: token,
            profile: user,
          });
        }
      }
    } catch (error) {
      return errorResponse(error, res);
    }
  },
  alluserdata: async (req, res) => {
    try {
      if (req.headers.authorization) {
        let { err, decoded } = await tokenverify(
          req.headers.authorization.split(" ")[1]
        );
        if (decoded) {
          decoded = await cloneDeep(decoded);
          if (decoded.profile.username === "admin") {
            const userdata1 = await findAllRecord(Usermodal, {});
            return successResponse(res, {
              message: "all user data get",
              data: userdata1,
            });
          }
        }
      } else {
        return badRequestResponse(res, {
          message: "No token provided.",
        });
      }
    } catch (error) {
      return errorResponse(error, res);
    }
  },
  alltranfor: async (req, res) => {
    try {
      if (req.headers.authorization) {
        let { err, decoded } = await tokenverify(
          req.headers.authorization.split(" ")[1]
        );
        if (decoded) {
          decoded = await cloneDeep(decoded);
          const userdata1 = await Transactionmodal.aggregate([
            {
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "result",
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "fromaccountusername",
                foreignField: "_id",
                as: "result1",
              },
            },
            {
              $unwind: {
                path: "$result",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $unwind: {
                path: "$result1",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                toaccunt: "$result.username",
                fromaccunt: "$result1.username",
                tranforWallet: 1,
                Amount: 1,
                createdAt: 1,
                updatedAt: 1,
              },
            },
          ]);

          return successResponse(res, {
            message: "all user data get",
            data: userdata1,
          });
        }
      } else {
        return badRequestResponse(res, {
          message: "No token provided.",
        });
      }
    } catch (error) {
      return errorResponse(error, res);
    }
  },
  userblock: async (req, res) => {
    try {
      const { usename, note } = req.body;
      let { err, decoded } = await tokenverify(
        req.headers.authorization.split(" ")[1]
      );
      if (decoded) {
        decoded = await cloneDeep(decoded);
        let a = await findOneRecord(Usermodal, {
          username: usename,
        });
        if (a.isActive === false) {
          await updateRecord(
            Usermodal,
            {
              username: usename,
            },
            {
              isActive: !false,
              note: note,
            }
          );
          return successResponse(res, {
            message: "user unblock",
          });
        } else {
          await updateRecord(
            Usermodal,
            {
              username: usename,
            },
            {
              isActive: false,
              note: note,
            }
          );
          return successResponse(res, {
            message: "user block",
          });
        }
      } else {
        return badRequestResponse(res, {
          message: "No token provided.",
        });
      }
    } catch (error) {
      return errorResponse(error, res);
    }
  },
  emailcheng: async (req, res) => {
    try {
      const { username, note } = req.body;
      let { err, decoded } = await tokenverify(
        req.headers.authorization.split(" ")[1]
      );
      if (decoded) {
        decoded = await cloneDeep(decoded);
        let a = await findOneRecord(Usermodal, {
          username: username,
        });
        await updateRecord(
          Usermodal,
          {
            username: username,
          },
          {
            email: note,
          }
        );
        return successResponse(res, {
          message: "Email change successfully",
        });
      } else {
        return badRequestResponse(res, {
          message: "No token provided.",
        });
      }
    } catch (error) {
      return errorResponse(error, res);
    }
  },
  userRemove: async (req, res) => {
    try {
      const { usename } = req.body;
      await Usermodal.findOneAndRemove({ usename: usename }).then((res1) => {
        return successResponse(res, {
          message: "user delete successfully",
        });
      });
    } catch (error) {
      return errorResponse(error, res);
    }
  },
  userwallateblock: async (req, res) => {
    try {
      const { username, note } = req.body;
      let { err, decoded } = await tokenverify(
        req.headers.authorization.split(" ")[1]
      );
      if (decoded) {
        decoded = await cloneDeep(decoded);
        let a = await findOneRecord(Usermodal, {
          username: username,
        });
        console.log(a);
        if (a.iswalletActive === false) {
          await updateRecord(
            Usermodal,
            {
              _id: a._id,
            },
            {
              iswalletActive: !false,
            }
          );
          return successResponse(res, {
            message: "wallate unblock",
          });
        } else {
          await updateRecord(
            Usermodal,
            {
              _id: a._id,
            },
            {
              iswalletActive: false,
            }
          );
          return successResponse(res, {
            message: "wallate block",
          });
        }
      } else {
        return badRequestResponse(res, {
          message: "No token provided.",
        });
      }
    } catch (error) {
      return errorResponse(error, res);
    }
  },
  priceV4X: async (req, res) => {
    try {
      const { price } = req.body;
      let { err, decoded } = await tokenverify(
        req.headers.authorization.split(" ")[1]
      );
      if (decoded) {
        decoded = await cloneDeep(decoded);
        if (price > 0) {
          await updateRecord(
            V4Xpricemodal,
            {},
            {
              price: price,
            }
          );
          await V4XpriceSchemaDetails({
            price: price,
            ipAddress: "json.IPv4",
          })
            .save()
          return successResponse(res, {
            message: "Infinity.AI price chenge successfully!",
          });
        } else {
          return badRequestResponse(res, {
            message: "anter valid amount!",
          });
        }
      } else {
        return badRequestResponse(res, {
          message: "No token provided.",
        });
      }
    } catch (error) {
      return errorResponse(error, res);
    }
  },
  getlive: async (req, res) => {
    try {
      const { price } = req.body;
      let { err, decoded } = await tokenverify(
        req.headers.authorization.split(" ")[1]
      );
      if (decoded) {
        decoded = await cloneDeep(decoded);
        let data = await V4XpriceSchemaDetails.find({});
        return successResponse(res, {
          message: "Infinity.AI price chenge successfully!",
          data: data,
        });
      } else {
        return badRequestResponse(res, {
          message: "No token provided.",
        });
      }
    } catch (error) {
      return errorResponse(error, res);
    }
  },
  amontsend: async (req, res) => {
    try {
      let { err, decoded } = await tokenverify(
        req.headers.authorization.split(" ")[1]
      );
      if (decoded) {
        decoded = await cloneDeep(decoded);
        let data = await findOneRecord(Usermodal, {
          username: req.body.username,
        });
        if (data !== null) {
          if (req.body.Walletname === "Main Wallet") {
            await updateRecord(
              Walletmodal,
              {
                userId: data._id,
              },
              { $inc: { mainWallet: req.body.price } }
            ).then(async (res) => {
              await Mainwallatesc({
                userId: data._id,
                Note: `Coin Transfer by Admin`,
                Amount: req.body.price,
                balace: res.mainWallet,
                type: 1,
                Active: true,
              }).save();
            });
            return successResponse(res, {
              message: "Infinity.AI Token Transfer successfully!",
            });
          } else {
            console.log(data);
            await updateRecord(
              Walletmodal,
              {
                userId: data._id,
              },
              { $inc: { v4xWallet: req.body.price } }
            ).then(async (res) => {
              console.log(res);
              await Ewallateesc({
                userId: data._id,
                Note: `Coin Transfer by Admin`,
                Amount: req.body.price,
                balace: res.v4xWallet,
                type: 1,
                Active: true,
              }).save();
            });
            return successResponse(res, {
              message: "Infinity.AI Token Transfer successfully!",
            });
          }
        } else {
          return badRequestResponse(res, {
            message: "User not Found!",
          });
        }
      } else {
        return badRequestResponse(res, {
          message: "No token provided.",
        });
      }
    } catch (error) {
      return errorResponse(error, res);
    }
  },
  supportdata: async (req, res) => {
    try {
      let { err, decoded } = await tokenverify(
        req.headers.authorization.split(" ")[1]
      );
      if (decoded) {
        decoded = await cloneDeep(decoded);
        const userdata1 = await Sopprtmodal.aggregate([
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "result",
            },
          },
          {
            $unwind: {
              path: "$result",
              preserveNullAndEmptyArrays: true,
            },
          },
        ]);
        return successResponse(res, {
          message: "Infinity.AI price chenge successfully!",
          data: userdata1,
        });
      } else {
        return badRequestResponse(res, {
          message: "No token provided.",
        });
      }
    } catch (error) {
      return errorResponse(error, res);
    }
  },
  Addbenars: async (req, res) => {
    try {
      await Bannars({
        img: req.body.img,
      }).save();
      return successResponse(res, {
        message: "bannar add successfully",
      });
    } catch (error) {
      return errorResponse(error, res);
    }
  },
  Getbenars: async (req, res) => {
    try {
      let data = await Bannars.find({});
      return successResponse(res, {
        message: "bannar add successfully",
        data: data,
      });
    } catch (error) {
      return errorResponse(error, res);
    }
  },
  Removebenars: async (req, res) => {
    try {
      let data = await Bannars.findOneAndDelete({ _id: req.body._id });
      return successResponse(res, {
        message: "bannar add successfully",
        data: data,
      });
    } catch (error) {
      return errorResponse(error, res);
    }
  },
  Buystack: async (req, res) => {
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
          decoded = await cloneDeep(decoded);
          const userdata = await findOneRecord(Usermodal, {
            username: req.body.username,
          });
          if (userdata !== null) {
            const ReffData = await findOneRecord(Usermodal, {
              username: userdata.refferalBy,
              isValid: true,
            });
            if (ReffData !== null) {
              const price = await findAllRecord(V4Xpricemodal, {});
              if (ReffData.mystack >= 50) {
                await updateRecord(
                  Walletmodal,
                  {
                    userId: ReffData?._id,
                  },
                  {
                    $inc: {
                      mainWallet:
                        (req.body.Amount * price[0].price * 10) / 100,
                    },
                  }
                ).then(async (res) => {
                  await Mainwallatesc({
                    userId: ReffData?._id,
                    Note: `You Got Refer and Earn Income From ${decoded.profile.username}`,
                    Amount: (req.body.Amount * price[0].price * 5) / 100,
                    type: 1,
                    balace: res.mainWallet,
                    Active: true,
                  }).save();
                  await Stakingbonus({
                    userId: ReffData?._id,
                    ReffId: decoded.profile._id,
                    Amount: (req.body.Amount * price[0].price * 5) / 100,
                    Note: `You Got Refer and Earn Income From ${decoded.profile.username}`,
                    Active: true,
                  }).save();
                });
              }
              const ReffData2 = await findAllRecord(Usermodal, {
                refferalBy: ReffData.username,
                isValid: true,
              });
              await updateRecord(
                Usermodal,
                { _id: ReffData?._id },
                {
                  leval: Number(
                    ReffData2.length == 1
                      ? 2
                      : ReffData2.length == 2
                        ? 4
                        : ReffData2.length == 3
                          ? 6
                          : ReffData2.length == 4
                            ? 8
                            : ReffData2.length == 5
                              ? 10
                              : ReffData2.length == 6
                                ? 12
                                : ReffData2.length == 7
                                  ? 14
                                  : ReffData2.length == 8
                                    ? 16
                                    : 18
                  ),
                }
              ).then(async () => {
                const Refflevalncome = await findOneRecord(Usermodal, {
                  username: decoded.profile.username,
                  isValid: true,
                });

                if (!Refflevalncome) {
                  return;
                }
                const Refflevalncome1 = await findOneRecord(Usermodal, {
                  username: Refflevalncome.refferalBy,
                  isValid: true,
                });
                if (!Refflevalncome1) {
                  return;
                }
                console.log("Refflevalncome1", Refflevalncome1);
                if (Refflevalncome1.leval >= 1) {
                  if (Refflevalncome1.mystack >= 50) {
                    let data1 = {
                      userId: Refflevalncome1._id,
                      Note: `You Got Level ${1} Income`,
                      Usernameby: decoded.profile.username,
                      Amount: (req.body.Amount * 4) / 100,
                    };
                    await updateRecord(
                      Walletmodal,
                      {
                        userId: Refflevalncome1._id,
                      },
                      { $inc: { mainWallet: (req.body.Amount * 4) / 100 } }
                    ).then(async (res) => {
                      await Mainwallatesc({
                        userId: Refflevalncome1._id,
                        Note: `You Got Level ${1} Income`,
                        Amount: (req.body.Amount * 4) / 100,
                        Usernameby: decoded.profile.username,
                        balace: res.mainWallet,
                        type: 1,
                        Active: true,
                      }).save();
                    });
                    await Communitymodal(data1).save();
                  }
                }
                const Refflevalncome2 = await findOneRecord(Usermodal, {
                  username: Refflevalncome1.refferalBy,
                  isValid: true,
                });
                if (!Refflevalncome2) {
                  return;
                }
                if (Refflevalncome2.leval >= 2) {
                  if (Refflevalncome2.mystack >= 50) {
                    let data2 = {
                      userId: Refflevalncome2._id,
                      Note: `You Got Level ${2} Income`,
                      Usernameby: decoded.profile.username,
                      Amount: (req.body.Amount * 3) / 100,
                    };
                    await updateRecord(
                      Walletmodal,
                      {
                        userId: Refflevalncome2._id,
                      },
                      { $inc: { mainWallet: (req.body.Amount * 3) / 100 } }
                    ).then(async (res) => {
                      await Mainwallatesc({
                        userId: Refflevalncome2._id,
                        Note: `You Got Level ${2} Income`,
                        Amount: (req.body.Amount * 3) / 100,
                        Usernameby: decoded.profile.username,
                        balace: res.mainWallet,
                        type: 1,
                        Active: true,
                      }).save();
                    });

                    await Communitymodal(data2).save();
                    console.log("===============>22", {
                      Refflevalncome2,
                      data2,
                    });
                  }
                }
                const Refflevalncome3 = await findOneRecord(Usermodal, {
                  username: Refflevalncome2.refferalBy,
                  isValid: true,
                });
                if (!Refflevalncome3) {
                  return;
                }
                if (Refflevalncome3.leval >= 3) {
                  if (Refflevalncome3.mystack >= 50) {
                    let data3 = {
                      userId: Refflevalncome3._id,
                      Note: `You Got Level ${3} Income`,
                      Usernameby: decoded.profile.username,
                      Amount: (req.body.Amount * 2) / 100,
                    };
                    await updateRecord(
                      Walletmodal,
                      {
                        userId: Refflevalncome3._id,
                      },
                      { $inc: { mainWallet: (req.body.Amount * 2) / 100 } }
                    ).then(async (res) => {
                      await Mainwallatesc({
                        userId: Refflevalncome3._id,
                        Note: `You Got Level ${3} Income`,
                        Usernameby: decoded.profile.username,
                        Amount: (req.body.Amount * 2) / 100,
                        balace: res.mainWallet,
                        type: 1,
                        Active: true,
                      }).save();
                    });
                    await Communitymodal(data3).save();

                    console.log("===============>33", {
                      Refflevalncome3,
                      data3,
                    });
                  }
                }
                const Refflevalncome4 = await findOneRecord(Usermodal, {
                  username: Refflevalncome3.refferalBy,
                  isValid: true,
                });
                if (!Refflevalncome4) {
                  return;
                }
                if (Refflevalncome4.leval >= 4) {
                  if (Refflevalncome4.mystack >= 50) {
                    let data4 = {
                      userId: Refflevalncome4._id,
                      Note: `You Got Level ${4} Income`,
                      Usernameby: decoded.profile.username,
                      Amount: (req.body.Amount * 1) / 100,
                    };
                    await updateRecord(
                      Walletmodal,
                      {
                        userId: Refflevalncome4._id,
                      },
                      { $inc: { mainWallet: (req.body.Amount * 1) / 100 } }
                    ).then(async (res) => {
                      await Mainwallatesc({
                        userId: Refflevalncome4._id,
                        Note: `You Got Level ${4} Income`,
                        Usernameby: decoded.profile.username,
                        Amount: (req.body.Amount * 1) / 100,
                        balace: res.mainWallet,
                        type: 1,
                        Active: true,
                      }).save();
                    });
                    await Communitymodal(data4).save();

                    console.log("===============>44", {
                      Refflevalncome4,
                      data4,
                    });
                  }
                }
                const Refflevalncome5 = await findOneRecord(Usermodal, {
                  username: Refflevalncome4.refferalBy,
                  isValid: true,
                });
                if (!Refflevalncome5) {
                  return;
                }
                if (Refflevalncome5.leval >= 5) {
                  if (Refflevalncome5.mystack >= 50) {
                    let data5 = {
                      userId: Refflevalncome5._id,
                      Note: `You Got Level ${5} Income`,
                      Usernameby: decoded.profile.username,
                      Amount: (req.body.Amount * 0.5) / 100,
                    };
                    await updateRecord(
                      Walletmodal,
                      {
                        userId: Refflevalncome5._id,
                      },
                      { $inc: { mainWallet: (req.body.Amount * 0.5) / 100 } }
                    ).then(async (res) => {
                      await Mainwallatesc({
                        userId: Refflevalncome5._id,
                        Note: `You Got Level ${5} Income`,
                        Usernameby: decoded.profile.username,
                        Amount: (req.body.Amount * 0.5) / 100,
                        balace: res.mainWallet,
                        type: 1,
                        Active: true,
                      }).save();
                    });
                    await Communitymodal(data5).save();

                    console.log("===============>55", {
                      Refflevalncome5,
                      data5,
                    });
                  }
                }
                const Refflevalncome6 = await findOneRecord(Usermodal, {
                  username: Refflevalncome5.refferalBy,
                  isValid: true,
                });
                if (!Refflevalncome6) {
                  return;
                }
                if (Refflevalncome6.leval >= 6) {
                  if (Refflevalncome6.mystack >= 50) {
                    let data6 = {
                      userId: Refflevalncome6._id,
                      Note: `You Got Level ${6} Income`,
                      Usernameby: decoded.profile.username,
                      Amount: (req.body.Amount * 0.5) / 100,
                    };
                    await updateRecord(
                      Walletmodal,
                      {
                        userId: Refflevalncome6._id,
                      },
                      { $inc: { mainWallet: (req.body.Amount * 0.5) / 100 } }
                    ).then(async (res) => {
                      await Mainwallatesc({
                        userId: Refflevalncome6._id,
                        Note: `You Got Level ${6} Income`,
                        Usernameby: decoded.profile.username,
                        Amount: (req.body.Amount * 0.5) / 100,
                        balace: res.mainWallet,
                        type: 1,
                        Active: true,
                      }).save();
                    });
                    await Communitymodal(data6).save();

                    console.log("===============>66", {
                      Refflevalncome6,
                      data6,
                    });
                  }
                }
                const Refflevalncome7 = await findOneRecord(Usermodal, {
                  username: Refflevalncome6.refferalBy,
                  isValid: true,
                });
                if (!Refflevalncome7) {
                  return;
                }
                if (Refflevalncome7.leval >= 7) {
                  if (Refflevalncome7.mystack >= 50) {
                    let data7 = {
                      userId: Refflevalncome7._id,
                      Note: `You Got Level ${7} Income`,
                      Usernameby: decoded.profile.username,
                      Amount: (req.body.Amount * 0.5) / 100,
                    };
                    await updateRecord(
                      Walletmodal,
                      {
                        userId: Refflevalncome7._id,
                      },
                      { $inc: { mainWallet: (req.body.Amount * 0.5) / 100 } }
                    ).then(async (res) => {
                      await Mainwallatesc({
                        userId: Refflevalncome7._id,
                        Note: `You Got Level ${7} Income`,
                        Usernameby: decoded.profile.username,
                        Amount: (req.body.Amount * 0.5) / 100,
                        balace: res.mainWallet,
                        type: 1,
                        Active: true,
                      }).save();
                    });
                    await Communitymodal(data7).save();

                    console.log("===============>77", {
                      Refflevalncome7,
                      data7,
                    });
                  }
                }
                const Refflevalncome8 = await findOneRecord(Usermodal, {
                  username: Refflevalncome7.refferalBy,
                  isValid: true,
                });
                if (!Refflevalncome8) {
                  return;
                }
                if (Refflevalncome8.leval >= 8) {
                  if (Refflevalncome8.mystack >= 50) {
                    let data8 = {
                      userId: Refflevalncome8._id,
                      Note: `You Got Level ${8} Income`,
                      Usernameby: decoded.profile.username,
                      Amount: (req.body.Amount * 0.5) / 100,
                    };
                    await updateRecord(
                      Walletmodal,
                      {
                        userId: Refflevalncome8._id,
                      },
                      { $inc: { mainWallet: (req.body.Amount * 0.5) / 100 } }
                    ).then(async (res) => {
                      await Mainwallatesc({
                        userId: Refflevalncome8._id,
                        Note: `You Got Level ${8} Income`,
                        Usernameby: decoded.profile.username,
                        Amount: (req.body.Amount * 0.5) / 100,
                        balace: res.mainWallet,
                        type: 1,
                        Active: true,
                      }).save();
                    });
                    await Communitymodal(data8).save();

                    console.log("===============>88", {
                      Refflevalncome8,
                      data8,
                    });
                  }
                }
                const Refflevalncome9 = await findOneRecord(Usermodal, {
                  username: Refflevalncome8.refferalBy,
                  isValid: true,
                });
                if (!Refflevalncome9) {
                  return;
                }
                if (Refflevalncome9.leval >= 9) {
                  if (Refflevalncome9.mystack >= 50) {
                    let data9 = {
                      userId: Refflevalncome9._id,
                      Note: `You Got Level ${9} Income`,
                      Usernameby: decoded.profile.username,
                      Amount: (req.body.Amount * 0.5) / 100,
                    };
                    await updateRecord(
                      Walletmodal,
                      {
                        userId: Refflevalncome9._id,
                      },
                      { $inc: { mainWallet: (req.body.Amount * 0.5) / 100 } }
                    ).then(async (res) => {
                      await Mainwallatesc({
                        userId: Refflevalncome9._id,
                        Note: `You Got Level ${9} Income`,
                        Usernameby: decoded.profile.username,
                        Amount: (req.body.Amount * 0.5) / 100,
                        balace: res.mainWallet,
                        type: 1,
                        Active: true,
                      }).save();
                    });
                    await Communitymodal(data9).save();

                    console.log("===============>99", {
                      Refflevalncome9,
                      data9,
                    });
                  }
                }
                const Refflevalncome10 = await findOneRecord(Usermodal, {
                  username: Refflevalncome9.refferalBy,
                  isValid: true,
                });
                if (!Refflevalncome10) {
                  return;
                }

                if (Refflevalncome10.leval >= 10) {
                  if (Refflevalncome10.mystack >= 50) {
                    let data10 = {
                      userId: Refflevalncome10._id,
                      Note: `You Got Level ${10} Income`,
                      Usernameby: decoded.profile.username,
                      Amount: (req.body.Amount * 0.5) / 100,
                    };
                    await updateRecord(
                      Walletmodal,
                      {
                        userId: Refflevalncome10._id,
                      },
                      { $inc: { mainWallet: (req.body.Amount * 0.5) / 100 } }
                    ).then(async (res) => {
                      await Mainwallatesc({
                        userId: Refflevalncome10._id,
                        Note: `You Got Level ${10} Income`,
                        Usernameby: decoded.profile.username,
                        Amount: (req.body.Amount * 0.5) / 100,
                        balace: res.mainWallet,
                        type: 1,
                        Active: true,
                      }).save();
                    });
                    await Communitymodal(data10).save();

                    console.log("===============>1010", {
                      Refflevalncome10,
                      data10,
                    });
                  }
                }
                const Refflevalncome11 = await findOneRecord(Usermodal, {
                  username: Refflevalncome10.refferalBy,
                  isValid: true,
                });
                if (!Refflevalncome11) {
                  return;
                }

                if (Refflevalncome11.leval >= 11) {
                  if (Refflevalncome11.mystack >= 50) {
                    let data11 = {
                      userId: Refflevalncome11._id,
                      Note: `You Got Level ${11} Income`,
                      Usernameby: decoded.profile.username,
                      Amount: (req.body.Amount * 0.5) / 100,
                    };
                    await updateRecord(
                      Walletmodal,
                      {
                        userId: Refflevalncome11._id,
                      },
                      { $inc: { mainWallet: (req.body.Amount * 0.5) / 100 } }
                    ).then(async (res) => {
                      await Mainwallatesc({
                        userId: Refflevalncome11._id,
                        Note: `You Got Level ${11} Income`,
                        Usernameby: decoded.profile.username,
                        Amount: (req.body.Amount * 0.5) / 100,
                        balace: res.mainWallet,
                        type: 1,
                        Active: true,
                      }).save();
                    });
                    await Communitymodal(data11).save();

                    console.log("===============>1111", {
                      Refflevalncome11,
                      data11,
                    });
                  }
                }
                const Refflevalncome12 = await findOneRecord(Usermodal, {
                  username: Refflevalncome11.refferalBy,
                  isValid: true,
                });
                if (!Refflevalncome12) {
                  return;
                }
                if (Refflevalncome12.leval >= 12) {
                  if (Refflevalncome12.mystack >= 50) {
                    let data12 = {
                      userId: Refflevalncome12._id,
                      Note: `You Got Level ${12} Income`,
                      Usernameby: decoded.profile.username,
                      Amount: (req.body.Amount * 0.5) / 100,
                    };
                    await updateRecord(
                      Walletmodal,
                      {
                        userId: Refflevalncome12._id,
                      },
                      { $inc: { mainWallet: (req.body.Amount * 0.5) / 100 } }
                    ).then(async (res) => {
                      await Mainwallatesc({
                        userId: Refflevalncome12._id,
                        Note: `You Got Level ${12} Income`,
                        Usernameby: decoded.profile.username,
                        Amount: (req.body.Amount * 0.5) / 100,
                        balace: res.mainWallet,
                        type: 1,
                        Active: true,
                      }).save();
                    });
                    await Communitymodal(data12).save();

                    console.log("===============>1212", {
                      Refflevalncome12,
                      data12,
                    });
                  }
                }
                const Refflevalncome13 = await findOneRecord(Usermodal, {
                  username: Refflevalncome12.refferalBy,
                  isValid: true,
                });
                if (!Refflevalncome13) {
                  return;
                }
                if (Refflevalncome13.leval >= 13) {
                  if (Refflevalncome13.mystack >= 50) {
                    let data13 = {
                      userId: Refflevalncome13._id,
                      Note: `You Got Level ${13} Income`,
                      Usernameby: decoded.profile.username,
                      Amount: (req.body.Amount * 0.5) / 100,
                    };
                    await updateRecord(
                      Walletmodal,
                      {
                        userId: Refflevalncome13._id,
                      },
                      { $inc: { mainWallet: (req.body.Amount * 0.5) / 100 } }
                    ).then(async (res) => {
                      await Mainwallatesc({
                        userId: Refflevalncome13._id,
                        Note: `You Got Level ${13} Income`,
                        Usernameby: decoded.profile.username,
                        Amount: (req.body.Amount * 0.5) / 100,
                        balace: res.mainWallet,
                        type: 1,
                        Active: true,
                      }).save();
                    });
                    await Communitymodal(data13).save();

                    console.log("===============>1313", {
                      Refflevalncome13,
                      data13,
                    });
                  }
                }
                const Refflevalncome14 = await findOneRecord(Usermodal, {
                  username: Refflevalncome13.refferalBy,
                  isValid: true,
                });
                if (!Refflevalncome14) {
                  return;
                }
                if (Refflevalncome14.leval >= 14) {
                  if (Refflevalncome14.mystack >= 50) {
                    let data14 = {
                      userId: Refflevalncome14._id,
                      Note: `You Got Level ${14} Income`,
                      Usernameby: decoded.profile.username,
                      Amount: (req.body.Amount * 0.5) / 100,
                    };
                    await updateRecord(
                      Walletmodal,
                      {
                        userId: Refflevalncome14._id,
                      },
                      { $inc: { mainWallet: (req.body.Amount * 0.5) / 100 } }
                    ).then(async (res) => {
                      await Mainwallatesc({
                        userId: Refflevalncome14._id,
                        Note: `You Got Level ${14} Income`,
                        Usernameby: decoded.profile.username,
                        Amount: (req.body.Amount * 0.5) / 100,
                        balace: res.mainWallet,
                        type: 1,
                        Active: true,
                      }).save();
                    });
                    await Communitymodal(data14).save();

                    console.log("===============>1414", {
                      Refflevalncome14,
                      data14,
                    });
                  }
                }
                const Refflevalncome15 = await findOneRecord(Usermodal, {
                  username: Refflevalncome14.refferalBy,
                  isValid: true,
                });
                if (!Refflevalncome15) {
                  return;
                }
                if (Refflevalncome15.leval >= 15) {
                  if (Refflevalncome15.mystack >= 50) {
                    let data15 = {
                      userId: Refflevalncome15._id,
                      Note: `You Got Level ${15} Income`,
                      Usernameby: decoded.profile.username,
                      Amount: (req.body.Amount * 1) / 100,
                    };
                    await updateRecord(
                      Walletmodal,
                      {
                        userId: Refflevalncome15._id,
                      },
                      { $inc: { mainWallet: (req.body.Amount * 1) / 100 } }
                    ).then(async (res) => {
                      await Mainwallatesc({
                        userId: Refflevalncome15._id,
                        Note: `You Got Level ${15} Income`,
                        Usernameby: decoded.profile.username,
                        Amount: (req.body.Amount * 1) / 100,
                        balace: res.mainWallet,
                        type: 1,
                        Active: true,
                      }).save();
                    });
                    await Communitymodal(data15).save();

                    console.log("===============>1515", {
                      Refflevalncome15,
                      data15,
                    });
                  }
                }
                const Refflevalncome16 = await findOneRecord(Usermodal, {
                  username: Refflevalncome15.refferalBy,
                  isValid: true,
                });
                if (!Refflevalncome16) {
                  return;
                }
                if (Refflevalncome16.leval >= 16) {
                  if (Refflevalncome16.mystack >= 50) {
                    let data16 = {
                      userId: Refflevalncome16._id,
                      Note: `You Got Level ${16} Income`,
                      Usernameby: decoded.profile.username,
                      Amount: (req.body.Amount * 2) / 100,
                    };
                    await updateRecord(
                      Walletmodal,
                      {
                        userId: Refflevalncome16._id,
                      },
                      { $inc: { mainWallet: (req.body.Amount * 2) / 100 } }
                    ).then(async (res) => {
                      await Mainwallatesc({
                        userId: Refflevalncome16._id,
                        Note: `You Got Level ${16} Income`,
                        Usernameby: decoded.profile.username,
                        Amount: (req.body.Amount * 2) / 100,
                        balace: res.mainWallet,
                        type: 1,
                        Active: true,
                      }).save();
                    });
                    await Communitymodal(data16).save();

                    console.log("===============>1616", {
                      Refflevalncome16,
                      data16,
                    });
                  }
                }
                const Refflevalncome17 = await findOneRecord(Usermodal, {
                  username: Refflevalncome16.refferalBy,
                  isValid: true,
                });
                if (!Refflevalncome17) {
                  return;
                }
                if (Refflevalncome17.leval >= 17) {
                  if (Refflevalncome17.mystack >= 50) {
                    let data17 = {
                      userId: Refflevalncome17._id,
                      Note: `You Got Level ${17} Income`,
                      Usernameby: decoded.profile.username,
                      Amount: (req.body.Amount * 3) / 100,
                    };
                    await updateRecord(
                      Walletmodal,
                      {
                        userId: Refflevalncome17._id,
                      },
                      { $inc: { mainWallet: (req.body.Amount * 3) / 100 } }
                    ).then(async (res) => {
                      await Mainwallatesc({
                        userId: Refflevalncome17._id,
                        Note: `You Got Level ${17} Income`,
                        Usernameby: decoded.profile.username,
                        Amount: (req.body.Amount * 3) / 100,
                        balace: res.mainWallet,
                        type: 1,
                        Active: true,
                      }).save();
                    });
                    await Communitymodal(data17).save();

                    console.log("===============>1717", {
                      Refflevalncome17,
                      data17,
                    });
                  }
                }
                const Refflevalncome18 = await findOneRecord(Usermodal, {
                  username: Refflevalncome17.refferalBy,
                  isValid: true,
                });
                if (!Refflevalncome18) {
                  return;
                }
                if (Refflevalncome18.leval >= 18) {
                  if (Refflevalncome18.mystack >= 50) {
                    let data18 = {
                      userId: Refflevalncome18._id,
                      Note: `You Got Level ${18} Income`,
                      Usernameby: decoded.profile.username,
                      Amount: (req.body.Amount * 4) / 100,
                    };
                    await updateRecord(
                      Walletmodal,
                      {
                        userId: Refflevalncome18._id,
                      },
                      { $inc: { mainWallet: (req.body.Amount * 4) / 100 } }
                    ).then(async (res) => {
                      await Mainwallatesc({
                        userId: Refflevalncome18._id,
                        Note: `You Got Level ${18} Income`,
                        Usernameby: decoded.profile.username,
                        Amount: (req.body.Amount * 4) / 100,
                        balace: res.mainWallet,
                        type: 1,
                        Active: true,
                      }).save();
                    });
                    await Communitymodal(data18).save();
                    console.log("===============>1818", {
                      Refflevalncome18,
                      data18,
                    });
                  }
                }
              });
            }
            const price = await findAllRecord(V4Xpricemodal, {});
            await Stakingmodal({
              userId: userdata._id,
              WalletType: req.body.Walletname,
              DailyReword:
                req.body.Amount <= 2000
                  ? Number(req.body.Amount / 730) * 2
                  : req.body.Amount >= 2040 && req.body.Amount <= 8000
                    ? Number(req.body.Amount / 730) * 2.25
                    : req.body.Amount >= 8040 && req.body.Amount <= 20000
                      ? Number(req.body.Amount / 730) * 2.5
                      : Number(req.body.Amount / 730) * 3,
              bonusAmount:
                req.body.Amount <= 2000
                  ? 200
                  : req.body.Amount >= 2040 && req.body.Amount <= 8000
                    ? 225
                    : req.body.Amount >= 8040 && req.body.Amount <= 20000
                      ? 250
                      : 300,
              Amount: req.body.Amount,
              TotalRewordRecived:
                req.body.Amount <= 2000
                  ? req.body.Amount * 2
                  : req.body.Amount >= 2040 && req.body.Amount <= 8000
                    ? req.body.Amount * 2.25
                    : req.body.Amount >= 8040 && req.body.Amount <= 20000
                      ? req.body.Amount * 2.5
                      : req.body.Amount * 3,
              V4xTokenPrice: price[0].price,
              transactionHash: JSON.stringify("admin"),
            }).save();
            await Usermodal.aggregate([
              {
                $match: {
                  username: userdata.username,
                },
              },
              {
                $graphLookup: {
                  from: "users",
                  startWith: "$username",
                  connectFromField: "username",
                  connectToField: "refferalBy",
                  as: "refers_to",
                },
              },
              {
                $lookup: {
                  from: "stakings",
                  localField: "refers_to._id",
                  foreignField: "userId",
                  as: "amount2",
                },
              },
              {
                $lookup: {
                  from: "stakings",
                  localField: "_id",
                  foreignField: "userId",
                  as: "amount",
                },
              },
              {
                $match: {
                  amount: {
                    $ne: [],
                  },
                },
              },
              {
                $project: {
                  total: {
                    $reduce: {
                      input: "$amount",
                      initialValue: 0,
                      in: {
                        $add: ["$$value", "$$this.Amount"],
                      },
                    },
                  },
                  total1: {
                    $reduce: {
                      input: "$amount2",
                      initialValue: 0,
                      in: {
                        $add: ["$$value", "$$this.Amount"],
                      },
                    },
                  },
                  email: 1,
                  username: 1,
                  level: 4,
                  refers_to: 1,
                },
              },
              {
                $unwind: {
                  path: "$refers_to",
                  preserveNullAndEmptyArrays: true,
                },
              },
            ]).then(async (e) => {
              if (e.length > 0) {
                await updateRecord(
                  Usermodal,
                  { _id: e[0]._id },
                  { teamtotalstack: e[0].total1, mystack: e[0].total }
                );
              }
            });
            return successResponse(res, {
              message: "You have successfully staked Infinity.AI Tokens",
            });
          } else {
            return notFoundResponse(res, {
              message: "user not found",
            });
          }
        }
      } else {
        return badRequestResponse(res, {
          message: "No token provided.",
        });
      }
    } catch (error) {
      return errorResponse(error, res);
    }
  },
  AllBuystack: async (req, res) => {
    try {
      const data = await Stakingmodal.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "result",
          },
        },
        {
          $unwind: {
            path: "$result",
            preserveNullAndEmptyArrays: true,
          },
        },
      ])
      console.log(data);
      return successResponse(res, {
        message: "bannar add successfully",
        data: data,
      });
    } catch (error) {
      return errorResponse(error, res);

    }
  },
  tranforcoins: async (req, res) => {
    try {
      let data = await Mainwallatesc.aggregate([
        {
          $match: {
            Note: "Coin Transfer by Admin",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "result",
          },
        },
        {
          $unwind: {
            path: "$result",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            username: "$result.username",
            Note: 1,
            Amount: 1,
            Active: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ]);
      let data1 = await Ewallateesc.aggregate([
        {
          $match: {
            Note: "Coin Transfer by Admin",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "result",
          },
        },
        {
          $unwind: {
            path: "$result",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            username: "$result.username",
            Note: 1,
            Amount: 1,
            Active: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ]);
      return successResponse(res, {
        message: "Infinity.AI Token Transfer successfully!",
        data: [...data, ...data1],
      });
    } catch (error) {
      return errorResponse(error, res);
    }
  },
};
