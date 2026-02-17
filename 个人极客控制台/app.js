/**
 * Nexus Workspace Core v3.1 (Voice Enabled)
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initBackground();
    initRouter();
    initDashboard();
    initPasswordGenerator();
    initIconFactory();
    initRestTimer();
    showToast('Nexus Workspace 已就绪', 'success');
});

/* ================= 工具函数 ================= */
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? 'ri-checkbox-circle-line' : 'ri-information-line';
    toast.innerHTML = `<i class="${icon}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

/* ================= 1. 主题与背景 ================= */
function initTheme() {
    const toggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    toggle.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        updateThemeIcon(next);
    });

    setInterval(() => {
        const now = new Date();
        document.getElementById('mini-clock').textContent = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }, 1000);
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#theme-toggle i');
    icon.className = theme === 'light' ? 'ri-moon-line' : 'ri-sun-line';
}

function initBackground() {
    const bgLayer = document.getElementById('app-background');
    const btn = document.getElementById('bg-setting-btn');
    const input = document.getElementById('bg-upload-input');

    const savedBg = localStorage.getItem('nexus_custom_bg');
    if (savedBg) {
        bgLayer.style.backgroundImage = `url('${savedBg}')`;
    }

    btn.addEventListener('click', () => input.click());

    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            showToast('图片过大，仅将在本次会话生效', 'warning');
            const url = URL.createObjectURL(file);
            bgLayer.style.backgroundImage = `url('${url}')`;
        } else {
            const reader = new FileReader();
            reader.onload = (evt) => {
                const base64 = evt.target.result;
                bgLayer.style.backgroundImage = `url('${base64}')`;
                try {
                    localStorage.setItem('nexus_custom_bg', base64);
                    showToast('背景已更换并保存', 'success');
                } catch (err) {
                    showToast('图片太大无法保存，仅本次生效', 'warning');
                }
            };
            reader.readAsDataURL(file);
        }
    });
}

function initRouter() {
    const navItems = document.querySelectorAll('.nav-item[data-target]');
    const sections = document.querySelectorAll('.page-section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(n => n.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            item.classList.add('active');
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });
}

/* ================= 2. 仪表盘模块 ================= */
function initDashboard() {
    const weatherWidget = document.getElementById('weather-widget');
    const cityInputWrapper = document.getElementById('city-input-wrapper');
    const cityInput = document.getElementById('city-input');
    
    let lat = localStorage.getItem('weather_lat') || 39.9042;
    let lon = localStorage.getItem('weather_lon') || 116.4074;
    let cityName = localStorage.getItem('weather_city') || '北京';

    async function fetchWeather(latitude, longitude, name) {
        try {
            weatherWidget.innerHTML = `<i class="ri-loader-2-line animate-spin"></i> Loading...`;
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
            const data = await res.json();
            const temp = Math.round(data.current_weather.temperature);
            weatherWidget.innerHTML = `<i class="ri-sun-cloudy-line"></i> ${name} ${temp}°C`;
        } catch (e) {
            weatherWidget.innerHTML = `<i class="ri-error-warning-line"></i> N/A`;
        }
    }
    fetchWeather(lat, lon, cityName);

    weatherWidget.addEventListener('click', (e) => {
        e.stopPropagation();
        cityInputWrapper.classList.toggle('hidden');
        if(!cityInputWrapper.classList.contains('hidden')) cityInput.focus();
    });
    cityInputWrapper.addEventListener('click', (e) => e.stopPropagation());
    document.addEventListener('click', () => cityInputWrapper.classList.add('hidden'));

    cityInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter' && cityInput.value.trim()) {
            const query = cityInput.value.trim();
            try {
                const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=1&language=zh&format=json`);
                const data = await res.json();
                if (data.results && data.results.length > 0) {
                    const result = data.results[0];
                    lat = result.latitude; lon = result.longitude; cityName = result.name;
                    localStorage.setItem('weather_lat', lat);
                    localStorage.setItem('weather_lon', lon);
                    localStorage.setItem('weather_city', cityName);
                    fetchWeather(lat, lon, cityName);
                    cityInputWrapper.classList.add('hidden');
                    cityInput.value = '';
                    showToast(`已切换城市到: ${cityName}`, 'success');
                } else {
                    showToast('未找到该城市', 'info');
                }
            } catch (err) {
                showToast('搜索失败', 'info');
            }
        }
    });

    const focusCard = document.getElementById('focus-card');
    const focusLabel = document.getElementById('focus-label');
    const focusTimerDisplay = document.getElementById('focus-timer');
    const focusIcon = document.getElementById('focus-icon');
    let focusInterval = null;
    let focusSeconds = 0;
    let isFocusing = false;

    focusCard.addEventListener('click', () => {
        if (isFocusing) {
            clearInterval(focusInterval);
            isFocusing = false;
            focusCard.style.borderColor = 'var(--border)';
            focusLabel.textContent = '专注已暂停';
            focusIcon.className = 'ri-play-circle-line';
        } else {
            isFocusing = true;
            focusCard.style.borderColor = 'var(--primary)';
            focusLabel.textContent = '🔥 正在专注中...';
            focusIcon.className = 'ri-pause-circle-line';
            focusInterval = setInterval(() => {
                focusSeconds++;
                const h = Math.floor(focusSeconds / 3600);
                const m = Math.floor((focusSeconds % 3600) / 60);
                const s = focusSeconds % 60;
                focusTimerDisplay.textContent = `${h}h ${m}m ${s}s`;
            }, 1000);
        }
    });

    const todoList = document.getElementById('todo-list');
    const inputArea = document.getElementById('todo-input-area');
    const input = document.getElementById('new-task-input');
    const addBtn = document.getElementById('add-task-btn');
    const countBadge = document.getElementById('todo-count');
    const completionRateDisplay = document.getElementById('task-completion-rate');

    let tasks = JSON.parse(localStorage.getItem('nexus_tasks')) || [{ id: 1, text: '欢迎使用 Nexus', done: false }];

    function updateStats() {
        const total = tasks.length;
        const done = tasks.filter(t => t.done).length;
        countBadge.textContent = `${done}/${total}`;
        const rate = total === 0 ? 0 : Math.round((done / total) * 100);
        completionRateDisplay.textContent = `${rate}%`;
    }

    function renderTasks() {
        todoList.innerHTML = '';
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.done ? 'completed' : ''}`;
            li.setAttribute('data-id', task.id);
            li.innerHTML = `
                <input type="checkbox" ${task.done ? 'checked' : ''}>
                <span>${task.text}</span>
                <i class="ri-delete-bin-line task-delete"></i>
            `;
            const checkbox = li.querySelector('input');
            checkbox.addEventListener('change', () => {
                task.done = checkbox.checked;
                saveTasks();
                renderTasks();
            });
            const delBtn = li.querySelector('.task-delete');
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                tasks = tasks.filter(t => t.id !== task.id);
                saveTasks();
                renderTasks();
            });
            todoList.appendChild(li);
        });
        updateStats();
    }
    function saveTasks() { localStorage.setItem('nexus_tasks', JSON.stringify(tasks)); }

    addBtn.addEventListener('click', () => {
        inputArea.classList.toggle('hidden');
        if (!inputArea.classList.contains('hidden')) input.focus();
    });
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && input.value.trim()) {
            tasks.push({ id: Date.now(), text: input.value.trim(), done: false });
            saveTasks();
            renderTasks();
            input.value = '';
        }
    });
    new Sortable(todoList, { animation: 150 });
    renderTasks();

    const ctx = document.getElementById('efficiencyChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: '效率值',
                data: [65, 59, 80, 81, 56, 85, 90],
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });

    function updateCountdown() {
        const now = new Date();
        const friday = new Date();
        friday.setDate(now.getDate() + (5 + 7 - now.getDay()) % 7);
        friday.setHours(18, 0, 0, 0);
        if (now > friday) friday.setDate(friday.getDate() + 7);
        const diff = friday - now;
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        document.getElementById('cd-weekend').textContent = `${h}h ${m}m`;
        const nextYear = new Date(now.getFullYear() + 1, 0, 1);
        const d_year = Math.floor((nextYear - now) / (1000 * 60 * 60 * 24));
        document.getElementById('cd-year').textContent = `${d_year} 天`;
    }
    setInterval(updateCountdown, 60000);
    updateCountdown();
}

/* ================= 3. 密码生成器 ================= */
function initPasswordGenerator() {
    const display = document.getElementById('generated-password');
    const lengthSlider = document.getElementById('pass-length');
    const lengthVal = document.getElementById('length-val');
    const btnGen = document.getElementById('generate-btn');
    const btnCopy = document.getElementById('copy-btn');
    const historyList = document.getElementById('password-history-list');

    const opts = {
        upper: document.getElementById('inc-uppercase'),
        number: document.getElementById('inc-numbers'),
        symbol: document.getElementById('inc-symbols'),
        exclude: document.getElementById('exc-ambiguous')
    };
    const CHARS = { lower: 'abcdefghijklmnopqrstuvwxyz', upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', number: '0123456789', symbol: '!@#$%^&*()_+~`|}{[]:;?><,./-=' };

    function generate() {
        let chars = CHARS.lower;
        if (opts.upper.checked) chars += CHARS.upper;
        if (opts.number.checked) chars += CHARS.number;
        if (opts.symbol.checked) chars += CHARS.symbol;
        if (opts.exclude.checked) chars = chars.replace(/[l1O0]/g, '');
        const len = parseInt(lengthSlider.value);
        let pass = '';
        for (let i = 0; i < len; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
        display.value = pass;
        calculateStrength(pass);
        addToHistory(pass);
    }

    function calculateStrength(pass) {
        let score = 0;
        if (pass.length > 8) score++;
        if (pass.length > 12) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;
        const bar = document.getElementById('strength-fill');
        const text = document.getElementById('strength-text');
        const width = Math.min(100, score * 20);
        bar.style.width = `${width}%`;
        if (score < 2) { bar.style.backgroundColor = 'var(--danger)'; text.textContent = 'Weak'; }
        else if (score < 4) { bar.style.backgroundColor = 'var(--warning)'; text.textContent = 'Medium'; }
        else { bar.style.backgroundColor = 'var(--success)'; text.textContent = 'Strong'; }
    }

    function addToHistory(pass) {
        const li = document.createElement('li');
        const time = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
        li.innerHTML = `
            <span class="hist-pass">${pass}</span>
            <div style="display:flex; align-items:center; gap:5px;">
                <span class="hist-time">${time}</span>
                <button class="hist-copy" title="复制"><i class="ri-file-copy-line"></i></button>
            </div>
        `;
        li.querySelector('.hist-copy').addEventListener('click', () => {
            navigator.clipboard.writeText(pass);
            showToast('已复制历史密码', 'success');
        });
        historyList.prepend(li);
    }
    lengthSlider.addEventListener('input', (e) => lengthVal.textContent = e.target.value);
    btnGen.addEventListener('click', generate);
    btnCopy.addEventListener('click', () => { if(display.value) { navigator.clipboard.writeText(display.value); showToast('密码已复制', 'success'); }});
    generate();
}

/* ================= 4. 休息提醒 (含中文语音) ================= */
function initRestTimer() {
    const btn = document.getElementById('rest-timer-btn');
    const modal = document.getElementById('rest-modal');
    const closeBtn = document.querySelector('.close-modal');
    const badge = document.getElementById('rest-badge');
    const soundSelect = document.getElementById('rest-sound-select');
    const sound = document.getElementById('alarm-sound');
    
    // 音频源
    const SOUNDS = {
        bell: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
        alarm: "https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3",
        bird: "https://assets.mixkit.co/active_storage/sfx/209/209-preview.mp3"
    };

    // 播放提示音工具函数
    function playNotification() {
        const type = soundSelect.value;
        if (type === 'voice') {
            // 使用浏览器 Text-to-Speech API
            const msg = new SpeechSynthesisUtterance("辛苦啦，该休息一下啦");
            msg.lang = 'zh-CN';
            msg.rate = 0.9; // 语速稍慢更自然
            msg.pitch = 1.1; // 语调稍高更温柔
            window.speechSynthesis.speak(msg);
        } else {
            // 播放 MP3
            sound.src = SOUNDS[type];
            sound.play();
        }
    }

    btn.addEventListener('click', () => modal.classList.remove('hidden'));
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    window.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });

    // 试听音效
    soundSelect.addEventListener('change', () => {
        playNotification();
    });

    const presetBtns = document.querySelectorAll('.preset-btn');
    const customInput = document.getElementById('custom-rest-minutes');
    const startBtn = document.getElementById('start-rest-btn');
    const cancelBtn = document.getElementById('cancel-rest-btn');
    const displayArea = document.getElementById('rest-countdown-area');
    const display = document.getElementById('rest-countdown-display');

    let restInterval = null;
    let selectedTime = 0;

    presetBtns.forEach(pBtn => {
        pBtn.addEventListener('click', () => {
            presetBtns.forEach(b => b.style.borderColor = 'var(--border)');
            pBtn.style.borderColor = 'var(--primary)';
            selectedTime = parseInt(pBtn.dataset.time);
            customInput.value = '';
        });
    });

    startBtn.addEventListener('click', () => {
        const custom = parseInt(customInput.value);
        if (custom > 0) selectedTime = custom;
        if (selectedTime <= 0) { showToast('请选择时间', 'info'); return; }
        
        startTimer(selectedTime * 60);
    });

    cancelBtn.addEventListener('click', () => {
        clearInterval(restInterval);
        displayArea.classList.add('hidden');
        badge.classList.add('hidden');
        showToast('休息提醒已取消', 'info');
    });

    function startTimer(seconds) {
        clearInterval(restInterval);
        displayArea.classList.remove('hidden');
        badge.classList.remove('hidden');
        if (Notification.permission !== 'granted') Notification.requestPermission();
        updateDisplay(seconds);
        restInterval = setInterval(() => {
            seconds--;
            updateDisplay(seconds);
            if (seconds <= 0) {
                clearInterval(restInterval);
                badge.classList.add('hidden');
                display.textContent = "Time's up!";
                
                // 播放选定的音效或语音
                playNotification();

                if (Notification.permission === 'granted') new Notification("Nexus", { body: "☕ 休息时间到了！" });
                showToast("休息时间到了！", "success");
            }
        }, 1000);
    }
    function updateDisplay(s) {
        const m = Math.floor(s / 60);
        const remS = s % 60;
        display.textContent = `${m.toString().padStart(2,'0')}:${remS.toString().padStart(2,'0')}`;
    }
}

