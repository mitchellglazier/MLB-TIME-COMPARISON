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
  calculateBABIP,
  calculateBBPercentage,
  calculateKPercentage,
} from '../app/utils/stats';
import Select from './components/base/Select';

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
  const [selectedGameNumber, setSelectedGameNumber] = useState<number | null>(null);
  const [selectedRange, setSelectedRange] = useState<{ start: number; end: number } | null>(null);

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

    setFilteredPlayers(filtered);
  }, [searchQuery, selectedTeams, players]);

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

  const handleRangeUpdate = (start: number, end?: number) => {
    if (end === undefined) {
      setSelectedRange({ start, end: start });
    } else {
      setSelectedRange({ start: Math.min(start, end), end: Math.max(start, end) }); 
    }
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
    ISO: calculateISO,
    BABIP: calculateBABIP,
    'BB%': calculateBBPercentage,
    'K%': calculateKPercentage,
  };

  if (!players.length) return <Loading />;

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
        <Select
          options={stats}
          selectedOption={selectedStat}
          onChange={setSelectedStat}
        />

        {graphData.length > 0 && (
          <div className="bg-white shadow-md rounded-lg p-4 mb-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-700">
                2023 Season {selectedStat}
              </h3>
            </div>
            <LineGraph
              selectedPlayers={graphData}
              onColorUpdate={handleColorUpdate}
              onRangeSelect={(range) => setSelectedRange(range)}
              selectedGameNumber={selectedGameNumber}
            />
          </div>
        )}

        {selectedPlayers.length > 0 ? (
          <div
            className={`grid gap-4 mt-4 ${
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
                />
              </div>
            ))}
          </div>
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

