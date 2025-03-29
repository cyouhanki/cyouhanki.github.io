document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing chart...');
    const ctx = document.getElementById('timeChart');
    
    if (!ctx) {
        console.error('Cannot find timeChart element');
        return;
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
            datasets: [
                {
                    label: '日本語',
                    data: [50, 50, 25, 100, 100, 100, 100, 25],
                    fill: true,
                    backgroundColor: 'rgba(255, 182, 193, 0.7)',
                    borderColor: 'rgba(255, 182, 193, 0.9)',
                    tension: 0.4,
                    borderWidth: 1
                },
                {
                    label: 'CSS+HTML',
                    data: [50, 50, 25, 0, 0, 0, 0, 0],
                    fill: true,
                    backgroundColor: 'rgba(152, 251, 152, 0.7)',
                    borderColor: 'rgba(152, 251, 152, 0.9)',
                    tension: 0.4,
                    borderWidth: 1
                },
                {
                    label: 'C#',
                    data: [0, 0, 50, 0, 0, 0, 0, 0],
                    fill: true,
                    backgroundColor: 'rgba(135, 206, 250, 0.7)',
                    borderColor: 'rgba(135, 206, 250, 0.9)',
                    tension: 0.4,
                    borderWidth: 1
                },
                {
                    label: 'Python',
                    data: [0, 0, 0, 0, 0, 0, 0, 20],
                    fill: true,
                    backgroundColor: 'rgba(221, 160, 221, 0.7)',
                    borderColor: 'rgba(221, 160, 221, 0.9)',
                    tension: 0.4,
                    borderWidth: 1
                },
                {
                    label: 'AI Tools',
                    data: [0, 0, 0, 0, 0, 0, 0, 50],
                    fill: true,
                    backgroundColor: 'rgba(255, 218, 185, 0.7)',
                    borderColor: 'rgba(255, 218, 185, 0.9)',
                    tension: 0.4,
                    borderWidth: 1
                },
                {
                    label: 'Swift',
                    data: [0, 0, 0, 0, 0, 0, 0, 5],
                    fill: true,
                    backgroundColor: 'rgba(255, 255, 224, 0.7)',
                    borderColor: 'rgba(255, 255, 224, 0.9)',
                    tension: 0.4,
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    stacked: true,
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.03)',
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
                            size: 12
                        },
                        color: '#999',
                        padding: 10,
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    title: {
                        display: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
                            size: 12
                        },
                        color: '#999',
                        padding: 10
                    },
                    title: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    align: 'center',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
                            size: 13,
                            weight: '500'
                        },
                        color: '#666'
                    }
                },
                title: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#333',
                    bodyColor: '#666',
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y + '%';
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            elements: {
                line: {
                    tension: 0.4
                }
            }
        }
    });

    // 初始化地图
    const map = L.map('map').setView([43.0667, 141.3500], 4); // 札幌的坐标

    // 使用 OpenStreetMap 瓦片图层
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // 自定义头像标记
    const avatarIcon = L.divIcon({
        className: 'custom-avatar-marker',
        html: '<div class="avatar-container"><img src="self1.png" class="avatar-img"></div>',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });

    // 添加札幌的头像标记
    L.marker([43.0667, 141.3500], {icon: avatarIcon})
        .addTo(map)
        .bindPopup('Current Location: Sapporo, Japan');

    // 自定义旅行地点标记
    const visitedIcon = L.divIcon({
        className: 'visited-place-marker',
        html: '<div class="visited-marker"><i class="fas fa-map-marker-alt"></i></div>',
        iconSize: [30, 30],
        iconAnchor: [15, 30]
    });

    // 旅行地点数据
    const visitedPlaces = [
        {name: "Manila, Philippines", coords: [14.5995, 120.9842]},
        {name: "Seoul, South Korea", coords: [37.5665, 126.9780]},
        {name: "Hong Kong", coords: [22.3193, 114.1694]},
        {name: "Taipei, Taiwan", coords: [25.0330, 121.5654]},
        {name: "Macau", coords: [22.1987, 113.5439]},
        {name: "Male, Maldives", coords: [4.1755, 73.5093]},
        {name: "Marrakech, Morocco", coords: [31.6295, -7.9811]},
        {name: "Tunis, Tunisia", coords: [36.8065, 10.1815]}
    ];

    // 添加旅行地点标记
    visitedPlaces.forEach(place => {
        L.marker(place.coords, {icon: visitedIcon})
            .addTo(map)
            .bindPopup(place.name);
    });

    // 连接所有地点（包括札幌）创建旅行路线
    const allCoords = [[43.0667, 141.3500], ...visitedPlaces.map(p => p.coords)];
    const pathLine = L.polyline(allCoords, {
        color: '#FF69B4',
        weight: 2,
        opacity: 0.6,
        dashArray: '5, 10'
    }).addTo(map);

    // 调整地图视图以显示所有标记
    map.fitBounds(pathLine.getBounds(), {padding: [50, 50]});
}); 