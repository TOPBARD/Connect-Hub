import User from "../../models/user.model";

export const addDefaultFollowers = async (id: string) => {
  const idsToFollow = [
    `${process.env.RJ_USERID}`,
    `${process.env.INSTAGRAM_USERID}`,
    `${process.env.SNAPCHAT_USERID}`,
    `${process.env.BOT_USERID}`,
    `${process.env.CONNECT_HUB_USERID}`,
  ];
  for (const idToFollow of idsToFollow) {
    await User.findByIdAndUpdate(idToFollow, { $push: { followers: id } });
    await User.findByIdAndUpdate(id, { $push: { following: idToFollow } });
  }
};
