const tierToNumber = {
  IRON: 0,
  BRONZE: 4,
  SILVER: 8,
  GOLD: 12,
  PLATINUM: 16,
  DIAMOND: 20,
};

const rankToNumber = {
  IV: 1,
  III: 2,
  II: 3,
  I: 4,
};

const getOrderedRank = (tier, rank) => {
  if (tier === "MASTER") {
    return 25;
  }
  if (tier === "GRANDMASTER") {
    return 26;
  }
  if (tier === "CHALLENGER") {
    return 27;
  }
  return tierToNumber[tier] + rankToNumber[rank];
};

module.exports = getOrderedRank;
