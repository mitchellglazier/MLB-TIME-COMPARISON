import { Player } from '@/app/types/Player';
import Image from 'next/image';

interface PlayerCardProps {
  player: Player;
  onClick?: () => void;
  isSelected?: boolean;
  showRemove?: boolean;
  onRemove?: () => void;
  borderColor?: string;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  onClick,
  isSelected,
  showRemove,
  onRemove,
  borderColor,
}) => {
  return (
    <div
      onClick={onClick}
      className="relative flex items-center space-x-4 bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
      style={{ border: borderColor ? `2px solid ${borderColor}` : undefined }}
    >
      {showRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
          aria-label="Remove player"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
      <Image
        src={player.playerImage}
        alt={`${player.playerFullName}'s Image`}
        width={50}
        height={50}
        className="rounded-full"
      />
      <div>
        <h3 className="text-lg font-bold">{player.playerFullName}</h3>
      </div>
      <Image src={player.teamImage} alt="Team Logo" width={30} height={30} />
    </div>
  );
};

export default PlayerCard;
