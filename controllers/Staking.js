const { Types } = require("mongoose");
const { ObjectId } = Types;
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
  validarionerrorResponse,
} = require("../middleware/response");
const { tokenverify } = require("../middleware/token");
const Stakingmodal = require("../models/Staking");
const Passivesmodal = require("../models/Passive");
const Walletmodal = require("../models/Wallet");
const Usermodal = require("../models/user");
const Stakingbonus = require("../models/Stakingbonus");
const Transactionmodal = require("../models/Transaction");
const Communitymodal = require("../models/Community");
const Achivementsmodal = require("../models/Achivement");
const Achivementmodal = require("../models/Achivement");
const Passivemodal = require("../models/Passive");
const V4Xpricemodal = require("../models/V4XLiveRate");
const Achivement = require("../models/Achivement");
const Mainwallatesc = require("../models/Mainwallate");
const Ewallateesc = require("../models/Ewallate");
const env = require("../env");
const Web3 = require("web3");
const otp = require("../models/otp");
const maxTimeDifference = 0.75 * 60 * 1000;
const infraUrl = env.globalAccess.rpcUrl;
const web3 = new Web3(infraUrl);
const nowIST = new Date();
nowIST.setUTCHours(nowIST.getUTCHours(), nowIST.getUTCMinutes(), 0, 0); // Convert to IST

const todayIST = new Date(nowIST);
todayIST.setHours(0, 0, 0, 0);

const nextDayIST = new Date(todayIST);
nextDayIST.setDate(nextDayIST.getDate() + 1); // Add one day to get the next day
todayIST.setHours(0, 0, 0, 0);

// const today = new Date();
// const nextDay = new Date(today);
// nextDay.setDate(nextDay.getDate() + 1);
console.log({ todayIST, nextDayIST });
exports.stack = {
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
          const WalletData = await findOneRecord(Walletmodal, {
            userId: decoded.profile._id,
          });
          if (req.body.WalletType !== "dappwalletstacking") {
            let data1 = await otp.find({
              userId: decoded.profile._id,
              otp: Number(req.body.otp),
            });
            if (data1.length !== 0) {
              await otp.remove({
                userId: decoded.profile._id,
              });
              if (req.body.WalletType == "Mainwalletstacking") {
                console.log("WalletData.mainWallet", WalletData.mainWallet);
                if (WalletData.mainWallet >= req.body.Amount) {
                  const ReffData = await findOneRecord(Usermodal, {
                    username: decoded.profile.refferalBy,
                    isValid: true,
                  });
                  if (ReffData !== null) {
                    const price = await findAllRecord(V4Xpricemodal, {});
                    if (ReffData.mystack >= 40) {
                      const data123 = await Stakingbonus.find({
                        Note: `You Got Refer and Earn Income From ${decoded.profile.username}`,
                      });
                      if (data123.length <= 0) {
                        await updateRecord(
                          Walletmodal,
                          {
                            userId: ReffData?._id,
                          },
                          {
                            $inc: {
                              mainWallet: (req.body.Amount * 5) / 100,
                            },
                          }
                        ).then(async (res) => {
                          await Mainwallatesc({
                            userId: ReffData?._id,
                            Note: `You Got Refer and Earn Income From ${decoded.profile.username}`,
                            Amount: (req.body.Amount * 5) / 100,
                            type: 1,
                            balace: res.mainWallet,
                            Active: true,
                          }).save();
                          await Stakingbonus({
                            userId: ReffData?._id,
                            ReffId: decoded.profile._id,
                            Amount: (req.body.Amount * 5) / 100,
                            Note: `You Got Refer and Earn Income From ${decoded.profile.username}`,
                            Active: true,
                          }).save();
                        });
                      }
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
                        if (Refflevalncome1.mystack >= 40) {
                          let data1 = {
                            userId: Refflevalncome1._id,
                            Note: `You Got Level ${1} Income`,
                            Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                            Amount: (req.body.Amount * 4) / 100,
                          };
                          await updateRecord(
                            Walletmodal,
                            {
                              userId: Refflevalncome1._id,
                            },
                            {
                              $inc: { mainWallet: (req.body.Amount * 4) / 100 },
                            }
                          ).then(async (res) => {
                            await Mainwallatesc({
                              userId: Refflevalncome1._id,
                              Note: `You Got Level ${1} Income`,
                              Amount: (req.body.Amount * 4) / 100,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        if (Refflevalncome2.mystack >= 40) {
                          let data2 = {
                            userId: Refflevalncome2._id,
                            Note: `You Got Level ${2} Income`,
                            Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                            Amount: (req.body.Amount * 3) / 100,
                          };
                          await updateRecord(
                            Walletmodal,
                            {
                              userId: Refflevalncome2._id,
                            },
                            {
                              $inc: { mainWallet: (req.body.Amount * 3) / 100 },
                            }
                          ).then(async (res) => {
                            await Mainwallatesc({
                              userId: Refflevalncome2._id,
                              Note: `You Got Level ${2} Income`,
                              Amount: (req.body.Amount * 3) / 100,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        if (Refflevalncome3.mystack >= 40) {
                          let data3 = {
                            userId: Refflevalncome3._id,
                            Note: `You Got Level ${3} Income`,
                            Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                            Amount: (req.body.Amount * 2) / 100,
                          };
                          await updateRecord(
                            Walletmodal,
                            {
                              userId: Refflevalncome3._id,
                            },
                            {
                              $inc: { mainWallet: (req.body.Amount * 2) / 100 },
                            }
                          ).then(async (res) => {
                            await Mainwallatesc({
                              userId: Refflevalncome3._id,
                              Note: `You Got Level ${3} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        if (Refflevalncome4.mystack >= 40) {
                          let data4 = {
                            userId: Refflevalncome4._id,
                            Note: `You Got Level ${4} Income`,
                            Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                            Amount: (req.body.Amount * 1) / 100,
                          };
                          await updateRecord(
                            Walletmodal,
                            {
                              userId: Refflevalncome4._id,
                            },
                            {
                              $inc: { mainWallet: (req.body.Amount * 1) / 100 },
                            }
                          ).then(async (res) => {
                            await Mainwallatesc({
                              userId: Refflevalncome4._id,
                              Note: `You Got Level ${4} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        if (Refflevalncome5.mystack >= 40) {
                          let data5 = {
                            userId: Refflevalncome5._id,
                            Note: `You Got Level ${5} Income`,
                            Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                            Amount: (req.body.Amount * 0.5) / 100,
                          };
                          await updateRecord(
                            Walletmodal,
                            {
                              userId: Refflevalncome5._id,
                            },
                            {
                              $inc: {
                                mainWallet: (req.body.Amount * 0.5) / 100,
                              },
                            }
                          ).then(async (res) => {
                            await Mainwallatesc({
                              userId: Refflevalncome5._id,
                              Note: `You Got Level ${5} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        if (Refflevalncome6.mystack >= 40) {
                          let data6 = {
                            userId: Refflevalncome6._id,
                            Note: `You Got Level ${6} Income`,
                            Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                            Amount: (req.body.Amount * 0.5) / 100,
                          };
                          await updateRecord(
                            Walletmodal,
                            {
                              userId: Refflevalncome6._id,
                            },
                            {
                              $inc: {
                                mainWallet: (req.body.Amount * 0.5) / 100,
                              },
                            }
                          ).then(async (res) => {
                            await Mainwallatesc({
                              userId: Refflevalncome6._id,
                              Note: `You Got Level ${6} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        if (Refflevalncome7.mystack >= 40) {
                          let data7 = {
                            userId: Refflevalncome7._id,
                            Note: `You Got Level ${7} Income`,
                            Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                            Amount: (req.body.Amount * 0.5) / 100,
                          };
                          await updateRecord(
                            Walletmodal,
                            {
                              userId: Refflevalncome7._id,
                            },
                            {
                              $inc: {
                                mainWallet: (req.body.Amount * 0.5) / 100,
                              },
                            }
                          ).then(async (res) => {
                            await Mainwallatesc({
                              userId: Refflevalncome7._id,
                              Note: `You Got Level ${7} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        if (Refflevalncome8.mystack >= 40) {
                          let data8 = {
                            userId: Refflevalncome8._id,
                            Note: `You Got Level ${8} Income`,
                            Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                            Amount: (req.body.Amount * 0.5) / 100,
                          };
                          await updateRecord(
                            Walletmodal,
                            {
                              userId: Refflevalncome8._id,
                            },
                            {
                              $inc: {
                                mainWallet: (req.body.Amount * 0.5) / 100,
                              },
                            }
                          ).then(async (res) => {
                            await Mainwallatesc({
                              userId: Refflevalncome8._id,
                              Note: `You Got Level ${8} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        if (Refflevalncome9.mystack >= 40) {
                          let data9 = {
                            userId: Refflevalncome9._id,
                            Note: `You Got Level ${9} Income`,
                            Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                            Amount: (req.body.Amount * 0.5) / 100,
                          };
                          await updateRecord(
                            Walletmodal,
                            {
                              userId: Refflevalncome9._id,
                            },
                            {
                              $inc: {
                                mainWallet: (req.body.Amount * 0.5) / 100,
                              },
                            }
                          ).then(async (res) => {
                            await Mainwallatesc({
                              userId: Refflevalncome9._id,
                              Note: `You Got Level ${9} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        if (Refflevalncome10.mystack >= 40) {
                          let data10 = {
                            userId: Refflevalncome10._id,
                            Note: `You Got Level ${10} Income`,
                            Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                            Amount: (req.body.Amount * 0.5) / 100,
                          };
                          await updateRecord(
                            Walletmodal,
                            {
                              userId: Refflevalncome10._id,
                            },
                            {
                              $inc: {
                                mainWallet: (req.body.Amount * 0.5) / 100,
                              },
                            }
                          ).then(async (res) => {
                            await Mainwallatesc({
                              userId: Refflevalncome10._id,
                              Note: `You Got Level ${10} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        if (Refflevalncome11.mystack >= 40) {
                          let data11 = {
                            userId: Refflevalncome11._id,
                            Note: `You Got Level ${11} Income`,
                            Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                            Amount: (req.body.Amount * 0.5) / 100,
                          };
                          await updateRecord(
                            Walletmodal,
                            {
                              userId: Refflevalncome11._id,
                            },
                            {
                              $inc: {
                                mainWallet: (req.body.Amount * 0.5) / 100,
                              },
                            }
                          ).then(async (res) => {
                            await Mainwallatesc({
                              userId: Refflevalncome11._id,
                              Note: `You Got Level ${11} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        if (Refflevalncome12.mystack >= 40) {
                          let data12 = {
                            userId: Refflevalncome12._id,
                            Note: `You Got Level ${12} Income`,
                            Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                            Amount: (req.body.Amount * 0.5) / 100,
                          };
                          await updateRecord(
                            Walletmodal,
                            {
                              userId: Refflevalncome12._id,
                            },
                            {
                              $inc: {
                                mainWallet: (req.body.Amount * 0.5) / 100,
                              },
                            }
                          ).then(async (res) => {
                            await Mainwallatesc({
                              userId: Refflevalncome12._id,
                              Note: `You Got Level ${12} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        if (Refflevalncome13.mystack >= 40) {
                          let data13 = {
                            userId: Refflevalncome13._id,
                            Note: `You Got Level ${13} Income`,
                            Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                            Amount: (req.body.Amount * 0.5) / 100,
                          };
                          await updateRecord(
                            Walletmodal,
                            {
                              userId: Refflevalncome13._id,
                            },
                            {
                              $inc: {
                                mainWallet: (req.body.Amount * 0.5) / 100,
                              },
                            }
                          ).then(async (res) => {
                            await Mainwallatesc({
                              userId: Refflevalncome13._id,
                              Note: `You Got Level ${13} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        if (Refflevalncome14.mystack >= 40) {
                          let data14 = {
                            userId: Refflevalncome14._id,
                            Note: `You Got Level ${14} Income`,
                            Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                            Amount: (req.body.Amount * 0.5) / 100,
                          };
                          await updateRecord(
                            Walletmodal,
                            {
                              userId: Refflevalncome14._id,
                            },
                            {
                              $inc: {
                                mainWallet: (req.body.Amount * 0.5) / 100,
                              },
                            }
                          ).then(async (res) => {
                            await Mainwallatesc({
                              userId: Refflevalncome14._id,
                              Note: `You Got Level ${14} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        if (Refflevalncome15.mystack >= 40) {
                          let data15 = {
                            userId: Refflevalncome15._id,
                            Note: `You Got Level ${15} Income`,
                            Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                            Amount: (req.body.Amount * 1) / 100,
                          };
                          await updateRecord(
                            Walletmodal,
                            {
                              userId: Refflevalncome15._id,
                            },
                            {
                              $inc: { mainWallet: (req.body.Amount * 1) / 100 },
                            }
                          ).then(async (res) => {
                            await Mainwallatesc({
                              userId: Refflevalncome15._id,
                              Note: `You Got Level ${15} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        if (Refflevalncome16.mystack >= 40) {
                          let data16 = {
                            userId: Refflevalncome16._id,
                            Note: `You Got Level ${16} Income`,
                            Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                            Amount: (req.body.Amount * 2) / 100,
                          };
                          await updateRecord(
                            Walletmodal,
                            {
                              userId: Refflevalncome16._id,
                            },
                            {
                              $inc: { mainWallet: (req.body.Amount * 2) / 100 },
                            }
                          ).then(async (res) => {
                            await Mainwallatesc({
                              userId: Refflevalncome16._id,
                              Note: `You Got Level ${16} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        if (Refflevalncome17.mystack >= 40) {
                          let data17 = {
                            userId: Refflevalncome17._id,
                            Note: `You Got Level ${17} Income`,
                            Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                            Amount: (req.body.Amount * 3) / 100,
                          };
                          await updateRecord(
                            Walletmodal,
                            {
                              userId: Refflevalncome17._id,
                            },
                            {
                              $inc: { mainWallet: (req.body.Amount * 3) / 100 },
                            }
                          ).then(async (res) => {
                            await Mainwallatesc({
                              userId: Refflevalncome17._id,
                              Note: `You Got Level ${17} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        if (Refflevalncome18.mystack >= 40) {
                          let data18 = {
                            userId: Refflevalncome18._id,
                            Note: `You Got Level ${18} Income`,
                            Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                            Amount: (req.body.Amount * 4) / 100,
                          };
                          await updateRecord(
                            Walletmodal,
                            {
                              userId: Refflevalncome18._id,
                            },
                            {
                              $inc: { mainWallet: (req.body.Amount * 4) / 100 },
                            }
                          ).then(async (res) => {
                            await Mainwallatesc({
                              userId: Refflevalncome18._id,
                              Note: `You Got Level ${18} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                    userId: decoded.profile._id,
                    WalletType: "Main Wallet",
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
                    transactionHash: "",
                  }).save();
                  await updateRecord(
                    Walletmodal,
                    { userId: decoded.profile._id },
                    { mainWallet: WalletData.mainWallet - req.body.Amount }
                  ).then(async (res) => {
                    await Mainwallatesc({
                      userId: decoded.profile._id,
                      Note: `Staking Charge`,
                      Amount: req.body.Amount,
                      balace: res.mainWallet,
                      type: 0,
                      Active: true,
                    }).save();
                  });
                  return successResponse(res, {
                    message: "You have successfully staked Infinity.AI Tokens",
                  });
                } else {
                  return validarionerrorResponse(res, {
                    message:
                      "please check your mian wallet balance do not have infoe amount to stake!",
                  });
                }
              }
              if (req.body.WalletType == "ewalletstacking") {
                if (WalletData.v4xWallet >= req.body.Amount) {
                  const ReffData = await findOneRecord(Usermodal, {
                    username: decoded.profile.refferalBy,
                    isValid: true,
                  });
                  if (ReffData !== null) {
                    const price = await findAllRecord(V4Xpricemodal, {});
                    if (ReffData.mystack >= 40) {
                      const data123 = await Stakingbonus.find({
                        Note: `You Got Refer and Earn Income From ${decoded.profile.username}`,
                      });
                      if (data123.length <= 0) {
                        await updateRecord(
                          Walletmodal,
                          {
                            userId: ReffData?._id,
                          },
                          {
                            $inc: {
                              mainWallet: (req.body.Amount * 5) / 100,
                            },
                          }
                        ).then(async (res) => {
                          await Mainwallatesc({
                            userId: ReffData?._id,
                            Note: `You Got Refer and Earn Income From ${decoded.profile.username}`,
                            Amount: (req.body.Amount * 5) / 100,
                            type: 1,
                            balace: res.mainWallet,
                            Active: true,
                          }).save();
                          await Stakingbonus({
                            userId: ReffData?._id,
                            ReffId: decoded.profile._id,
                            Amount: (req.body.Amount * 5) / 100,
                            Note: `You Got Refer and Earn Income From ${decoded.profile.username}`,
                            Active: true,
                          }).save();
                        });
                      }
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
                        if (Refflevalncome1.mystack >= 40) {
                          let data1 = {
                            userId: Refflevalncome1._id,
                            Note: `You Got Level ${1} Income`,
                            Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                            Amount: (req.body.Amount * 4) / 100,
                          };
                          await updateRecord(
                            Walletmodal,
                            {
                              userId: Refflevalncome1._id,
                            },
                            {
                              $inc: { mainWallet: (req.body.Amount * 4) / 100 },
                            }
                          ).then(async (res) => {
                            await Mainwallatesc({
                              userId: Refflevalncome1._id,
                              Note: `You Got Level ${1} Income`,
                              Amount: (req.body.Amount * 4) / 100,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        if (Refflevalncome2.mystack >= 40) {
                          let data2 = {
                            userId: Refflevalncome2._id,
                            Note: `You Got Level ${2} Income`,
                            Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                            Amount: (req.body.Amount * 3) / 100,
                          };
                          await updateRecord(
                            Walletmodal,
                            {
                              userId: Refflevalncome2._id,
                            },
                            {
                              $inc: { mainWallet: (req.body.Amount * 3) / 100 },
                            }
                          ).then(async (res) => {
                            await Mainwallatesc({
                              userId: Refflevalncome2._id,
                              Note: `You Got Level ${2} Income`,
                              Amount: (req.body.Amount * 3) / 100,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        if (Refflevalncome3.mystack >= 40) {
                          let data3 = {
                            userId: Refflevalncome3._id,
                            Note: `You Got Level ${3} Income`,
                            Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                            Amount: (req.body.Amount * 2) / 100,
                          };
                          await updateRecord(
                            Walletmodal,
                            {
                              userId: Refflevalncome3._id,
                            },
                            {
                              $inc: { mainWallet: (req.body.Amount * 2) / 100 },
                            }
                          ).then(async (res) => {
                            await Mainwallatesc({
                              userId: Refflevalncome3._id,
                              Note: `You Got Level ${3} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        if (Refflevalncome4.mystack >= 40) {
                          let data4 = {
                            userId: Refflevalncome4._id,
                            Note: `You Got Level ${4} Income`,
                            Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                            Amount: (req.body.Amount * 1) / 100,
                          };
                          await updateRecord(
                            Walletmodal,
                            {
                              userId: Refflevalncome4._id,
                            },
                            {
                              $inc: { mainWallet: (req.body.Amount * 1) / 100 },
                            }
                          ).then(async (res) => {
                            await Mainwallatesc({
                              userId: Refflevalncome4._id,
                              Note: `You Got Level ${4} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        if (Refflevalncome5.mystack >= 40) {
                          let data5 = {
                            userId: Refflevalncome5._id,
                            Note: `You Got Level ${5} Income`,
                            Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                            Amount: (req.body.Amount * 0.5) / 100,
                          };
                          await updateRecord(
                            Walletmodal,
                            {
                              userId: Refflevalncome5._id,
                            },
                            {
                              $inc: {
                                mainWallet: (req.body.Amount * 0.5) / 100,
                              },
                            }
                          ).then(async (res) => {
                            await Mainwallatesc({
                              userId: Refflevalncome5._id,
                              Note: `You Got Level ${5} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        if (Refflevalncome6.mystack >= 40) {
                          let data6 = {
                            userId: Refflevalncome6._id,
                            Note: `You Got Level ${6} Income`,
                            Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                            Amount: (req.body.Amount * 0.5) / 100,
                          };
                          await updateRecord(
                            Walletmodal,
                            {
                              userId: Refflevalncome6._id,
                            },
                            {
                              $inc: {
                                mainWallet: (req.body.Amount * 0.5) / 100,
                              },
                            }
                          ).then(async (res) => {
                            await Mainwallatesc({
                              userId: Refflevalncome6._id,
                              Note: `You Got Level ${6} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        if (Refflevalncome7.mystack >= 40) {
                          let data7 = {
                            userId: Refflevalncome7._id,
                            Note: `You Got Level ${7} Income`,
                            Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                            Amount: (req.body.Amount * 0.5) / 100,
                          };
                          await updateRecord(
                            Walletmodal,
                            {
                              userId: Refflevalncome7._id,
                            },
                            {
                              $inc: {
                                mainWallet: (req.body.Amount * 0.5) / 100,
                              },
                            }
                          ).then(async (res) => {
                            await Mainwallatesc({
                              userId: Refflevalncome7._id,
                              Note: `You Got Level ${7} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        if (Refflevalncome8.mystack >= 40) {
                          let data8 = {
                            userId: Refflevalncome8._id,
                            Note: `You Got Level ${8} Income`,
                            Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                            Amount: (req.body.Amount * 0.5) / 100,
                          };
                          await updateRecord(
                            Walletmodal,
                            {
                              userId: Refflevalncome8._id,
                            },
                            {
                              $inc: {
                                mainWallet: (req.body.Amount * 0.5) / 100,
                              },
                            }
                          ).then(async (res) => {
                            await Mainwallatesc({
                              userId: Refflevalncome8._id,
                              Note: `You Got Level ${8} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        if (Refflevalncome9.mystack >= 40) {
                          let data9 = {
                            userId: Refflevalncome9._id,
                            Note: `You Got Level ${9} Income`,
                            Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                            Amount: (req.body.Amount * 0.5) / 100,
                          };
                          await updateRecord(
                            Walletmodal,
                            {
                              userId: Refflevalncome9._id,
                            },
                            {
                              $inc: {
                                mainWallet: (req.body.Amount * 0.5) / 100,
                              },
                            }
                          ).then(async (res) => {
                            await Mainwallatesc({
                              userId: Refflevalncome9._id,
                              Note: `You Got Level ${9} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        if (Refflevalncome10.mystack >= 40) {
                          let data10 = {
                            userId: Refflevalncome10._id,
                            Note: `You Got Level ${10} Income`,
                            Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                            Amount: (req.body.Amount * 0.5) / 100,
                          };
                          await updateRecord(
                            Walletmodal,
                            {
                              userId: Refflevalncome10._id,
                            },
                            {
                              $inc: {
                                mainWallet: (req.body.Amount * 0.5) / 100,
                              },
                            }
                          ).then(async (res) => {
                            await Mainwallatesc({
                              userId: Refflevalncome10._id,
                              Note: `You Got Level ${10} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        if (Refflevalncome11.mystack >= 40) {
                          let data11 = {
                            userId: Refflevalncome11._id,
                            Note: `You Got Level ${11} Income`,
                            Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                            Amount: (req.body.Amount * 0.5) / 100,
                          };
                          await updateRecord(
                            Walletmodal,
                            {
                              userId: Refflevalncome11._id,
                            },
                            {
                              $inc: {
                                mainWallet: (req.body.Amount * 0.5) / 100,
                              },
                            }
                          ).then(async (res) => {
                            await Mainwallatesc({
                              userId: Refflevalncome11._id,
                              Note: `You Got Level ${11} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        if (Refflevalncome12.mystack >= 40) {
                          let data12 = {
                            userId: Refflevalncome12._id,
                            Note: `You Got Level ${12} Income`,
                            Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                            Amount: (req.body.Amount * 0.5) / 100,
                          };
                          await updateRecord(
                            Walletmodal,
                            {
                              userId: Refflevalncome12._id,
                            },
                            {
                              $inc: {
                                mainWallet: (req.body.Amount * 0.5) / 100,
                              },
                            }
                          ).then(async (res) => {
                            await Mainwallatesc({
                              userId: Refflevalncome12._id,
                              Note: `You Got Level ${12} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        if (Refflevalncome13.mystack >= 40) {
                          let data13 = {
                            userId: Refflevalncome13._id,
                            Note: `You Got Level ${13} Income`,
                            Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                            Amount: (req.body.Amount * 0.5) / 100,
                          };
                          await updateRecord(
                            Walletmodal,
                            {
                              userId: Refflevalncome13._id,
                            },
                            {
                              $inc: {
                                mainWallet: (req.body.Amount * 0.5) / 100,
                              },
                            }
                          ).then(async (res) => {
                            await Mainwallatesc({
                              userId: Refflevalncome13._id,
                              Note: `You Got Level ${13} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        if (Refflevalncome14.mystack >= 40) {
                          let data14 = {
                            userId: Refflevalncome14._id,
                            Note: `You Got Level ${14} Income`,
                            Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                            Amount: (req.body.Amount * 0.5) / 100,
                          };
                          await updateRecord(
                            Walletmodal,
                            {
                              userId: Refflevalncome14._id,
                            },
                            {
                              $inc: {
                                mainWallet: (req.body.Amount * 0.5) / 100,
                              },
                            }
                          ).then(async (res) => {
                            await Mainwallatesc({
                              userId: Refflevalncome14._id,
                              Note: `You Got Level ${14} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        if (Refflevalncome15.mystack >= 40) {
                          let data15 = {
                            userId: Refflevalncome15._id,
                            Note: `You Got Level ${15} Income`,
                            Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                            Amount: (req.body.Amount * 1) / 100,
                          };
                          await updateRecord(
                            Walletmodal,
                            {
                              userId: Refflevalncome15._id,
                            },
                            {
                              $inc: { mainWallet: (req.body.Amount * 1) / 100 },
                            }
                          ).then(async (res) => {
                            await Mainwallatesc({
                              userId: Refflevalncome15._id,
                              Note: `You Got Level ${15} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        if (Refflevalncome16.mystack >= 40) {
                          let data16 = {
                            userId: Refflevalncome16._id,
                            Note: `You Got Level ${16} Income`,
                            Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                            Amount: (req.body.Amount * 2) / 100,
                          };
                          await updateRecord(
                            Walletmodal,
                            {
                              userId: Refflevalncome16._id,
                            },
                            {
                              $inc: { mainWallet: (req.body.Amount * 2) / 100 },
                            }
                          ).then(async (res) => {
                            await Mainwallatesc({
                              userId: Refflevalncome16._id,
                              Note: `You Got Level ${16} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        if (Refflevalncome17.mystack >= 40) {
                          let data17 = {
                            userId: Refflevalncome17._id,
                            Note: `You Got Level ${17} Income`,
                            Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                            Amount: (req.body.Amount * 3) / 100,
                          };
                          await updateRecord(
                            Walletmodal,
                            {
                              userId: Refflevalncome17._id,
                            },
                            {
                              $inc: { mainWallet: (req.body.Amount * 3) / 100 },
                            }
                          ).then(async (res) => {
                            await Mainwallatesc({
                              userId: Refflevalncome17._id,
                              Note: `You Got Level ${17} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        if (Refflevalncome18.mystack >= 40) {
                          let data18 = {
                            userId: Refflevalncome18._id,
                            Note: `You Got Level ${18} Income`,
                            Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                            Amount: (req.body.Amount * 4) / 100,
                          };
                          await updateRecord(
                            Walletmodal,
                            {
                              userId: Refflevalncome18._id,
                            },
                            {
                              $inc: { mainWallet: (req.body.Amount * 4) / 100 },
                            }
                          ).then(async (res) => {
                            await Mainwallatesc({
                              userId: Refflevalncome18._id,
                              Note: `You Got Level ${18} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                    userId: decoded.profile._id,
                    WalletType: "E-Wallet",
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
                      req.body.Amount <= 2500
                        ? req.body.Amount * 2
                        : req.body.Amount >= 2040 && req.body.Amount <= 8000
                          ? req.body.Amount * 2.25
                          : req.body.Amount >= 8040 && req.body.Amount <= 20000
                            ? req.body.Amount * 2.5
                            : req.body.Amount * 3,
                    V4xTokenPrice: price[0].price,
                    transactionHash: "",
                  }).save();
                  await updateRecord(
                    Walletmodal,
                    { userId: decoded.profile._id },
                    { v4xWallet: WalletData.v4xWallet - req.body.Amount }
                  ).then(async (res) => {
                    await Ewallateesc({
                      userId: decoded.profile._id,
                      Note: `Staking Charge`,
                      Amount: req.body.Amount,
                      balace: res.v4xWallet,
                      type: 0,
                      Active: true,
                    }).save();
                  });
                  return successResponse(res, {
                    message: "You have successfully staked Infinity.AI Tokens",
                  });
                } else {
                  return validarionerrorResponse(res, {
                    message:
                      "please check your Infinity.AI wallet balance do not have infoe amount to stake!",
                  });
                }
              }
            } else {
              await otp.remove({
                userId: decoded.profile._id,
              });
              return notFoundResponse(res, {
                message: "Transaction failed",
              });
            }
          } else {
            if (req.body.WalletType === "dappwalletstacking") {
              web3.eth
                .getTransactionReceipt(req.body.transactionHash)
                .then((transaction) => {
                  const blockNumber = transaction.blockNumber;
                  return web3.eth.getBlock(blockNumber);
                })
                .then(async (block) => {
                  const timestamp = block.timestamp; // This is the Unix timestamp of the block
                  const currentTimestamp = new Date().getTime();
                  const blockTimestamp = timestamp * 1000;
                  const timeDifference = currentTimestamp - blockTimestamp;
                  if (timeDifference <= maxTimeDifference) {
                    const ReffData = await findOneRecord(Usermodal, {
                      username: decoded.profile.refferalBy,
                      isValid: true,
                    });
                    if (ReffData !== null) {
                      if (ReffData.mystack >= 40) {
                        const data123 = await Stakingbonus.find({
                          Note: `You Got Refer and Earn Income From ${ReffData.username}`,
                        });
                        if (data123.length <= 0) {
                          await updateRecord(
                            Walletmodal,
                            {
                              userId: ReffData?._id,
                            },
                            {
                              $inc: {
                                mainWallet: (req.body.Amount * 5) / 100,
                              },
                            }
                          ).then(async (res) => {
                            await Mainwallatesc({
                              userId: ReffData?._id,
                              Note: `You Got Refer and Earn Income From ${decoded.profile.username}`,
                              Amount: (req.body.Amount * 5) / 100,
                              type: 1,
                              balace: res.mainWallet,
                              Active: true,
                            }).save();
                            await Stakingbonus({
                              userId: ReffData?._id,
                              ReffId: decoded.profile._id,
                              Amount: (req.body.Amount * 5) / 100,
                              Note: `You Got Refer and Earn Income From ${decoded.profile.username}`,
                              Active: true,
                            }).save();
                          });
                        }
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
                          if (Refflevalncome1.mystack >= 40) {
                            let data1 = {
                              userId: Refflevalncome1._id,
                              Note: `You Got Level ${1} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                              Amount: (req.body.Amount * 4) / 100,
                            };
                            await updateRecord(
                              Walletmodal,
                              {
                                userId: Refflevalncome1._id,
                              },
                              {
                                $inc: {
                                  mainWallet: (req.body.Amount * 4) / 100,
                                },
                              }
                            ).then(async (res) => {
                              await Mainwallatesc({
                                userId: Refflevalncome1._id,
                                Note: `You Got Level ${1} Income`,
                                Amount: (req.body.Amount * 4) / 100,
                                Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                          if (Refflevalncome2.mystack >= 40) {
                            let data2 = {
                              userId: Refflevalncome2._id,
                              Note: `You Got Level ${2} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                              Amount: (req.body.Amount * 3) / 100,
                            };
                            await updateRecord(
                              Walletmodal,
                              {
                                userId: Refflevalncome2._id,
                              },
                              {
                                $inc: {
                                  mainWallet: (req.body.Amount * 3) / 100,
                                },
                              }
                            ).then(async (res) => {
                              await Mainwallatesc({
                                userId: Refflevalncome2._id,
                                Note: `You Got Level ${2} Income`,
                                Amount: (req.body.Amount * 3) / 100,
                                Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                          if (Refflevalncome3.mystack >= 40) {
                            let data3 = {
                              userId: Refflevalncome3._id,
                              Note: `You Got Level ${3} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                              Amount: (req.body.Amount * 2) / 100,
                            };
                            await updateRecord(
                              Walletmodal,
                              {
                                userId: Refflevalncome3._id,
                              },
                              {
                                $inc: {
                                  mainWallet: (req.body.Amount * 2) / 100,
                                },
                              }
                            ).then(async (res) => {
                              await Mainwallatesc({
                                userId: Refflevalncome3._id,
                                Note: `You Got Level ${3} Income`,
                                Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                          if (Refflevalncome4.mystack >= 40) {
                            let data4 = {
                              userId: Refflevalncome4._id,
                              Note: `You Got Level ${4} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                              Amount: (req.body.Amount * 1) / 100,
                            };
                            await updateRecord(
                              Walletmodal,
                              {
                                userId: Refflevalncome4._id,
                              },
                              {
                                $inc: {
                                  mainWallet: (req.body.Amount * 1) / 100,
                                },
                              }
                            ).then(async (res) => {
                              await Mainwallatesc({
                                userId: Refflevalncome4._id,
                                Note: `You Got Level ${4} Income`,
                                Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                          if (Refflevalncome5.mystack >= 40) {
                            let data5 = {
                              userId: Refflevalncome5._id,
                              Note: `You Got Level ${5} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                              Amount: (req.body.Amount * 0.5) / 100,
                            };
                            await updateRecord(
                              Walletmodal,
                              {
                                userId: Refflevalncome5._id,
                              },
                              {
                                $inc: {
                                  mainWallet: (req.body.Amount * 0.5) / 100,
                                },
                              }
                            ).then(async (res) => {
                              await Mainwallatesc({
                                userId: Refflevalncome5._id,
                                Note: `You Got Level ${5} Income`,
                                Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                          if (Refflevalncome6.mystack >= 40) {
                            let data6 = {
                              userId: Refflevalncome6._id,
                              Note: `You Got Level ${6} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                              Amount: (req.body.Amount * 0.5) / 100,
                            };
                            await updateRecord(
                              Walletmodal,
                              {
                                userId: Refflevalncome6._id,
                              },
                              {
                                $inc: {
                                  mainWallet: (req.body.Amount * 0.5) / 100,
                                },
                              }
                            ).then(async (res) => {
                              await Mainwallatesc({
                                userId: Refflevalncome6._id,
                                Note: `You Got Level ${6} Income`,
                                Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                          if (Refflevalncome7.mystack >= 40) {
                            let data7 = {
                              userId: Refflevalncome7._id,
                              Note: `You Got Level ${7} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                              Amount: (req.body.Amount * 0.5) / 100,
                            };
                            await updateRecord(
                              Walletmodal,
                              {
                                userId: Refflevalncome7._id,
                              },
                              {
                                $inc: {
                                  mainWallet: (req.body.Amount * 0.5) / 100,
                                },
                              }
                            ).then(async (res) => {
                              await Mainwallatesc({
                                userId: Refflevalncome7._id,
                                Note: `You Got Level ${7} Income`,
                                Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                          if (Refflevalncome8.mystack >= 40) {
                            let data8 = {
                              userId: Refflevalncome8._id,
                              Note: `You Got Level ${8} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                              Amount: (req.body.Amount * 0.5) / 100,
                            };
                            await updateRecord(
                              Walletmodal,
                              {
                                userId: Refflevalncome8._id,
                              },
                              {
                                $inc: {
                                  mainWallet: (req.body.Amount * 0.5) / 100,
                                },
                              }
                            ).then(async (res) => {
                              await Mainwallatesc({
                                userId: Refflevalncome8._id,
                                Note: `You Got Level ${8} Income`,
                                Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                          if (Refflevalncome9.mystack >= 40) {
                            let data9 = {
                              userId: Refflevalncome9._id,
                              Note: `You Got Level ${9} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                              Amount: (req.body.Amount * 0.5) / 100,
                            };
                            await updateRecord(
                              Walletmodal,
                              {
                                userId: Refflevalncome9._id,
                              },
                              {
                                $inc: {
                                  mainWallet: (req.body.Amount * 0.5) / 100,
                                },
                              }
                            ).then(async (res) => {
                              await Mainwallatesc({
                                userId: Refflevalncome9._id,
                                Note: `You Got Level ${9} Income`,
                                Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        const Refflevalncome10 = await findOneRecord(
                          Usermodal,
                          {
                            username: Refflevalncome9.refferalBy,
                            isValid: true,
                          }
                        );
                        if (!Refflevalncome10) {
                          return;
                        }

                        if (Refflevalncome10.leval >= 10) {
                          if (Refflevalncome10.mystack >= 40) {
                            let data10 = {
                              userId: Refflevalncome10._id,
                              Note: `You Got Level ${10} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                              Amount: (req.body.Amount * 0.5) / 100,
                            };
                            await updateRecord(
                              Walletmodal,
                              {
                                userId: Refflevalncome10._id,
                              },
                              {
                                $inc: {
                                  mainWallet: (req.body.Amount * 0.5) / 100,
                                },
                              }
                            ).then(async (res) => {
                              await Mainwallatesc({
                                userId: Refflevalncome10._id,
                                Note: `You Got Level ${10} Income`,
                                Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        const Refflevalncome11 = await findOneRecord(
                          Usermodal,
                          {
                            username: Refflevalncome10.refferalBy,
                            isValid: true,
                          }
                        );
                        if (!Refflevalncome11) {
                          return;
                        }

                        if (Refflevalncome11.leval >= 11) {
                          if (Refflevalncome11.mystack >= 40) {
                            let data11 = {
                              userId: Refflevalncome11._id,
                              Note: `You Got Level ${11} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                              Amount: (req.body.Amount * 0.5) / 100,
                            };
                            await updateRecord(
                              Walletmodal,
                              {
                                userId: Refflevalncome11._id,
                              },
                              {
                                $inc: {
                                  mainWallet: (req.body.Amount * 0.5) / 100,
                                },
                              }
                            ).then(async (res) => {
                              await Mainwallatesc({
                                userId: Refflevalncome11._id,
                                Note: `You Got Level ${11} Income`,
                                Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        const Refflevalncome12 = await findOneRecord(
                          Usermodal,
                          {
                            username: Refflevalncome11.refferalBy,
                            isValid: true,
                          }
                        );
                        if (!Refflevalncome12) {
                          return;
                        }
                        if (Refflevalncome12.leval >= 12) {
                          if (Refflevalncome12.mystack >= 40) {
                            let data12 = {
                              userId: Refflevalncome12._id,
                              Note: `You Got Level ${12} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                              Amount: (req.body.Amount * 0.5) / 100,
                            };
                            await updateRecord(
                              Walletmodal,
                              {
                                userId: Refflevalncome12._id,
                              },
                              {
                                $inc: {
                                  mainWallet: (req.body.Amount * 0.5) / 100,
                                },
                              }
                            ).then(async (res) => {
                              await Mainwallatesc({
                                userId: Refflevalncome12._id,
                                Note: `You Got Level ${12} Income`,
                                Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        const Refflevalncome13 = await findOneRecord(
                          Usermodal,
                          {
                            username: Refflevalncome12.refferalBy,
                            isValid: true,
                          }
                        );
                        if (!Refflevalncome13) {
                          return;
                        }
                        if (Refflevalncome13.leval >= 13) {
                          if (Refflevalncome13.mystack >= 40) {
                            let data13 = {
                              userId: Refflevalncome13._id,
                              Note: `You Got Level ${13} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                              Amount: (req.body.Amount * 0.5) / 100,
                            };
                            await updateRecord(
                              Walletmodal,
                              {
                                userId: Refflevalncome13._id,
                              },
                              {
                                $inc: {
                                  mainWallet: (req.body.Amount * 0.5) / 100,
                                },
                              }
                            ).then(async (res) => {
                              await Mainwallatesc({
                                userId: Refflevalncome13._id,
                                Note: `You Got Level ${13} Income`,
                                Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        const Refflevalncome14 = await findOneRecord(
                          Usermodal,
                          {
                            username: Refflevalncome13.refferalBy,
                            isValid: true,
                          }
                        );
                        if (!Refflevalncome14) {
                          return;
                        }
                        if (Refflevalncome14.leval >= 14) {
                          if (Refflevalncome14.mystack >= 40) {
                            let data14 = {
                              userId: Refflevalncome14._id,
                              Note: `You Got Level ${14} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                              Amount: (req.body.Amount * 0.5) / 100,
                            };
                            await updateRecord(
                              Walletmodal,
                              {
                                userId: Refflevalncome14._id,
                              },
                              {
                                $inc: {
                                  mainWallet: (req.body.Amount * 0.5) / 100,
                                },
                              }
                            ).then(async (res) => {
                              await Mainwallatesc({
                                userId: Refflevalncome14._id,
                                Note: `You Got Level ${14} Income`,
                                Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        const Refflevalncome15 = await findOneRecord(
                          Usermodal,
                          {
                            username: Refflevalncome14.refferalBy,
                            isValid: true,
                          }
                        );
                        if (!Refflevalncome15) {
                          return;
                        }
                        if (Refflevalncome15.leval >= 15) {
                          if (Refflevalncome15.mystack >= 40) {
                            let data15 = {
                              userId: Refflevalncome15._id,
                              Note: `You Got Level ${15} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                              Amount: (req.body.Amount * 1) / 100,
                            };
                            await updateRecord(
                              Walletmodal,
                              {
                                userId: Refflevalncome15._id,
                              },
                              {
                                $inc: {
                                  mainWallet: (req.body.Amount * 1) / 100,
                                },
                              }
                            ).then(async (res) => {
                              await Mainwallatesc({
                                userId: Refflevalncome15._id,
                                Note: `You Got Level ${15} Income`,
                                Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        const Refflevalncome16 = await findOneRecord(
                          Usermodal,
                          {
                            username: Refflevalncome15.refferalBy,
                            isValid: true,
                          }
                        );
                        if (!Refflevalncome16) {
                          return;
                        }
                        if (Refflevalncome16.leval >= 16) {
                          if (Refflevalncome16.mystack >= 40) {
                            let data16 = {
                              userId: Refflevalncome16._id,
                              Note: `You Got Level ${16} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                              Amount: (req.body.Amount * 2) / 100,
                            };
                            await updateRecord(
                              Walletmodal,
                              {
                                userId: Refflevalncome16._id,
                              },
                              {
                                $inc: {
                                  mainWallet: (req.body.Amount * 2) / 100,
                                },
                              }
                            ).then(async (res) => {
                              await Mainwallatesc({
                                userId: Refflevalncome16._id,
                                Note: `You Got Level ${16} Income`,
                                Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        const Refflevalncome17 = await findOneRecord(
                          Usermodal,
                          {
                            username: Refflevalncome16.refferalBy,
                            isValid: true,
                          }
                        );
                        if (!Refflevalncome17) {
                          return;
                        }
                        if (Refflevalncome17.leval >= 17) {
                          if (Refflevalncome17.mystack >= 40) {
                            let data17 = {
                              userId: Refflevalncome17._id,
                              Note: `You Got Level ${17} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                              Amount: (req.body.Amount * 3) / 100,
                            };
                            await updateRecord(
                              Walletmodal,
                              {
                                userId: Refflevalncome17._id,
                              },
                              {
                                $inc: {
                                  mainWallet: (req.body.Amount * 3) / 100,
                                },
                              }
                            ).then(async (res) => {
                              await Mainwallatesc({
                                userId: Refflevalncome17._id,
                                Note: `You Got Level ${17} Income`,
                                Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                        const Refflevalncome18 = await findOneRecord(
                          Usermodal,
                          {
                            username: Refflevalncome17.refferalBy,
                            isValid: true,
                          }
                        );
                        if (!Refflevalncome18) {
                          return;
                        }
                        if (Refflevalncome18.leval >= 18) {
                          if (Refflevalncome18.mystack >= 40) {
                            let data18 = {
                              userId: Refflevalncome18._id,
                              Note: `You Got Level ${18} Income`,
                              Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
                              Amount: (req.body.Amount * 4) / 100,
                            };
                            await updateRecord(
                              Walletmodal,
                              {
                                userId: Refflevalncome18._id,
                              },
                              {
                                $inc: {
                                  mainWallet: (req.body.Amount * 4) / 100,
                                },
                              }
                            ).then(async (res) => {
                              await Mainwallatesc({
                                userId: Refflevalncome18._id,
                                Note: `You Got Level ${18} Income`,
                                Usernameby: `${decoded.profile.username} (${decoded.profile.Fullname})`,
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
                      userId: decoded.profile._id,
                      WalletType: "DAPP-Wallet",
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
                        req.body.Amount <= 2500
                          ? req.body.Amount * 2
                          : req.body.Amount >= 2040 && req.body.Amount <= 8000
                            ? req.body.Amount * 2.25
                            : req.body.Amount >= 8040 && req.body.Amount <= 20000
                              ? req.body.Amount * 2.5
                              : req.body.Amount * 3,
                      V4xTokenPrice: price[0].price,
                      transactionHash: req.body.transactionHash,
                    }).save();
                    return successResponse(res, {
                      message:
                        "You have successfully staked Infinity.AI Tokens",
                    });
                  } else {
                    return badRequestResponse(res, {
                      message: "Transaction is not valid within 5 minutes.",
                    });
                  }
                })
                .catch((err) => {
                  console.log(err);
                });
            } else {
              return badRequestResponse(res, {
                message: "something went to wrong please try again",
              });
            }
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
  gelallstack: async (req, res) => {
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
          const StakingData = await findAllRecord(Stakingmodal, {
            userId: decoded.profile._id,
          });
          const price = await findAllRecord(V4Xpricemodal, {});
          return successResponse(res, {
            message: "staking data get successfully",
            data: StakingData,
            V4Xtokenprice: price[0].price,
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
  gelUserWallate: async (req, res) => {
    try {
      if (!req.headers.authorization) {
        return badRequestResponse(res, {
          message: "No token provided.",
        });
      }

      const token = req.headers.authorization.split(" ")[1];
      const { err, decoded } = await tokenverify(token);

      if (err) {
        return notFoundResponse(res, {
          message: "User not found",
        });
      }

      if (!decoded) {
        return notFoundResponse(res, {
          message: "Decoded token is missing",
        });
      }

      const {
        profile: { _id: userId, username },
      } = decoded;

      const [
        stakingData,
        WalletData,
        userData,
        aggregatedUserData,
        data1,
        data,
        data123,
        v4xTokenPrice,
      ] = await Promise.all([
        findAllRecord(Stakingmodal, {
          userId: userId,
        }),
        findAllRecord(Walletmodal, {
          userId: userId,
        }),
        findAllRecord(Usermodal, {
          _id: userId,
        }),
        Usermodal.aggregate([
          {
            $match: {
              username,
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
            $graphLookup: {
              from: "users",
              startWith: "$username",
              connectFromField: "username",
              connectToField: "refferalBy",
              as: "refers_to1",
              restrictSearchWithMatch: {
                mystack: { $gte: 40 },
              },
            },
          },
          {
            $graphLookup: {
              from: "users",
              startWith: "$username",
              connectFromField: "username",
              connectToField: "refferalBy",
              as: "todayrefers_to1",
              maxDepth: 1, // Optionally specify the maximum depth to traverse
              depthField: "level", // Optionally store the depth in a field
              restrictSearchWithMatch: {
                mystack: { $gte: 40 },
                createdAt: {
                  $gte: new Date(todayIST), // Modify the date format as needed
                  $lt: new Date(nextDayIST), // Modify the date format as needed
                },
              },
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
              todaymystack: {
                $reduce: {
                  input: {
                    $filter: {
                      input: "$amount",
                      as: "item",
                      cond: {
                        $and: [
                          {
                            $gte: ["$$item.createdAt", new Date(todayIST)],
                          },
                          {
                            $lt: ["$$item.createdAt", new Date(nextDayIST)],
                          },
                        ],
                      },
                    },
                  },
                  initialValue: 0,
                  in: {
                    $add: ["$$value", "$$this.Amount"],
                  },
                },
              },
              todaymyteam: {
                $reduce: {
                  input: {
                    $filter: {
                      input: "$amount2",
                      as: "item",
                      cond: {
                        $and: [
                          {
                            $gte: ["$$item.createdAt", new Date(todayIST)],
                          },
                          {
                            $lt: ["$$item.createdAt", new Date(nextDayIST)],
                          },
                        ],
                      },
                    },
                  },
                  initialValue: 0,
                  in: {
                    $add: ["$$value", "$$this.Amount"],
                  },
                },
              },
              total2: {
                $reduce: {
                  input: "$amount",
                  initialValue: 0,
                  in: {
                    $add: [
                      "$$value",
                      {
                        $divide: ["$$this.Amount", "$$this.V4xTokenPrice"],
                      },
                    ],
                  },
                },
              },
              refers_to1Size: { $size: "$refers_to1" },
              todayrefers_to1Size: { $size: "$todayrefers_to1" },
              email: 1,
              username: 1,
              level: 4,
            },
          },
        ]),
        Usermodal.aggregate([
          {
            $match: {
              refferalBy: username,
            },
          },
          {
            $project: {
              // Exclude unnecessary fields
              referredUser: 0,
              walletaddress: 0,
              profileimg: 0,
              password: 0,
              isActive: 0,
              isValid: 0,
              createdAt: 0,
              updatedAt: 0,
              __v: 0,
              referredUser: 0,
              AirdroppedActive: 0,
              Airdropped: 0,
            },
          },
        ]),
        Usermodal.aggregate([
          {
            $match: {
              username,
            },
          },
          {
            $graphLookup: {
              from: "users",
              startWith: "$username",
              connectFromField: "username",
              connectToField: "refferalBy",
              as: "referBY",
            },
          },
          {
            $project: {
              referBYCount: { $size: "$referBY" },
              mystack: 1,
              teamtotalstack: 1,
            },
          },
        ]),
        Usermodal.aggregate([
          {
            $match: {
              username,
            },
          },
          {
            $lookup: {
              from: "stakings",
              localField: "_id",
              foreignField: "userId",
              as: "amount2",
            },
          },
          {
            $lookup: {
              from: "stakingbonus",
              localField: "_id",
              foreignField: "userId",
              as: "amount3",
            },
          },
          {
            $lookup: {
              from: "communities",
              localField: "_id",
              foreignField: "userId",
              as: "amount32",
            },
          },
          {
            $lookup: {
              from: "passives",
              localField: "_id",
              foreignField: "userId",
              as: "passives",
            },
          },
          {
            $lookup: {
              from: "achivements",
              localField: "_id",
              foreignField: "userId",
              as: "achivements",
            },
          },
          {
            $project: {
              StakingBonusIncome: {
                $reduce: {
                  input: "$amount3",
                  initialValue: 0,
                  in: {
                    $add: [
                      "$$value",
                      {
                        $cond: {
                          if: {
                            $eq: [
                              "$$this.Note",
                              "You Got Staking Bonus Income.",
                            ],
                          },
                          then: "$$this.Amount",
                          else: 0,
                        },
                      },
                    ],
                  },
                },
              },
              ReferandEarn: {
                $reduce: {
                  input: "$amount3",
                  initialValue: 0,
                  in: {
                    $add: [
                      "$$value",
                      {
                        $cond: {
                          if: {
                            $eq: [
                              { $substr: ["$$this.Note", 0, 29] },
                              "You Got Refer and Earn Income",
                            ],
                          },
                          then: "$$this.Amount",
                          else: 0,
                        },
                      },
                    ],
                  },
                },
              },
              communities: {
                $reduce: {
                  input: "$amount32",
                  initialValue: 0,
                  in: {
                    $add: [
                      "$$value",
                      {
                        $cond: {
                          if: {
                            $eq: [
                              { $substr: ["$$this.Note", 0, 13] },
                              "You Got Level",
                            ],
                          },
                          then: "$$this.Amount",
                          else: 0,
                        },
                      },
                    ],
                  },
                },
              },
              passives: {
                $reduce: {
                  input: "$passives",
                  initialValue: 0,
                  in: {
                    $add: [
                      "$$value",
                      {
                        $cond: {
                          if: {
                            $eq: [
                              { $substr: ["$$this.Note", 0, 57] },
                              "Infinity.AI Token WILL BE CREDITED IN PASSIVE CLUB WALLET",
                            ],
                          },
                          then: "$$this.Amount",
                          else: 0,
                        },
                      },
                    ],
                  },
                },
              },
              achivements: {
                $reduce: {
                  input: "$achivements",
                  initialValue: 0,
                  in: {
                    $add: ["$$value", "$$this.Amount"],
                  },
                },
              },
            },
          },
        ]),
        findAllRecord(V4Xpricemodal, {}),
      ]);
      let data1234 = await Usermodal.aggregate([{
        $match: {
          username,
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
        $match: {
          amount: {
            $ne: [],
          },
        },
      },
      {
        $project: {
          amount2: 1,
        },
      },
      ])
      var todayStackAmount = data1234[0].amount2.filter((a) => {
        const currentDate = new Date();
        const istTime = new Date(currentDate.getTime());
        const currentDate1 = new Date(a.createdAt);
        const istTime1 = new Date(currentDate1.getTime());
        return istTime === istTime1;
      });
      var innerAmountSum = todayStackAmount.reduce((sum, a) => sum + a.Amount, 0);
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      const todayStakingData1 = await Stakingbonus.aggregate([{
        $match: {
          createdAt: {
            $gte: startOfToday,
            $lt: endOfToday
          }
        }
      }, {
        $group: {
          _id: null,
          totalAmount: { $sum: "$Amount" } // Assuming "amount" is the field you want to sum
        }
      }])
      const todaypassives = await Passivesmodal.aggregate([{
        $match: {
          createdAt: {
            $gte: startOfToday,
            $lt: endOfToday
          }
        }
      }, {
        $group: {
          _id: null,
          totalAmount: { $sum: "$Amount" } // Assuming "amount" is the field you want to sum
        }
      }])
      const todayCommunitymodal = await Communitymodal.aggregate([{
        $match: {
          createdAt: {
            $gte: startOfToday,
            $lt: endOfToday
          }
        }
      }, {
        $group: {
          _id: null,
          totalAmount: { $sum: "$Amount" } // Assuming "amount" is the field you want to sum
        }
      }])
      const todayAchivementsmodal = await Achivementsmodal.aggregate([{
        $match: {
          createdAt: {
            $gte: startOfToday,
            $lt: endOfToday
          }
        }
      }, {
        $group: {
          _id: null,
          totalAmount: { $sum: "$Amount" } // Assuming "amount" is the field you want to sum
        }
      }])
      const todayReff = await Stakingbonus.aggregate([{
        $match: {
          createdAt: {
            $gte: startOfToday,
            $lt: endOfToday
          },
          $or: [
            { ReffId: { $exists: false } }, // Match documents where ReffId doesn't exist
            { ReffId: "" } // Match documents where ReffId is an empty string
          ]
        }
      }, {
        $group: {
          _id: null,
          totalAmount: { $sum: "$Amount" } // Assuming "amount" is the field you want to sum
        }
      }])
      return successResponse(res, {
        message: "Wallet data retrieved successfully",
        data: WalletData,
        profile: userData,
        todayStakingData1: todayStakingData1,
        todaypassives: todaypassives,
        todayReff: todayReff,
        todayAchivementsmodal: todayAchivementsmodal,
        todayCommunitymodal: todayCommunitymodal,
        activedate: stakingData.length > 0 ? stakingData[0]?.createdAt : null,
        lockeddate:
          stakingData.length > 0
            ? new Date(
              new Date(stakingData[0]?.createdAt).setMonth(
                new Date(stakingData[0].createdAt).getMonth() + 42
              )
            ).toDateString()
            : null,
        mystack: aggregatedUserData[0].total,
        lockamount: aggregatedUserData[0].total2,
        teamtotalstack: aggregatedUserData[0].total1,
        todayStackAmount: innerAmountSum,
        aggregatedUserData: aggregatedUserData[0],
        ReffData: data[0].referBYCount,
        ReffData1: data1,
        income: data123,
        V4Xtokenprice: v4xTokenPrice[0].price,
      });
    } catch (error) {
      return errorResponse(error, res);
    }
  },
  getstackbouns: async (req, res) => {
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
          const StakingData = await Stakingbonus.aggregate([
            {
              $match: {
                userId: ObjectId(decoded.profile._id),
              },
            },
            {
              $project: {
                rewordId: 0,
                updatedAt: 0,
                V4xTokenPrice: 0,
                ReffId: 0,
                __v: 0,
              },
            },
          ]).sort({ createdAt: 1 });
          return successResponse(res, {
            message: "staking data get successfully",
            data: StakingData,
            profile: decoded.profile,
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
  Transfercoin: async (req, res) => {
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
          let data = await findOneRecord(Walletmodal, {
            userId: decoded.profile._id,
          });
          if (req.body.Amount > 0) {
            let data1 = await otp.find({
              userId: decoded.profile._id,
              otp: Number(req.body.otp),
            });
            if (data1.length !== 0) {
              await otp.remove({
                userId: decoded.profile._id,
              });
              if (req.body.Wallet === "Main Wallet") {
                if (data.mainWallet >= req.body.Amount) {
                  let amount = Number(data.mainWallet - req.body.Amount);

                  if (req.body.Username !== "") {
                    let abc = await Usermodal.find({
                      username: req.body.Username,
                    });
                    console.log(abc);
                    let tdata = {
                      userId: decoded.profile._id,
                      tranforWallet: req.body.Wallet,
                      fromaccountusername: abc[0]._id,
                      Amount: Number(req.body.Amount),
                    };
                    await Transactionmodal(tdata).save();
                    await updateRecord(
                      Walletmodal,
                      {
                        userId: decoded.profile._id,
                      },
                      {
                        mainWallet: amount,
                      }
                    ).then(async (res) => {
                      await Mainwallatesc({
                        userId: decoded.profile._id,
                        Note: `You Transfer coin from ${abc[0].username}`,
                        Amount: req.body.Amount,
                        balace: res?.mainWallet,
                        type: 0,
                        Active: true,
                      }).save();
                    });
                    await updateRecord(
                      Walletmodal,
                      {
                        userId: abc[0]._id,
                      },
                      { $inc: { v4xWallet: req.body.Amount } }
                    ).then(async (res) => {
                      await Ewallateesc({
                        userId: abc[0]._id,
                        Note: `coin received from ${decoded.profile.username}`,
                        Amount: req.body.Amount,
                        balace: res.v4xWallet,
                        type: 1,
                        Active: true,
                      }).save();
                    });
                    return successResponse(res, {
                      message: "transactions have been sent successfully",
                    });
                  }
                } else {
                  return validarionerrorResponse(res, {
                    message:
                      "please check your mian wallet balance do not have infoe amount to Transfer!",
                  });
                }
              } else {
                if (data.v4xWallet >= req.body.Amount) {
                  let amount = Number(data.v4xWallet - req.body.Amount);

                  if (req.body.Username !== "") {
                    let abc = await Usermodal.find({
                      username: req.body.Username,
                    });
                    console.log(abc);
                    let tdata = {
                      userId: decoded.profile._id,
                      tranforWallet: req.body.Wallet,
                      fromaccountusername: abc[0]._id,
                      Amount: Number(req.body.Amount),
                    };
                    await Transactionmodal(tdata).save();
                    await updateRecord(
                      Walletmodal,
                      {
                        userId: decoded.profile._id,
                      },
                      {
                        v4xWallet: amount,
                      }
                    ).then(async (res) => {
                      await Ewallateesc({
                        userId: decoded.profile._id,
                        Note: `You Transfer coin from ${abc[0].username}`,
                        Amount: req.body.Amount,
                        balace: res?.v4xWallet,
                        type: 0,
                        Active: true,
                      }).save();
                    });
                    await updateRecord(
                      Walletmodal,
                      {
                        userId: abc[0]._id,
                      },
                      { $inc: { v4xWallet: req.body.Amount } }
                    ).then(async (res) => {
                      await Ewallateesc({
                        userId: abc[0]._id,
                        Note: `coin received from ${decoded.profile.username}`,
                        Amount: req.body.Amount,
                        balace: res.v4xWallet,
                        type: 1,
                        Active: true,
                      }).save();
                    });
                    return successResponse(res, {
                      message: "transactions have been sent successfully",
                    });
                  }
                } else {
                  return validarionerrorResponse(res, {
                    message:
                      "please check your mian wallet balance do not have infoe amount to Transfer!",
                  });
                }
                // if (data.v4xWallet >= req.body.Amount) {
                //   let amount = Number(data.v4xWallet - req.body.Amount);
                //   let tdata = {
                //     userId: new ObjectId(decoded.profile._id),
                //     tranforWallet: req.body.Wallet,
                //     fromaccountusername: new ObjectId(req.body.Username),
                //     Amount: Number(req.body.Amount),
                //   };

                //   if (req.body.Username1 !== "") {
                //     // E-waallate
                //     // await Mainwallatesc({
                //     //   userId: decoded.profile._id,
                //     //   Note: `Transfer coins from ${decoded.profile.username}`,
                //     //   Amount: req.body.Amount,
                //     //   type: 0,
                //     //   Active: true,
                //     // }).save();

                //     let abc = await Usermodal.find({
                //       username: req.body.Username1,
                //     });
                //     await Transactionmodal(tdata).save();

                //     await updateRecord(
                //       Walletmodal,
                //       {
                //         userId: decoded.profile._id,
                //       },
                //       {
                //         v4xWallet: amount,
                //       }
                //     ).then(async (res) => {
                //       await Ewallateesc({
                //         userId: decoded.profile._id,
                //         Note: `You Transfer coin from ${abc[0].username}`,
                //         Amount: req.body.Amount,
                //         balace: res?.v4xWallet,
                //         type: 0,
                //         Active: true,
                //       }).save();
                //     });
                //     await updateRecord(
                //       Walletmodal,
                //       {
                //         userId: abc[0]._id,
                //       },
                //       { $inc: { v4xWallet: req.body.Amount } }
                //     ).then(async (res) => {
                //       await Ewallateesc({
                //         userId: abc[0]._id,
                //         Note: `You Received Coins from ${decoded.profile.username}`,
                //         Amount: req.body.Amount,
                //         balace: res?.v4xWallet,
                //         type: 1,
                //         Active: true,
                //       }).save();
                //     });
                //     return successResponse(res, {
                //       message: "transactions have been sent successfully",
                //     });
                //   }
                // } else {
                //   return validarionerrorResponse(res, {
                //     message:
                //       "please check your Infinity.AI wallet balance do not have infoe amount to Transfer!",
                //   });
                // }
              }
            } else {
              await otp.remove({
                userId: decoded.profile._id,
              });
              return notFoundResponse(res, {
                message: "Transaction failed",
              });
            }
          } else {
            return badRequestResponse(res, {
              message: "plase enter valid amount.",
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
  getCommunityincome: async (req, res) => {
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
          let data = await findAllRecord(Communitymodal, {
            userId: decoded.profile._id,
          });
          return successResponse(res, {
            message: "Community Building Programe Income get successfully",
            data: data,
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
  getTransfercoinasync: async (req, res) => {
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
          const ReffData = await findAllRecord(Usermodal, {
            _id: decoded.profile._id,
          });
          let data = await Transactionmodal.aggregate([
            {
              $match: {
                userId: ReffData[0]._id,
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "fromaccountusername",
                foreignField: "_id",
                as: "username",
              },
            },
            {
              $project: {
                tranforWallet: 1,
                Amount: 1,
                "username.username": 1,
                createdAt: 1,
              },
            },
          ]);

          let reciveddata = await Transactionmodal.aggregate([
            {
              $match: {
                fromaccountusername: ReffData[0]._id,
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "username",
              },
            },
            {
              $project: {
                tranforWallet: 1,
                Amount: 1,
                "username.username": 1,
                createdAt: 1,
              },
            },
          ]);
          console.log("reciveddata", reciveddata);
          return successResponse(res, {
            message: "Transfer data get successfully",
            data: data,
            reciveddata: reciveddata,
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
  getAchievementincome: async (req, res) => {
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
          let data = await findAllRecord(Achivementmodal, {
            userId: decoded.profile._id,
          });
          return successResponse(res, {
            message: "Achievement Income get successfully",
            data: data,
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
  gePassiveincome: async (req, res) => {
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
          let data = await findAllRecord(Passivemodal, {
            userId: decoded.profile._id,
          });
          return successResponse(res, {
            message: "Achievement Income get successfully",
            data: data,
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
  indaireactteam: async (req, res) => {
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
          let data = await Usermodal.aggregate([
            {
              $match: {
                refferalBy: decoded.profile.username,
              },
            },
            {
              $project: {
                referredUser: 0,
                password: 0,
                _id: 0,
                userId: 0,
                AirdroppedActive: 0,
                isActive: 0,
                teamtotalstack: 0,
                refferalId: 0,
                iswalletActive: 0,
                leval: 0,
                note: 0,
                isValid: 0,
                updatedAt: 0,
                __v: 0,
                referredUser: 0,
                Airdropped: 0,
              },
            },
          ]);
          return successResponse(res, {
            message: "wallet data get successfully",
            ReffData: data,
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
  daireactteam: async (req, res) => {
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
          let data = await Usermodal.aggregate([
            {
              $match: {
                username: decoded.profile.username,
              },
            },
            {
              $graphLookup: {
                from: "users",
                startWith: "$username",
                connectFromField: "username",
                connectToField: "refferalBy",
                as: "referBY",
              },
            },
            {
              $project: {
                referredUser: 0,
                walletaddress: 0,
                password: 0,
                isActive: 0,
                isValid: 0,
                "referBY.password": 0,
                "referBY._id": 0,
                "referBY.userId": 0,
                "referBY.referredUser": 0,
                "referBY.AirdroppedActive": 0,
                "referBY.teamtotalstack": 0,
                "referBY.refferalId": 0,
                "referBY.iswalletActive": 0,
                "referBY.isValid": 0,
                "referBY.isActive": 0,
                "referBY.leval": 0,
                "referBY.note": 0,
                "referBY.updatedAt": 0,
                createdAt: 0,
                updatedAt: 0,
                __v: 0,
                email: 0,
                referredUser: 0,
                AirdroppedActive: 0,
                Airdropped: 0,
              },
            },
          ]);
          return successResponse(res, {
            message: "wallet data get successfully",
            ReffData: data,
          });
        }
      } else {
        return badRequestResponse(res, {
          message: "No token provided!",
        });
      }
    } catch (error) {
      return errorResponse(error, res);
    }
  },
  allincome: async (req, res) => {
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
          const StakingData = await findOneRecord(Usermodal, {
            username: decoded.profile.username,
          });
          let data1 = await Communitymodal.aggregate([
            {
              $match: {
                userId: StakingData._id,
              },
            },
          ]);
          let data2 = await Achivementmodal.aggregate([
            {
              $match: {
                userId: StakingData._id,
              },
            },
          ]);
          let data3 = await Passivemodal.aggregate([
            {
              $match: {
                userId: StakingData._id,
              },
            },
          ]);
          let data4 = await Passivemodal.aggregate([
            {
              $match: {
                userId: StakingData._id,
              },
            },
          ]);
          const data = data1.concat(data2, data3, data4);
          return successResponse(res, {
            message: "wallet data get successfully",
            data: data,
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
  userallincome: async (req, res) => {
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
          const StakingData = await findOneRecord(Usermodal, {
            username: decoded.profile.username,
          });
          let data1 = await Communitymodal.find({});
          let data2 = await Achivementmodal.find({});
          let data3 = await Passivemodal.find({});
          let data4 = await Passivemodal.find({});
          const data = data1.concat(data2, data3, data4);
          return successResponse(res, {
            message: "wallet data get successfully",
            data: data,
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
  livaprice: async (req, res) => {
    try {
      const price = await findAllRecord(V4Xpricemodal, {});
      return successResponse(res, {
        message: "wallet data get successfully",
        data: price,
      });
    } catch (error) {
      return badRequestResponse(res, {
        message: "error.",
      });
    }
  },
};
