'use client';

import { useEffect, useState } from 'react';
import { Player } from './types/Player';
import PlayerCard from './components/ui/PlayerCard';
import PlayerDetails from './components/ui/PlayerDetails';
import Loading from './components/base/Loading';
import LineGraph from './components/graphs/LineGraph';
import {
  calculateCumulativeStat,
  calculateAVG,
  calculateOPS,
  calculateOBP,
  calculateSLG,
  calculateISO,
} from '../app/utils/stats';
import Select from './components/base/Select';
import Table from './components/base/Table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTh, faList } from '@fortawesome/free-solid-svg-icons';
import useAverages from './hooks/useAverages';

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [selectedPlayersData, setSelectedPlayersData] = useState<any>({});
  const [graphData, setGraphData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedStat, setSelectedStat] = useState<string>('HR');
  const [playerColors, setPlayerColors] = useState<{
    [playerName: string]: string;
  }>({});
  const [selectedGameNumber, setSelectedGameNumber] = useState<number | null>(
    null
  );
  const [selectedRange, setSelectedRange] = useState<{
    start: number;
    end: number;
  } | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const averages: any = useAverages();

  const stats = [
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
    'BABIP',
    'BB%',
    'K%',
  ];

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch('/api/players');
        const data = await response.json();
        if (response.ok) {
          setPlayers(data);
          setFilteredPlayers(data);
        } else {
          setError(data.error || 'Failed to fetch players.');
        }
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchPlayers();
  }, []);

  useEffect(() => {
    const updatedGraphData = Object.entries(selectedPlayersData).map(
      ([playerId, games]: any) => {
        const player = players.find((p) => p.playerId === parseInt(playerId));
        return {
          playerFullName: player?.playerFullName || 'Unknown Player',
          games: statCalculators[selectedStat](games),
        };
      }
    );
    setGraphData(updatedGraphData);
  }, [selectedPlayersData, selectedStat, players]);

  useEffect(() => {
    const filtered = players.filter((player) => {
      const matchesSearchQuery = player.playerFullName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesTeams =
        selectedTeams.length > 0
          ? selectedTeams.includes(player.teamImage)
          : true;
  
      return matchesSearchQuery && matchesTeams;
    });
  
    filtered.sort((a, b) => {
      const isSelectedA = selectedPlayers.some((p) => p.playerId === a.playerId);
      const isSelectedB = selectedPlayers.some((p) => p.playerId === b.playerId);
  
      if (isSelectedA && !isSelectedB) return -1;
      if (!isSelectedA && isSelectedB) return 1;
      return 0;
    });
  
    setFilteredPlayers(filtered);
  }, [searchQuery, selectedTeams, players, selectedPlayers]);


  const fetchPlayerData = async (playerId: number) => {
    if (selectedPlayersData[playerId]) return;
    try {
      const response = await fetch(`/api/players/${playerId}`);
      const data = await response.json();
      if (response.ok) {
        setSelectedPlayersData((prev: any) => ({
          ...prev,
          [playerId]: data,
        }));
      } else {
        setError(data.error || 'Failed to fetch player data.');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const uniqueTeamImages = Array.from(
    new Set(players.map((player) => player.teamImage))
  );

  const handleColorUpdate = (colorMap: { [playerName: string]: string }) => {
    setPlayerColors(colorMap);
  };

  const toggleTeamSelection = (teamImage: string) => {
    setSelectedTeams((prevSelected) =>
      prevSelected.includes(teamImage)
        ? prevSelected.filter((team) => team !== teamImage)
        : [...prevSelected, teamImage]
    );
  };

  const togglePlayerSelection = (player: Player) => {
    const isSelected = selectedPlayers.some(
      (p) => p.playerId === player.playerId
    );

    if (isSelected) {
      setSelectedPlayers((prev) =>
        prev.filter((p) => p.playerId !== player.playerId)
      );

      setSelectedPlayersData((prev: any) => {
        const { [player.playerId]: _, ...remainingData } = prev;
        return remainingData;
      });
    } else {
      setSelectedPlayers((prev) => [...prev, player]);
      fetchPlayerData(player.playerId);
    }
  };

  const statCalculators: {
    [key: string]: (
      games: any[]
    ) => { gameNumber: number; statValue: number | string }[];
  } = {
    PA: (games) => calculateCumulativeStat(games, 'PA'),
    AB: (games) => calculateCumulativeStat(games, 'AB'),
    H: (games) => calculateCumulativeStat(games, 'H'),
    BB: (games) => calculateCumulativeStat(games, 'BB'),
    HBP: (games) => calculateCumulativeStat(games, 'HBP'),
    SF: (games) => calculateCumulativeStat(games, 'SF'),
    TB: (games) => calculateCumulativeStat(games, 'TB'),
    K: (games) => calculateCumulativeStat(games, 'K'),
    RBI: (games) => calculateCumulativeStat(games, 'RBI'),
    HR: (games) => calculateCumulativeStat(games, 'HR'),
    AVG: calculateAVG,
    OPS: calculateOPS,
    OBP: calculateOBP,
    SLG: calculateSLG,
    ISO: calculateISO
  };

  if (!players.length) return <Loading />;

  const bestRanges = selectedPlayers.map((player) => {
    const games = selectedPlayersData[player.playerId] || [];
    let maxValue = 0;
    let bestStartIndex = 0;
  
    for (let i = 0; i <= games.length - 10; i++) {
      const windowGames = games.slice(i, i + 10);
  
      const totals = windowGames.reduce(
        (acc: any, game: any) => {
          acc.PA += game.PA || 0;
          acc.AB += game.AB || 0;
          acc.H += game.H || 0;
          acc.BB += game.BB || 0;
          acc.HBP += game.HBP || 0;
          acc.SF += game.SF || 0;
          acc.TB += game.TB || 0;
          return acc;
        },
        { PA: 0, AB: 0, H: 0, BB: 0, HBP: 0, SF: 0, TB: 0 }
      );
  
      let statValue = 0;
      switch (selectedStat) {
        case "AVG":
          statValue = totals.AB > 0 ? totals.H / totals.AB : 0;
          break;
        case "OBP":
          statValue = totals.PA - totals.SF > 0
            ? (totals.H + totals.BB + totals.HBP) / (totals.PA - totals.SF)
            : 0;
          break;
        case "SLG":
          statValue = totals.AB > 0 ? totals.TB / totals.AB : 0;
          break;
        case "OPS":
          const obp = totals.PA - totals.SF > 0
            ? (totals.H + totals.BB + totals.HBP) / (totals.PA - totals.SF)
            : 0;
          const slg = totals.AB > 0 ? totals.TB / totals.AB : 0;
          statValue = obp + slg;
          break;
        case "ISO":
          const avg = totals.AB > 0 ? totals.H / totals.AB : 0;
          const slgForIso = totals.AB > 0 ? totals.TB / totals.AB : 0;
          statValue = slgForIso - avg;
          break;
        default:
          statValue = windowGames.reduce((sum: any, game: any) => sum + (game[selectedStat] || 0), 0);
          break;
      }
  
      if (statValue > maxValue) {
        maxValue = statValue;
        bestStartIndex = i;
      }
    }
  
    return {
      playerFullName: player.playerFullName,
      bestRange: {
        start: bestStartIndex + 1,
        end: bestStartIndex + 10,
      },
    };
  });
  

  const headerText = selectedRange
    ? `Statistics from Game ${selectedRange.start} to ${selectedRange.end}`
    : selectedGameNumber !== null
      ? `Statistics Through Game ${selectedGameNumber}`
      : 'Season Statistics';

  return (
    <div className="flex" style={{ height: 'calc(100vh - 63px)' }}>
      <div className="w-1/4 p-4 overflow-y-auto bg-gray-100">
        <input
          type="text"
          placeholder="Search players..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded-md"
        />

        <div className="mb-4 flex flex-wrap gap-2">
          {uniqueTeamImages.map((teamImage) => (
            <button
              key={teamImage}
              onClick={() => toggleTeamSelection(teamImage)}
              className={`p-2 border border-gray-300 rounded-md ${
                selectedTeams.includes(teamImage) ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <img
                src={teamImage}
                alt="Team Logo"
                className="w-6 h-6 object-contain"
              />
            </button>
          ))}
        </div>

        {selectedPlayers.length === 3 && (
          <p className="text-sm text-red-500 mb-4">
            You can only select up to 3 players.
          </p>
        )}

        <div className="grid grid-cols-1 gap-4">
          {filteredPlayers.length > 0 ? (
            filteredPlayers.map((player) => (
              <PlayerCard
                key={player.playerId}
                player={player}
                onClick={
                  selectedPlayers.length < 3 ||
                  selectedPlayers.some((p) => p.playerId === player.playerId)
                    ? () => togglePlayerSelection(player)
                    : undefined
                }
                isSelected={selectedPlayers.some(
                  (p) => p.playerId === player.playerId
                )}
                borderColor={playerColors[player.playerFullName]}
              />
            ))
          ) : (
            <p className="text-gray-500">
              No players found matching your filters.
            </p>
          )}
        </div>
      </div>

      <div className="w-3/4 p-4 bg-gray-200">
      {selectedPlayers.length > 0 && (
        <Select
          options={stats}
          selectedOption={selectedStat}
          onChange={setSelectedStat}
        />
      )}

        {graphData.length > 0 && (
          <div className="bg-white shadow-md rounded-lg p-4 mb-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-700">
                2023 Season {selectedStat} (League Average: {
                averages.cumulative[selectedStat] || averages.derived[selectedStat]
              })
              </h3>
            </div>
            <LineGraph
              selectedPlayers={graphData}
              bestRanges={bestRanges}
              onColorUpdate={handleColorUpdate}
              onRangeSelect={(range) => setSelectedRange(range)}
              selectedGameNumber={selectedGameNumber}
              average={
                averages.cumulative[selectedStat] || averages.derived[selectedStat]
              }
            />
          </div>
        )}
        {selectedPlayers.length > 0 && (
          <div className="flex justify-between mt-4">
          <h3 className="text-lg font-bold text-gray-700 mb-4">{headerText}</h3>
          <div>
            <button
              className={`pl-2 pr-2 pt-1 pb-1 rounded-md ${
                viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-300'
              }`}
              onClick={() => setViewMode('grid')}
            >
              <FontAwesomeIcon icon={faTh} />
            </button>
            <button
              className={`pl-2 pr-2 pt-1 pb-1 rounded-md ml-2 ${
                viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-300'
              }`}
              onClick={() => setViewMode('list')}
            >
              <FontAwesomeIcon icon={faList} />
            </button>
          </div>
        </div>
        )}

        {selectedPlayers.length > 0 ? (
          viewMode === 'grid' ? (
            <div
              className={`grid gap-4 ${
                selectedPlayers.length === 1
                  ? 'grid-cols-1'
                  : selectedPlayers.length === 2
                    ? 'grid-cols-2'
                    : 'grid-cols-3'
              }`}
            >
              {selectedPlayers.map((player) => (
                <div key={player.playerId}>
                  <PlayerCard
                    player={player}
                    showRemove
                    onRemove={() => togglePlayerSelection(player)}
                    borderColor={playerColors[player.playerFullName]}
                  />
                  <PlayerDetails
                    data={selectedPlayersData[player.playerId]}
                    selectedStat={selectedStat}
                    selectedGameNumber={selectedGameNumber}
                    selectedRange={selectedRange}
                    onStatChange={setSelectedStat}
                  />
                </div>
              ))}
            </div>
          ) : (
            <Table
              players={selectedPlayers}
              playerData={selectedPlayersData}
              selectedStat={selectedStat}
              selectedRange={selectedRange}
              selectedGameNumber={selectedGameNumber}
              playerColors={playerColors}
              onStatChange={setSelectedStat}
            />
          )
        ) : (
          <div
            className="flex items-center justify-center"
            style={{ height: 'calc(100vh - 150px)' }}
          >
            <p className="text-gray-500">
              No players selected. Select up to 3 players to compare.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
