// js/voice.js - Enhanced with Fallback

let recognition = null;
let isListening = false;
let isVoiceSupported = false;

// Check browser support
function checkVoiceSupport() {
    const speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const speechSynthesis = window.speechSynthesis;
    
    return {
        recognition: !!speechRecognition,
        synthesis: !!speechSynthesis,
        microphone: navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    };
}

// Initialize voice recognition
function initVoiceRecognition() {
    const support = checkVoiceSupport();
    
    if (support.recognition) {
        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';
            recognition.maxAlternatives = 1;
            
            recognition.onstart = function() {
                isListening = true;
                updateVoiceStatus(true);
                showNotification('🎤 Listening... Speak now', 'info');
            };
            
            recognition.onresult = function(event) {
                const transcript = event.results[0][0].transcript;
                if (window.currentVoiceCallback) {
                    window.currentVoiceCallback(transcript);
                }
            };
            
            recognition.onerror = function(event) {
                console.warn('Speech recognition error:', event.error);
                
                // Friendly error messages
                const errors = {
                    'not-allowed': 'Microphone access denied. Please allow microphone permissions.',
                    'audio-capture': 'No microphone found. Please connect a microphone.',
                    'network': 'Network error. Please check your connection.',
                    'no-speech': 'No speech detected. Please try again.',
                    'aborted': 'Voice recognition was aborted.',
                    'service-not-allowed': 'Speech service not allowed.'
                };
                
                const errorMessage = errors[event.error] || 'Voice recognition error. Please try again.';
                showNotification(`🎤 ${errorMessage}`, 'error');
                updateVoiceStatus(false);
            };
            
            recognition.onend = function() {
                isListening = false;
                updateVoiceStatus(false);
            };
            
            isVoiceSupported = true;
            console.log('Voice recognition initialized');
            return true;
            
        } catch (error) {
            console.error('Failed to initialize voice recognition:', error);
            isVoiceSupported = false;
            return false;
        }
    }
    
    isVoiceSupported = false;
    console.warn('Speech recognition not supported in this browser');
    return false;
}

// Start voice recognition with permission handling
function startVoiceRecognition(callback) {
    if (!isVoiceSupported && !initVoiceRecognition()) {
        showNotification('🎤 Voice recognition is not supported in your browser. Please use Chrome, Edge, or Safari.', 'error');
        return false;
    }
    
    if (isListening) {
        recognition.stop();
        return false;
    }
    
    // Request microphone permission first
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function(stream) {
                // Permission granted, start recognition
                window.currentVoiceCallback = callback;
                recognition.start();
                
                // Stop all tracks when done
                stream.getTracks().forEach(track => track.stop());
                return true;
            })
            .catch(function(err) {
                console.warn('Microphone permission denied:', err);
                showNotification('🎤 Microphone permission required for voice input. Please allow microphone access.', 'error');
                return false;
            });
    } else {
        // Fallback without permission request
        window.currentVoiceCallback = callback;
        recognition.start();
        return true;
    }
}

// Text-to-speech with fallback
function speakText(text) {
    if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        const speech = new SpeechSynthesisUtterance(text);
        speech.rate = 1.0;
        speech.pitch = 1.0;
        speech.volume = 1.0;
        speech.lang = 'en-US';
        
        speech.onstart = function() {
            showNotification('🔊 Mentor is speaking...', 'info');
        };
        
        speech.onend = function() {
            showNotification('🔊 Finished speaking', 'success', 2000);
        };
        
        speech.onerror = function(event) {
            console.error('Speech synthesis error:', event.error);
            showNotification('🔊 Voice output not available. Please read the text.', 'error');
        };
        
        window.speechSynthesis.speak(speech);
        return true;
    }
    return false;
}

// Update voice status UI
function updateVoiceStatus(listening) {
    const statusElement = document.getElementById('voice-status');
    const mentorSpeech = document.getElementById('mentor-speech');
    
    if (statusElement) {
        if (listening) {
            statusElement.innerHTML = '<i class="fas fa-microphone"></i> Listening... Speak now';
            statusElement.style.color = 'var(--primary)';
            statusElement.style.background = 'rgba(91, 106, 225, 0.1)';
            if (mentorSpeech) mentorSpeech.classList.add('listening');
        } else {
            statusElement.innerHTML = '<i class="fas fa-microphone-slash"></i> Click mic to use voice';
            statusElement.style.color = 'var(--gray)';
            statusElement.style.background = '#f5f7ff';
            if (mentorSpeech) mentorSpeech.classList.remove('listening');
        }
    }
}

