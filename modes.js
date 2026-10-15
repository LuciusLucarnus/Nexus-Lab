// --- All 14 Perception Game Definitions ---
const MODES = {
    harmony: {
        id: 'harmony',
        name: 'HARMONY (Duo-Akkord)',
        category: 'duo',
        axis: 'Auditiv',
        icon: '🎵',
        color: 'purple',
        desc: 'Speziell für Koop & 1v1: Höre ein doppeltes Klang-Intervall (2 Frequenzen) und stimme den Zielakkord ab.'
    },
    split_radar: {
        id: 'split_radar',
        name: 'SPLIT RADAR (Duo-Koordinate)',
        category: 'duo',
        axis: 'Räumlich',
        icon: '📍',
        color: 'cyan',
        desc: 'Zwei Fadenkreuze blitzen auf. Im Koop ergibt der Mittelwert eurer Klicks den Team-Vektor!'
    },
    duo_balance: {
        id: 'duo_balance',
        name: 'BALANCE (Duo-Kraft/Waage)',
        category: 'duo',
        axis: 'Kognitiv',
        icon: '⚖️',
        color: 'amber',
        desc: 'Eine Waage zeigt kurz ein Gewicht. Merk dir Neigung und Größe des Blocks und stell es nach. Im Koop zählt der Mittelwert.'
    },
    color: {
        id: 'color',
        name: 'COLOR (Farbe)',
        category: 'dialed',
        axis: 'Visuell',
        icon: '🎨',
        color: 'purple',
        desc: 'Präge dir Farbtöne (HSL) genau ein und reklamiere sie aus dem Gedächtnis.'
    },
    sound: {
        id: 'sound',
        name: 'SOUND (Ton-Frequenz)',
        category: 'dialed',
        axis: 'Auditiv',
        icon: '〰️',
        color: 'cyan',
        desc: 'Höre eine Ton-Frequenz (200-800 Hz) und finde den exakten Ton per Gehör.'
    },
    time: {
        id: 'time',
        name: 'TIME (Zeitdauer)',
        category: 'dialed',
        axis: 'Zeitgefühl',
        icon: '⏱️',
        color: 'amber',
        desc: 'Spüre die gezeigte Zeitdauer und halte den Button exakt solange gedrückt.'
    },
    shape: {
        id: 'shape',
        name: 'SHAPE (Geometrie)',
        category: 'dialed',
        axis: 'Räumlich',
        icon: '🔷',
        color: 'rose',
        desc: 'Merke dir Skalierung, Rotation und Ecken-Abrundung der Form.'
    },
    tempo: {
        id: 'tempo',
        name: 'TEMPO (BPM Beat)',
        category: 'nexus',
        axis: 'Auditiv',
        icon: '🥁',
        color: 'emerald',
        desc: 'Höre den Rhythmus und tappe 4 Beats exakt im gleichen Tempo.'
    },
    vector: {
        id: 'vector',
        name: 'VECTOR (Raum-Radar)',
        category: 'nexus',
        axis: 'Räumlich',
        icon: '🎯',
        color: 'cyan',
        desc: 'Ein Zielpunkt leuchtet kurz im Radar. Klicke blind exakt auf die Stelle.'
    },
    angle: {
        id: 'angle',
        name: 'ANGLE (Neigungswinkel)',
        category: 'nexus',
        axis: 'Räumlich',
        icon: '🧭',
        color: 'indigo',
        desc: 'Erkenne die Gradzahl des Laserstrahls und passe den Zeiger an.'
    },
    velocity: {
        id: 'velocity',
        name: 'VELOCITY (Geschwindigkeit)',
        category: 'nexus',
        axis: 'Visuell',
        icon: '🚀',
        color: 'amber',
        desc: 'Beobachte das Tempo des Partikels und rekonstruiere seine Fluggeschwindigkeit.'
    },
    quantity: {
        id: 'quantity',
        name: 'QUANTITY (Mengen-Dichte)',
        category: 'nexus',
        axis: 'Kognitiv',
        icon: '🔢',
        color: 'purple',
        desc: 'Ein Partikelschwarm blitzt auf. Schätze die exakte Anzahl der Punkte.'
    },
    strobe: {
        id: 'strobe',
        name: 'STROBE (Blinkfrequenz)',
        category: 'nexus',
        axis: 'Visuell',
        icon: '⚡',
        color: 'rose',
        desc: 'Erkenne das Stroboskop-Blinken und finde die Frequenz (Hz).'
    },
    grid: {
        id: 'grid',
        name: 'GRID (Matrix-Muster)',
        category: 'nexus',
        axis: 'Kognitiv',
        icon: '🔲',
        color: 'emerald',
        desc: 'Ein 3x3 Felder-Muster leuchtet kurz auf. Klicke die aktiven Felder nach.'
    },
    echo_gap: { id: 'echo_gap', name: 'ECHO GAP (Micro-Delay)', category: 'nexus', axis: 'Auditiv', icon: '🎧', color: 'cyan',
        desc: 'Zwei Audioklicks (60-500 ms Abstand). Stelle den Zeitabstand per Gehör nach.' },
    micro_gap: { id: 'micro_gap', name: 'MICRO GAP (Spaltbreite)', category: 'nexus', axis: 'Visuell', icon: '📐', color: 'indigo',
        desc: 'Zwei Flächen mit feinem Spalt. Merke dir die Breite und stelle sie pixelgenau ein.' },
    spin: { id: 'spin', name: 'SPIN RPM (Drehzahl)', category: 'nexus', axis: 'Visuell', icon: '🔄', color: 'purple',
        desc: 'Ein Rotor dreht sich. Erfasse die Drehzahl und stelle sie nach.' },
    tunnel: { id: 'tunnel', name: 'TUNNEL (Blind-Timing)', category: 'nexus', axis: 'Zeitgefühl', icon: '🙈', color: 'amber',
        desc: 'Der Ball gleitet in einen Tunnel. Drücke genau dann, wenn er blind wieder herauskommt.' },
    chroma: { id: 'chroma', name: 'CHROMA FADE (Kontrast)', category: 'nexus', axis: 'Visuell', icon: '🌓', color: 'rose',
        desc: 'Ein Kreis hebt sich nur minimal vom Hintergrund ab. Stelle die Kontraststärke nach.' },
    duo_radar: { id: 'duo_radar', name: 'DUO RADAR (Dual-Sektor)', category: 'duo', axis: 'Räumlich', icon: '🎯', color: 'emerald',
        desc: 'Zwei Laser-Vektoren (Winkel). Im Koop ergibt der Mittelwert eurer Winkel die Team-Richtung!' }
};

// Erweiterungs-Schnittstelle: neue Sinnes-Spiele registrieren sich hier (js/games/*.js)
const EXT = {};
