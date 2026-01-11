const Calculation = require('../models/Calculation');
const User = require('../models/User');
const axios = require('axios');

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// @route   POST api/chatbot/process
// @desc    Process user message and return bot response
// @access  Private
exports.processMessage = async (req, res) => {
    const { message, context } = req.body;

    if (!req.user || !req.user.id) {
        return res.status(401).json({ msg: 'User not authenticated' });
    }

    try {
        // Get user's recent data for context
        const userCalculations = await Calculation.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        const totalScore = userCalculations.reduce((sum, calc) => sum + (calc.score || 0), 0);
        const averageScore = userCalculations.length ? Math.round(totalScore / userCalculations.length) : 0;

        // Enhanced context for better responses
        const enhancedContext = {
            ...context,
            userId: req.user.id,
            recentCalculations: userCalculations,
            totalScore,
            averageScore,
            calculationCount: userCalculations.length,
            lastActivity: userCalculations[0]?.createdAt
        };

        // Process the message with enhanced context
        const response = await generateEnhancedResponse(message, enhancedContext);

        // Broadcast real-time update to user's room
        const io = req.app.get('io');
        if (io) {
            io.to(`user-${req.user.id}`).emit('chatbot-response', {
                message: response.text,
                timestamp: new Date(),
                type: response.type
            });
        }

        res.json({
            response: response.text,
            type: response.type,
            suggestions: response.suggestions,
            quickReplies: response.quickReplies,
            context: enhancedContext
        });

    } catch (err) {
        console.error('Chatbot Processing Error:', err.message);
        res.status(500).json({ msg: 'Error processing message' });
    }
};

// Enhanced response generation with OpenAI integration
async function generateEnhancedResponse(userInput, context) {
    const input = userInput.toLowerCase();
    
    // Try OpenAI API first if available
    if (OPENAI_API_KEY) {
        try {
            const openAIResponse = await callOpenAI(userInput, context);
            if (openAIResponse) {
                return openAIResponse;
            }
        } catch (error) {
            console.error('OpenAI API error:', error.message);
            // Fall back to rule-based responses
        }
    }
    
    // Context-aware responses based on user's actual data
    if (context.averageScore > 15000) {
        if (input.includes('reduce') || input.includes('improve') || input.includes('lower')) {
            return {
                text: `I see your average carbon footprint is quite high (${context.averageScore} kg CO₂e). Based on your recent calculations, here are targeted recommendations:`,
                type: 'suggestion',
                suggestions: [
                    'Switch to public transport - this could reduce your transport emissions by 60%',
                    'Reduce meat consumption - your food choices could cut emissions by 30%',
                    'Upgrade to energy-efficient appliances - potential 25% reduction in home energy',
                    'Minimize air travel - consider video calls for business meetings'
                ],
                quickReplies: ['Transport alternatives', 'Energy efficiency', 'Diet changes', 'Travel options']
            };
        }
    }

    if (context.averageScore < 8000) {
        if (input.includes('improve') || input.includes('better')) {
            return {
                text: `Great job! Your carbon footprint is already quite low (${context.averageScore} kg CO₂e). Here are some advanced tips to optimize further:`,
                type: 'suggestion',
                suggestions: [
                    'Fine-tune your digital habits - optimize streaming quality',
                    'Consider renewable energy options for your home',
                    'Explore carbon offset programs for remaining emissions',
                    'Share your sustainable practices with others'
                ],
                quickReplies: ['Digital optimization', 'Renewable energy', 'Carbon offsets', 'Share tips']
            };
        }
    }

    // Analyze recent calculation patterns
    if (context.recentCalculations && context.recentCalculations.length > 0) {
        const recentTypes = context.recentCalculations.map(calc => calc.inputData?.type || 'physical');
        const hasDigitalCalculations = recentTypes.includes('digital');
        const hasPhysicalCalculations = recentTypes.includes('physical') || !hasDigitalCalculations;

        if (input.includes('digital') && !hasDigitalCalculations) {
            return {
                text: "I notice you haven't calculated your digital carbon footprint yet. Digital activities contribute significantly to emissions. Would you like to track your digital footprint?",
                type: 'suggestion',
                suggestions: [
                    'Calculate digital carbon footprint',
                    'Learn about digital emissions',
                    'Get digital reduction tips'
                ],
                quickReplies: ['Calculate digital footprint', 'Digital tips', 'Learn more']
            };
        }

        if (input.includes('trend') || input.includes('progress') || input.includes('improving')) {
            const trendAnalysis = analyzeTrend(context.recentCalculations);
            return {
                text: `Based on your recent calculations, ${trendAnalysis.text}. ${trendAnalysis.recommendation}`,
                type: 'suggestion',
                suggestions: trendAnalysis.suggestions,
                quickReplies: ['View dashboard', 'Set goals', 'More tips']
            };
        }
    }

    // Specific feature guidance
    if (input.includes('export') || input.includes('download') || input.includes('report')) {
        return {
            text: `You can export your data! With ${context.calculationCount} calculations saved, you have comprehensive data for reports. Export options include:`,
            type: 'suggestion',
            suggestions: [
                'CSV format - perfect for data analysis',
                'PDF report - professional presentation',
                'Custom date ranges - focus on specific periods',
                'Include both physical and digital calculations'
            ],
            quickReplies: ['Export CSV', 'Generate PDF', 'Custom range', 'View data']
        };
    }

    if (input.includes('leaderboard') || input.includes('compare') || input.includes('ranking')) {
        const rankingAdvice = context.averageScore > 12000 ? 
            "Your footprint is above average. Focus on high-impact changes to improve your ranking." :
            "Your footprint is below average - great work! Keep up the sustainable practices.";
        
        return {
            text: `The leaderboard ranks users by total score (lower is better). ${rankingAdvice}`,
            type: 'suggestion',
            suggestions: [
                'View current leaderboard rankings',
                'Compare with average footprints',
                'Set improvement goals',
                'Track ranking progress over time'
            ],
            quickReplies: ['View leaderboard', 'Set goals', 'Compare data', 'Track progress']
        };
    }

    // Fallback with personalized context
    return {
        text: `I can help you with your carbon footprint journey! You've made ${context.calculationCount} calculations with an average score of ${context.averageScore} kg CO₂e. What would you like to explore?`,
        type: 'text',
        quickReplies: [
            'Explain my data',
            'Reduction tips',
            'View dashboard',
            'Calculate footprint'
        ]
    };
}

