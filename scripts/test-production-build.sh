#!/bin/bash

echo "🚀 Testing Production Build (Vercel Simulation)"
echo "=============================================="

# 1. Build for production
echo "📦 Building for production..."
npm run build

# 2. Check if build succeeded
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# 3. Check build output
echo -e "\n📊 Build Statistics:"
du -sh .next/
ls -la .next/static/

# 4. Run production server locally
echo -e "\n🌐 Starting production server..."
echo "Visit http://localhost:3000/flows-experimental/workout-execution"
npm run start