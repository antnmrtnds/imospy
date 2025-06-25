# Scrape Creators API Documentation

## Overview
The Scrape Creators API provides powerful endpoints to extract *public* data from various social media platforms including TikTok, Instagram, LinkedIn, and more.

**Base URL:** `https://api.scrapecreators.com`  
**Documentation:** https://docs.scrapecreators.com  
**Get API Key:** https://app.scrapecreators.com  

## Authentication
All API requests require authentication using an API key. Include your API key in the `x-api-key` header with every request.

```bash
curl -H "x-api-key: YOUR_API_KEY" "https://api.scrapecreators.com/v1/..."
```

## Response Codes
- **200** - Success
- **400** - Bad Request - Invalid parameters or missing required fields  
- **401** - Unauthorized - Invalid or missing API key
- **500** - Server Error - Please try again later

## Support
For issues, feature requests, or bugs: adrian@thewebscrapingguy.com

---

## 🎵 TikTok Endpoints (15 total)

### 1. Profile
**GET** `/v1/tiktok/profile`
- **Description:** Scrapes a public TikTok profile
- **Parameters:**
  - `handle` (string, required) - TikTok handle

**Example Response:**
```json
{
  "user": {
    "id": "6659752019493208069",
    "uniqueId": "stoolpresidente",
    "nickname": "Dave Portnoy",
    "signature": "El Presidente/Barstool Sports Founder.",
    "verified": true
  },
  "stats": {
    "followerCount": 4100000,
    "followingCount": 74,
    "heartCount": 190400000,
    "videoCount": 2017
  }
}
```

### 2. User's Audience Demographics
**GET** `/v1/tiktok/user/audience`
- **Description:** Get audience demographics (countries). **Costs 26 credits per request**
- **Parameters:**
  - `handle` (string, required) - TikTok handle

### 3. Profile Videos
**GET** `/v1/tiktok/profile/videos`
- **Description:** Get profile videos

### 4. Profile Videos (Paginated)
**GET** `/v1/tiktok/profile/videos/paginated`  
- **Description:** Get profile videos with pagination handled

### 5. Video Info
**GET** `/v1/tiktok/video`
- **Description:** Get video information

### 6. Transcript
**GET** `/v1/tiktok/transcript`
- **Description:** Get video transcript

### 7. Comments
**GET** `/v1/tiktok/comments`
- **Description:** Get video comments

### 8. Following
**GET** `/v1/tiktok/following`
- **Description:** Get users following list

### 9. Followers
**GET** `/v1/tiktok/followers`
- **Description:** Get users followers list

### 10. Search Users
**GET** `/v1/tiktok/search/users`
- **Description:** Search for TikTok users

### 11. Search by Hashtag
**GET** `/v1/tiktok/search/hashtag`
- **Description:** Search by hashtag

### 12. Search by Keyword
**GET** `/v1/tiktok/search/keyword`
- **Description:** Search by keyword

### 13. Get Popular Songs
**GET** `/v1/tiktok/songs/popular`
- **Description:** Get popular songs

### 14. Get Song Details
**GET** `/v1/tiktok/song/details`
- **Description:** Get song details

### 15. TikToks using Song
**GET** `/v1/tiktok/song/videos`
- **Description:** Get TikToks using a specific song

---

## 📸 Instagram Endpoints (8 total)

### 1. Profile
**GET** `/v1/instagram/profile`
- **Description:** Gets public Instagram profile data, recent posts, and related accounts
- **Parameters:**
  - `handle` (string, required) - Instagram handle
  - `trim` (boolean, optional) - Set to true to get a trimmed response

**Example Response:**
```json
{
  "data": {
    "user": {
      "biography": "Scraping the web",
      "full_name": "Adrian Horning",
      "id": "2700692569", 
      "is_business_account": true,
      "is_verified": true,
      "username": "adrianhorning",
      "edge_followed_by": {"count": 25116},
      "edge_follow": {"count": 101}
    }
  }
}
```

### 2. Posts
**GET** `/v1/instagram/posts`
- **Description:** Get Instagram posts

### 3. Post/Reel Info
**GET** `/v1/instagram/post`
- **Description:** Get specific post or reel information

### 4. Transcript
**GET** `/v1/instagram/transcript`
- **Description:** Get transcript from video content

### 5. Reels
**GET** `/v1/instagram/reels`
- **Description:** Get Instagram reels

### 6. Reels (Paginated)
**GET** `/v1/instagram/reels/paginated`
- **Description:** Get Instagram reels with pagination handled

### 7. Story Highlights
**GET** `/v1/instagram/highlights`
- **Description:** Get story highlights

### 8. Highlights Details
**GET** `/v1/instagram/highlights/details`
- **Description:** Get highlights details

---

## 💼 LinkedIn Endpoints (5 total)

### 1. Person's Profile
**GET** `/v1/linkedin/profile`
- **Description:** Get a person's public profile (including recent posts)
- **Note:** Only returns publicly available data. LinkedIn doesn't return work history or job title publicly anymore
- **Parameters:**
  - `url` (string, required) - The URL of the LinkedIn profile to get

**Example Response:**
```json
{
  "success": true,
  "name": "Sam Parr",
  "location": "Westport, Connecticut, United States", 
  "followers": 64803,
  "about": "I founded The Hustle, a business news media company with $12 when I was around 25 years…",
  "experience": [],
  "education": [],
  "recentPosts": [],
  "activity": []
}
```

### 2. Company Page
**GET** `/v1/linkedin/company`
- **Description:** Get LinkedIn company page information

### 3. Post
**GET** `/v1/linkedin/post`
- **Description:** Get LinkedIn post details

### 4. Search Ads
**GET** `/v1/linkedin/ads/search`
- **Description:** Search the LinkedIn Ad Library
- **Parameters:**
  - `company` (string, optional) - The company to search for
  - `keyword` (string, optional) - The keyword to search for
  - `countries` (string, optional) - Comma separated list of countries. Example: US,CA,MX
  - `startDate` (string, optional) - Start date to search for. Format: YYYY-MM-DD
  - `endDate` (string, optional) - End date to search for. Format: YYYY-MM-DD
  - `paginationToken` (string, optional) - Pagination token to paginate through results

### 5. Ad Details
**GET** `/v1/linkedin/ads/details`
- **Description:** Get LinkedIn ad details

---

## Usage Examples

### TikTok Profile Example
```bash
curl -H "x-api-key: YOUR_API_KEY" \
  "https://api.scrapecreators.com/v1/tiktok/profile?handle=stoolpresidente"
```

### Instagram Profile Example  
```bash
curl -H "x-api-key: YOUR_API_KEY" \
  "https://api.scrapecreators.com/v1/instagram/profile?handle=adrianhorning&trim=true"
```

### LinkedIn Profile Example
```bash
curl -H "x-api-key: YOUR_API_KEY" \
  "https://api.scrapecreators.com/v1/linkedin/profile?url=https://www.linkedin.com/in/parrsam"
```

---

## Summary
- **Total Endpoints:** 28
- **TikTok:** 15 endpoints
- **Instagram:** 8 endpoints  
- **LinkedIn:** 5 endpoints

**Documentation Source:** https://docs.scrapecreators.com/
**Generated:** June 24, 2025