/* ================= 5. 图标工场 ================= */
function initIconFactory() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-upload');
    const previewArea = document.getElementById('preview-area');
    const previewFav = document.getElementById('preview-favicon');
    const previewApp = document.getElementById('preview-app-icon');
    const downloadBtn = document.getElementById('download-zip-btn');
    
    const cropModal = document.getElementById('cropper-modal');
    const imageToCrop = document.getElementById('image-to-crop');
    const confirmCropBtn = document.getElementById('confirm-crop-btn');
    const closeCropper = document.querySelector('.close-cropper');
    let cropper = null;
    let finalCanvas = null;

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = 'var(--primary)'; });
    dropZone.addEventListener('dragleave', (e) => { e.preventDefault(); dropZone.style.borderColor = 'var(--border)'; });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border)';
        handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

    closeCropper.addEventListener('click', () => cropModal.classList.add('hidden'));

    function handleFile(file) {
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            imageToCrop.src = e.target.result;
            cropModal.classList.remove('hidden');
            if (cropper) cropper.destroy();
            cropper = new Cropper(imageToCrop, {
                aspectRatio: 1,
                viewMode: 1,
            });
        };
        reader.readAsDataURL(file);
    }

    confirmCropBtn.addEventListener('click', () => {
        if (!cropper) return;
        finalCanvas = cropper.getCroppedCanvas({ width: 512, height: 512 });
        const url = finalCanvas.toDataURL('image/png');
        
        previewArea.classList.remove('hidden');
        previewFav.src = url;
        previewApp.src = url;
        
        cropModal.classList.add('hidden');
        showToast('裁剪完成，可下载图标', 'success');
    });

    downloadBtn.addEventListener('click', async () => {
        if (!finalCanvas) return;
        const zip = new JSZip();
        
        showToast('正在生成图标包...', 'info');

        const sizes = [16, 32, 180, 192, 512];
        const fileNames = {
            16: 'favicon-16x16.png', 32: 'favicon-32x32.png',
            180: 'apple-touch-icon.png', 192: 'android-chrome-192x192.png', 512: 'android-chrome-512x512.png'
        };

        const promises = sizes.map(size => {
            return new Promise(resolve => {
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = size; tempCanvas.height = size;
                const ctx = tempCanvas.getContext('2d');
                ctx.drawImage(finalCanvas, 0, 0, size, size);
                tempCanvas.toBlob(blob => {
                    zip.file(fileNames[size], blob);
                    resolve(blob);
                }, 'image/png');
            });
        });

        const results = await Promise.all(promises);
        
        const icoBlob = await pngToIco(results[1]);
        zip.file("favicon.ico", icoBlob);

        const content = await zip.generateAsync({type:"blob"});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = "nexus-icons.zip";
        link.click();
        
        showToast('下载已开始', 'success');
    });

    async function pngToIco(pngBlob) {
        const pngBuffer = await pngBlob.arrayBuffer();
        const header = new Uint8Array([0, 0, 1, 0, 1, 0]);
        const entry = new Uint8Array(16);
        const view = new DataView(entry.buffer);
        
        view.setUint8(0, 32); view.setUint8(1, 32); view.setUint8(2, 0); view.setUint8(3, 0);
        view.setUint16(4, 1, true); view.setUint16(6, 32, true);
        view.setUint32(8, pngBuffer.byteLength, true); view.setUint32(12, 22, true);

        const icoArr = new Uint8Array(6 + 16 + pngBuffer.byteLength);
        icoArr.set(header, 0); icoArr.set(entry, 6); icoArr.set(new Uint8Array(pngBuffer), 22);
        
        return new Blob([icoArr], { type: 'image/x-icon' });
    }
}