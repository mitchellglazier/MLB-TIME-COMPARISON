import React from 'react';

const Table: React.FC<{
  players: any[];
  playerData: any;
  selectedStat: string;
  selectedRange: { start: number; end: number } | null;
  selectedGameNumber: number | null;
  playerColors: { [playerName: string]: string };
  onStatChange: (stat: string) => void;
}> = ({
  players,
  playerData,
  selectedStat,
  selectedRange,
  selectedGameNumber,
  playerColors,
  onStatChange,
}) => {
  const calculateStats = (data: any[]) => {
    const totals = data.reduce(
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

    totals.AVG = totals.AB > 0 ? (totals.H / totals.AB).toFixed(3) : '.000';
    totals.OBP =
      totals.PA - totals.SF > 0
        ? (
            (totals.H + totals.BB + totals.HBP) /
            (totals.PA - totals.SF)
          ).toFixed(3)
        : '.000';
    totals.SLG = totals.AB > 0 ? (totals.TB / totals.AB).toFixed(3) : '.000';
    totals.OPS = (parseFloat(totals.OBP) + parseFloat(totals.SLG)).toFixed(3);
    totals.ISO = (parseFloat(totals.SLG) - parseFloat(totals.AVG)).toFixed(3);

    return totals;
  };

  const getFilteredData = (data: any[]) => {
    if (selectedRange) {
      const { start, end } = selectedRange;
      const validRange =
        start > end ? { start: end, end: start } : selectedRange;
      return data.filter(
        (_: any, index: number) =>
          index + 1 >= validRange.start && index + 1 <= validRange.end
      );
    } else if (selectedGameNumber !== null) {
      return data.slice(0, selectedGameNumber);
    } else {
      return data;
    }
  };

  const sortedPlayers = players
    .map((player) => {
      const data = playerData[player.playerId] || [];
      const filteredData = getFilteredData(data);
      const filteredStats = calculateStats(filteredData);
      return {
        player,
        stats: filteredStats,
      };
    })
    .sort((a, b) => {
      const aValue = parseFloat(a.stats[selectedStat] || 0);
      const bValue = parseFloat(b.stats[selectedStat] || 0);
      return bValue - aValue;
    });

  return (
    <div>
      <table className="w-full bg-white shadow-md rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left px-4 py-2">Player Name</th>
            {[
              'PA',
              'AB',
              'H',
              'BB',
              'HBP',
              'SF',
              'TB',
              'K',
              'RBI',
              'HR',
              'AVG',
              'OPS',
              'OBP',
              'SLG',
              'ISO',
            ].map((stat) => (
              <th
                key={stat}
                onClick={() => onStatChange(stat)}
                className={`px-4 py-2 text-center cursor-pointer ${
                  selectedStat === stat ? 'text-blue-500 font-bold' : ''
                } hover:bg-gray-200`}
              >
                {stat}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedPlayers.map(({ player, stats }) => (
            <tr key={player.playerId} className="border-t">
              <td className="px-4 py-2 text-left flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor: playerColors[player.playerFullName],
                  }}
                />
                {player.playerFullName}
              </td>
              {[
                'PA',
                'AB',
                'H',
                'BB',
                'HBP',
                'SF',
                'TB',
                'K',
                'RBI',
                'HR',
                'AVG',
                'OPS',
                'OBP',
                'SLG',
                'ISO',
              ].map((stat) => (
                <td
                  key={stat}
                  className={`px-4 py-2 text-center ${
                    selectedStat === stat ? 'bg-blue-100 font-bold' : ''
                  }`}
                >
                  {stats[stat]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
