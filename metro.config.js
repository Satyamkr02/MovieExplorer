const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  server: {
    enhanceMiddleware: (middleware, metroServer) => {
      return (req, res, next) => {
        // Handle preflight requests
        if (req.method === 'OPTIONS' && (req.url.startsWith('/tmdb-proxy') || req.url.startsWith('/tmdb-image-proxy'))) {
          res.statusCode = 204;
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', '*');
          res.end();
          return;
        }

        // API Proxy
        if (req.url.startsWith('/tmdb-proxy')) {
          const targetPath = req.url.replace(/^\/tmdb-proxy/, '');
          const targetUrl = `https://api.themoviedb.org/3${targetPath}`;
          
          console.log(`[TMDB Proxy] API: ${req.method} ${targetUrl}`);
          
          fetch(targetUrl, {
            method: req.method,
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            }
          })
          .then(async (response) => {
            res.statusCode = response.status;
            res.setHeader('Content-Type', 'application/json;charset=utf-8');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', '*');
            const data = await response.text();
            res.end(data);
          })
          .catch((err) => {
            console.error('[TMDB Proxy] API Error:', err.message);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ error: err.message }));
          });
          
          return;
        }

        // Image Proxy
        if (req.url.startsWith('/tmdb-image-proxy')) {
          const targetPath = req.url.replace(/^\/tmdb-image-proxy/, '');
          const targetUrl = `https://image.tmdb.org${targetPath}`;
          
          console.log(`[TMDB Proxy] Image: GET ${targetUrl}`);
          
          fetch(targetUrl, { method: 'GET' })
          .then(async (response) => {
            res.statusCode = response.status;
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', '*');
            const contentType = response.headers.get('Content-Type');
            if (contentType) {
              res.setHeader('Content-Type', contentType);
            }
            const arrayBuffer = await response.arrayBuffer();
            res.end(Buffer.from(arrayBuffer));
          })
          .catch((err) => {
            console.error('[TMDB Proxy] Image Error:', err.message);
            res.statusCode = 500;
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end();
          });
          
          return;
        }

        return middleware(req, res, next);
      };
    }
  }
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
