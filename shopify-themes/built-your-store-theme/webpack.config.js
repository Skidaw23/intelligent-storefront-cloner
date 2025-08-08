const path = require('path');

module.exports = {
  entry: {
    'rolex-theme': './assets/ts/main.ts',
    'rolex-3d-viewer': './assets/ts/3d-viewer.ts',
    'rolex-animations': './assets/ts/animations.ts'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'assets'),
    clean: false, // Don't clean existing Shopify assets
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'assets'),
      '@components': path.resolve(__dirname, 'assets/ts/components'),
      '@utils': path.resolve(__dirname, 'assets/ts/utils'),
      '@types': path.resolve(__dirname, 'assets/ts/types')
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-typescript']
            }
          },
          'ts-loader'
        ],
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        },
        exclude: /node_modules/
      }
    ]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        }
      }
    }
  },
  externals: {
    // Shopify's existing jQuery if available
    jquery: 'jQuery'
  }
};