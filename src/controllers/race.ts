// Require Dependencies
import Race from '../common/models/Race.js';
import RaceEntry from '../common/models/RaceEntry.js';
import User from '../common/models/User.js';
import Usero from '../common/models/Usero.js';

import { getVipLevelFromWager } from './vip.js';

// Enter an active race (if there is currently one active)
async function checkAndEnterRace(userId: string, amount: number): Promise<void> {
  return new Promise<void>(async (resolve, reject) => {
    try {
      // Get active race
      const activeRace = await Race.findOne({ active: true });

      // If there is an active race
      if (activeRace) {
        // Find the user in the fakeUsers array
        const users = await Usero.findOne({ _id: userId });

        if (users) {
          // If user is not in the fakeUsers array, query the database
          const user = await Usero.findOne({ _id: userId });

          if (!user || user.rank > 1) {
            // If user doesn't exist or isn't allowed to participate
            // Resolve to successfully continue
            return resolve();
          }

          const existingEntry = await RaceEntry.findOne({
            _user: userId,
            _race: activeRace.id,
          });

          if (existingEntry) {
            await RaceEntry.updateOne(
              { _id: existingEntry.id },
              {
                $inc: { value: amount },
                $set: {
                  user_level: getVipLevelFromWager(user.wager).name,
                  user_levelColor: getVipLevelFromWager(user.wager).levelColor,
                  username: user.username,
                  avatar: user.avatar,
                },
              }
            );
          } else {
            const newEntry = new RaceEntry({
              value: amount,
              _user: userId,
              user_level: getVipLevelFromWager(user.wager).name,
              user_levelColor: getVipLevelFromWager(user.wager).levelColor,
              _race: activeRace.id,
              username: user.username,
              avatar: user.avatar,
            });

            await newEntry.save();
          }
        } else {
          // If user is not in the fakeUsers array, query the database
          const user = await User.findOne({ _id: userId });

          if (!user || user.rank > 1) {
            // If user doesn't exist or isn't allowed to participate
            // Resolve to successfully continue
            return resolve();
          }

          const existingEntry = await RaceEntry.findOne({
            _user: userId,
            _race: activeRace.id,
          });

          if (existingEntry) {
            await RaceEntry.updateOne(
              { _id: existingEntry.id },
              {
                $inc: { value: amount },
                $set: {
                  user_level: getVipLevelFromWager(user.wager).name,
                  user_levelColor: getVipLevelFromWager(user.wager).levelColor,
                  username: user.username,
                  avatar: user.avatar,
                },
              }
            );
          } else {
            const newEntry = new RaceEntry({
              value: amount,
              _user: userId,
              user_level: getVipLevelFromWager(user.wager).name,
              user_levelColor: getVipLevelFromWager(user.wager).levelColor,
              _race: activeRace.id,
              username: user.username,
              avatar: user.avatar,
            });

            await newEntry.save();
          }
        }

        // Resolve to successfully continue
        resolve();
      } else {
        // If there is no active race
        // Resolve to successfully continue
        resolve();
      }
    } catch (error) {
      reject(error);
    }
  });
}

// Increment active race prize by rake% (if there is currently one active)
async function checkAndApplyRakeToRace(rakeValue: number) {
  return new Promise<void>(async (resolve, reject) => {
    try {
      // Get active race
      const activeRace = await Race.findOne({ active: true });

      // If there is an active race
      if (activeRace) {
        // Update and increment race prize | here was something changed from the original
        await Race.updateOne({ _id: activeRace.id }, { $inc: { prize: 0 } });
        // Resolve to successfully continue
        resolve();
      } else {
        // Resolve to successfully continue
        resolve();
      }
    } catch (error) {
      reject(error);
    }
  });
}

// Export functions
export { checkAndEnterRace, checkAndApplyRakeToRace };
