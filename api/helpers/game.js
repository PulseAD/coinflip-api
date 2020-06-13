class Game {
  constructor(session) {
    this.session = session;
    this.hasWon = null;
    this.lp = null;
    this.MASTER = 25;
    this.GRANDMASTER = 26;
    this.CHALLENGER = 27;
    this.lpNeededForGrandMaster = 350;
    this.lpNeededForChallenger = 700;
    this.message = "";
    this.miniSeriesJustGranted = false;
  }

  setGrandMasterLp(lp) {
    this.lpNeededForGrandMaster = lp;
  }

  setChallengerLp(lp) {
    this.lpNeededForChallenger = lp;
  }

  start() {
    this.hasWon = this.generateGameResult();
    this.lp = this.generateLpNumber();
    this.applyRankChanges();
    this.session.lastGame = new Date();
  }

  generateGameResult() {
    const winrate = this.determineWinrate();
    console.log(winrate)
    const randomNb = Math.floor(Math.random() * 100) + 1;
    return randomNb <= winrate;
  }

  getInitialWinrate() {
    if (this.session.currentRank.orderedRank < 25) {
      return 52;
    }
    return 50;
  }

  determineWinrate() {
    const rankDifference = this.session.maxRank.orderedRank - this.session.currentRank.orderedRank;
    return this.getInitialWinrate() + (rankDifference * 2); 
  }

  generateLpNumber() {
    return Math.floor(Math.random() * 6) + 18;
  }

  applyRankChanges() {
    if (this.hasWon) {
      this.handleVictory();
      return;
    }
    this.handleDefeat();
  }

  handleVictory() {
    this.message = "victory";
    this.session.winNumber++;
    this.increaseLeaguePoints();
    this.handleWinInEventualMiniSeries();
    this.session.messageHistory.unshift({
      message: this.message,
      lp: this.lp,
      date: new Date()
    });
    if (this.session.messageHistory.length > 50) {
      this.session.messageHistory.pop();
    }
  }

  increaseLeaguePoints() {
    const rank = this.session.currentRank;
    rank.leaguePoints += this.lp;
    this.session.score += this.lp;
    if (rank.orderedRank >= this.MASTER) {
      this.verifyMasterPlusPromotion();
      return;
    }
    if (rank.leaguePoints > 100 && !rank.miniSeries.target) {
      const difference = rank.leaguePoints - 100;
      this.lp -= difference;
      rank.leaguePoints = 100;
    }
    if (rank.leaguePoints === 100 && !rank.miniSeries.target) {
      this.grantMiniSeries();
    }
  }

  verifyMasterPlusPromotion() {
    const rank = this.session.currentRank;
    if (rank.orderedRank === this.MASTER) {
      if (rank.leaguePoints >= this.lpNeededForGrandMaster) {
        this.promote();
      }
      return;
    }
    if (rank.orderedRank === this.GRANDMASTER) {
      if (rank.leaguePoints >= this.lpNeededForChallenger) {
        this.promote();
      }
    }
  }

  grantMiniSeries() {
    const rank = this.session.currentRank;
    this.message = "new_miniseries";
    this.miniSeriesJustGranted = true;
    if (rank.rank === "I") {
      rank.miniSeries = {
        target: 3,
        wins: 0,
        losses: 0,
        progress: "NNNNN"
      };
      return;
    }
    rank.miniSeries = {
      target: 2,
      wins: 0,
      losses: 0,
      progress: "NNN"
    };
  }

  handleWinInEventualMiniSeries() {
    const miniSeries = this.session.currentRank.miniSeries;
    if (!miniSeries || !miniSeries.target || this.miniSeriesJustGranted) {
      return;
    }
    miniSeries.wins++;
    miniSeries.progress = miniSeries.progress.replace("N", "W");
    this.message = "miniseries_victory";
    if (miniSeries.target === miniSeries.wins) {
      this.promote();
    }
  }

  promote() {
    const rank = this.session.currentRank;
    rank.orderedRank++;
    this.setRankTierfromOrderedRank();
    rank.demoteProtection = 2;
    rank.miniSeries = null;
    this.message = "promote";
    this.handleMaxRank();
    if (rank.orderedRank > 25) {
      return;
    }
    rank.leaguePoints = 0;
  }

  setRankTierfromOrderedRank() {
    const rank = this.session.currentRank;
    rank.rank = this.getRankFromOrderedRank(rank.orderedRank);
    rank.tier = this.getTierFromOrderedRank(rank.orderedRank);
  }

  getTierFromOrderedRank(orderedRank) {
    if (orderedRank === 27) {
      return "CHALLENGER";
    }
    if (orderedRank === 26) {
      return "GRANDMASTER";
    }
    if (orderedRank === 25) {
      return "MASTER";
    }
    if (orderedRank - 20 > 0) {
      return "DIAMOND";
    }
    if (orderedRank - 16 > 0) {
      return "PLATINUM";
    }
    if (orderedRank - 12 > 0) {
      return "GOLD";
    }
    if (orderedRank - 8 > 0) {
      return "SILVER";
    }
    if (orderedRank - 4 > 0) {
      return "BRONZE";
    }
    return "IRON";
  }

  getRankFromOrderedRank(orderedRank) {
    if ([25, 26, 27].includes(orderedRank)) {
      return "I";
    }
    if (orderedRank % 4 === 0) {
      return "I";
    }
    if (orderedRank % 4 === 3) {
      return "II";
    }
    if (orderedRank % 4 === 2) {
      return "III"
    }
    if (orderedRank % 4 === 1) {
      return "IV";
    }
  }

  handleMaxRank() {
    if (this.session.currentRank.orderedRank <= this.session.maxRank.orderedRank) {
      return;
    }
    this.session.maxRank.tier = this.session.currentRank.tier;
    this.session.maxRank.rank = this.session.currentRank.rank;
    this.session.maxRank.orderedRank = this.session.currentRank.orderedRank;
  }

  handleDefeat() {
    this.message = "defeat";
    this.session.looseNumber++;
    this.decreaseLeaguePoints();
    this.handleDefeatInEventualMiniSeries();
    this.session.messageHistory.unshift({
      message: this.message,
      lp: -this.lp,
      date: new Date()
    });
    if (this.session.messageHistory.length > 50) {
      this.session.messageHistory.pop();
    }
  }

  decreaseLeaguePoints() {
    const rank = this.session.currentRank;
    const oldLp = rank.leaguePoints;
    rank.leaguePoints -= this.lp;
    this.session.score -= this.lp;
    if (rank.orderedRank >= this.GRANDMASTER) {
      this.verifyGrandMasterPlusDemotion();
      return;
    }
    if (rank.leaguePoints < 0) {
      const difference = 0 - rank.leaguePoints;
      this.lp -= difference;
      rank.leaguePoints = 0;
    }
    if (oldLp === 0) {
      this.handleDemoteProcess();
    }
  }

  verifyGrandMasterPlusDemotion() {
    const rank = this.session.currentRank;
    if (rank.orderedRank === this.GRANDMASTER) {
      if (rank.leaguePoints < this.lpNeededForGrandMaster) {
        this.demote();
      }
      return;
    }
    if (rank.orderedRank === this.CHALLENGER) {
      if (rank.leaguePoints < this.lpNeededForChallenger) {
        this.demote();
      }
    }
  }

  handleDemoteProcess() {
    if (this.session.currentRank.demoteProtection === 0) {
      this.demote();
      return;
    } 
    this.session.currentRank.demoteProtection--;
  }

  demote() {
    const rank = this.session.currentRank;
    if (rank.orderedRank === 1) {
      return;
    }
    rank.orderedRank--;
    this.setRankTierfromOrderedRank();
    rank.demoteProtection = 2;
    rank.miniSeries = null;
    this.message = "demote";
    if (rank.orderedRank > 24) {
      return;
    }
    rank.leaguePoints = 75;
  }

  handleDefeatInEventualMiniSeries() {
    const miniSeries = this.session.currentRank.miniSeries;
    if (!miniSeries || !miniSeries.target) {
      return;
    }
    miniSeries.losses++;
    miniSeries.progress = miniSeries.progress.replace("N", "L");
    this.message = "miniseries_defeat";
    if (miniSeries.target === miniSeries.losses) {
      this.endMiniSeries();
    }
  }

  endMiniSeries() {
    this.message = "miniseries_failed";
    this.session.currentRank.miniSeries = null;
  }
}

module.exports = Game;
