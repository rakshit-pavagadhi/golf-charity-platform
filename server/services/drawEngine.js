const Score = require('../models/Score');
const User = require('../models/User');

class DrawEngine {
  /**
   * Generate winning numbers using random method
   * @returns {number[]} Array of 5 unique random numbers (1-45)
   */
  static generateRandomNumbers() {
    const numbers = new Set();
    while (numbers.size < 5) {
      numbers.add(Math.floor(Math.random() * 45) + 1);
    }
    return Array.from(numbers).sort((a, b) => a - b);
  }

  /**
   * Generate winning numbers using algorithmic method
   * Weighted by frequency of user scores (least frequent have higher chance)
   * @returns {number[]} Array of 5 unique numbers (1-45)
   */
  static async generateAlgorithmicNumbers() {
    // Get all scores from active subscribers
    const activeUsers = await User.find({ subscriptionStatus: 'active' }).select('_id');
    const userIds = activeUsers.map(u => u._id);
    
    const scores = await Score.find({ user: { $in: userIds } });
    
    // Count frequency of each number
    const frequency = {};
    for (let i = 1; i <= 45; i++) frequency[i] = 0;
    scores.forEach(s => { frequency[s.value] = (frequency[s.value] || 0) + 1; });

    // Invert frequencies for weighting (less common = higher weight)
    const maxFreq = Math.max(...Object.values(frequency), 1);
    const weights = {};
    for (let i = 1; i <= 45; i++) {
      weights[i] = maxFreq - frequency[i] + 1;
    }

    // Weighted random selection
    const numbers = new Set();
    while (numbers.size < 5) {
      const totalWeight = Object.entries(weights)
        .filter(([num]) => !numbers.has(Number(num)))
        .reduce((sum, [, w]) => sum + w, 0);
      
      let random = Math.random() * totalWeight;
      for (let i = 1; i <= 45; i++) {
        if (numbers.has(i)) continue;
        random -= weights[i];
        if (random <= 0) {
          numbers.add(i);
          break;
        }
      }
    }

    return Array.from(numbers).sort((a, b) => a - b);
  }

  /**
   * Match user scores against winning numbers
   * @param {number[]} userScores - array of user's score values
   * @param {number[]} winningNumbers - array of winning numbers
   * @returns {{ matchCount: number, matchedNumbers: number[] }}
   */
  static matchScores(userScores, winningNumbers) {
    const matched = userScores.filter(s => winningNumbers.includes(s));
    return {
      matchCount: matched.length,
      matchedNumbers: matched
    };
  }

  /**
   * Calculate prize pool based on active subscribers
   * @param {number} activeSubscribers - count of active subscribers
   * @param {number} subscriptionAmount - amount per subscription (in cents)
   * @param {number} poolPercentage - percentage going to prize pool (e.g., 0.3 = 30%)
   * @returns {number} Total prize pool amount
   */
  static calculatePrizePool(activeSubscribers, subscriptionAmount = 1999, poolPercentage = 0.3) {
    return Math.round(activeSubscribers * subscriptionAmount * poolPercentage);
  }

  /**
   * Distribute prize pool across match tiers
   * 5-match: 40%, 4-match: 35%, 3-match: 25%
   * @param {number} totalPool - total prize pool
   * @param {number} jackpotCarryOver - carry over from previous draws
   * @returns {{ fiveMatch: number, fourMatch: number, threeMatch: number }}
   */
  static distributePrizePool(totalPool, jackpotCarryOver = 0) {
    return {
      fiveMatch: Math.round((totalPool * 0.4) + jackpotCarryOver), // Jackpot
      fourMatch: Math.round(totalPool * 0.35),
      threeMatch: Math.round(totalPool * 0.25)
    };
  }

  /**
   * Execute a full draw
   * @param {string} drawType - 'random' or 'algorithmic'
   * @param {number} jackpotCarryOver - carry over amount
   * @returns {Object} Draw results
   */
  static async executeDraw(drawType = 'random', jackpotCarryOver = 0) {
    // Generate winning numbers
    const winningNumbers = drawType === 'algorithmic' 
      ? await this.generateAlgorithmicNumbers()
      : this.generateRandomNumbers();

    // Get all active subscribers and their scores
    const activeUsers = await User.find({ subscriptionStatus: 'active' }).select('_id');
    const userIds = activeUsers.map(u => u._id);

    // Calculate prize pool
    const prizePool = this.calculatePrizePool(activeUsers.length);
    const distribution = this.distributePrizePool(prizePool, jackpotCarryOver);

    // Match each user's scores
    const results = { fiveMatch: [], fourMatch: [], threeMatch: [] };

    for (const userId of userIds) {
      const scores = await Score.find({ user: userId })
        .sort({ date: -1 })
        .limit(5);
      
      if (scores.length === 0) continue;

      const scoreValues = scores.map(s => s.value);
      const { matchCount, matchedNumbers } = this.matchScores(scoreValues, winningNumbers);

      if (matchCount >= 3) {
        const entry = {
          user: userId,
          matchedNumbers,
          matchCount,
          prizeAmount: 0 // Will be calculated below
        };

        if (matchCount === 5) results.fiveMatch.push(entry);
        else if (matchCount === 4) results.fourMatch.push(entry);
        else if (matchCount === 3) results.threeMatch.push(entry);
      }
    }

    // Calculate individual prizes (split equally among winners in each tier)
    const calculateShare = (pool, winners) => {
      if (winners.length === 0) return 0;
      return Math.round(pool / winners.length);
    };

    results.fiveMatch.forEach(w => {
      w.prizeAmount = calculateShare(distribution.fiveMatch, results.fiveMatch);
    });
    results.fourMatch.forEach(w => {
      w.prizeAmount = calculateShare(distribution.fourMatch, results.fourMatch);
    });
    results.threeMatch.forEach(w => {
      w.prizeAmount = calculateShare(distribution.threeMatch, results.threeMatch);
    });

    // Jackpot carries forward if no 5-match winner
    const newJackpotCarryOver = results.fiveMatch.length === 0 ? distribution.fiveMatch : 0;

    return {
      winningNumbers,
      results,
      prizePool,
      distribution,
      jackpotCarryOver: newJackpotCarryOver,
      totalWinners: results.fiveMatch.length + results.fourMatch.length + results.threeMatch.length
    };
  }
}

module.exports = DrawEngine;
