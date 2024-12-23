const formatStat = (value: number) => {
  return value >= 1 ? value.toFixed(3) : value.toFixed(3).substring(1);
};

export const calculateCumulativeStat = (games: any[], stat: string) => {
  let cumulativeTotal = 0;
  return games.map((game: any, index: number) => {
    cumulativeTotal += game[stat] || 0;
    return {
      gameNumber: index + 1,
      statValue: cumulativeTotal,
    };
  });
};

export const calculateAVG = (games: any[]) => {
  let totalH = 0;
  let totalAB = 0;

  return games.map((game: any, index: number) => {
    totalH += game.H || 0;
    totalAB += game.AB || 0;

    const avg = totalAB > 0 ? totalH / totalAB : 0;
    return {
      gameNumber: index + 1,
      statValue: formatStat(avg),
    };
  });
};

export const calculateOPS = (games: any[]) => {
  let totalH = 0;
  let totalBB = 0;
  let totalHBP = 0;
  let totalSF = 0;
  let totalPA = 0;
  let totalAB = 0;
  let totalTB = 0;

  return games.map((game: any, index: number) => {
    totalH += game.H || 0;
    totalBB += game.BB || 0;
    totalHBP += game.HBP || 0;
    totalSF += game.SF || 0;
    totalPA += game.PA || 0;
    totalAB += game.AB || 0;
    totalTB += game.TB || 0;

    const obp =
      totalPA - totalSF > 0
        ? (totalH + totalBB + totalHBP) / (totalPA - totalSF)
        : 0;
    const slg = totalAB > 0 ? totalTB / totalAB : 0;
    const ops = obp + slg;

    return {
      gameNumber: index + 1,
      statValue: formatStat(ops),
    };
  });
};

// Repeat similarly for the other functions:
export const calculateOBP = (games: any[]) => {
  let totalH = 0;
  let totalBB = 0;
  let totalHBP = 0;
  let totalPA = 0;
  let totalSF = 0;

  return games.map((game: any, index: number) => {
    totalH += game.H || 0;
    totalBB += game.BB || 0;
    totalHBP += game.HBP || 0;
    totalPA += game.PA || 0;
    totalSF += game.SF || 0;

    const obp =
      totalPA - totalSF > 0
        ? (totalH + totalBB + totalHBP) / (totalPA - totalSF)
        : 0;

    return {
      gameNumber: index + 1,
      statValue: formatStat(obp),
    };
  });
};

export const calculateSLG = (games: any[]) => {
  let totalTB = 0;
  let totalAB = 0;

  return games.map((game: any, index: number) => {
    totalTB += game.TB || 0;
    totalAB += game.AB || 0;

    const slg = totalAB > 0 ? totalTB / totalAB : 0;
    return {
      gameNumber: index + 1,
      statValue: formatStat(slg),
    };
  });
};

export const calculateISO = (games: any[]) => {
  let totalTB = 0;
  let totalH = 0;
  let totalAB = 0;

  return games.map((game: any, index: number) => {
    totalTB += game.TB || 0;
    totalH += game.H || 0;
    totalAB += game.AB || 0;

    const iso = totalAB > 0 ? (totalTB - totalH) / totalAB : 0;
    return {
      gameNumber: index + 1,
      statValue: formatStat(iso),
    };
  });
};

export const calculateBABIP = (games: any[]) => {
  let totalH = 0;
  let totalAB = 0;
  let totalK = 0;
  let totalHR = 0;
  let totalSF = 0;

  return games.map((game: any, index: number) => {
    totalH += game.H || 0;
    totalAB += game.AB || 0;
    totalK += game.K || 0;
    totalHR += game.HR || 0;
    totalSF += game.SF || 0;

    const babip =
      totalAB - totalK - totalHR + totalSF > 0
        ? (totalH - totalHR) / (totalAB - totalK - totalHR + totalSF)
        : 0;

    return {
      gameNumber: index + 1,
      statValue: formatStat(babip),
    };
  });
};

export const calculateBBPercentage = (games: any[]) => {
  let totalBB = 0;
  let totalPA = 0;

  return games.map((game: any, index: number) => {
    totalBB += game.BB || 0;
    totalPA += game.PA || 0;

    const bbPercentage = totalPA > 0 ? (totalBB / totalPA) * 100 : 0;
    return {
      gameNumber: index + 1,
      statValue: bbPercentage.toFixed(1),
    };
  });
};

export const calculateKPercentage = (games: any[]) => {
  let totalK = 0;
  let totalPA = 0;

  return games.map((game: any, index: number) => {
    totalK += game.K || 0;
    totalPA += game.PA || 0;

    const kPercentage = totalPA > 0 ? (totalK / totalPA) * 100 : 0;
    return {
      gameNumber: index + 1,
      statValue: kPercentage.toFixed(1),
    };
  });
};