// Create voice input buttons with fallback
function setupVoiceInputButtons() {
    const priorityInputs = ['priority1', 'priority2', 'priority3', 'activity'];
    
    priorityInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            // Check if button already exists
            if (input.parentNode.querySelector('.voice-input-btn')) {
                return;
            }
            
            const voiceBtn = document.createElement('button');
            voiceBtn.className = 'voice-input-btn';
            voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            voiceBtn.title = 'Voice Input';
            voiceBtn.setAttribute('aria-label', 'Use voice input');
            
            // Style the button
            voiceBtn.style.cssText = `
                position: absolute;
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
                background: var(--primary);
                color: white;
                border: none;
                border-radius: 50%;
                width: 35px;
                height: 35px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.9rem;
                transition: all 0.3s;
                z-index: 10;
            `;
            
            // Hover effect
            voiceBtn.addEventListener('mouseenter', function() {
                this.style.background = 'var(--primary-light)';
                this.style.transform = 'translateY(-50%) scale(1.1)';
            });
            
            voiceBtn.addEventListener('mouseleave', function() {
                this.style.background = 'var(--primary)';
                this.style.transform = 'translateY(-50%) scale(1)';
            });
            
            // Click handler with fallback
            voiceBtn.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Add listening animation
                this.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
                this.style.background = 'var(--secondary)';
                
                // Try voice recognition
                if (window.startVoiceRecognition) {
                    const success = window.startVoiceRecognition(function(transcript) {
                        // Success - set value
                        input.value = transcript;
                        
                        // Auto-save if it's a priority
                        if (inputId.startsWith('priority')) {
                            const saveBtn = document.getElementById('save-plan');
                            if (saveBtn) {
                                setTimeout(() => {
                                    saveBtn.click();
                                }, 500);
                            }
                        }
                        
                        showNotification(`🎤 Voice input saved: "${transcript}"`, 'success');
                    });
                    
                    if (!success) {
                        // Voice failed, show text fallback
                        showVoiceFallback(input, inputId, voiceBtn);
                    }
                } else {
                    // Voice not supported
                    showVoiceFallback(input, inputId, voiceBtn);
                }
                
                // Reset button after 2 seconds
                setTimeout(() => {
                    voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
                    voiceBtn.style.background = 'var(--primary)';
                }, 2000);
            });
            
            // Style input container
            input.parentNode.style.position = 'relative';
            input.style.paddingRight = '45px'; // Make room for button
            
            // Add button
            input.parentNode.appendChild(voiceBtn);
        }
    });
}

// Fallback for when voice doesn't work
function showVoiceFallback(input, inputId, voiceBtn) {
    // Create a modal for text input
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 20px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 50px rgba(0,0,0,0.2);
    `;
    
    modalContent.innerHTML = `
        <h3 style="margin-bottom: 15px; color: var(--dark);">Text Input</h3>
        <p style="color: var(--gray); margin-bottom: 20px;">Voice input not available. Please enter your ${inputId.replace('priority', 'Priority ')} manually:</p>
        <textarea id="fallback-text" style="width: 100%; padding: 15px; border-radius: 10px; border: 2px solid #e0e4f7; font-family: inherit; margin-bottom: 20px; min-height: 100px;" placeholder="Type here...">${input.value}</textarea>
        <div style="display: flex; gap: 15px; justify-content: flex-end;">
            <button id="cancel-fallback" class="btn btn-outline" style="padding: 10px 20px;">Cancel</button>
            <button id="save-fallback" class="btn btn-primary" style="padding: 10px 20px;">Save</button>
        </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Focus on textarea
    setTimeout(() => {
        document.getElementById('fallback-text').focus();
    }, 100);
    
    // Event listeners
    document.getElementById('save-fallback').addEventListener('click', function() {
        const text = document.getElementById('fallback-text').value;
        if (text.trim()) {
            input.value = text;
            
            // Auto-save if it's a priority
            if (inputId.startsWith('priority')) {
                const saveBtn = document.getElementById('save-plan');
                if (saveBtn) {
                    setTimeout(() => {
                        saveBtn.click();
                    }, 500);
                }
            }
            
            showNotification(`📝 Text input saved: "${text}"`, 'success');
        }
        document.body.removeChild(modal);
    });
    
    document.getElementById('cancel-fallback').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    // Close on click outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Make functions globally available
window.startVoiceRecognition = startVoiceRecognition;
window.speakText = speakText;
window.setupVoiceInputButtons = setupVoiceInputButtons;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check and initialize voice support
    const support = checkVoiceSupport();
    console.log('Voice support:', support);
    
    if (support.recognition) {
        initVoiceRecognition();
    } else {
        console.warn('Voice recognition not supported');
        // Show alternative instructions
        if (document.getElementById('voice-status')) {
            document.getElementById('voice-status').innerHTML = 
                '<i class="fas fa-keyboard"></i> Use keyboard input';
        }
    }
    
    // Set up voice input buttons
    if (document.getElementById('priority1') || document.getElementById('activity')) {
        setupVoiceInputButtons();
    }
    
    // Add voice tutorial on first visit
    if (!localStorage.getItem('voiceTutorialShown')) {
        setTimeout(() => {
            showNotification('🎤 Tip: Click microphone icons to use voice input!', 'info', 5000);
            localStorage.setItem('voiceTutorialShown', 'true');
        }, 3000);
    }
});