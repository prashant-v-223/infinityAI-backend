require("dotenv").config();
require("./config/db");
const express = require("express");
const cors = require("cors");
const schedule = require("node-schedule");
const app = express();
app.use(cors());
const routes = require("./routes/index");
const Usermodal = require("./models/user");
const Stakingmodal = require("./models/Staking");
const {
  findAllRecord,
  updateRecord,
  findOneRecord,
} = require("./library/commonQueries");
const Walletmodal = require("./models/Wallet");
const Stakingbonus = require("./models/Stakingbonus");
const Mainwallatesc = require("./models/Mainwallate");
const Achivement = require("./models/Achivement");
const { ObjectId } = require("mongodb");
const Passive = require("./models/Passive");

app.use(
  express.json({
    limit: "100024mb",
  })
);
app.use(
  express.urlencoded({
    limit: "100024mb",
    extended: true,
  })
);
app.use("/api", routes);
const every24hours = "01 24 * * *";
schedule.scheduleJob(every24hours, async () => {
  try {
    const stakingRecords = await findAllRecord(Stakingmodal);
    for (const record of stakingRecords) {
      if (record) {
        const elapsedTimeInDays = await Stakingbonus.aggregate([
          {
            $match: {
              rewordId: ObjectId(record._id),
              Note: "You Got Staking Bonus Income.",
            },
          },
        ]);
        if (elapsedTimeInDays.length < 730) {
          const updatedWallet = await updateRecord(
            Walletmodal,
            { userId: record.userId },
            { $inc: { mainWallet: record.DailyReword } }
          );

          if (updatedWallet) {
            await Promise.all([
              Mainwallatesc({
                userId: record.userId,
                Note: "You Got Staking Bonus Income.",
                Amount: record.DailyReword,
                type: 1,
                balace: updatedWallet.mainWallet,
                Active: true,
              }).save(),
              Stakingbonus({
                userId: record.userId,
                rewordId: record._id,
                Amount: record.DailyReword,
                Note: "You Got Staking Bonus Income.",
                Active: true,
              }).save(),
              updateRecord(
                Stakingmodal,
                { _id: record._id },
                {
                  TotalRewordRecived:
                    record.TotalRewordRecived - record.DailyReword,
                  TotaldaysTosendReword: record.TotaldaysTosendReword - 1,
                  $inc: { Totalsend: 1 },
                }
              ),
            ]);
          }
        } else {
          await Promise.all([
            Stakingbonus({
              userId: record.userId,
              rewordId: record._id,
              Amount: 0,
              Note: "Your staking plan period is completed. You have received your bonus as per the return.",
              Active: false,
            }).save(),
            updateRecord(
              Stakingmodal,
              { userId: record.userId },
              {
                Active: false,
              }
            ),
          ]);
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
});
const updateRank = async (user, newRank, rewardAmount, teamtotalstack) => {
  console.log("user", user);
  let data = await findOneRecord(Usermodal, {
    _id: user._id,
    Rank: user.Rank,
    teamtotalstack: { $gt: teamtotalstack },
  });
  console.log("data", data);
  await updateRecord(
    Usermodal,
    {
      _id: user._id,
      Rank: user.Rank,
      teamtotalstack: { $gt: teamtotalstack },
    },
    { Rank: newRank }
  );

  const da = await findAllRecord(Usermodal, {
    _id: user._id,
    Rank: newRank,
  });

  if (da.length > 0) {
    let data = {
      userId: user._id,
      Note: `${rewardAmount} USDT Token WILL BE CREDITED IN ACHEIVER WALLET`,
      Amount: rewardAmount,
    };

    await updateRecord(
      Walletmodal,
      {
        userId: user._id,
      },
      {
        $inc: {
          mainWallet: rewardAmount,
        },
      }
    ).then(async (res) => {
      await Mainwallatesc({
        userId: user._id,
        Note: `${rewardAmount} USDT Token WILL BE CREDITED IN ACHEIVER WALLET`,
        Amount: rewardAmount,
        type: 1,
        balace: res?.mainWallet,
        Active: true,
      }).save();
      await Achivement(data).save();
    });
  }
};
const every24hours1 = "25 24 * * *";
schedule.scheduleJob("*/5 * * * *", async () => {
  try {
    const Userdata = await findAllRecord(Usermodal, {});
    for (const user of Userdata) {
      await Usermodal.aggregate([
        {
          $match: {
            username:user.username,
          },
        },
      ]).then(async (res) => {
        if (res.length > 0) {
          switch (res[0]?.Rank) {
            case "DIRECT":
              const Refflevalncome = await findAllRecord(Usermodal, {
                refferalBy: res[0].username,
                Rank: { $in: ["COMMUNITY ⭐", "COMMUNITY ⭐⭐", ] },
              });
              if (Refflevalncome.length >= 4) {
                console.log(Refflevalncome);
                await updateRank(res[0], "COMMUNITY ⭐", 50, 2480);
              }
              break;
            case "COMMUNITY ⭐":
              const Refflevalncome1 = await findAllRecord(Usermodal, {
                refferalBy: res[0].username,
                Rank: { $in: ["COMMUNITY ⭐", "COMMUNITY ⭐⭐⭐", "COMMUNITY ⭐⭐"] },
              });
              if (Refflevalncome1.length >= 2) {
                await updateRank(res[0], "COMMUNITY ⭐⭐", 100, 10000);
              }
              break;
            case "COMMUNITY ⭐⭐":
              const Refflevalncome2 = await findAllRecord(Usermodal, {
                refferalBy: res[0].username,
                Rank: { $in: ["COMMUNITY ⭐⭐", "COMMUNITY ⭐⭐⭐", "COMMUNITY ⭐⭐⭐⭐"] },
              });
              if (Refflevalncome2.length >= 2) {
                await updateRank(res[0], "COMMUNITY ⭐⭐⭐", 250, 22480);
              }
              break;
            case "COMMUNITY ⭐⭐⭐":
              const Refflevalncome3 = await findAllRecord(Usermodal, {
                refferalBy: res[0].username,
                Rank: { $in: ["COMMUNITY ⭐⭐⭐", "COMMUNITY ⭐⭐⭐⭐", "COMMUNITY ⭐⭐⭐⭐⭐"] },
              });
              if (Refflevalncome3.length >= 2) {
                await updateRank(res[0], "COMMUNITY ⭐⭐⭐⭐", 500, 57480);
              }
              break;
            case "COMMUNITY ⭐⭐⭐⭐":
              const Refflevalncome4 = await findAllRecord(Usermodal, {
                refferalBy: res[0].username,
                Rank: { $in: ["COMMUNITY ⭐⭐⭐⭐", "COMMUNITY ⭐⭐⭐⭐⭐⭐", "COMMUNITY ⭐⭐⭐⭐⭐"] },
              });
              if (Refflevalncome4.length >= 2) {
                await updateRank(res[0], "COMMUNITY ⭐⭐⭐⭐⭐", 1500, 140480);
              }
              break;
            case "COMMUNITY ⭐⭐⭐⭐⭐":
              const Refflevalncome5 = await findAllRecord(Usermodal, {
                refferalBy: res[0].username,
                Rank: { $in: ["COMMUNITY ⭐⭐⭐⭐⭐⭐", "COMMUNITY ⭐⭐⭐⭐⭐⭐", "COMMUNITY ⭐⭐⭐⭐⭐"] },
              });
              if (Refflevalncome5.length >= 2) {
                await updateRank(
                  res[0],
                  "COMMUNITY ⭐⭐⭐⭐⭐⭐",
                  7500,
                  308480
                );
              }
              break;
            case "COMMUNITY ⭐⭐⭐⭐⭐⭐":
              const Refflevalncome6 = await findAllRecord(Usermodal, {
                refferalBy: res[0].username,
                Rank: { $in: ["COMMUNITY ⭐⭐⭐⭐⭐⭐", "COMMUNITY ⭐B", "COMMUNITY ⭐A"] },
              });
              if (Refflevalncome6.length >= 2) {
                await updateRank(res[0], "COMMUNITY ⭐B", 7500, 645480);
              }
              break;
            case "COMMUNITY ⭐B":
              const Refflevalncome7 = await findAllRecord(Usermodal, {
                refferalBy: res[0].username,
                Rank: { $in: ["COMMUNITY ⭐TRUST", "COMMUNITY ⭐B", "COMMUNITY ⭐A"] },
              });
              if (Refflevalncome7.length >= 2) {
                await updateRank(res[0], "COMMUNITY ⭐A", 10000, 1290980);
              }
              break;
            case "COMMUNITY ⭐A":
              const Refflevalncome8 = await findAllRecord(Usermodal, {
                refferalBy: res[0].username,
                Rank: { $in: ["COMMUNITY ⭐TRUST", "COMMUNITY ⭐A"] },
              });
              if (Refflevalncome8.length >= 2) {
                await updateRank(res[0], "COMMUNITY ⭐TRUST", 18740, 1936440);
              }
              break;
            case "COMMUNITY ⭐TRUST":
              const Refflevalncome9 = await findAllRecord(Usermodal, {
                refferalBy: res[0].username,
                Rank: { $in: ["COMMUNITY ⭐TRUST"] },
              });
              if (Refflevalncome9.length >= 2) {
                await updateRank(res[0], "CORE TEAM", 37540, 3227420);
              }
              break;
            default:
              break;
          }
        }
      });
    }
  } catch (error) {
    console.log(error);
  }
});
const getUserIncomeMultiplier = (rank) => {
  switch (rank) {
    case "COMMUNITY ⭐":
      return 9;
    case "COMMUNITY ⭐⭐":
      return 8;
    case "COMMUNITY ⭐⭐⭐":
      return 7;
    case "COMMUNITY ⭐⭐⭐⭐":
      return 6;
    case "COMMUNITY ⭐⭐⭐⭐⭐":
      return 5;
    case "COMMUNITY ⭐⭐⭐⭐⭐":
      return 4;
    case "COMMUNITY ⭐B":
      return 3;
    case "COMMUNITY ⭐A":
      return 2;
    case "COMMUNITY ⭐TRUST":
      return 1;
    default:
      return 0.5;
  }
};
schedule.scheduleJob(every24hours1, async () => {
  try {
    let data12 = await Usermodal.find({
      mystack: { $ne: 0 },
      Rank: { $ne: "DIRECT" },
    })
    for (let index = 0; index < data12.length; index++) {
      const element = await data12[index];

      // Assuming element.Rank is the rank you want to find
      const rankToFind = element.Rank;

      const rankArray = [
        { Rank: "COMMUNITY ⭐" },
        { Rank: "COMMUNITY ⭐⭐" },
        { Rank: "COMMUNITY ⭐⭐⭐" },
        { Rank: "COMMUNITY ⭐⭐⭐⭐" },
        { Rank: "COMMUNITY ⭐⭐⭐⭐⭐" },
        { Rank: "COMMUNITY ⭐⭐⭐⭐⭐" },
        { Rank: "COMMUNITY ⭐B" },
        { Rank: "COMMUNITY ⭐A" },
        { Rank: "COMMUNITY ⭐TRUST" },
      ];

      let movedObject = [];

      for (let i = 0; i < rankArray.length; i++) {
        if (rankArray[i].Rank === rankToFind) {
          foundIndex = i;
          movedObject   = rankArray.splice(i, 
            8);
          break;
        }
      }

      const restrictSearchWithMatch = {
        Rank: { $nin: movedObject.map(rankCondition => rankCondition.Rank) },
      };
      const result12 = await Usermodal.aggregate([
        {
          $match: {
            username: element.username,
          },
        },
        {
          $graphLookup: {
            from: "users",
            startWith: "$username",
            connectFromField: "username",
            connectToField: "refferalBy",
            as: "refers_to",
            restrictSearchWithMatch: restrictSearchWithMatch,
          },
        },
        {
          $lookup: {
            from: "stakings",
            localField: "refers_to._id",
            foreignField: "userId",
            as: "stackingdata",
          },
        },
        {
          $match: {
            "stackingdata.amount": { $ne: [] },
            "stackingdata.at": { $ne: [] },
          },
        },
        {
          $project: {
            refers_to: 1,
            stackingdata: {
              $filter: {
                input: "$stackingdata",
                as: "d",
                cond: {
                  $gte: ["$$d.Active", true],
                },
              },
            },
            result: "$Rank",
            username: 1,
            Rank: 1,
            level: 1,
          },
        },
      ]);
      console.log("result12[0].refers_to======>",result12[0].refers_to);
      console.log("result12[0].refers_to======>",result12[0].refers_to.length);
      if (result12.length > 0) {
        let result = await result12[0]
        const dd = getUserIncomeMultiplier(result.Rank);
        for (const d of result.stackingdata) {
          const incomeAmount = (d.DailyReword * dd) / 100;
          if (d.Active === true) {
            const Refflevalncome = await findOneRecord(Usermodal, {
              _id: d.userId,
            });
            const data = {
              userId: result._id,
              username: `${Refflevalncome?.username} (${Refflevalncome?.Fullname})`,
              Note: `Infinity.AI Token WILL BE CREDITED IN PASSIVE CLUB WALLET ${Refflevalncome?.Fullname}`,
              Amount: incomeAmount,
            };
            await updateRecord(
              Walletmodal,
              { userId: result._id },
              {
                $inc: {
                  mainWallet: incomeAmount,
                },
              }
            ).then(async (res1) => {
              await Mainwallatesc({
                userId: result._id,
                Note: `Infinity.AI Token WILL BE CREDITED IN PASSIVE CLUB WALLET ${Refflevalncome?.Fullname} (${Refflevalncome?.username})`,
                Amount: incomeAmount,
                type: 1,
                balace: res1?.mainWallet,
                Active: true,
              }).save();
            });
            await Passive(data).save();
          }
        }
      }
    }

  } catch (error) {
    console.log(error);
  }
});
schedule.scheduleJob("*/5 * * * *", async () => {
  try {
    const Userdata = await findAllRecord(Usermodal, {});
    for (const user of Userdata) {
      const { _id: userId, username } = user;
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
            email: 1,
            username: 1,
            level: 4,
          },
        },
      ]).then(async (aggregatedUserData) => {
        if (aggregatedUserData.length > 0) {
          await Usermodal.findOneAndUpdate(
            { _id: ObjectId(userId) },
            {
              teamtotalstack: aggregatedUserData[0].total1,
              mystack: aggregatedUserData[0].total,
              lockamount: aggregatedUserData[0].total2,
            }
          );
        }
      });
    }
  } catch (error) {
    console.log(error);
  }
});
schedule.scheduleJob(every24hours, async () => {
  try {
    const Userdata = await findAllRecord(Usermodal, {});
    for (const user of Userdata) {
      if (user.isValid !== true) {
        await Usermodal.findByIdAndDelete({ _id: user._id });
      }
    }
  } catch (error) {
    console.log(error);
  }
});
const maxTimeDifference = 5 * 60 * 1000;
app.get("/", async (req, res) => {
  console.log("Transaction is valid within 5 minutes.");
});
const LOCALPORT = process.env.PORT || 8080;

app.listen(LOCALPORT, () => {
  console.log(`http://localhost:${LOCALPORT} is listening...`);
});
