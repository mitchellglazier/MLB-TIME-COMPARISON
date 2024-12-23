import { NextResponse } from 'next/server';
import { getPlayerDetails, getTempToken } from '../../../../../lib/apiUtils';

export async function GET(
  req: Request,
  context: { params: Record<string, string> }
) {
  try {
    const playerId = context.params.playerId;

    if (!playerId) {
      return NextResponse.json(
        { error: 'Player ID is required.' },
        { status: 400 }
      );
    }

    const tempToken = await getTempToken();
    const playerDetails = await getPlayerDetails(tempToken, playerId);

    return NextResponse.json(playerDetails);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


