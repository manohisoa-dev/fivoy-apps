import React, { useState, useEffect, useRef } from 'react';
import { Clock, Timer, DollarSign, Wifi, RotateCcw, Play, Pause, StepForward } from 'lucide-react';
import Swal from 'sweetalert2';   
import { supabase } from "./lib/supabaseClient";

// Dans CounterApp.js, ajoutez cet import au début du fichier :
import { createSale } from './modules/sales/salesApi';

const FivoyCounterApp = () => {
  // États pour l'heure actuelle
  const [currentTime, setCurrentTime] = useState('');
  
  // États pour le calcul de connexion
  const [startHour, setStartHour] = useState('');
  const [startMinute, setStartMinute] = useState('');
  const [connectionResult, setConnectionResult] = useState('');
  
  // États pour le timer
  const [timerMinutes, setTimerMinutes] = useState('');
  const [timerDisplay, setTimerDisplay] = useState('00:00');
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const timerRef = useRef(null);
  const targetTimeRef = useRef(null);
  const initialSecondsRef = useRef(0);
  
  // États pour le money timer
  const [moneyAmount, setMoneyAmount] = useState('');
  const [moneyDisplay, setMoneyDisplay] = useState('0000');
  const [moneyTimerRunning, setMoneyTimerRunning] = useState(false);
  const [moneyTimerPaused, setMoneyTimerPaused] = useState(false);
  const moneyTimerRef = useRef(null);
  const remainingAmountRef = useRef(0);
  
  // État pour le mot de passe WiFi
  const [wifiPassword, setWifiPassword] = useState('');
  
  // Audio ref pour les alertes
  const audioRef = useRef(null);

  // Ajoute ça avec les autres useRef
  const startMinuteRef = useRef(null);

  // Ajoute ces états au début du composant
  const [isBeeping, setIsBeeping] = useState(false);
  const beepTimeoutRefs = useRef([]);

  // Ajout du debounce timer ref
  const debounceTimerRef = useRef(null);


  // Configuration des prix
  const PRICE_PER_MINUTE = 50; // 50 Ar par minute de connexion
  const MONEY_DECREMENT = 5; // 5 Ar toutes les 6 secondes

  const [calculatedAmount, setCalculatedAmount] = useState(0);
  const [connectionMinutes, setConnectionMinutes] = useState(0);

  // Mise à jour de l'heure actuelle
  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      setCurrentTime(time);
    };

    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Modifiez la fonction saveConnectionAmount
  const saveConnectionAmount = async () => {
    if (!connectionResult || calculatedAmount === 0) {
      alert("Veuillez calculer le montant de la connexion avant de sauvegarder.");
      return;
    }

    try {
      // Utiliser directement calculatedAmount au lieu d'extraire du JSX
      const saleData = {
        date: new Date().toISOString().slice(0, 10), // Format YYYY-MM-DD
        client: null,
        modePaiement: "Espèces",
        notes: `Connexion internet - ${connectionMinutes} minutes`,
        total: calculatedAmount,
        items: [
          {
            name: "Connexion internet",
            qty: 1,
            price: calculatedAmount
          }
        ]
      };

      const result = await createSale(saleData);

      if (result) {
        Swal.fire({
          title: "Vente sauvegardée !",
          text: `Le montant de ${calculatedAmount.toLocaleString('fr-FR')} Ar a été ajouté aux ventes.`,
          icon: "success",
          confirmButtonText: "OK",
        });

        // Reset le résultat après sauvegarde
        setConnectionResult('');
        setStartHour('');
        setStartMinute('');
        setCalculatedAmount(0);
        setConnectionMinutes(0);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde :', error);
      Swal.fire({
        title: "Erreur",
        text: "Impossible de sauvegarder la vente. Vérifiez votre connexion.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  // Fonction de calcul du montant de connexion
  // Modifiez la fonction calculateConnectionAmount
  const calculateConnectionAmount = () => {
    if (!startHour || !startMinute) {
      setConnectionResult(
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Veuillez renseigner l'heure ainsi que la minute de départ de votre connexion
        </div>
      );
      setCalculatedAmount(0);
      setConnectionMinutes(0);
      return;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    const startHourNum = parseInt(startHour);
    const startMinuteNum = parseInt(startMinute);

    if (startHourNum > currentHour || (startHourNum === currentHour && startMinuteNum > currentMinute)) {
      setConnectionResult(
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Il est {currentHour}:{String(currentMinute).padStart(2, '0')} du coup, l'heure de départ doit être inférieure ou égale à {currentHour}h et la minute de départ inférieure ou égale à {currentMinute} min
        </div>
      );
      setCalculatedAmount(0);
      setConnectionMinutes(0);
      return;
    }

    // Calcul de la différence en minutes
    const startTime = startHourNum * 60 + startMinuteNum;
    const currentTime = currentHour * 60 + currentMinute;
    const diffMinutes = currentTime - startTime;
    
    const totalAmount = diffMinutes * PRICE_PER_MINUTE;
    const formattedAmount = totalAmount.toLocaleString('fr-FR');

    // Stocker les valeurs calculées dans les états
    setCalculatedAmount(totalAmount);
    setConnectionMinutes(diffMinutes);

    setConnectionResult(
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        <b>{diffMinutes} min de connexion</b><br/>
        Montant total : <b className="text-red-600">{formattedAmount} Ar</b>
      </div>
    );
  };


  // Gestionnaire pour le timer
  const startTimer = () => {
    const minutes = parseInt(timerMinutes);
    if (isNaN(minutes) || minutes <= 0) {
      alert('Veuillez entrer un nombre de minutes valide.');
      return;
    }

    initialSecondsRef.current = minutes * 60;
    
    if (!timerPaused) {
      targetTimeRef.current = Date.now() + initialSecondsRef.current * 1000;
    }

    setTimerRunning(true);
    setTimerPaused(false);

    timerRef.current = setInterval(() => {
      const remainingTime = targetTimeRef.current - Date.now();
      
      if (remainingTime <= 0) {
        clearInterval(timerRef.current);
        setTimerDisplay('00:00');
        setTimerRunning(false);
        setTimerPaused(false);
        
        // Jouer le son d'alerte
         playBeepSound();
        
        // SweetAlert au lieu d'alert()
        if (window.Swal) {
          window.Swal.fire({
            title: `Minuteur terminé pour ${minutes} min!`,
            text: 'Cliquez sur OK pour arrêter le bip sonore.',
            icon: 'success',
            confirmButtonText: 'OK'
          }).then(() => {
            stopBeeping(); // Arrêter le bip
          });
        } else {
          alert(`Minuteur terminé pour ${minutes} min!\nCliquez sur OK pour arrêter le bip sonore.`);
          stopBeeping();
        }
      } else {
        const displayMinutes = Math.floor(remainingTime / 60000);
        const displaySeconds = Math.floor((remainingTime % 60000) / 1000);
        
        const formattedMinutes = displayMinutes < 10 ? '0' + displayMinutes : displayMinutes;
        const formattedSeconds = displaySeconds < 10 ? '0' + displaySeconds : displaySeconds;
        
        setTimerDisplay(formattedMinutes + ':' + formattedSeconds);
      }
    }, 1000);
  };

  const pauseTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      setTimerPaused(true);
      setTimerRunning(false);
      initialSecondsRef.current = (targetTimeRef.current - Date.now()) / 1000;
    }
  };

  const resumeTimer = () => {
    if (timerPaused) {
      targetTimeRef.current = Date.now() + initialSecondsRef.current * 1000;
      setTimerPaused(false);
      startTimer();
    }
  };

  const playBeepSound = () => {
    if (isBeeping) return; // Évite les bips multiples
    
    setIsBeeping(true);
    
    try {
      // Créer un élément audio temporaire
      const audio = new Audio('/assets/beep.mp3');
      audio.preload = 'auto';
      audio.loop = true; // Pour répéter comme avant
      
      // Jouer le fichier
      audio.play().catch(error => {
        console.log('Erreur lecture MP3:', error);
        // Fallback vers le bip synthétique si le MP3 ne marche pas
        playFallbackBeep();
      });
      
      // Stocker la référence audio pour pouvoir l'arrêter
      window.currentBeepAudio = audio;
      
    } catch (error) {
      console.error('Erreur audio MP3:', error);
      playFallbackBeep();
    }
  };

  // Fonction de fallback avec le bip synthétique
  const playFallbackBeep = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 1000;
      oscillator.type = 'square';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Erreur audio fallback:', error);
    }
  };

  const stopBeeping = () => {
    setIsBeeping(false);
    
    // Arrêter le MP3 s'il joue
    if (window.currentBeepAudio) {
      window.currentBeepAudio.pause();
      window.currentBeepAudio.currentTime = 0;
      window.currentBeepAudio = null;
    }
    
    // Nettoyer les timeouts
    beepTimeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    beepTimeoutRefs.current = [];
  };

  // Gestionnaire pour le money timer
  const startMoneyTimer = () => {
    const amount = parseInt(moneyAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Veuillez entrer un montant valide.');
      return;
    }

    remainingAmountRef.current = amount;
    setMoneyDisplay(amount.toString());
    setMoneyTimerRunning(true);
    setMoneyTimerPaused(false);

    moneyTimerRef.current = setInterval(() => {
      if (!moneyTimerPaused && remainingAmountRef.current > 0) {
        remainingAmountRef.current -= MONEY_DECREMENT;
        setMoneyDisplay(remainingAmountRef.current.toString());
      } else if (remainingAmountRef.current <= 0) {
        clearInterval(moneyTimerRef.current);
        setMoneyTimerRunning(false);
        setMoneyTimerPaused(false);
        
        // Jouer le son d'alerte
        playBeepSound();

        // SweetAlert au lieu d'alert()
        if (window.Swal) {
          window.Swal.fire({
            title: `Montant épuisé pour ${amount} Ariary`,
            text: 'Cliquez sur OK pour arrêter le bip sonore.',
            icon: 'success',
            confirmButtonText: 'OK',
            allowOutsideClick: false // Empêche de fermer en cliquant dehors
          }).then(() => {
              stopBeeping(); // Arrêter le bip
            });
        } else {
          alert(`Minuteur épuisé pour ${amount} Ariary!\nCliquez sur OK pour arrêter le bip sonore.`);
          if (playBeepSound()) {
            audioRef.current.pause();
          audioRef.current.currentTime = 0;
          }
        }
        
      }
    }, 6000); // 6 secondes
  };

  const pauseMoneyTimer = () => {
    setMoneyTimerPaused(true);
  };

  const resumeMoneyTimer = () => {
    setMoneyTimerPaused(false);
  };

  // Générateur de mot de passe WiFi
  const generateWifiPassword = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    
    for (let i = 0; i < 8; i++) {
      password += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    setWifiPassword(password);
    
    // SweetAlert pour le mot de passe WiFi
    if (window.Swal) {
      window.Swal.fire({
        title: 'Nouveau Mot de Passe WiFi',
        text: password,
        icon: 'success',
        confirmButtonText: 'OK',
        customClass: {
          title: 'text-lg font-bold',
          content: 'text-2xl font-mono tracking-wider text-blue-600'
        }
      });
    } else {
      alert(`Nouveau Mot de Passe WiFi généré :\n\n${password}`);
    }
  };

  // Fonction de remise à zéro
  const resetAll = () => {
    // Arrêter tous les timers
    if (timerRef.current) clearInterval(timerRef.current);
    if (moneyTimerRef.current) clearInterval(moneyTimerRef.current);

    // Arrêter le bip
    stopBeeping();
    
    // Reset tous les états
    setStartHour('');
    setStartMinute('');
    setConnectionResult('');
    setTimerMinutes('');
    setTimerDisplay('00:00');
    setTimerRunning(false);
    setTimerPaused(false);
    setMoneyAmount('');
    setMoneyDisplay('0000');
    setMoneyTimerRunning(false);
    setMoneyTimerPaused(false);
    setWifiPassword('');

    setCalculatedAmount(0);
    setConnectionMinutes(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Audio pour les alertes */}
      <audio ref={audioRef} preload="auto" loop>
        <source src="/assets/beep.mp3" type="audio/mpeg" />
      </audio>

      <div className="container mx-auto px-4">
        {/* Header avec heure actuelle */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Clock className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Fivoy Services - Imerintsiatosika</h1>
          </div>
          <div className="text-xl font-mono font-semibold text-gray-700 bg-white rounded-lg py-2 px-4 inline-block shadow">
            {currentTime}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Colonne gauche - Calcul de connexion */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <DollarSign className="w-6 h-6 text-violet-600" />
              <h2 className="text-xl font-semibold text-violet-700">Calcul de Connexion</h2>
            </div>
            
            <div className="bg-violet-50 border border-violet-200 text-violet-700 p-3 rounded mb-4">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              Ne perdez pas votre heure de départ pour la connexion!
            </div>

            <div className="space-y-4">
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Heure de départ (0-23)"
                value={startHour}
                onChange={(e) => {
                    setStartHour(e.target.value);
                    if (e.target.value.length >= 2) {
                      startMinuteRef.current.focus();
                    }
                }}
                // onBlur={calculateConnectionAmount}
                min="0"
                max="23"
              />
              
              <input
                ref={startMinuteRef} 
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Minute de départ (0-59)"
                value={startMinute}
                onChange={(e) => {
                    setStartMinute(e.target.value);
                    // calculateConnectionAmount();
                }}
                onBlur={(e) => {
                  if (startMinute !== '' && Number(startMinute) >= 0 && Number(startMinute) <= 59 && e.target.value.length >= 2) {
                    calculateConnectionAmount();
                  }
                }}
                min="0"
                max="59"
              />
              
              <button
                onClick={calculateConnectionAmount}
                className="w-full bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Afficher montant connexion
              </button>
              
              <div className="mt-4">
                {connectionResult}

                {/* Sauvegarder le montant calculé */}
                {connectionResult && (
                  <button
                    onClick={saveConnectionAmount}
                    className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Sauvegarder Connexion
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Colonne droite - Timers et outils */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Timer className="w-6 h-6 text-violet-600" />
              <h2 className="text-xl font-semibold text-violet-700">Outils et Timers</h2>
            </div>            
            
            {/* Timer/Chronomètre */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Timer className={`w-6 h-6 ${timerRunning ? 'text-green-600 animate-pulse' : 'text-gray-600'}`} />
                  <span className="font-semibold">Chronomètre</span>
                </div>
                <span className="text-2xl font-mono font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded">
                  {timerDisplay}
                </span>
              </div>
              
              <div className="flex space-x-2 mb-3">
                <input
                  type="number"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Minutes"
                  value={timerMinutes}
                  onChange={(e) => setTimerMinutes(e.target.value)}
                />
                <button
                  onClick={startTimer}
                  disabled={timerRunning}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                </button>
                <button
                  onClick={pauseTimer}
                  disabled={!timerRunning}
                  className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                >
                  <Pause className="w-4 h-4" />
                </button>
                <button
                  onClick={resumeTimer}
                  disabled={!timerPaused}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <StepForward className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Money Timer */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <DollarSign className={`w-6 h-6 ${moneyTimerRunning && !moneyTimerPaused ? 'text-red-600 animate-pulse' : 'text-gray-600'}`} />
                  <span className="font-semibold">Décompte Argent</span>
                </div>
                <span className="text-2xl font-mono font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded">
                  {moneyDisplay} Ar
                </span>
              </div>
              
              <div className="flex space-x-2 mb-3">
                <input
                  type="number"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Montant en Ar"
                  value={moneyAmount}
                  onChange={(e) => setMoneyAmount(e.target.value)}
                />
                <button
                  onClick={startMoneyTimer}
                  disabled={moneyTimerRunning}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                </button>
                <button
                  onClick={pauseMoneyTimer}
                  disabled={!moneyTimerRunning || moneyTimerPaused}
                  className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                >
                  <Pause className="w-4 h-4" />
                </button>
                <button
                  onClick={resumeMoneyTimer}
                  disabled={!moneyTimerPaused}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <StepForward className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Générateur WiFi */}
            <button
              onClick={generateWifiPassword}
              className="w-full mb-4 bg-cyan-600 text-white py-2 px-4 rounded-lg hover:bg-cyan-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Wifi className="w-5 h-5" />
              <span>Générer Nouveau Mot de Passe WIFI</span>
            </button>

            {/* Bouton Reset */}
            <button
              onClick={resetAll}
              className="w-full text-red-600 border-2 border-red-600 py-2 px-4 rounded-lg hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center space-x-2"
              style={{width: '100%'}}
            >
              <RotateCcw className="w-5 h-5" />
              <span>Remise à zéro</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FivoyCounterApp;