# =====================================================
# PowerShell Script tạo test data cho Discord Clone
# Chạy: .\create-test-data.ps1 -Token "YOUR_JWT_TOKEN"
# =====================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$Token
)

$BaseUrl = "http://localhost:8085/api"
$Headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $Token"
}

Write-Host "`n🚀 Bắt đầu tạo test data..." -ForegroundColor Cyan

# =====================================================
# 1. TẠO SERVERS
# =====================================================
Write-Host "`n📦 Tạo Servers..." -ForegroundColor Yellow

$servers = @(
    @{
        name = "Gaming Squad"
        description = "Cộng đồng game thủ Việt Nam - PUBG, LOL, Valorant"
    },
    @{
        name = "Dev Vietnam"
        description = "Nơi chia sẻ kiến thức lập trình - React, Node, Java"
    },
    @{
        name = "Study Together"
        description = "Học nhóm online mỗi ngày - IELTS, TOEIC, Đại học"
    },
    @{
        name = "Music Lounge"
        description = "Chill và nghe nhạc cùng nhau"
    }
)

foreach ($server in $servers) {
    Write-Host "  → Creating: $($server.name)"
    try {
        $body = $server | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "$BaseUrl/servers" -Method Post -Headers $Headers -Body $body
        Write-Host "    ✓ Created with ID: $($response.id)" -ForegroundColor Green
    } catch {
        Write-Host "    ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# =====================================================
# 2. TẠO CATEGORIES (cho Server ID = 1)
# =====================================================
Write-Host "`n📂 Tạo Categories cho Server 1..." -ForegroundColor Yellow

$categories = @(
    @{ name = "Kênh Chat"; serverId = 1 },
    @{ name = "Kênh Thoại"; serverId = 1 },
    @{ name = "Thông Báo"; serverId = 1 }
)

foreach ($category in $categories) {
    Write-Host "  → Creating: $($category.name)"
    try {
        $body = $category | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "$BaseUrl/servers/1/categories" -Method Post -Headers $Headers -Body $body
        Write-Host "    ✓ Created with ID: $($response.id)" -ForegroundColor Green
    } catch {
        Write-Host "    ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# =====================================================
# 3. TẠO CHANNELS (cho Server ID = 1)
# =====================================================
Write-Host "`n💬 Tạo Channels cho Server 1..." -ForegroundColor Yellow

$channels = @(
    # Text Channels (categoryId = 1)
    @{ name = "general"; serverId = 1; categoryId = 1; type = "TEXT"; topic = "Kênh chat chung" },
    @{ name = "off-topic"; serverId = 1; categoryId = 1; type = "TEXT"; topic = "Nói chuyện linh tinh" },
    @{ name = "game-chat"; serverId = 1; categoryId = 1; type = "TEXT"; topic = "Bàn luận về game" },
    # Voice Channels (categoryId = 2)
    @{ name = "Phòng Game"; serverId = 1; categoryId = 2; type = "VOICE" },
    @{ name = "Music Room"; serverId = 1; categoryId = 2; type = "VOICE" },
    @{ name = "Chill Zone"; serverId = 1; categoryId = 2; type = "VOICE" },
    # Announcement (categoryId = 3)
    @{ name = "announcements"; serverId = 1; categoryId = 3; type = "TEXT"; topic = "Thông báo quan trọng" }
)

foreach ($channel in $channels) {
    Write-Host "  → Creating: $($channel.name) ($($channel.type))"
    try {
        $body = $channel | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "$BaseUrl/servers/1/channels" -Method Post -Headers $Headers -Body $body
        Write-Host "    ✓ Created with ID: $($response.id)" -ForegroundColor Green
    } catch {
        Write-Host "    ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# =====================================================
Write-Host "`n✅ Hoàn thành tạo test data!" -ForegroundColor Green
Write-Host "`n📊 Tổng kết:" -ForegroundColor Cyan
Write-Host "  - 4 Servers"
Write-Host "  - 3 Categories (cho Server 1)"
Write-Host "  - 7 Channels (cho Server 1)"
Write-Host "`n🔍 Test tìm kiếm với keywords:" -ForegroundColor Cyan
Write-Host "  - 'Gaming', 'Dev', 'Study', 'Music'"
Write-Host "  - 'general', 'game', 'announcements'"
Write-Host "  - 'Phòng', 'Room', 'Chill'"
