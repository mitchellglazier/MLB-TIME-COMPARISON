const API_BASE_URL = 'https://project.trumedianetworks.com/api';

export const getTempToken = async (): Promise<string> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error('API_KEY is not set in the environment variables.');
  }

  const response = await fetch(`${API_BASE_URL}/token`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      apiKey: apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch tempToken: ${response.statusText}`);
  }

  const data = await response.json();
  return data.token;
};

export const getAllPlayers = async (tempToken: string): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/mlb/players`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      tempToken: `${tempToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch players: ${response.statusText}`);
  }

  return await response.json();
};

export const getPlayerDetails = async (
  tempToken: string,
  playerId: string
): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/mlb/player/${playerId}`, {
    headers: {
      'Content-Type': 'application/json',
      tempToken: `${tempToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch player details: ${response.statusText}`);
  }

  return await response.json();
};
