import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, searchType } = await request.json();

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid message format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check for Gemini API key
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      // Fallback response when no API key is available
      return streamFallbackResponse(message, searchType);
    }

    // Determine system instruction based on search type
    const systemInstruction = searchType === 'web'
      ? "You are a general research assistant. Provide comprehensive, up-to-date information on the user's question. Include relevant context and cite sources when possible."
      : "You are BIOSPACE AI, an expert assistant specializing in NASA space biology research. You have access to 608 publications covering topics like microgravity effects on human physiology, radiation biology, muscle atrophy, bone loss, plant growth in space, cardiovascular changes, immune system responses, and more. Provide helpful, scientific responses based on space biology research. Keep responses concise but informative. Use bullet points where appropriate.";

    // Call Google Gemini API with streaming
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemInstruction}\n\nUser question: ${message}`
            }]
          }],
          generationConfig: {
            temperature: searchType === 'web' ? 0.8 : 0.7,
            maxOutputTokens: 1000,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    // Create a ReadableStream to stream the response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const reader = response.body?.getReader();
          if (!reader) {
            controller.close();
            return;
          }

          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.trim() === '') continue;
              
              try {
                const data = JSON.parse(line);
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                
                if (text) {
                  controller.enqueue(encoder.encode(text));
                }
              } catch (e) {
                // Skip invalid JSON lines
                continue;
              }
            }
          }

          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Return fallback streaming response on error
    try {
      const { message, searchType } = await request.json();
      return streamFallbackResponse(message, searchType);
    } catch {
      return new Response('Sorry, I encountered an error. Please try again.', {
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  }
}

function streamFallbackResponse(message: string, searchType?: string): Response {
  const fallbackText = generateFallbackResponse(message, searchType);
  
  // Simulate streaming by chunking the response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const words = fallbackText.split(' ');
      
      for (let i = 0; i < words.length; i++) {
        const chunk = (i === 0 ? words[i] : ' ' + words[i]);
        controller.enqueue(encoder.encode(chunk));
        
        // Small delay to simulate streaming
        await new Promise(resolve => setTimeout(resolve, 30));
      }
      
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    },
  });
}

function generateFallbackResponse(message: string, searchType?: string): string {
  const lowerMessage = message.toLowerCase();

  // Web search fallback
  if (searchType === 'web') {
    return `**Web Search Results**

I apologize, but I don't have access to live web search capabilities at the moment. However, I can provide information based on NASA's space biology research database.

For the most current information about "${message}", I recommend:
• Visiting NASA's official website (nasa.gov)
• Checking the NASA Life Sciences Data Archive
• Exploring recent publications on NASA Technical Reports Server

Would you like me to answer your question using the NASA space biology research database instead?`;
  }

  // Topic-based responses
  if (lowerMessage.includes('bone') || lowerMessage.includes('osteo')) {
    return `**Bone Loss in Microgravity**

Research shows astronauts lose 1-2% of bone mass per month in space, primarily in weight-bearing bones.

**Key Findings:**
• Reduced mechanical loading leads to decreased bone formation
• Increased bone resorption through osteoclast activity
• Exercise countermeasures can mitigate but not eliminate bone loss
• Recovery after return to Earth takes months to years

**Current Research Focus:**
• Pharmacological interventions (bisphosphonates)
• Optimized exercise protocols
• Nutritional supplementation strategies

*Source: Multiple NASA Life Sciences publications*`;
  }

  if (lowerMessage.includes('muscle') || lowerMessage.includes('atrophy')) {
    return `**Muscle Atrophy in Space**

Astronauts can lose 20-40% of muscle mass during long-duration missions, particularly in antigravity muscles.

**Research Insights:**
• Reduced protein synthesis and increased degradation
• Type I (slow-twitch) fibers more affected than Type II
• Exercise countermeasures essential for maintaining function
• Changes occur within days of entering microgravity

