
import { Game } from '../types';

// ------------------------------------------------------------------
// CONFIGURATION
// ------------------------------------------------------------------
// ⚠️ CORS WARNING: IGDB does not allow direct browser calls. 
// You must use a proxy (e.g., cors-anywhere) or a backend server.
// For local dev, you can use a proxy URL prefix.
const PROXY_URL = 'https://cors-anywhere.herokuapp.com/'; 
const IGDB_BASE_URL = 'https://api.igdb.com/v4/games';

// 🔑 SECURITY WARNING: In a real production app, never store secrets 
// in frontend code. These should be environment variables or fetched 
// via a backend proxy.
const CLIENT_ID = 'YOUR_CLIENT_ID_HERE';
const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN_HERE'; 

// ------------------------------------------------------------------
// SERVICE
// ------------------------------------------------------------------

const DUMMY_GAMES: Game[] = [
    { id: 'igdb-1', name: 'The Witcher 3: Wild Hunt', cover: 'bg-gradient-to-br from-red-900 to-black', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg', igdbId: 1942 },
    { id: 'igdb-2', name: 'Elden Ring', cover: 'bg-gradient-to-br from-yellow-700 to-black', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4h8h.jpg', igdbId: 119171 },
    { id: 'igdb-3', name: 'Cyberpunk 2077', cover: 'bg-gradient-to-br from-yellow-400 to-black', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2mjt.jpg', igdbId: 1020 },
    { id: 'igdb-4', name: 'God of War Ragnarök', cover: 'bg-gradient-to-br from-blue-900 to-black', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5s5v.jpg', igdbId: 138237 },
    { id: 'igdb-5', name: 'Baldur\'s Gate 3', cover: 'bg-gradient-to-br from-red-800 to-black', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co670h.jpg', igdbId: 121129 },
];

export const searchIGDB = async (query: string): Promise<Game[]> => {
    // If keys aren't set, return dummy data to allow testing UI
    if (CLIENT_ID === 'YOUR_CLIENT_ID_HERE' || ACCESS_TOKEN === 'YOUR_ACCESS_TOKEN_HERE') {
        process.env.NODE_ENV === 'development' && console.log("IGDB Service: Using Dummy Data (Keys missing)");
        
        // Simple client-side search simulation
        if (!query) return DUMMY_GAMES;
        return DUMMY_GAMES.filter(g => g.name.toLowerCase().includes(query.toLowerCase()));
    }

    try {
        const response = await fetch(`${PROXY_URL}${IGDB_BASE_URL}`, {
            method: 'POST',
            headers: {
                'Client-ID': CLIENT_ID,
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'text/plain',
            },
            // Search query looking for name and cover
            body: `
                search "${query}"; 
                fields name, cover.url, screenshots.url; 
                limit 20;
                where category = (0,4,8,9); // Main games, expansions, remakes
            `
        });

        if (!response.ok) {
            throw new Error(`IGDB API Error: ${response.statusText}`);
        }

        const data = await response.json();

        // Transform IGDB data to our App's Game interface
        return data.map((item: any) => {
            // Process cover URL (IGDB returns //images... so we prepend protocol)
            // We also swap 't_thumb' for a larger size like 't_cover_big' or 't_720p'
            let imageUrl = null;
            if (item.cover?.url) {
                imageUrl = "https:" + item.cover.url.replace('t_thumb', 't_cover_big');
            } else if (item.screenshots && item.screenshots.length > 0) {
                 imageUrl = "https:" + item.screenshots[0].url.replace('t_thumb', 't_cover_big');
            }

            return {
                id: `igdb-${item.id}`,
                name: item.name,
                cover: 'bg-gradient-to-br from-gray-800 to-black', // Default fallback gradient
                image: imageUrl,
                igdbId: item.id
            };
        });

    } catch (error) {
        console.error("Failed to search IGDB:", error);
        return [];
    }
};
