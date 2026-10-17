import { NextResponse } from 'next/server';
import { COUNTRIES } from '@/data/countries';

export async function GET() {
  return NextResponse.json({
    success: true,
    count: COUNTRIES.length,
    countries: COUNTRIES,
  });
}
