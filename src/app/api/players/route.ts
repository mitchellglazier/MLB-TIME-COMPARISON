import { NextResponse } from 'next/server';
import { getAllPlayers, getTempToken } from '../../../../lib/apiUtils';

export async function GET() {
  try {
    const tempToken = await getTempToken();
    const players = await getAllPlayers(tempToken);
    return NextResponse.json(players);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
