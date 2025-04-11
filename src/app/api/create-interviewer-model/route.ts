import { NextResponse } from 'next/server';
import Retell from 'retell-sdk';
import { RETELL_AGENT_GENERAL_PROMPT } from '@/lib/constants';

const retellClient = new Retell({
  apiKey: process.env.RETELL_API_KEY || "",
});

export async function POST(request: Request) {
  try {
    console.log('Starting LLM model creation...');
    console.log('API Key:', process.env.RETELL_API_KEY ? 'Set' : 'Not set');
    
    const body = await request.json();
    const { interviewer } = body;

    if (!interviewer) {
      return NextResponse.json(
        { error: 'Interviewer data is required' },
        { status: 400 }
      );
    }

    // Create the general prompt using the interviewer's attributes
    const generalPrompt = RETELL_AGENT_GENERAL_PROMPT({
      name: interviewer.name,
      empathy: interviewer.empathy,
      rapport: interviewer.rapport,
      exploration: interviewer.exploration,
      speed: interviewer.speed,
      description: interviewer.description
    });

    const newModel = await retellClient.llm.create({
      model: "gpt-4o",
      general_prompt: generalPrompt,
      general_tools: [
        {
          type: "end_call",
          name: "end_call_1",
          description: "End the call if the user uses goodbye phrases such as 'bye,' 'goodbye,' or 'have a nice day.' ",
        },
      ],
    });

    if (!newModel) {
      console.error('Model creation returned null or undefined');
      return NextResponse.json(
        { error: 'Model creation failed: No response from Retell API' },
        { status: 500 }
      );
    }

    console.log('LLM model created successfully:', JSON.stringify(newModel, null, 2));
    return NextResponse.json(newModel);
  } catch (error) {
    console.error('Error creating model:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to create model: ${error.message}`, details: error.stack },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create model', details: JSON.stringify(error) },
      { status: 500 }
    );
  }
} 