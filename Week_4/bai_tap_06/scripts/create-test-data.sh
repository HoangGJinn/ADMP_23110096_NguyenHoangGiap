#!/bin/bash
# =====================================================
# Script tạo test data cho Discord Clone
# Chạy: ./create-test-data.sh YOUR_JWT_TOKEN
# =====================================================

BASE_URL="http://localhost:8085/api"
TOKEN=$1

if [ -z "$TOKEN" ]; then
    echo "❌ Vui lòng cung cấp JWT token!"
    echo "Usage: ./create-test-data.sh YOUR_JWT_TOKEN"
    exit 1
fi

AUTH_HEADER="Authorization: Bearer $TOKEN"
CONTENT_TYPE="Content-Type: application/json"

echo "🚀 Bắt đầu tạo test data..."

# =====================================================
# 1. TẠO SERVERS
# =====================================================
echo ""
echo "📦 Tạo Servers..."

echo "  → Creating: Gaming Squad"
curl -s -X POST "$BASE_URL/servers" \
  -H "$CONTENT_TYPE" \
  -H "$AUTH_HEADER" \
  -d '{
    "name": "Gaming Squad",
    "description": "Cộng đồng game thủ Việt Nam - PUBG, LOL, Valorant"
  }'
echo ""

echo "  → Creating: Dev Vietnam"
curl -s -X POST "$BASE_URL/servers" \
  -H "$CONTENT_TYPE" \
  -H "$AUTH_HEADER" \
  -d '{
    "name": "Dev Vietnam",
    "description": "Nơi chia sẻ kiến thức lập trình - React, Node, Java"
  }'
echo ""

echo "  → Creating: Study Together"
curl -s -X POST "$BASE_URL/servers" \
  -H "$CONTENT_TYPE" \
  -H "$AUTH_HEADER" \
  -d '{
    "name": "Study Together",
    "description": "Học nhóm online mỗi ngày - IELTS, TOEIC, Đại học"
  }'
echo ""

echo "  → Creating: Music Lounge"
curl -s -X POST "$BASE_URL/servers" \
  -H "$CONTENT_TYPE" \
  -H "$AUTH_HEADER" \
  -d '{
    "name": "Music Lounge",
    "description": "Chill và nghe nhạc cùng nhau"
  }'
echo ""

# =====================================================
# 2. TẠO CATEGORIES (cho Server ID = 1)
# =====================================================
echo ""
echo "📂 Tạo Categories cho Server 1..."

echo "  → Creating: Kênh Chat"
curl -s -X POST "$BASE_URL/servers/1/categories" \
  -H "$CONTENT_TYPE" \
  -H "$AUTH_HEADER" \
  -d '{
    "name": "Kênh Chat",
    "serverId": 1
  }'
echo ""

echo "  → Creating: Kênh Thoại"
curl -s -X POST "$BASE_URL/servers/1/categories" \
  -H "$CONTENT_TYPE" \
  -H "$AUTH_HEADER" \
  -d '{
    "name": "Kênh Thoại",
    "serverId": 1
  }'
echo ""

echo "  → Creating: Thông Báo"
curl -s -X POST "$BASE_URL/servers/1/categories" \
  -H "$CONTENT_TYPE" \
  -H "$AUTH_HEADER" \
  -d '{
    "name": "Thông Báo",
    "serverId": 1
  }'
echo ""

# =====================================================
# 3. TẠO CHANNELS (cho Server ID = 1)
# =====================================================
echo ""
echo "💬 Tạo Channels cho Server 1..."

# Text Channels (categoryId = 1)
echo "  → Creating: general"
curl -s -X POST "$BASE_URL/servers/1/channels" \
  -H "$CONTENT_TYPE" \
  -H "$AUTH_HEADER" \
  -d '{
    "name": "general",
    "serverId": 1,
    "categoryId": 1,
    "type": "TEXT",
    "topic": "Kênh chat chung cho mọi người"
  }'
echo ""

echo "  → Creating: off-topic"
curl -s -X POST "$BASE_URL/servers/1/channels" \
  -H "$CONTENT_TYPE" \
  -H "$AUTH_HEADER" \
  -d '{
    "name": "off-topic",
    "serverId": 1,
    "categoryId": 1,
    "type": "TEXT",
    "topic": "Nói chuyện linh tinh"
  }'
echo ""

echo "  → Creating: game-chat"
curl -s -X POST "$BASE_URL/servers/1/channels" \
  -H "$CONTENT_TYPE" \
  -H "$AUTH_HEADER" \
  -d '{
    "name": "game-chat",
    "serverId": 1,
    "categoryId": 1,
    "type": "TEXT",
    "topic": "Bàn luận về game"
  }'
echo ""

# Voice Channels (categoryId = 2)
echo "  → Creating: Phòng Game (VOICE)"
curl -s -X POST "$BASE_URL/servers/1/channels" \
  -H "$CONTENT_TYPE" \
  -H "$AUTH_HEADER" \
  -d '{
    "name": "Phòng Game",
    "serverId": 1,
    "categoryId": 2,
    "type": "VOICE"
  }'
echo ""

echo "  → Creating: Music Room (VOICE)"
curl -s -X POST "$BASE_URL/servers/1/channels" \
  -H "$CONTENT_TYPE" \
  -H "$AUTH_HEADER" \
  -d '{
    "name": "Music Room",
    "serverId": 1,
    "categoryId": 2,
    "type": "VOICE"
  }'
echo ""

echo "  → Creating: Chill Zone (VOICE)"
curl -s -X POST "$BASE_URL/servers/1/channels" \
  -H "$CONTENT_TYPE" \
  -H "$AUTH_HEADER" \
  -d '{
    "name": "Chill Zone",
    "serverId": 1,
    "categoryId": 2,
    "type": "VOICE"
  }'
echo ""

# Announcement Channel (categoryId = 3)
echo "  → Creating: announcements"
curl -s -X POST "$BASE_URL/servers/1/channels" \
  -H "$CONTENT_TYPE" \
  -H "$AUTH_HEADER" \
  -d '{
    "name": "announcements",
    "serverId": 1,
    "categoryId": 3,
    "type": "TEXT",
    "topic": "Thông báo quan trọng"
  }'
echo ""

# =====================================================
echo ""
echo "✅ Hoàn thành tạo test data!"
echo ""
echo "📊 Tổng kết:"
echo "  - 4 Servers"
echo "  - 3 Categories (cho Server 1)"
echo "  - 7 Channels (cho Server 1)"
echo ""
echo "🔍 Bây giờ bạn có thể test tìm kiếm với keywords:"
echo "  - 'Gaming', 'Dev', 'Study', 'Music'"
echo "  - 'general', 'game', 'announcements'"
echo "  - 'Phòng', 'Room', 'Chill'"
