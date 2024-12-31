import React from 'react';
import Loading from '../base/Loading';

interface PlayerDetailsProps {
  data: any;
  selectedStat: string;
  selectedGameNumber: number | null;
  selectedRange: { start: number; end: number } | null;
  onStatChange: (stat: string) => void;
}

const PlayerDetails: React.FC<PlayerDetailsProps> = ({
  data,
  selectedStat,
  selectedGameNumber,
  selectedRange,
  onStatChange,
}) => {
  if (!data) {
    return <Loading />;
  }

  const filteredData = selectedRange
    ? (() => {
        const { start, end } = selectedRange;
        const validRange =
          start > end ? { start: end, end: start } : selectedRange;

        return data.filter(
          (_: any, index: number) =>
            index + 1 >= validRange.start && index + 1 <= validRange.end
        );
      })()
    : selectedGameNumber !== null
    ? data.slice(0, selectedGameNumber)
    : data;

  const computeStats = (games: any[]) => {
    const totals = games.reduce(
      (totals: any, game: any) => {
        totals.PA += game.PA;
        totals.AB += game.AB;
        totals.H += game.H;
        totals.BB += game.BB;
        totals.HBP += game.HBP;
        totals.SF += game.SF;
        totals.TB += game.TB;
        totals.K += game.K;
        totals.RBI += game.RBI;
        totals.HR += game.HR;
        return totals;
      },
      { PA: 0, AB: 0, H: 0, BB: 0, HBP: 0, SF: 0, TB: 0, K: 0, RBI: 0, HR: 0 }
    );

    const formatStat = (value: number) => {
      return value >= 1 ? value.toFixed(3) : value.toFixed(3).substring(1);
    };

    return {
      PA: totals.PA,
      AB: totals.AB,
      H: totals.H,
      BB: totals.BB,
      HBP: totals.HBP,
      SF: totals.SF,
      TB: totals.TB,
      K: totals.K,
      RBI: totals.RBI,
      HR: totals.HR,
      AVG: totals.AB > 0 ? formatStat(totals.H / totals.AB) : '.000',
      OBP:
        totals.PA - totals.SF > 0
          ? formatStat(
              (totals.H + totals.BB + totals.HBP) / (totals.PA - totals.SF)
            )
          : '.000',
      SLG: totals.AB > 0 ? formatStat(totals.TB / totals.AB) : '.000',
      OPS:
        totals.AB > 0 && totals.PA > 0
          ? formatStat(
              parseFloat(
                ((totals.H + totals.BB + totals.HBP) / totals.PA).toFixed(3)
              ) +
                totals.TB / totals.AB
            )
          : '.000',
      ISO:
        totals.AB > 0 ? formatStat((totals.TB - totals.H) / totals.AB) : '.000',
    };
  };

  const filteredStats = computeStats(filteredData);
  const seasonStats = computeStats(data);

  const stats = [
    { label: 'PA', value: filteredStats.PA, seasonValue: seasonStats.PA },
    { label: 'AB', value: filteredStats.AB, seasonValue: seasonStats.AB },
    { label: 'H', value: filteredStats.H, seasonValue: seasonStats.H },
    { label: 'BB', value: filteredStats.BB, seasonValue: seasonStats.BB },
    { label: 'HBP', value: filteredStats.HBP, seasonValue: seasonStats.HBP },
    { label: 'SF', value: filteredStats.SF, seasonValue: seasonStats.SF },
    { label: 'TB', value: filteredStats.TB, seasonValue: seasonStats.TB },
    { label: 'K', value: filteredStats.K, seasonValue: seasonStats.K },
    { label: 'RBI', value: filteredStats.RBI, seasonValue: seasonStats.RBI },
    { label: 'HR', value: filteredStats.HR, seasonValue: seasonStats.HR },
    { label: 'AVG', value: filteredStats.AVG, seasonValue: seasonStats.AVG },
    { label: 'OPS', value: filteredStats.OPS, seasonValue: seasonStats.OPS },
    { label: 'OBP', value: filteredStats.OBP, seasonValue: seasonStats.OBP },
    { label: 'SLG', value: filteredStats.SLG, seasonValue: seasonStats.SLG },
    { label: 'ISO', value: filteredStats.ISO, seasonValue: seasonStats.ISO },
  ];

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mt-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm text-gray-700">
        {stats.map((stat) => (
          <p
            key={stat.label}
            onClick={() => onStatChange(stat.label)} 
            className={`pl-1 rounded cursor-pointer ${
              selectedStat === stat.label ? 'border-2 border-yellow-500' : ''
            }`}
          >
            <span className="font-semibold text-gray-900">{stat.label}:</span>{' '}
            <span
              className={
                typeof stat.value === 'string' &&
                stat.value !== stat.seasonValue
                  ? parseFloat(stat.value) > parseFloat(stat.seasonValue)
                    ? 'text-green-500'
                    : 'text-red-500'
                  : ''
              }
            >
              {stat.value}
            </span>{' '}
            {selectedRange && (
              <span className="text-gray-500"> ({stat.seasonValue})</span>
            )}
          </p>
        ))}
      </div>
    </div>
  );
};

export default PlayerDetails;

