const beerSequence = ['b', 'e', 'e', 'r'];
let currentText = '';
let currentPosition = 0;

const previewElement = document.getElementById('previewText');
const sendButton = document.getElementById('sendButton');
const messagesArea = document.getElementById('messagesArea');

// === SONS ===
let audioContext;
let soundEnabled = false;

// Initialiser l'audio au clic
document.getElementById('enableSound')?.addEventListener('click', function () {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    soundEnabled = true;
    document.getElementById('soundOverlay').classList.add('hidden');

    // Jouer un son de test
    playSound(1000, 0.1);
});

// Fonction pour jouer un son
function playSound(frequency, duration, type = 'sine') {
    if (!soundEnabled || !audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

// Sons spécifiques
function clickSound() {
    playSound(800, 0.05, 'square');
}

function errorSound() {
    playSound(200, 0.1, 'sawtooth');
}

function successSound() {
    playSound(600, 0.1);
    setTimeout(() => playSound(800, 0.15), 50);
    setTimeout(() => playSound(1000, 0.2), 100);
}

function sendSound() {
    playSound(1200, 0.05);
    setTimeout(() => playSound(1400, 0.1), 60);
}

// Mettre à jour la prévisualisation
function updatePreview() {
    if (currentText.trim() === '') {
        previewElement.textContent = '';
        previewElement.classList.add('empty');
        sendButton.disabled = true;
    } else {
        previewElement.textContent = currentText;
        previewElement.classList.remove('empty');
        sendButton.disabled = false;
    }
}

// Envoyer le message
function sendMessage() {
    if (currentText.trim() === '') return;

    sendSound(); // Son d'envoi

    // Créer le message
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message sent';

    const messageContent = document.createElement('div');
    messageContent.textContent = currentText.trim();

    const messageTime = document.createElement('div');
    messageTime.className = 'message-time';
    messageTime.textContent = new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
    });

    messageDiv.appendChild(messageContent);
    messageDiv.appendChild(messageTime);
    messagesArea.appendChild(messageDiv);

    // Scroll vers le bas
    messagesArea.scrollTop = messagesArea.scrollHeight;

    // Réinitialiser
    currentText = '';
    currentPosition = 0;
    updatePreview();
    updateKeyboard();
}

// Mettre à jour les touches disponibles
function updateKeyboard() {
    const allKeys = document.querySelectorAll('.key[data-key]');

    allKeys.forEach(key => {
        const keyChar = key.dataset.key;

        if (currentPosition < beerSequence.length) {
            const expectedChar = beerSequence[currentPosition];

            if (keyChar === expectedChar) {
                key.classList.remove('disabled');
                key.classList.add('highlighted');
            } else {
                key.classList.add('disabled');
                key.classList.remove('highlighted');
            }
        } else {
            key.classList.add('disabled');
            key.classList.remove('highlighted');
        }
    });
}

// Gérer le clic sur une touche
document.querySelectorAll('.key[data-key]').forEach(key => {
    key.addEventListener('click', function () {
        if (this.classList.contains('disabled')) {
            // Effet de refus
            errorSound(); // Son d'erreur
            this.style.background = 'rgba(255, 0, 0, 0.3)';
            setTimeout(() => {
                this.style.background = '';
            }, 200);
            return;
        }

        clickSound(); // Son de clic

        const char = this.dataset.key;

        // Ajouter le caractère
        currentText += char;
        currentPosition++;

        // Effet visuel
        this.classList.add('pressed');
        createLightningEffect(this);
        setTimeout(() => this.classList.remove('pressed'), 100);

        // Vérifier si "beer" est complet
        if (currentPosition === beerSequence.length) {
            successSound(); // Son de succès
            currentPosition = 0;
            currentText += ' ';
        }

        updatePreview();
        updateKeyboard();
    });
});

// Fonction backspace
function backspace() {
    if (currentText.length === 0) return;

    clickSound(); // Son pour backspace

    // Retirer le dernier caractère
    currentText = currentText.slice(0, -1);

    // Recalculer la position dans la séquence
    const lastWord = currentText.split(' ').pop();
    currentPosition = lastWord.length % 4;

    updatePreview();
    updateKeyboard();
}

// Fonction espace (auto-complete "beer")
function addSpace() {
    if (currentPosition > 0) {
        // Compléter le mot en cours
        while (currentPosition < beerSequence.length) {
            currentText += beerSequence[currentPosition];
            currentPosition++;
        }
        successSound(); // Son de succès pour auto-complete
    } else {
        clickSound();
    }
    currentText += ' ';
    currentPosition = 0;
    updatePreview();
    updateKeyboard();
}

// Auto-complétion
function autoComplete() {
    while (currentPosition < beerSequence.length) {
        currentText += beerSequence[currentPosition];
        currentPosition++;
    }
    successSound(); // Son de succès
    currentText += ' ';
    currentPosition = 0;
    updatePreview();
    updateKeyboard();
}

// Effet lightning
function createLightningEffect(element) {
    const rect = element.getBoundingClientRect();
    const lightning = document.createElement('div');
    lightning.className = 'lightning';
    lightning.style.left = rect.left + rect.width / 2 + 'px';
    lightning.style.top = rect.top - 100 + 'px';
    lightning.style.animation = 'lightning 0.4s ease-out';
    document.body.appendChild(lightning);

    setTimeout(() => lightning.remove(), 400);
}

// Support clavier physique
document.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace') {
        e.preventDefault();
        backspace();
    } else if (e.key === ' ') {
        e.preventDefault();
        addSpace();
    } else if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
    } else {
        const key = e.key.toLowerCase();
        if (currentPosition < beerSequence.length && key === beerSequence[currentPosition]) {
            const keyElement = document.querySelector(`.key[data-key="${key}"]:not(.disabled)`);
            if (keyElement) {
                keyElement.click();
            }
        }
    }
});

// Initialisation
updateKeyboard();
updatePreview();