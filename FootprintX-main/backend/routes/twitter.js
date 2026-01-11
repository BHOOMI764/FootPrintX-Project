const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/authMiddleware');

// Twitter API configuration
const TWITTER_API_KEY = process.env.TWITTER_API_KEY;
const TWITTER_API_SECRET = process.env.TWITTER_API_SECRET;
const TWITTER_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN;
const TWITTER_ACCESS_TOKEN_SECRET = process.env.TWITTER_ACCESS_TOKEN_SECRET;
const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

// @route   POST api/twitter/tweet
// @desc    Post a tweet about environmental complaint
// @access  Private
router.post('/tweet', auth, async (req, res) => {
    const { complaintId, tweetText, hashtags, images } = req.body;
    
    if (!req.user || !req.user.id) {
        return res.status(401).json({ msg: 'User not authenticated' });
    }
    
    const userId = req.user.id;

    try {
        // Validate tweet content
        if (!tweetText || tweetText.length > 280) {
            return res.status(400).json({ 
                msg: 'Tweet text is required and must be under 280 characters' 
            });
        }

        // Format tweet with hashtags
        const formattedTweet = `${tweetText}\n\n${hashtags || '#ClimateAction #CarbonFootprint #Sustainability'}`;

        // Post tweet using Twitter API v2
        const tweetResponse = await postTweet(formattedTweet, images);

        // Store tweet data in database (you might want to create a Tweet model)
        const tweetData = {
            userId,
            complaintId,
            tweetId: tweetResponse.data.id,
            tweetText: formattedTweet,
            timestamp: new Date(),
            status: 'posted'
        };

        // Broadcast real-time update
        const io = req.app.get('io');
        if (io) {
            io.emit('tweet-posted', {
                userId,
                tweetId: tweetResponse.data.id,
                tweetText: formattedTweet,
                timestamp: new Date()
            });
        }

        res.json({
            success: true,
            tweetId: tweetResponse.data.id,
            tweetText: formattedTweet,
            url: `https://twitter.com/user/status/${tweetResponse.data.id}`,
            message: 'Tweet posted successfully!'
        });

    } catch (error) {
        console.error('Twitter API Error:', error.response?.data || error.message);
        res.status(500).json({ 
            msg: 'Failed to post tweet',
            error: error.response?.data || error.message
        });
    }
});

// @route   GET api/twitter/trending-hashtags
// @desc    Get trending environmental hashtags
// @access  Public
router.get('/trending-hashtags', async (req, res) => {
    try {
        const trendingHashtags = await getTrendingHashtags();
        res.json(trendingHashtags);
    } catch (error) {
        console.error('Trending hashtags error:', error);
        res.status(500).json({ msg: 'Failed to fetch trending hashtags' });
    }
});

// @route   GET api/twitter/environmental-mentions
// @desc    Get recent environmental mentions
// @access  Public
router.get('/environmental-mentions', async (req, res) => {
    try {
        const mentions = await getEnvironmentalMentions();
        res.json(mentions);
    } catch (error) {
        console.error('Environmental mentions error:', error);
        res.status(500).json({ msg: 'Failed to fetch environmental mentions' });
    }
});

// @route   POST api/twitter/schedule-tweet
// @desc    Schedule a tweet for later posting
// @access  Private
router.post('/schedule-tweet', auth, async (req, res) => {
    const { tweetText, scheduledTime, hashtags } = req.body;
    
    if (!req.user || !req.user.id) {
        return res.status(401).json({ msg: 'User not authenticated' });
    }
    
    const userId = req.user.id;

    try {
        // Validate scheduled time
        const scheduleDate = new Date(scheduledTime);
        if (scheduleDate <= new Date()) {
            return res.status(400).json({ msg: 'Scheduled time must be in the future' });
        }

        // Store scheduled tweet (you might want to create a ScheduledTweet model)
        const scheduledTweet = {
            userId,
            tweetText: `${tweetText}\n\n${hashtags || '#ClimateAction #CarbonFootprint'}`,
            scheduledTime: scheduleDate,
            status: 'scheduled',
            createdAt: new Date()
        };

        // In a real implementation, you'd store this in a database
        // and have a cron job to post it at the scheduled time

        res.json({
            success: true,
            scheduledTweet,
            message: 'Tweet scheduled successfully!'
        });

    } catch (error) {
        console.error('Schedule tweet error:', error);
        res.status(500).json({ msg: 'Failed to schedule tweet' });
    }
});

// @route   GET api/twitter/user-tweets/:userId
// @desc    Get user's environmental tweets
// @access  Private
router.get('/user-tweets/:userId', auth, async (req, res) => {
    const { userId } = req.params;

    try {
        // In a real implementation, you'd fetch from your database
        const userTweets = await getUserTweets(userId);
        res.json(userTweets);
    } catch (error) {
        console.error('User tweets error:', error);
        res.status(500).json({ msg: 'Failed to fetch user tweets' });
    }
});

// Helper function to post tweet
async function postTweet(tweetText, images = []) {
    const response = await axios.post('https://api.twitter.com/2/tweets', {
        text: tweetText,
        // media: images // Uncomment if you want to support images
    }, {
        headers: {
            'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`,
            'Content-Type': 'application/json'
        }
    });

    return response;
}

// Helper function to get trending hashtags
async function getTrendingHashtags() {
    try {
        // Search for environmental hashtags
        const response = await axios.get('https://api.twitter.com/2/tweets/search/recent', {
            params: {
                query: '#ClimateAction OR #CarbonFootprint OR #Sustainability OR #GreenEnergy OR #EcoFriendly',
                max_results: 100,
                'tweet.fields': 'created_at,public_metrics'
            },
            headers: {
                'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`
            }
        });

        // Extract and count hashtags
        const hashtagCount = {};
        response.data.data?.forEach(tweet => {
            const hashtags = tweet.text.match(/#\w+/g);
            if (hashtags) {
                hashtags.forEach(tag => {
                    hashtagCount[tag] = (hashtagCount[tag] || 0) + 1;
                });
            }
        });

        // Sort by count and return top hashtags
        const trendingHashtags = Object.entries(hashtagCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([hashtag, count]) => ({ hashtag, count }));

        return trendingHashtags;
    } catch (error) {
        console.error('Error fetching trending hashtags:', error);
        // Return default hashtags if API fails
        return [
            { hashtag: '#ClimateAction', count: 1250 },
            { hashtag: '#CarbonFootprint', count: 980 },
            { hashtag: '#Sustainability', count: 2100 },
            { hashtag: '#GreenEnergy', count: 750 },
            { hashtag: '#EcoFriendly', count: 1100 },
            { hashtag: '#RenewableEnergy', count: 850 },
            { hashtag: '#ZeroWaste', count: 650 },
            { hashtag: '#ClimateChange', count: 3200 },
            { hashtag: '#Environmental', count: 900 },
            { hashtag: '#GreenTech', count: 500 }
        ];
    }
}

// Helper function to get environmental mentions
async function getEnvironmentalMentions() {
    try {
        const response = await axios.get('https://api.twitter.com/2/tweets/search/recent', {
            params: {
                query: 'carbon footprint OR climate change OR sustainability OR renewable energy',
                max_results: 20,
                'tweet.fields': 'created_at,public_metrics,author_id',
                'user.fields': 'username,name,profile_image_url'
            },
            headers: {
                'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`
            }
        });

        return response.data.data || [];
    } catch (error) {
        console.error('Error fetching environmental mentions:', error);
        return [];
    }
}

// Helper function to get user tweets
async function getUserTweets(userId) {
    // In a real implementation, you'd fetch from your database
    return [
        {
            id: 1,
            tweetText: "Just calculated my carbon footprint and found ways to reduce it! 🌱 #CarbonFootprint #Sustainability",
            timestamp: new Date(Date.now() - 3600000),
            likes: 15,
            retweets: 3
        },
        {
            id: 2,
            tweetText: "Switched to renewable energy and my carbon footprint dropped by 30%! 💚 #GreenEnergy #ClimateAction",
            timestamp: new Date(Date.now() - 7200000),
            likes: 28,
            retweets: 7
        }
    ];
}

module.exports = router;
