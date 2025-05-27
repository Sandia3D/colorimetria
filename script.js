class ColorPaletteGenerator {
            constructor() {
                this.config = {
                    swatches: 12,
                    currentPalette: 'grises',
                    theme: 'light'
                };
                
                this.customColors = [];
                
                this.palettes = {
                    grises: {
                        name: 'grises',
                        getColor: (index, total) => {
                            const lightness = Math.round((0.15 + (index / total) * 0.8) * 100);
                            return `hsl(0, 0%, ${lightness}%)`;
                        }
                    },
                    azules: {
                        name: 'azules',
                        getColor: (index, total) => {
                            const lightness = Math.round((0.2 + (index / total) * 0.7) * 100);
                            const saturation = Math.round(60 + (index / total) * 30);
                            return `hsl(220, ${saturation}%, ${lightness}%)`;
                        }
                    },
                    verdes: {
                        name: 'verdes',
                        getColor: (index, total) => {
                            const lightness = Math.round((0.2 + (index / total) * 0.7) * 100);
                            const hue = 120 + (index / total) * 40;
                            return `hsl(${hue}, 70%, ${lightness}%)`;
                        }
                    },
                    rojos: {
                        name: 'rojos',
                        getColor: (index, total) => {
                            const lightness = Math.round((0.2 + (index / total) * 0.7) * 100);
                            const hue = 0 + (index / total) * 20;
                            return `hsl(${hue}, 80%, ${lightness}%)`;
                        }
                    },
                    morados: {
                        name: 'morados',
                        getColor: (index, total) => {
                            const lightness = Math.round((0.2 + (index / total) * 0.7) * 100);
                            const hue = 260 + (index / total) * 40;
                            return `hsl(${hue}, 70%, ${lightness}%)`;
                        }
                    },
                    arcoiris: {
                        name: 'arcoíris',
                        getColor: (index, total) => {
                            const hue = Math.round((index / total) * 360);
                            return `hsl(${hue}, 70%, 60%)`;
                        }
                    },
                    calidos: {
                        name: 'cálidos',
                        getColor: (index, total) => {
                            const hue = 10 + (index / total) * 50;
                            const lightness = Math.round((0.3 + (index / total) * 0.6) * 100);
                            return `hsl(${hue}, 75%, ${lightness}%)`;
                        }
                    },
                    frios: {
                        name: 'fríos',
                        getColor: (index, total) => {
                            const hue = 180 + (index / total) * 60;
                            const lightness = Math.round((0.2 + (index / total) * 0.7) * 100);
                            return `hsl(${hue}, 65%, ${lightness}%)`;
                        }
                    }
                };
                
                this.elements = {
                    swatchesList: document.querySelector('.swatches'),
                    paletteTitle: document.querySelector('.palette-title'),
                    paletteButtons: document.querySelectorAll('.palette-button'),
                    modal: document.getElementById('colorModal'),
                    colorPreview: document.querySelector('.color-preview'),
                    hexValue: document.querySelector('.hex-value'),
                    rgbValue: document.querySelector('.rgb-value'),
                    hslValue: document.querySelector('.hsl-value'),
                    copyButtons: document.querySelectorAll('.copy-button'),
                    closeModalButton: document.getElementById('closeModalBtn'),
                    notification: document.getElementById('notification'),
                    customColorsList: document.getElementById('customColors'),
                    colorPicker: document.getElementById('colorPicker'),
                    addColorBtn: document.getElementById('addColorBtn'),
                    clearCustomBtn: document.getElementById('clearCustomBtn'),
                    themeToggle: document.getElementById('themeToggle')
                };
                
                this.init();
            }
            
            init() {
                this.generateSwatches();
                this.bindEvents();
                this.initTweakPane();
                this.loadCustomColors();
                this.setInitialTheme();
            }
            
            bindEvents() {
                // Palette selection
                this.elements.paletteButtons.forEach(btn => {
                    btn.addEventListener('click', (e) => this.changePalette(e));
                });
                
                // Modal events
                this.elements.swatchesList.addEventListener('click', (e) => this.openModal(e));
                this.elements.customColorsList.addEventListener('click', (e) => this.handleCustomColorClick(e));
                this.elements.closeModalButton.addEventListener('click', () => this.closeModal());
                this.elements.modal.addEventListener('click', (e) => {
                    if (e.target === this.elements.modal) this.closeModal();
                });
                
                // Copy events
                this.elements.copyButtons.forEach(btn => {
                    btn.addEventListener('click', (e) => this.copyToClipboard(e));
                });
                
                // Custom color buttons
                this.elements.addColorBtn.addEventListener('click', () => this.addCustomColor());
                this.elements.clearCustomBtn.addEventListener('click', () => this.clearCustomColors());
                this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
                
                // Keyboard events
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && this.elements.modal.classList.contains('active')) {
                        this.closeModal();
                    }
                    
                    // Ctrl/Cmd + K to focus color picker
                    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                        e.preventDefault();
                        this.elements.colorPicker.focus();
                    }
                    
                    // Ctrl/Cmd + Enter to add color
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                        e.preventDefault();
                        if (document.activeElement === this.elements.colorPicker) {
                            this.addCustomColor();
                        }
                    }
                });
                
                // Add some polish with intersection observer for animations
                if ('IntersectionObserver' in window) {
                    const observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                entry.target.style.animationPlayState = 'running';
                            }
                        });
                    }, {
                        threshold: 0.1
                    });
                    
                    // Observe elements that need animation
                    setTimeout(() => {
                        const animatedElements = document.querySelectorAll('.swatch, .custom-swatch');
                        animatedElements.forEach(el => observer.observe(el));
                    }, 100);
                }
            }
            
            setInitialTheme() {
                const savedTheme = localStorage.getItem('colorPaletteTheme') || 'light';
                document.body.setAttribute('data-theme', savedTheme);
                this.config.theme = savedTheme;
                
                // Update button text based on theme
                this.updateThemeToggleText();
            }
            
            updateThemeToggleText() {
                const isDark = this.config.theme === 'dark';
                this.elements.themeToggle.innerHTML = isDark ? '☀️ Tema Claro' : '🌙 Tema Oscuro';
            }
            
            generateSwatches() {
                const palette = this.palettes[this.config.currentPalette];
                this.elements.paletteTitle.textContent = palette.name;
                
                let html = '';
                for (let i = 0; i < this.config.swatches; i++) {
                    const color = palette.getColor(i, this.config.swatches);
                    const colorInfo = this.convertColor(color);
                    const isDark = this.isColorDark(color);
                    
                    html += `
                        <li class="swatch" style="--delay: ${i * 0.05}s">
                            <button class="swatch-button" 
                                    style="background-color: ${color}; color: ${isDark ? 'white' : 'black'}"
                                    data-color="${color}"
                                    data-hex="${colorInfo.hex}"
                                    data-rgb="${colorInfo.rgb}"
                                    data-hsl="${colorInfo.hsl}"
                                    aria-label="Color ${colorInfo.hex}">
                                <div class="swatch-overlay"></div>
                                <div class="swatch-info">
                                    <div>${colorInfo.hex}</div>
                                </div>
                            </button>
                        </li>
                    `;
                }
                
                this.elements.swatchesList.innerHTML = html;
                this.animateSwatches();
            }
            
            animateSwatches() {
                const swatches = document.querySelectorAll('.swatch');
                gsap.fromTo(swatches, 
                    {
                        opacity: 0,
                        y: 50,
                        scale: 0.8
                    },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.6,
                        stagger: 0.05,
                        ease: "back.out(1.2)"
                    }
                );
            }
            
            convertColor(color) {
                // Create a temporary element to get computed color
                const temp = document.createElement('div');
                temp.style.color = color;
                document.body.appendChild(temp);
                const computed = getComputedStyle(temp).color;
                document.body.removeChild(temp);
                
                // Parse RGB values
                const rgbMatch = computed.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                if (!rgbMatch) return { hex: color, rgb: color, hsl: color };
                
                const r = parseInt(rgbMatch[1]);
                const g = parseInt(rgbMatch[2]);
                const b = parseInt(rgbMatch[3]);
                
                // Convert to hex
                const hex = '#' + [r, g, b].map(x => {
                    const hex = x.toString(16);
                    return hex.length === 1 ? '0' + hex : hex;
                }).join('');
                
                // Convert to HSL
                const hsl = this.rgbToHsl(r, g, b);
                
                return {
                    hex: hex.toUpperCase(),
                    rgb: `rgb(${r}, ${g}, ${b})`,
                    hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
                };
            }
            
            rgbToHsl(r, g, b) {
                r /= 255;
                g /= 255;
                b /= 255;
                
                const max = Math.max(r, g, b);
                const min = Math.min(r, g, b);
                let h, s, l = (max + min) / 2;
                
                if (max === min) {
                    h = s = 0;
                } else {
                    const d = max - min;
                    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                    
                    switch (max) {
                        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                        case g: h = (b - r) / d + 2; break;
                        case b: h = (r - g) / d + 4; break;
                    }
                    h /= 6;
                }
                
                return {
                    h: Math.round(h * 360),
                    s: Math.round(s * 100),
                    l: Math.round(l * 100)
                };
            }
            
            isColorDark(color) {
                const colorInfo = this.convertColor(color);
                const rgbMatch = colorInfo.rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                if (!rgbMatch) return false;
                
                const r = parseInt(rgbMatch[1]);
                const g = parseInt(rgbMatch[2]);
                const b = parseInt(rgbMatch[3]);
                
                // Calculate luminance
                const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                return luminance < 0.5;
            }
            
            changePalette(event) {
                const paletteKey = event.target.dataset.palette;
                if (!paletteKey || !this.palettes[paletteKey]) return;
                
                this.config.currentPalette = paletteKey;
                
                // Update button states
                this.elements.paletteButtons.forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.palette === paletteKey);
                });
                
                this.generateSwatches();
            }
            
            openModal(event) {
                const button = event.target.closest('.swatch-button, .custom-swatch-button');
                if (!button) return;
                
                const { color, hex, rgb, hsl } = button.dataset;
                
                this.elements.colorPreview.style.backgroundColor = color;
                this.elements.hexValue.textContent = hex;
                this.elements.rgbValue.textContent = rgb;
                this.elements.hslValue.textContent = hsl;
                
                this.elements.modal.classList.add('active');
                this.elements.modal.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
                
                // Focus trap
                setTimeout(() => {
                    this.elements.closeModalButton.focus();
                }, 100);
            }
            
            closeModal() {
                this.elements.modal.classList.remove('active');
                this.elements.modal.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            }
            
            async copyToClipboard(event) {
                const format = event.target.dataset.format;
                const button = event.target;
                let textToCopy;
                
                switch (format) {
                    case 'hex':
                        textToCopy = this.elements.hexValue.textContent;
                        break;
                    case 'rgb':
                        textToCopy = this.elements.rgbValue.textContent;
                        break;
                    case 'hsl':
                        textToCopy = this.elements.hslValue.textContent;
                        break;
                    default:
                        return;
                }
                
                try {
                    await navigator.clipboard.writeText(textToCopy);
                    this.showCopyFeedback(button);
                } catch (err) {
                    console.error('Error al copiar:', err);
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = textToCopy;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    this.showCopyFeedback(button);
                }
            }
            
            showCopyFeedback(button) {
                const originalText = button.textContent;
                button.textContent = '¡Copiado!';
                button.classList.add('copied');
                
                setTimeout(() => {
                    button.textContent = originalText;
                    button.classList.remove('copied');
                }, 2000);
                
                this.showNotification();
            }
            
            showNotification() {
                this.elements.notification.classList.add('show');
                setTimeout(() => {
                    this.elements.notification.classList.remove('show');
                }, 3000);
            }
            
            // Custom Colors Methods
            addCustomColor() {
                const color = this.elements.colorPicker.value;
                if (this.customColors.includes(color)) {
                    this.showNotification('Este color ya está en tu paleta personalizada');
                    return;
                }
                
                this.customColors.push(color);
                this.renderCustomColors();
                this.saveCustomColors();
                
                // Animate the new color
                const newColor = document.querySelector('.custom-swatch:last-child');
                if (newColor) {
                    gsap.fromTo(newColor, 
                        { scale: 0, opacity: 0 },
                        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
                    );
                }
            }
            
            renderCustomColors() {
                if (this.customColors.length === 0) {
                    this.elements.customColorsList.innerHTML = '<li style="grid-column: 1/-1; text-align: center; color: rgba(255,255,255,0.7); font-style: italic;">No hay colores personalizados aún. ¡Agrega algunos!</li>';
                    return;
                }
                
                let html = '';
                this.customColors.forEach((color, index) => {
                    const colorInfo = this.convertColor(color);
                    const isDark = this.isColorDark(color);
                    
                    html += `
                        <li class="custom-swatch">
                            <button class="custom-swatch-button" 
                                    style="background-color: ${color}; color: ${isDark ? 'white' : 'black'}"
                                    data-color="${color}"
                                    data-hex="${colorInfo.hex}"
                                    data-rgb="${colorInfo.rgb}"
                                    data-hsl="${colorInfo.hsl}"
                                    aria-label="Color personalizado ${colorInfo.hex}">
                                <div class="swatch-info">
                                    <div>${colorInfo.hex}</div>
                                </div>
                            </button>
                            <button class="delete-color-btn" onclick="colorGenerator.removeCustomColor(${index})" aria-label="Eliminar color">
                                ✕
                            </button>
                        </li>
                    `;
                });
                
                this.elements.customColorsList.innerHTML = html;
            }
            
            removeCustomColor(index) {
                const colorElement = document.querySelectorAll('.custom-swatch')[index];
                
                // Animate removal
                gsap.to(colorElement, {
                    scale: 0,
                    opacity: 0,
                    duration: 0.3,
                    ease: "back.in(1.7)",
                    onComplete: () => {
                        this.customColors.splice(index, 1);
                        this.renderCustomColors();
                        this.saveCustomColors();
                    }
                });
            }
            
            clearCustomColors() {
                if (this.customColors.length === 0) return;
                
                if (confirm('¿Estás seguro de que quieres eliminar todos los colores personalizados?')) {
                    const customSwatches = document.querySelectorAll('.custom-swatch');
                    
                    gsap.to(customSwatches, {
                        scale: 0,
                        opacity: 0,
                        duration: 0.3,
                        stagger: 0.05,
                        ease: "back.in(1.7)",
                        onComplete: () => {
                            this.customColors = [];
                            this.renderCustomColors();
                            this.saveCustomColors();
                        }
                    });
                }
            }
            
            handleCustomColorClick(event) {
                if (event.target.classList.contains('delete-color-btn')) {
                    return; // Let the delete button handle its own click
                }
                
                const button = event.target.closest('.custom-swatch-button');
                if (button) {
                    this.openModal(event);
                }
            }
            
            saveCustomColors() {
                try {
                    localStorage.setItem('customColors', JSON.stringify(this.customColors));
                } catch (e) {
                    console.error('Error al guardar en localStorage:', e);
                }
            }
            
            loadCustomColors() {
                try {
                    const saved = localStorage.getItem('customColors');
                    if (saved) {
                        this.customColors = JSON.parse(saved);
                        this.renderCustomColors();
                    } else {
                        this.renderCustomColors();
                    }
                } catch (e) {
                    console.error('Error al cargar desde localStorage:', e);
                    this.renderCustomColors();
                }
            }
            
            toggleTheme() {
                this.config.theme = this.config.theme === 'light' ? 'dark' : 'light';
                document.body.setAttribute('data-theme', this.config.theme);
                this.updateThemeToggleText();
                
                try {
                    localStorage.setItem('colorPaletteTheme', this.config.theme);
                } catch (e) {
                    console.error('Error al guardar tema:', e);
                }
                
                // Animate theme transition
                gsap.to(document.body, {
                    duration: 0.3,
                    ease: "power2.out"
                });
            }
            
            initTweakPane() {
                // Create a control panel for advanced users
                const pane = new Tweakpane.Pane({
                    title: 'Configuración Avanzada',
                    expanded: false,
                    container: document.body
                });
                
                // Add some controls
                const PARAMS = {
                    swatches: this.config.swatches,
                    animation: true,
                    autoGenerate: false
                };
                
                pane.addInput(PARAMS, 'swatches', {
                    min: 6,
                    max: 24,
                    step: 1,
                    label: 'Cantidad de colores'
                }).on('change', (ev) => {
                    this.config.swatches = ev.value;
                    this.generateSwatches();
                });
                
                pane.addInput(PARAMS, 'animation', {
                    label: 'Animaciones'
                }).on('change', (ev) => {
                    document.body.style.setProperty('--animation-enabled', ev.value ? '1' : '0');
                });
                
                pane.addButton({
                    title: 'Generar Paleta Aleatoria'
                }).on('click', () => {
                    this.generateRandomPalette();
                });
                
                pane.addButton({
                    title: 'Exportar Paleta'
                }).on('click', () => {
                    this.exportPalette();
                });
                
                // Style the pane
                pane.element.style.position = 'fixed';
                pane.element.style.top = '20px';
                pane.element.style.right = '20px';
                pane.element.style.zIndex = '999';
                pane.element.style.fontSize = '12px';
            }
            
            generateRandomPalette() {
                const paletteKeys = Object.keys(this.palettes);
                const randomKey = paletteKeys[Math.floor(Math.random() * paletteKeys.length)];
                
                // Update active button
                this.elements.paletteButtons.forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.palette === randomKey);
                });
                
                this.config.currentPalette = randomKey;
                this.generateSwatches();
                
                // Show notification
                this.showNotification(`¡Paleta ${this.palettes[randomKey].name} generada!`);
            }
            
            exportPalette() {
                const currentColors = [];
                const swatches = document.querySelectorAll('.swatch-button');
                
                swatches.forEach(swatch => {
                    currentColors.push({
                        hex: swatch.dataset.hex,
                        rgb: swatch.dataset.rgb,
                        hsl: swatch.dataset.hsl
                    });
                });
                
                const paletteData = {
                    name: this.palettes[this.config.currentPalette].name,
                    colors: currentColors,
                    customColors: this.customColors.map(color => {
                        const colorInfo = this.convertColor(color);
                        return {
                            hex: colorInfo.hex,
                            rgb: colorInfo.rgb,
                            hsl: colorInfo.hsl
                        };
                    }),
                    exportDate: new Date().toISOString(),
                    generator: 'Estudios Ivality Color Palette Generator'
                };
                
                // Create and download JSON file
                const dataStr = JSON.stringify(paletteData, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                
                const link = document.createElement('a');
                link.href = url;
                link.download = `paleta-${this.config.currentPalette}-${Date.now()}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                URL.revokeObjectURL(url);
                this.showNotification('¡Paleta exportada exitosamente!');
            }
            
            // Utility method to show custom notifications
            showNotification(message = '¡Color copiado al portapapeles!') {
                this.elements.notification.textContent = message;
                this.elements.notification.classList.add('show');
                
                setTimeout(() => {
                    this.elements.notification.classList.remove('show');
                }, 3000);
            }
            
            // Method to handle color harmony generation
            generateHarmony(baseColor, type = 'complementary') {
                const colorInfo = this.convertColor(baseColor);
                const hslMatch = colorInfo.hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
                
                if (!hslMatch) return [baseColor];
                
                const h = parseInt(hslMatch[1]);
                const s = parseInt(hslMatch[2]);
                const l = parseInt(hslMatch[3]);
                
                const harmonies = {
                    complementary: [h, (h + 180) % 360],
                    triadic: [h, (h + 120) % 360, (h + 240) % 360],
                    analogous: [h, (h + 30) % 360, (h - 30 + 360) % 360],
                    tetradic: [h, (h + 90) % 360, (h + 180) % 360, (h + 270) % 360],
                    monochromatic: [h, h, h, h, h].map((hue, i) => ({
                        h: hue,
                        s: Math.max(10, s - i * 10),
                        l: Math.min(90, l + (i - 2) * 15)
                    }))
                };
                
                if (type === 'monochromatic') {
                    return harmonies[type].map(color => `hsl(${color.h}, ${color.s}%, ${color.l}%)`);
                } else {
                    return harmonies[type].map(hue => `hsl(${hue}, ${s}%, ${l}%)`);
                }
            }
            
            // Accessibility method to check color contrast
            getContrastRatio(color1, color2) {
                const getLuminance = (color) => {
                    const colorInfo = this.convertColor(color);
                    const rgbMatch = colorInfo.rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                    if (!rgbMatch) return 0;
                    
                    const [r, g, b] = rgbMatch.slice(1).map(val => {
                        const sRGB = parseInt(val) / 255;
                        return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
                    });
                    
                    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
                };
                
                const lum1 = getLuminance(color1);
                const lum2 = getLuminance(color2);
                const brightest = Math.max(lum1, lum2);
                const darkest = Math.min(lum1, lum2);
                
                return (brightest + 0.05) / (darkest + 0.05);
            }
            
            // Method to suggest accessible color combinations
            getAccessibleCombinations() {
                const currentColors = Array.from(document.querySelectorAll('.swatch-button')).map(btn => btn.dataset.color);
                const combinations = [];
                
                for (let i = 0; i < currentColors.length; i++) {
                    for (let j = i + 1; j < currentColors.length; j++) {
                        const ratio = this.getContrastRatio(currentColors[i], currentColors[j]);
                        if (ratio >= 4.5) { // WCAG AA standard
                            combinations.push({
                                background: currentColors[i],
                                foreground: currentColors[j],
                                ratio: ratio.toFixed(2),
                                level: ratio >= 7 ? 'AAA' : 'AA'
                            });
                        }
                    }
                }
                
                return combinations;
            }
        }
        
        // Initialize the color palette generator when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            window.colorGenerator = new ColorPaletteGenerator();
        });
        
        // Add some global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Shift + R to generate random palette
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
                e.preventDefault();
                if (window.colorGenerator) {
                    window.colorGenerator.generateRandomPalette();
                }
            }
            
            // Ctrl/Cmd + Shift + E to export palette
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
                e.preventDefault();
                if (window.colorGenerator) {
                    window.colorGenerator.exportPalette();
                }
            }
            
            // Ctrl/Cmd + Shift + T to toggle theme
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                if (window.colorGenerator) {
                    window.colorGenerator.toggleTheme();
                }
            }
        });
        
        // Service Worker registration for offline functionality (optional)
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then((registration) => {
                        console.log('SW registered: ', registration);
                    })
                    .catch((registrationError) => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }