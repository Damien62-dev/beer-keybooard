const beerSequence = ['b', 'e', 'e', 'r'];
let currentText = '';
let currentPosition = 0;

const previewElement = document.getElementById('previewText');
const sendButton = document.getElementById('sendButton');
const messagesArea = document.getElementById('messagesArea');

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
            this.style.background = 'rgba(255, 0, 0, 0.3)';
            setTimeout(() => {
                this.style.background = '';
            }, 200);
            return;
        }

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