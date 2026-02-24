(function() {
    const createSpoolSVG = (index) => /* html */ `
        <div id="spool-container-${index}" style="flex: 1; text-align: center; max-width: 120px; min-width: 60px; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 8px; padding: 10px 10px; position: relative; overflow: hidden;">
            <svg viewBox="0 0 248 500" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: auto; position: relative; z-index: 2;">
                <defs>
                    <path id="oval" d="M0-63c35 0 63 28 63 63S35 63 0 63-63 35-63 0s28-63 63-63" vector-effect="non-scaling-stroke" />
                    <path id="center" d="M0-63c35 0 63 28 63 63S35 63 0 63h-624V-63z" vector-effect="non-scaling-stroke" />
                </defs>

                <filter id="blur_wheel" width="1.3" height="1.16">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                    <feOffset dx="18" dy="0" result="oBlur" />
                    <feFlood flood-color="#000" flood-opacity=".67" />
                    <feComposite in2="oBlur" operator="in" />
                    <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <g transform="matrix(0.59,0,0,3.95,197,250)">
                    <use href="#oval" style="filter: url(#blur_wheel)" fill="#AD8762" />
                    <use href="#oval" transform="scale(0.41)" style="filter: url(#blur_wheel)" fill="#AD8762" />
                    <use href="#center" transform="scale(0.41)" fill="#AD8762" />
                </g>
                <path id="filament-${index}" d="M0-63c35 0 63 28 63 63S35 63 0 63h-424V-63z" 
                    vector-effect="non-scaling-stroke" fill="#292929" 
                    transform="matrix(0.4,0,0,3.5,197,250)" />
                <g transform="matrix(0.59,0,0,3.95,37,250)">
                    <use href="#oval" style="filter: url(#blur_wheel)" fill="#AD8762" />
                    <use href="#oval" transform="scale(0.41)" style="fill: #111111" />
                </g>
                
                <text id="percent-${index}" x="140" y="270" text-anchor="middle" font-weight="900" font-size="62px" fill="white" stroke="#000" stroke-width="6" stroke-linejoin="round" stroke-linecap="round" paint-order="stroke fill" style="text-shadow: 4px 4px 4px rgba(0,0,0,1); font-family: sans-serif;">0%</text>
            </svg>
            <span id="material-${index}" style="margin-top: 10px; display: inline-block;font-size: 14px; padding: 2px 8px; border-radius: 15px; background: #333; color: #aaa; border: 1px solid #444;">EMPTY</span>
        </div>
        
    `;

    function isHomeRoute() {
        const hash = window.location.hash;
        if (!hash) return true;
        return /^#\/($|\?)/.test(hash);
    }

    function attemptInit(retries = 0) {
        const targetCard = Array.from(document.querySelectorAll('.collapsable-card')).find(c => c.textContent.includes('filament_sensor'));
        if (!targetCard) {
            if (retries < 20) setTimeout(() => attemptInit(retries + 1), 250);
            return;
        }
        if (targetCard.dataset.cfsInit) return;
        targetCard.dataset.cfsInit = '1';

        // Header updates
        const titleSpan = targetCard.querySelector('.font-weight-light');
        if (titleSpan) titleSpan.textContent = 'CFS Status';
        
        const menuBtn = targetCard.querySelector('.v-card__title button, .v-toolbar button'); 
        if (menuBtn) menuBtn.style.setProperty('display', 'none', 'important');

        const iconSvg = targetCard.querySelector('.v-icon__svg');
        if (iconSvg) iconSvg.innerHTML = '<path d="M 12 2 C 11.811244 2.0027 11.62182 2.01009 11.433594 2.0234375 C 11.245368 2.0367892 11.058338 2.0560871 10.871094 2.0800781 C 10.528376 2.1223311 10.188076 2.1823072 9.8515625 2.2597656 C 9.4050859 2.3584685 8.9659029 2.4876777 8.5371094 2.6464844 C 8.2433457 2.7507726 7.9546177 2.8687402 7.671875 3 L 7.6699219 3 C 7.2200923 3.2179359 6.7872406 3.4692919 6.375 3.7519531 C 6.1149723 3.9281592 5.8633915 4.1165194 5.6210938 4.3164062 C 5.2734281 4.6063526 4.9458497 4.9195737 4.640625 5.2539062 C 4.4299712 5.4884886 4.2305306 5.7329027 4.0429688 5.9863281 C 4.0007188 6.0418801 3.9590487 6.0978726 3.9179688 6.1542969 C 3.7241339 6.4206091 3.543575 6.6963363 3.3769531 6.9804688 C 3.3651531 7.0019097 3.3534369 7.0233949 3.3417969 7.0449219 C 2.9828732 7.6642764 2.691488 8.3203821 2.4726562 9.0019531 C 2.3383154 9.4325109 2.233258 9.8716656 2.1582031 10.316406 C 2.1085032 10.625133 2.0733024 10.936022 2.0527344 11.248047 L 2.0527344 11.25 L 2.0527344 11.251953 L 2.0527344 11.253906 L 2.0527344 11.255859 C 2.0258944 11.502973 2.00832 11.751383 2 12 C 2.000879 12.252257 2.0113 12.504391 2.03125 12.755859 L 2.0332031 12.767578 C 2.0566631 13.076458 2.0944624 13.384082 2.1464844 13.689453 C 2.2214943 14.129536 2.3258985 14.564103 2.4589844 14.990234 C 2.5675343 15.334756 2.6946769 15.673142 2.8398438 16.003906 L 2.8457031 16.017578 L 2.8535156 16.03125 C 2.9986205 16.362102 3.1616911 16.684839 3.3417969 16.998047 L 3.34375 17 C 3.5265728 17.317394 3.7267926 17.624495 3.9433594 17.919922 C 4.1600882 18.215026 4.3928602 18.498004 4.640625 18.767578 C 4.9426097 19.096141 5.2662503 19.404121 5.609375 19.689453 C 5.8509948 19.889955 6.1019244 20.078968 6.3613281 20.255859 C 6.7778367 20.540458 7.2152833 20.793132 7.6699219 21.011719 L 7.671875 21.011719 C 7.9543247 21.147608 8.2431027 21.27014 8.5371094 21.378906 C 8.956542 21.533797 9.3858911 21.660384 9.8222656 21.757812 L 9.8242188 21.757812 C 10.165943 21.833832 10.511518 21.891861 10.859375 21.931641 C 10.885405 21.935041 10.91144 21.938206 10.9375 21.941406 C 11.290376 21.979776 11.645044 21.99934 12 22 C 12.188756 21.9973 12.37818 21.98991 12.566406 21.976562 C 12.754632 21.963215 12.941662 21.943912 13.128906 21.919922 C 13.471624 21.877672 13.811924 21.817693 14.148438 21.740234 C 14.594914 21.641534 15.034096 21.512323 15.462891 21.353516 C 15.756653 21.249229 16.045381 21.131261 16.328125 21 L 16.330078 21 C 16.779908 20.782064 17.21276 20.530708 17.625 20.248047 C 17.885029 20.07184 18.136608 19.883481 18.378906 19.683594 C 18.726573 19.393647 19.054149 19.080425 19.359375 18.746094 C 19.570029 18.511511 19.76947 18.267097 19.957031 18.013672 C 19.999281 17.958122 20.040951 17.902127 20.082031 17.845703 C 20.275866 17.57939 20.456425 17.303665 20.623047 17.019531 C 20.634847 16.998091 20.646563 16.976598 20.658203 16.955078 C 21.017127 16.335724 21.308511 15.679617 21.527344 14.998047 C 21.661685 14.567489 21.766742 14.128334 21.841797 13.683594 C 21.891497 13.374867 21.926698 13.063978 21.947266 12.751953 L 21.947266 12.75 L 21.947266 12.748047 L 21.947266 12.746094 L 21.947266 12.744141 C 21.974096 12.496824 21.99169 12.248617 22 12 C 21.999121 11.747743 21.9887 11.495609 21.96875 11.244141 L 21.966797 11.232422 C 21.943337 10.923542 21.905537 10.615918 21.853516 10.310547 C 21.778506 9.8704641 21.6741 9.4358974 21.541016 9.0097656 C 21.432464 8.6652447 21.305324 8.3268573 21.160156 7.9960938 L 21.154297 7.9824219 L 21.146484 7.96875 C 21.001384 7.6379017 20.838309 7.315161 20.658203 7.0019531 L 20.65625 7 C 20.47338 6.6826091 20.273207 6.375505 20.056641 6.0800781 C 19.839912 5.7849746 19.60714 5.5019958 19.359375 5.2324219 C 19.05739 4.903859 18.73375 4.5958783 18.390625 4.3105469 C 18.149005 4.1100449 17.898076 3.921033 17.638672 3.7441406 C 17.222163 3.459542 16.784717 3.2068671 16.330078 2.9882812 L 16.328125 2.9882812 C 16.045675 2.8523915 15.756897 2.72986 15.462891 2.6210938 C 15.043458 2.4662029 14.614109 2.3396166 14.177734 2.2421875 L 14.175781 2.2421875 C 13.834058 2.1661636 13.488482 2.1081404 13.140625 2.0683594 C 13.114595 2.0649994 13.08856 2.0617537 13.0625 2.0585938 C 12.709629 2.0202237 12.354956 2.0006604 12 2 z M 10.701172 4.25 L 10.957031 4.3984375 L 11.066406 4.4609375 L 11.132812 4.5 L 11.566406 4.75 L 11.566406 5.75 L 11.132812 6 L 10.875 6.1484375 C 10.874877 6.1490598 10.875123 6.1497684 10.875 6.1503906 L 10.701172 6.25 L 10.267578 6 L 9.8359375 5.75 L 9.8359375 4.75 L 10.103516 4.5957031 L 10.701172 4.25 z M 13.298828 4.25 L 14.164062 4.75 L 14.164062 5.75 L 13.298828 6.25 L 12.433594 5.75 L 12.433594 4.75 L 13.298828 4.25 z M 8.8398438 4.6757812 L 8.96875 4.75 L 8.96875 5.75 L 8.5371094 6 L 8.1035156 6.25 L 7.2382812 5.75 L 7.2382812 5.578125 C 7.7356888 5.2168041 8.2730923 4.9140239 8.8398438 4.6757812 z M 15.160156 4.6757812 C 15.726909 4.914025 16.264309 5.2168044 16.761719 5.578125 L 16.761719 5.75 L 16.103516 6.1308594 L 15.896484 6.25 L 15.03125 5.75 L 15.03125 4.75 L 15.160156 4.6757812 z M 6.8046875 6.5 L 7.6699219 7 L 7.6699219 8 L 6.8046875 8.5 L 6.7011719 8.4394531 L 5.9394531 8 L 5.9394531 7.75 L 5.9394531 7 L 6.8046875 6.5 z M 9.4023438 6.5 L 10.267578 7 L 10.267578 7.8398438 L 10.267578 8 L 10.140625 8.0742188 L 9.8339844 8.25 L 9.4023438 8.5 L 8.9707031 8.25 L 8.5371094 8 L 8.5371094 7 L 8.96875 6.75 L 9.4023438 6.5 z M 12 6.5 L 12.865234 7 L 12.865234 7.75 L 12.865234 8 L 12.744141 8.0703125 C 12.743508 8.0701923 12.74282 8.0704324 12.742188 8.0703125 C 12.497492 8.0239396 12.249054 8.0001594 12 8 C 11.754037 8.00282 11.508857 8.0283149 11.267578 8.0761719 L 11.134766 8 L 11.134766 7.25 L 11.134766 7 L 11.896484 6.5605469 L 12 6.5 z M 14.597656 6.5 L 15.029297 6.75 L 15.462891 7 L 15.462891 8 L 14.597656 8.5 L 14.166016 8.25 L 13.732422 8 L 13.732422 7 L 14.166016 6.75 L 14.597656 6.5 z M 17.195312 6.5 L 17.298828 6.5605469 L 18.060547 7 L 18.060547 7.25 L 18.060547 8 L 17.298828 8.4394531 L 17.195312 8.5 L 16.330078 8 L 16.330078 7 L 17.195312 6.5 z M 5.5058594 8.75 L 6.3710938 9.25 L 6.3710938 10.25 L 5.5058594 10.75 L 4.640625 10.25 L 4.640625 9.25 L 5.5058594 8.75 z M 8.1035156 8.75 L 8.96875 9.25 L 8.96875 9.390625 C 8.6470443 9.7691664 8.398667 10.204324 8.2363281 10.673828 L 8.1035156 10.75 L 7.5449219 10.427734 L 7.2382812 10.25 L 7.2382812 9.25 L 8.1035156 8.75 z M 15.896484 8.75 L 16.761719 9.25 L 16.761719 10.25 L 16.328125 10.5 L 15.896484 10.75 L 15.775391 10.679688 C 15.6258 10.253096 15.401287 9.8581752 15.119141 9.5058594 C 15.089259 9.4685462 15.062498 9.4288507 15.03125 9.3925781 L 15.03125 9.390625 L 15.03125 9.25 L 15.462891 9 L 15.896484 8.75 z M 18.494141 8.75 L 19.359375 9.25 L 19.359375 10.25 L 18.494141 10.75 L 18.287109 10.630859 L 17.628906 10.25 L 17.628906 9.25 L 18.494141 8.75 z M 12 10 C 13.104568 10 14 10.895432 14 12 C 14 13.035532 13.213589 13.887814 12.205078 13.990234 C 12.137844 13.997062 12.069035 14 12 14 C 11.792894 14 11.592174 13.968592 11.404297 13.910156 C 11.028542 13.793284 10.701584 13.567814 10.457031 13.271484 C 10.416272 13.222096 10.377738 13.172341 10.341797 13.119141 C 10.126148 12.799939 10 12.414213 10 12 C 10 11.930965 10.002938 11.862156 10.009766 11.794922 C 10.037078 11.525986 10.119032 11.273584 10.242188 11.046875 C 10.396132 10.763489 10.614858 10.521504 10.880859 10.341797 C 10.93406 10.305855 10.990198 10.272976 11.046875 10.242188 C 11.330261 10.088243 11.654823 10 12 10 z M 4.2070312 11 L 5.0722656 11.5 L 5.0722656 11.75 L 5.0722656 12.5 L 4.2070312 13 L 4.0722656 12.921875 C 4.0304257 12.616234 4.0063 12.308428 4 12 C 4.00315 11.845786 4.0113888 11.690819 4.0234375 11.537109 C 4.0354862 11.383399 4.0513406 11.230945 4.0722656 11.078125 L 4.2070312 11 z M 6.8046875 11 L 7.2363281 11.25 L 7.6699219 11.5 L 7.6699219 12.5 L 6.8046875 13 L 6.7011719 12.939453 L 5.9394531 12.5 L 5.9394531 11.5 L 6.7011719 11.060547 L 6.8046875 11 z M 17.195312 11 L 17.298828 11.060547 L 18.060547 11.5 L 18.060547 12.5 L 17.298828 12.939453 L 17.195312 13 L 16.763672 12.75 L 16.330078 12.5 L 16.330078 11.5 L 17.195312 11 z M 19.792969 11 L 19.927734 11.078125 C 19.969574 11.383766 19.9937 11.691572 20 12 C 19.9937 12.308428 19.969584 12.616234 19.927734 12.921875 L 19.792969 13 L 18.927734 12.5 L 18.927734 12.25 L 18.927734 11.5 L 19.792969 11 z M 5.5058594 13.25 L 5.7128906 13.369141 L 6.3710938 13.75 L 6.3710938 14.75 L 5.5058594 15.25 L 4.640625 14.75 L 4.640625 13.75 L 5.5058594 13.25 z M 8.1035156 13.25 L 8.2246094 13.320312 C 8.3742003 13.746904 8.5987134 14.141825 8.8808594 14.494141 C 8.9107409 14.531454 8.9375015 14.571149 8.96875 14.607422 C 8.9690848 14.607816 8.968415 14.608981 8.96875 14.609375 L 8.96875 14.75 L 8.5371094 15 L 8.1035156 15.25 L 7.2382812 14.75 L 7.2382812 13.75 L 7.671875 13.5 L 8.1035156 13.25 z M 15.896484 13.25 L 16.455078 13.572266 L 16.761719 13.75 L 16.761719 14.75 L 15.896484 15.25 L 15.03125 14.75 L 15.03125 14.609375 C 15.288819 14.306302 15.495308 13.965789 15.652344 13.601562 C 15.6928 13.511265 15.729958 13.419415 15.763672 13.326172 L 15.896484 13.25 z M 18.494141 13.25 L 19.359375 13.75 L 19.359375 14.75 L 18.494141 15.25 L 17.628906 14.75 L 17.628906 13.75 L 18.494141 13.25 z M 6.8046875 15.5 L 7.6699219 16 L 7.6699219 17 L 6.8046875 17.5 L 6.7011719 17.439453 L 5.9394531 17 L 5.9394531 16.75 L 5.9394531 16 L 6.7011719 15.560547 L 6.8046875 15.5 z M 9.4023438 15.5 L 9.8339844 15.75 L 10.267578 16 L 10.267578 17 L 9.8339844 17.25 L 9.4023438 17.5 L 8.9707031 17.25 L 8.5371094 17 L 8.5371094 16.25 L 8.5371094 16 L 8.96875 15.75 L 8.9707031 15.75 L 9.4023438 15.5 z M 14.597656 15.5 L 15.029297 15.75 L 15.462891 16 L 15.462891 17 L 15.03125 17.25 L 14.597656 17.5 L 13.732422 17 L 13.732422 16.160156 L 13.732422 16 L 13.859375 15.925781 L 14.166016 15.75 L 14.597656 15.5 z M 17.195312 15.5 L 17.298828 15.560547 L 18.060547 16 L 18.060547 16.25 L 18.060547 17 L 17.195312 17.5 L 16.330078 17 L 16.330078 16 L 17.195312 15.5 z M 12.732422 15.923828 L 12.865234 16 L 12.865234 16.75 L 12.865234 17 L 12.103516 17.439453 L 12 17.5 L 11.134766 17 L 11.134766 16 L 11.255859 15.929688 C 11.256492 15.929808 11.25718 15.929568 11.257812 15.929688 C 11.502508 15.976059 11.750946 15.99984 12 16 C 12.122981 15.9986 12.244987 15.991227 12.367188 15.978516 C 12.489388 15.965806 12.611782 15.947758 12.732422 15.923828 z M 8.1035156 17.75 L 8.96875 18.25 L 8.96875 19.25 L 8.8398438 19.324219 C 8.2730923 19.085975 7.7356888 18.783196 7.2382812 18.421875 L 7.2382812 18.25 L 7.8964844 17.869141 L 8.1035156 17.75 z M 10.701172 17.75 L 11.566406 18.25 L 11.566406 19.25 L 10.701172 19.75 L 9.8359375 19.25 L 9.8359375 18.25 L 10.701172 17.75 z M 13.298828 17.75 L 13.732422 18 L 14.164062 18.25 L 14.164062 19.25 L 13.896484 19.404297 L 13.298828 19.75 L 13.042969 19.601562 L 12.867188 19.5 L 12.433594 19.25 L 12.433594 18.25 L 12.867188 18 L 13.125 17.851562 C 13.125123 17.85094 13.124877 17.850232 13.125 17.849609 L 13.298828 17.75 z M 15.896484 17.75 L 16.761719 18.25 L 16.761719 18.421875 C 16.264309 18.783196 15.726909 19.085977 15.160156 19.324219 L 15.03125 19.25 L 15.03125 18.25 L 15.462891 18 L 15.896484 17.75 z"></path>';


        const cardBody = targetCard.querySelector('.v-card__text');
        if (cardBody) {
            cardBody.innerHTML =/* html */ `
                <style>
                    .active-spool-bg { background: linear-gradient(to top, rgba(0, 230, 118, 0.15) 0%, transparent 100%) !important; border-bottom: 3px solid #00e676 !important; }
                    .empty-spool { filter: grayscale(1) opacity(0.3); }
                </style>
                <div id="spool-grid" style="display: flex; justify-content: space-around; background: #1a1a1a; padding: 10px; border-radius: 12px; border: 1px solid #333; gap: 8px; box-shadow: inset 0 0 20px rgba(0,0,0,0.5);">
                    ${[0,1,2,3].map(i => createSpoolSVG(i)).join('')}
                </div>
                <div id="climate-info" style="margin-top: 12px; display: flex; justify-content: center; align-items: center; gap: 15px;">
                    <span id="temp-val" style="font-size: 16px; font-weight: 300; color: #eee;">--°C</span>
                    <span style="font-weight: 100;">/</span>
                    <span id="hum-val" style="font-size: 16px; font-weight: 300; color: #eee;">--%</span>
                    <span id="status-chip" style="margin-left: 10px; font-size: 10px; padding: 2px 8px; border-radius: 10px; background: #333; color: #aaa; border: 1px solid #444;">IDLE</span>
                </div>
            `;

            window.updateSpoolUI = function(materialBoxsArray) {
                const box1 = materialBoxsArray.find(b => b.id === 1);
                if (!box1?.materials) return;

                box1.materials.forEach((mat, index) => {
                    if (index > 3) return;
                    
                    const container = document.getElementById(`spool-container-${index}`);
                    const filEl = document.getElementById(`filament-${index}`);
                    const percentEl = document.getElementById(`percent-${index}`);
                    const materialEl = document.getElementById(`material-${index}`);
                    
                    const hasMaterial = mat.state !== 0 && mat.type !== "" && mat.type !== "EMPTY";
                    const isSelected = mat.selected === 1;

                    if (hasMaterial) {
                        container.classList.remove('empty-spool');
                        percentEl.textContent = `${mat.percent}%`;
                        percentEl.style.visibility = 'visible';
                        materialEl.style.fill = "#aaa";
                        materialEl.textContent = mat.type;
                    } else {
                        container.classList.add('empty-spool');
                        percentEl.style.visibility = 'hidden';
                        materialEl.style.fill = "#555";
                        materialEl.textContent = "EMPTY";
                    }

                    if (isSelected && hasMaterial) {
                        container.classList.add('active-spool-bg');
                        materialEl.style.borderColor = '#00e676';
                        materialEl.style.color = '#00e676';
                    } else {
                        container.classList.remove('active-spool-bg');
                        materialEl.style.borderColor = '#444';
                        materialEl.style.color = '#aaa';
                    }

                    if (filEl && hasMaterial) {
                        const percent = mat.percent || 0;
                        const sX = 0.28 + (0.4 - 0.28) * (percent / 100);
                        const sY = 1.65 + (3.5 - 1.65) * (percent / 100);
                        filEl.setAttribute('transform', `matrix(${sX},0,0,${sY},197,250)`);
                        
                        let cleanColor = mat.color || "#444444";
                        if (cleanColor.startsWith("#0") && cleanColor.length > 7) cleanColor = "#" + cleanColor.substring(2);
                        filEl.setAttribute('fill', cleanColor);
                    }
                });

                // Update Climate Info bar
                document.getElementById('temp-val').textContent = `${box1.temp || "--"}°C`;
                document.getElementById('hum-val').textContent = `${box1.humidity || "--"}%`;
                const statusChip = document.getElementById('status-chip');
                statusChip.textContent = box1.state === 1 ? 'ONLINE' : 'IDLE';
                statusChip.style.borderColor = box1.state === 1 ? '#00e676' : '#444';
                statusChip.style.color = box1.state === 1 ? '#00e676' : '#aaa';
            }

            // Get IP of current page to connect WebSocket to the same host
            const host = window.location.hostname;
            // WebSocket initialization
            const socket = new WebSocket(`ws://${host}:9999`);
            socket.onopen = () => socket.send(JSON.stringify({"method":"get","params":{"boxsInfo":1}}));
            socket.onmessage = (e) => {
                const data = JSON.parse(e.data);
                if (data?.boxsInfo?.materialBoxs) updateSpoolUI(data.boxsInfo.materialBoxs);
            };
            setInterval(() => { if(socket.readyState === 1) socket.send(JSON.stringify({"method":"get","params":{"boxsInfo":1}})); }, 30000);
        }
    }

    //Poll for hash changes
    let lastHash = window.location.hash;
    setInterval(() => {
        if (window.location.hash !== lastHash) {
            lastHash = window.location.hash;
            if (isHomeRoute()) attemptInit();
        }
    }, 300);
    if (isHomeRoute()) attemptInit();
})();