// OpenAI API call function
async function callOpenAI(userInput, context) {
    try {
        const systemPrompt = `You are an expert sustainability and carbon footprint advisor. You help users understand and reduce their environmental impact.

User Context:
- Average Carbon Footprint: ${context.averageScore} kg CO₂e
- Total Score: ${context.totalScore} kg CO₂e
- Number of Calculations: ${context.calculationCount}
- Recent Activity: ${context.lastActivity ? new Date(context.lastActivity).toLocaleDateString() : 'None'}

Provide helpful, accurate, and actionable advice about carbon footprints, sustainability, and environmental impact. Keep responses conversational and practical.`;

        const response = await axios.post(OPENAI_API_URL, {
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userInput }
            ],
            max_tokens: 500,
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const aiResponse = response.data.choices[0].message.content;
        
        return {
            text: aiResponse,
            type: 'text',
            quickReplies: [
                'More details',
                'Related tips',
                'Calculate footprint',
                'View dashboard'
            ]
        };
    } catch (error) {
        console.error('OpenAI API call failed:', error.message);
        return null;
    }
}

// Analyze trend in user's calculations
function analyzeTrend(calculations) {
    if (calculations.length < 2) {
        return {
            text: "you need more data to see trends",
            recommendation: "Keep tracking your footprint to see progress over time.",
            suggestions: ['Make more calculations', 'Set tracking goals', 'View dashboard']
        };
    }

    const recent = calculations.slice(0, 2);
    const older = calculations.slice(2, 4);
    
    const recentAvg = recent.reduce((sum, calc) => sum + calc.score, 0) / recent.length;
    const olderAvg = older.length ? older.reduce((sum, calc) => sum + calc.score, 0) / older.length : recentAvg;
    
    const improvement = ((olderAvg - recentAvg) / olderAvg) * 100;
    
    if (improvement > 10) {
        return {
            text: "you're making excellent progress! Your recent scores are significantly lower.",
            recommendation: "Keep up the great work! Consider setting more ambitious goals.",
            suggestions: ['Set new goals', 'Share your success', 'Help others improve']
        };
    } else if (improvement > 0) {
        return {
            text: "you're showing improvement in your carbon footprint.",
            recommendation: "Focus on the areas with the highest impact for faster progress.",
            suggestions: ['Focus on high-impact changes', 'Review suggestions', 'Set specific goals']
        };
    } else {
        return {
            text: "your carbon footprint has remained relatively stable.",
            recommendation: "Try implementing some of the personalized suggestions to see improvement.",
            suggestions: ['Review suggestions', 'Try new strategies', 'Set improvement goals']
        };
    }
}

// @route   GET api/chatbot/context
// @desc    Get user context for chatbot
// @access  Private
exports.getUserContext = async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ msg: 'User not authenticated' });
    }

    try {
        const calculations = await Calculation.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        const totalScore = calculations.reduce((sum, calc) => sum + (calc.score || 0), 0);
        const averageScore = calculations.length ? Math.round(totalScore / calculations.length) : 0;

        res.json({
            recentCalculations: calculations,
            totalScore,
            averageScore,
            calculationCount: calculations.length,
            lastActivity: calculations[0]?.createdAt,
            trendAnalysis: analyzeTrend(calculations)
        });

    } catch (err) {
        console.error('Get Context Error:', err.message);
        res.status(500).json({ msg: 'Error fetching user context' });
    }
};

// @route   GET api/chatbot/history
// @desc    Get chat history for authenticated user
// @access  Private
exports.getHistory = async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ msg: 'User not authenticated' });
    }

    try {
        const ChatMessage = require('../models/ChatMessage');
        const messages = await ChatMessage.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            limit: 200
        });

        res.json(messages);
    } catch (err) {
        console.error('Get History Error:', err.message);
        res.status(500).json({ msg: 'Error fetching chat history' });
    }
};
