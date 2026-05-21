(function() {
    'use strict';

    const createSpoolSVG = (index) => `
        <div id="cfs-spool-container-${index}" class="cfs-spool-container" style="flex: 1; text-align: center; max-width: 120px; min-width: 60px; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 8px; padding: 10px; position: relative; overflow: hidden;">
            <svg viewBox="0 0 248 500" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: auto; position: relative; z-index: 2;">
                <defs>
                    <path id="cfs-oval" d="M0-63c35 0 63 28 63 63S35 63 0 63-63 35-63 0s28-63 63-63" vector-effect="non-scaling-stroke" />
                    <path id="cfs-center" d="M0-63c35 0 63 28 63 63S35 63 0 63h-624V-63z" vector-effect="non-scaling-stroke" />
                    <filter id="cfs-blur_wheel" width="1.3" height="1.16">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                        <feOffset dx="18" dy="0" result="oBlur" />
                        <feFlood flood-color="#000" flood-opacity=".67" />
                        <feComposite in2="oBlur" operator="in" />
                        <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                </defs>
                <g transform="matrix(0.59,0,0,3.95,197,250)">
                    <use href="#cfs-oval" style="filter: url(#cfs-blur_wheel)" fill="#AD8762" />
                    <use href="#cfs-oval" transform="scale(0.41)" style="filter: url(#cfs-blur_wheel)" fill="#AD8762" />
                    <use href="#cfs-center" transform="scale(0.41)" fill="#AD8762" />
                </g>
                <path id="cfs-filament-${index}" d="M0-63c35 0 63 28 63 63S35 63 0 63h-424V-63z" 
                    vector-effect="non-scaling-stroke" fill="#292929" 
                    transform="matrix(0.4,0,0,3.5,197,250)" style="display: none;" />
                <g transform="matrix(0.59,0,0,3.95,37,250)">
                    <use href="#cfs-oval" style="filter: url(#cfs-blur_wheel)" fill="#AD8762" />
                    <use href="#cfs-oval" transform="scale(0.41)" style="fill: #111111" />
                </g>
                <text id="cfs-percent-${index}" x="140" y="270" text-anchor="middle" font-weight="900" font-size="62px" fill="white" stroke="#000" stroke-width="6" stroke-linejoin="round" stroke-linecap="round" paint-order="stroke fill" style="display: none; text-shadow: 4px 4px 4px rgba(0,0,0,1); font-family: sans-serif;">0%</text>
            </svg>
            <span id="cfs-material-${index}" style="margin-top: 10px; display: inline-block; font-size: 14px; padding: 2px 8px; border-radius: 15px; background: #333; color: #555; border: 1px solid #444; width: 100%; box-sizing: border-box; text-align: center;">EMPTY</span>
        </div>
    `;

    function buildCfsCard() {
        if (document.getElementById('mainsail-cfs-panel')) return;

        const targetColumn = 
            document.querySelector('.v-window-item--active .row > .col-md-6') || 
            document.querySelector('.v-window-item--active .row > .col-12') ||
            document.querySelector('.dashboard-page .row > div') ||
            document.querySelector('#app .v-main__wrap .container .row > div');

        if (!targetColumn) return;

        const card = document.createElement('div');
        card.id = 'mainsail-cfs-panel';
        card.className = 'v-card v-sheet theme--dark mb-4 elevation-2';
        card.style.border = '1px solid rgba(255, 255, 255, 0.12)';

        card.innerHTML = `
            <div class="v-toolbar v-toolbar--flat v-sheet theme--dark" style="height: 44px; background: transparent;">
                <div class="v-toolbar__content" style="height: 44px; padding: 0 16px;">
                    <i class="v-icon notranslate mdi mdi-layers-outline theme--dark primary--text mr-2" style="font-size: 20px;"></i>
                    <div class="v-toolbar__title text-h6 font-weight-regular" style="font-size: 1.1rem !important;">CFS Status</div>
                    <div class="spacer"></div>
                    <span id="cfs-connection-chip" class="v-chip v-chip--no-color v-chip--outlined theme--dark v-size--x-small error--text font-weight-bold" style="padding: 0 8px;">
                        CFS DAEMON: DISCONNECTED
                    </span>
                </div>
            </div>
            <div class="v-card__text pa-2" style="padding: 8px !important;">
                <style>
                    .cfs-active-spool-bg { background: linear-gradient(to top, rgba(0, 230, 118, 0.15) 0%, transparent 100%) !important; border-bottom: 3px solid #00e676 !important; }
                    .cfs-empty-spool { filter: grayscale(1) opacity(0.3); }
                </style>
                <div id="cfs-spool-grid" style="display: flex; justify-content: space-around; background: #1a1a1a; padding: 10px; border-radius: 12px; border: 1px solid #333; gap: 8px; box-shadow: inset 0 0 20px rgba(0,0,0,0.5);">
                    ${[0,1,2,3].map(i => createSpoolSVG(i)).join('')}
                </div>
                <div id="cfs-climate-info" style="margin-top: 12px; display: flex; justify-content: center; align-items: center; gap: 15px; padding-bottom: 4px;">
                    <span id="cfs-temp-val" style="color: #eee;">--°C</span>
                    <span style="font-weight: 100; color: #666;">/</span>
                    <span id="cfs-hum-val" style="color: #eee;">--%</span>
                    <span id="cfs-status-chip" class="v-chip v-chip--no-color v-chip--outlined theme--dark v-size--x-small grey--text font-weight-bold" style="margin-left: 10px; padding: 0 8px;">IDLE</span>
                </div>
            </div>
        `;

        targetColumn.insertBefore(card, targetColumn.firstChild);
        connectCfsWebSocket();
    }

    function updateCfsUI(materialBoxsArray) {
        const box1 = materialBoxsArray.find(b => b.id === 1);
        if (!box1?.materials) return;

        box1.materials.forEach((mat, index) => {
            if (index > 3) return;
            
            const container = document.getElementById(`cfs-spool-container-${index}`);
            const filEl = document.getElementById(`cfs-filament-${index}`);
            const percentEl = document.getElementById(`cfs-percent-${index}`);
            const materialEl = document.getElementById(`cfs-material-${index}`);
            if (!container) return;
            
            const hasMaterial = mat.state !== 0;
            const isSelected = mat.selected === 1;

            if (hasMaterial) {
                container.classList.remove('cfs-empty-spool');
                percentEl.textContent = `${mat.percent ?? 0}%`;
                percentEl.style.display = 'block';
                materialEl.style.color = '#aaa';
                materialEl.textContent = mat.type || 'UNKNOWN';
            } else {
                container.classList.add('cfs-empty-spool');
                percentEl.style.display = 'none';
                materialEl.style.color = '#555';
                materialEl.textContent = "EMPTY";
            }

            if (isSelected && hasMaterial) {
                container.classList.add('cfs-active-spool-bg');
                materialEl.style.borderColor = '#00e676';
                materialEl.style.color = '#00e676';
            } else {
                container.classList.remove('cfs-active-spool-bg');
                materialEl.style.borderColor = '#444';
            }

            if (filEl && hasMaterial) {
                filEl.style.display = 'block';
                const percent = mat.percent || 0;
                const sX = 0.28 + (0.4 - 0.28) * (percent / 100);
                const sY = 1.65 + (3.5 - 1.65) * (percent / 100);
                filEl.setAttribute('transform', `matrix(${sX},0,0,${sY},197,250)`);
                
                let cleanColor = mat.color || "#444444";
                if (cleanColor.startsWith("#0") && cleanColor.length > 7) cleanColor = "#" + cleanColor.substring(2);
                filEl.setAttribute('fill', cleanColor);
            } else if (filEl) {
                filEl.style.display = 'none';
            }
        });

        document.getElementById('cfs-temp-val').textContent = `${box1.temp || "--"}°C`;
        document.getElementById('cfs-hum-val').textContent = `${box1.humidity || "--"}%`;
        const statusChip = document.getElementById('cfs-status-chip');
        
        if (box1.state === 1) {
            statusChip.textContent = 'ONLINE';
            statusChip.className = "v-chip v-chip--no-color v-chip--outlined theme--dark v-size--x-small success--text font-weight-bold";
        } else {
            statusChip.textContent = 'IDLE';
            statusChip.className = "v-chip v-chip--no-color v-chip--outlined theme--dark v-size--x-small grey--text font-weight-bold";
        }
    }

    let socket = null;
    function connectCfsWebSocket() {
        if (socket && socket.readyState <= 1) return;
        
        // Explicitly fallback to page host address to preserve layout contexts across network segments
        const host = window.location.hostname || 'localhost';
        socket = new WebSocket(`ws://${host}:9999`);
        
        const connectionChip = document.getElementById('cfs-connection-chip');

        socket.onopen = () => {
            if (connectionChip) {
                connectionChip.textContent = 'CFS DAEMON: CONNECTED';
                connectionChip.className = "v-chip v-chip--no-color v-chip--outlined theme--dark v-size--x-small success--text font-weight-bold";
            }
            socket.send(JSON.stringify({"method":"get","params":{"boxsInfo":1}}));
        };

        socket.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                if (data?.boxsInfo?.materialBoxs) updateCfsUI(data.boxsInfo.materialBoxs);
            } catch(err) {}
        };

        socket.onclose = () => {
            if (connectionChip) {
                connectionChip.textContent = 'CFS DAEMON: DISCONNECTED';
                connectionChip.className = "v-chip v-chip--no-color v-chip--outlined theme--dark v-size--x-small error--text font-weight-bold";
            }
            setTimeout(connectCfsWebSocket, 5000);
        };
    }

    setInterval(buildCfsCard, 1000);
})();
