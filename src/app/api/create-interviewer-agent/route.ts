import { NextResponse } from 'next/server';
import Retell from 'retell-sdk';

const retellClient = new Retell({
  apiKey: process.env.RETELL_API_KEY || "",
});

export async function POST(request: Request) {
  try {
    console.log('Starting agent creation...');
    console.log('API Key:', process.env.RETELL_API_KEY ? 'Set' : 'Not set');
    
    const body = await request.json();
    const { llm_id, voice_id, agent_name } = body;
    
    console.log('Creation parameters:', { llm_id, voice_id, agent_name });

    if (!llm_id || !voice_id || !agent_name) {
      console.error('Missing required parameters');
      return NextResponse.json(
        { error: 'Missing required parameters: llm_id, voice_id, or agent_name' },
        { status: 400 }
      );
    }

    const newAgent = await retellClient.agent.create({
      response_engine: { llm_id, type: "retell-llm" },
      voice_id,
      agent_name,
    });

    console.log('Agent created successfully:', newAgent);
    return NextResponse.json(newAgent);
  } catch (error) {
    console.error('Error creating agent:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to create agent: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
} 