**Countermeasures:**
• Resistance training (2+ hours daily)
• High-intensity interval training
• Proper nutrition (adequate protein intake)

*Based on ISS research data*`;
  }

  if (lowerMessage.includes('radiation') || lowerMessage.includes('cosmic')) {
    return `**Radiation Exposure in Space**

Space radiation poses significant health risks, including increased cancer risk and potential CNS effects.

**Key Concerns:**
• Galactic cosmic rays (GCR) - continuous low-dose exposure
• Solar particle events (SPE) - acute high-dose exposure
• Secondary radiation from spacecraft shielding
• DNA damage and increased mutation rates

**Protection Strategies:**
• Optimized spacecraft shielding materials
• Mission timing to avoid solar maximum
• Pharmaceutical radioprotectors under investigation
• Real-time monitoring systems

*Ongoing research priority for Mars missions*`;
  }

  if (lowerMessage.includes('plant') || lowerMessage.includes('crop') || lowerMessage.includes('grow')) {
    return `**Plant Growth in Microgravity**

NASA has conducted extensive research on growing plants in space for food production and life support.

**Research Findings:**
• Plants can complete full life cycles in microgravity
• Root growth shows altered gravitropism
• Gas exchange and water delivery require special systems
• Light quality affects growth rates and nutrition

**Applications:**
• Fresh food production for long missions
• Oxygen generation and CO2 removal
• Psychological benefits for crew
• Potential for Mars/lunar agriculture

**Current Projects:**
• Veggie plant growth system
• Advanced Plant Habitat
• Testing various crop species

*Essential for sustainable deep space exploration*`;
  }

  if (lowerMessage.includes('immune') || lowerMessage.includes('infection')) {
    return `**Immune System Changes in Microgravity**

Spaceflight significantly impacts immune function, increasing infection risk and viral reactivation.

**Key Findings:**
• Altered T-cell distribution and function
• Decreased natural killer cell activity
• Increased stress hormones affecting immunity
• Dormant viruses (like HSV) can reactivate
• Wound healing may be impaired

**Risk Factors:**
• Confined environment with limited medical care
• Stress from mission demands
• Radiation exposure
• Altered circadian rhythms

**Research Directions:**
• Nutritional interventions
• Exercise as immune booster
• Pharmaceutical countermeasures
• Real-time immune monitoring

*Critical concern for Mars missions*`;
  }

  if (lowerMessage.includes('heart') || lowerMessage.includes('cardiovascular') || lowerMessage.includes('blood')) {
    return `**Cardiovascular Adaptations in Space**

The cardiovascular system undergoes significant changes in microgravity due to fluid redistribution.

**Major Effects:**
• Cephalad fluid shift (fluid moves to upper body)
• Cardiac atrophy and decreased stroke volume
• Reduced orthostatic tolerance upon return
• Changes in blood vessel structure
• Altered blood pressure regulation

**Countermeasures:**
• Lower body negative pressure (LBNP) training
• Aerobic exercise protocols
• Fluid loading before re-entry
• Compression garments

**Long-term Concerns:**
• Risk of arrhythmias
• Reduced exercise capacity
• Post-flight orthostatic intolerance

*Extensive ISS cardiovascular research ongoing*`;
  }

  // Default response for general or unrelated questions
  return `**BIOSPACE AI - Space Biology Research Assistant**

I specialize in NASA space biology research topics including:

**Human Health in Space:**
• Bone density loss and countermeasures
• Muscle atrophy and exercise protocols
• Cardiovascular system adaptations
• Immune system dysregulation
• Radiation exposure effects

**Life Sciences:**
• Plant growth and food production in space
• Microbial behavior in microgravity
• Cellular and molecular changes
• Gene expression alterations

**Mission Support:**
• Countermeasure development
• Risk assessment for long-duration missions
• Life support system design

*Please ask me a specific question about any of these topics, and I'll provide detailed information based on NASA's research.*`;
}