import { NextResponse } from 'next/server';
import { config } from '@/app/config/config';
import axios from 'axios';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    
    // Отправляем запрос в n8n
    const n8nResponse = await axios.post(config.N8N_WEBHOOK_URL, { 
      text,
      sessionId: Date.now().toString() 
    });

    return NextResponse.json({ 
      success: true, 
      response: n8nResponse.data 
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal Server Error' 
    }, { status: 500 });
  }
}
