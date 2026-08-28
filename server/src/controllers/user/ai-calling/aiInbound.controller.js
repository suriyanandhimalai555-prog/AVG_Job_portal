import AIInboundModel from '../../../models/user/ai-calling/aiInbound.model.js';
import twilio from 'twilio';
import WebSocket from 'ws';

export const handleTwilioWebhook = (req, res) => {
    const callerNumber = req.body.From || 'Unknown';
    const calledNumber = req.body.To || 'Unknown';

    let host = process.env.NGROK_DOMAIN || req.headers.host;
    host = host.replace(/^https?:\/\//, '');

    console.log(`📞 Incoming live call from ${callerNumber} to ${calledNumber}`);

    if (global.io) {
        global.io.emit('incoming_live_call', {
            customerPhone: callerNumber,
            agentName: 'Academy AI Agent',
            status: 'Intercepting...'
        });
    }

    const VoiceResponse = twilio.twiml.VoiceResponse;
    const twiml = new VoiceResponse();

    twiml.say("Please wait while I connect you to our AI agent.");

    const connect = twiml.connect();
    connect.stream({
        url: `wss://${host}/media`,
        track: 'inbound_track'
    });

    res.type('text/xml');
    res.send(twiml.toString());
};

export const setupTwilioMediaStream = (wss) => {
    wss.on('connection', (ws) => {
        console.log('🔗 Twilio Media Stream connected');
        let streamSid = null;

        const elevenLabsUrl = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${process.env.ELEVENLABS_AGENT_ID}`;
        const elevenLabsWs = new WebSocket(elevenLabsUrl);

        elevenLabsWs.on('open', () => {
            console.log('🤖 Connected to ElevenLabs AI');
        });

        elevenLabsWs.on('message', (data) => {
            try {
                const message = JSON.parse(data);
                if (message.type === 'audio' && streamSid) {
                    ws.send(JSON.stringify({
                        event: 'media',
                        streamSid: streamSid,
                        media: { payload: message.audio_event.audio_base_64 }
                    }));
                }
            } catch (error) {
                console.error("Error parsing ElevenLabs message", error);
            }
        });

        elevenLabsWs.on('error', (err) => console.error('ElevenLabs Error:', err));

        ws.on('message', (message) => {
            const msg = JSON.parse(message);

            if (msg.event === 'start') {
                streamSid = msg.start.streamSid;
                console.log(`🎙️ Call Stream started: ${streamSid}`);

                if (global.io) {
                    global.io.emit('live_call_status_update', { status: 'Connected & Listening' });
                }
            }
            else if (msg.event === 'media') {
                if (elevenLabsWs.readyState === WebSocket.OPEN) {
                    elevenLabsWs.send(JSON.stringify({
                        user_audio_chunk: msg.media.payload
                    }));
                }
            }
            else if (msg.event === 'stop') {
                console.log(`🛑 Call ended: ${streamSid}`);
                elevenLabsWs.close();
                handleCallEnded(streamSid);
            }
        });

        ws.on('close', () => {
            console.log('Twilio stream closed');
            if (elevenLabsWs.readyState === WebSocket.OPEN) elevenLabsWs.close();
        });
    });
};

const handleCallEnded = async (streamSid) => {
    try {
        const generatedLog = {
            id: `AI-${Math.floor(10000 + Math.random() * 90000)}`,
            customer_name: 'Live Caller',
            phone: '+91 99999 12345',
            call_type: 'Inbound',
            purpose: 'General Inquiry',
            call_time: new Date().toLocaleTimeString(),
            duration: '02:45',
            status: 'Resolved',
            intent: 'Support',
            sentiment: 'Positive',
            score: 95,
            outcome: 'Handled',
            follow_up: 'None',
            appointment: 'None',
            summary: 'AI successfully handled the live caller inquiry using ElevenLabs.',
            transcript: JSON.stringify([{ speaker: 'AI', text: 'Thank you for calling.' }])
        };

        const userId = 1;
        const query = `INSERT INTO ai_call_logs 
            (id, user_id, customer_name, phone, call_type, purpose, call_time, duration, status, intent, sentiment, score, outcome, follow_up, appointment, summary, transcript) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`;

        const values = [
            generatedLog.id, userId, generatedLog.customer_name, generatedLog.phone, generatedLog.call_type,
            generatedLog.purpose, generatedLog.call_time, generatedLog.duration, generatedLog.status,
            generatedLog.intent, generatedLog.sentiment, generatedLog.score, generatedLog.outcome,
            generatedLog.follow_up, generatedLog.appointment, generatedLog.summary, generatedLog.transcript
        ];

        const frontendLog = {
            ...generatedLog,
            date: 'Today',
            time: generatedLog.call_time,
            customer: generatedLog.customer_name
        };

        if (global.io) {
            global.io.emit('live_call_completed', frontendLog);
        }

    } catch (error) {
        console.error('Error handling ended call:', error);
    }
};

export const getInboundData = async (req, res) => {
    try {
        const userId = req.user.id;
        await AIInboundModel.seedInitialInboundData(userId);

        const numbers = await AIInboundModel.getInboundNumbers(userId);
        const inboundLogs = await AIInboundModel.getCallLogs(userId, 'Inbound');

        res.status(200).json({ numbers, inboundLogs });
    } catch (error) {
        console.error('Error fetching inbound data:', error);
        res.status(500).json({ error: 'Failed to fetch inbound data' });
    }
};

export const simulateInboundCall = async (req, res) => {
    try {
        const userId = req.user.id;

        if (global.io) {
            global.io.emit('incoming_live_call', {
                customerPhone: '+91 99999 00000',
                agentName: 'Simulated Support AI',
                status: 'Connected'
            });
        }

        setTimeout(async () => {
            const newCall = await AIInboundModel.simulateIncomingCall(userId);
            if (global.io) global.io.emit('live_call_completed', newCall);
        }, 5000);

        res.status(201).json({ message: 'Simulation triggered' });
    } catch (error) {
        console.error('Error simulating call:', error);
        res.status(500).json({ error: 'Failed to simulate call' });
    }
};