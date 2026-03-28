ready(function() {	
		let htmlEl = document.documentElement;
		const main = document.getElementById("main-container");
		const hitbox = document.getElementById('cat-hitbox');
		const container = document.getElementById('cat-container');
		const cat = document.getElementById('cat');
		const catBody = document.getElementById('cat-body');
		const eyesNormal = document.getElementById('eyes-normal');
		const eyesCross = document.getElementById('eyes-cross');
		const eyeBlink = document.getElementById('eyes-blink');
		const pupilL = document.getElementById('pupil-l');
		const pupilR = document.getElementById('pupil-r');
		const whiskersL = document.getElementById('whiskers-left');
		const whiskersR = document.getElementById('whiskers-right');
		const catQueut = document.getElementById('cat-queut');
		const zzz = document.getElementById('zzz-container');
		
		let isHiding = false;
		let isonscreen = false;
		let isOverHitbox = null;
		let clockTimer = null;
		let timeout= null;
		let containerRect = container.getBoundingClientRect();
		
		document.body.classList.add("ready");
		
		const styleDay = () => {
			eyesNormal.style.visibility = 'visible';
			eyeBlink.style.visibility = 'hidden';
			cat.style.animationPlayState = 'running';
			container.style.transform = `translateX(0px) translateY(0px) rotate(0deg)`;
		}
		
		const styleNight = () => {
			eyesNormal.style.visibility = 'hidden';
			eyeBlink.style.visibility = 'visible';
			cat.style.animationPlayState = 'paused';
			container.style.transform = `translateX(0px) translateY(12px) rotate(-10deg)`;
			zzz.style.opacity = '1';
			zzz.style.transitionDelay = "3s";
		}
		
		async function startThemeEngine() {
			const STORAGE_KEY = "geo_refusal_timestamp";
			const SUN_CACHE_KEY = "cached_sun_times";
			const FOUR_MONTHS_MS = 4 * 30 * 24 * 60 * 60 * 1000;
			let sunData = { sunrise: null, sunset: null };
			let currentDay = new Date().toLocaleDateString('sv-SE');
			
			let config = {
				sunrise: { h: 7, m: 00 },
				sunset: { h: 18, m: 30 }
			};
			
			const safeGetItem = (key) => {return localStorage.getItem(key);};
			const safeSetItem = (key, value) => {localStorage.setItem(key, value);};
				
			const updateCelestialPosition = (d) => {
				const orbitEl = document.getElementById("celestial-orbit");

				let sunrise, sunset;
				const now = d.getTime();

				sunrise = sunData.sunrise.getTime();
				sunset = sunData.sunset.getTime();
				
				
				const noon = new Date(d).setHours(12, 0, 0, 0);
				const midnight = new Date(d).setHours(0, 0, 0, 0);

				const synodicMonth = 29.530588853;
				const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));
				const daysSinceNewMoon = (now - knownNewMoon.getTime()) / 86400000;
				let phase = (daysSinceNewMoon % synodicMonth) / synodicMonth;
				
				const shadow = document.getElementById('moon-phase-shadow');

				if (phase < 0.03 || phase > 0.97) {
					shadow.style.left = "0%";
				} else if (phase < 0.5) {
					shadow.style.left = (phase * 200) + "%";
				} else {
					shadow.style.left = ((phase - 0.5) * 200 - 100) + "%";
				}
				
				let orbitAngle;

				if (now >= sunrise && now <= sunset) {
					if (now < noon) {
						const progress = (now - sunrise) / (noon - sunrise);
						orbitAngle = -90 + (progress * 90);
					} else {
						const progress = (now - noon) / (sunset - noon);
						orbitAngle = progress * 90;
					}
				} else {
					if (now > sunset) {
						const progress = (now - sunset) / (new Date(d).setHours(24,0,0,0) - sunset);
						orbitAngle = 90 + (progress * 90);
					} else {
						const progress = (now - midnight) / (sunrise - midnight);
						orbitAngle = 180 + (progress * 90);
					}
				}

				orbitEl.style.transform = `rotate(${orbitAngle}deg)`;
				
				const moonEl = orbitEl.querySelector('.moon');
				if (moonEl) {
					moonEl.style.transform = `translate(-50%, -50%) scale(1.5) rotate(${-orbitAngle -30}deg)`;
				}
			};
			
			function clockNumHere(divHere, numHere){
			  let arrayClockOne = Array.from(document.querySelectorAll(".clockHere > "+divHere));
			  for(let i=0; i<arrayClockOne.length; i++){
				arrayClockOne[i].removeAttribute("class");
				arrayClockOne[i].classList.add("num"+numHere+"Here");
			  }
			}
			
			/* function afficherHorizontalement(texte, conteneur) {
				const htmlGenere = texte.split('').filter(char => char !== ' ').map(char => {
				  const estUnChiffre = /[0-9]/.test(char);
				  const classe = estUnChiffre ? 'class="chiffre"' : 'class="lettre"';
				  return `<span ${classe}>${char}</span>`;
				}).join('');
				
				conteneur.innerHTML = htmlGenere;
			} */
			
			function updateClock(d) {
				
				clockNumHere("div:first-child", d.hours[0]);
				clockNumHere("div:nth-child(2)", d.hours[1]);
				clockNumHere("div:nth-child(4)", d.minutes[0]);
				clockNumHere("div:nth-child(5)", d.minutes[1]);
				clockNumHere("div:nth-child(7)", d.seconds[0]);
				clockNumHere("div:last-child", d.seconds[1]);
				
				const dateDisplay = document.getElementById('date-display');
				if (dateDisplay.innerHTML !== d.date) dateDisplay.innerHTML = d.date;
				
				/*if (dateDisplay.innerHTML !== d.date) afficherHorizontalement(d.date, dateDisplay); */
				
				if (d.minutes === "00") {
					catQueut.style.animation = 'none';
					catQueut.style.borderRadius = '50% 50% 0 0'
				} else {
					catQueut.style.animation = 'remuer 2s ease-in-out infinite';
					catQueut.style.borderRadius = '20px 20px 0 0'
				}
			}

			const updateTheme = () => {
				if(clockTimer) clearTimeout(clockTimer)

				htmlEl = document.documentElement;
				const now = new Date();
				const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
				const formatter = new Intl.DateTimeFormat('fr-FR', options);
				const parts = formatter.formatToParts(now);

				const dateObj = {
					weekday: parts.find(p => p.type === 'weekday').value,
					day: parts.find(p => p.type === 'day').value,
					month: parts.find(p => p.type === 'month').value,
					year: parts.find(p => p.type === 'year').value
				};
				
				const globalDataTime = {
					'hours' : String(now.getHours()).padStart(2, '0'),
					'minutes' : String(now.getMinutes()).padStart(2, '0'),
					'seconds' : String(now.getSeconds()).padStart(2, '0'),
					'date' : `<span id="weekday">${dateObj.weekday}</span> <span id="day">${dateObj.day.padStart(2, '0')}</span> <span id="month">${dateObj.month}</span> <span id="year">${dateObj.year}</span>`
				}
				
				const time = `${globalDataTime.hours} ${globalDataTime.minutes}`;
				let isDay,inSunrise, inSunset, isNightTime;
				
				const sunriseEnd = new Date(sunData.sunrise);
				sunriseEnd.setMinutes(sunriseEnd.getMinutes() - 30);
					
				const sunsetEnd = new Date(sunData.sunset);
				sunsetEnd.setMinutes(sunsetEnd.getMinutes() + 30);
					
				isDay = now >= sunData.sunrise && now < sunData.sunset;
				inSunrise = now >= sunriseEnd && now < sunData.sunrise;
				inSunset = now >= sunData.sunset && now < sunsetEnd;
				isNightTime = now >= sunsetEnd || now < sunData.sunrise;

				htmlEl.classList.toggle("sunrise", inSunrise);
				htmlEl.classList.toggle("sunset", inSunset);
				
				const currentClass = isDay ? "day" : "night";
				const oldClass = isDay ? "night" : "day";
				
				if (!htmlEl.classList.contains(currentClass)) {
					htmlEl.classList.replace(oldClass, currentClass) || htmlEl.classList.add(currentClass);
					htmlEl.classList.contains('night') && !htmlEl.classList.contains('sunrise') && !htmlEl.classList.contains('sunset') ? styleNight() : styleDay();
				}
				
				const starGroups = document.querySelectorAll('.stars-group');
				starGroups.forEach(group => {
					isNightTime ? group.classList.add("view") : group.classList.remove("view");
				});
				
				updateClock(globalDataTime);
				updateCelestialPosition(now);
				
				clockTimer = setTimeout(() => {
					if(document.body.classList.contains("ready")) document.body.classList.remove("ready");
					if(!htmlEl.classList.contains("open-page")) htmlEl.classList.add("open-page");
					updateTheme();
					const todayStr = new Date().toLocaleDateString('sv-SE');
					if (todayStr !== currentDay) {
						currentDay = todayStr;
						fetchSunData(false);
					}
				}, 1000);
			};

			const fetchSunData = (useCache) => {
				const lastRefusal = safeGetItem(STORAGE_KEY);
				const isRefusalValid = lastRefusal && (Date.now() - parseInt(lastRefusal) < FOUR_MONTHS_MS);

				const processSunResults = (lat, lng, results) => {
					sunData.sunrise = new Date(results.sunrise);
					sunData.sunset = new Date(results.sunset);

					const locationTag = `${Math.round(lat)},${Math.round(lng)}`;
					safeSetItem(SUN_CACHE_KEY, JSON.stringify({
						date: currentDay,
						location: locationTag,
						sunrise: results.sunrise,
						sunset: results.sunset
					}));

					updateTheme();
				};
				
				const applyFallback = () => {
					console.log("DEBUG: Utilisation des données de secours");
					const cached = safeGetItem(SUN_CACHE_KEY);
					let parsed = null;
					try { parsed = JSON.parse(cached); } catch(e) {}

					if (parsed) {
						sunData.sunrise = new Date(parsed.sunrise);
						sunData.sunset = new Date(parsed.sunset);
					} else {
						sunData.sunrise = new Date();
						sunData.sunrise.setHours(config.sunrise.h, config.sunrise.m);
						sunData.sunset = new Date();
						sunData.sunset.setHours(config.sunset.h, config.sunset.m);
					}
					updateTheme();
				};

				const fetchSunByCoords = (lat, lng) => {
					const locationTag = `${Math.round(lat)},${Math.round(lng)}`;
					const cached = safeGetItem(SUN_CACHE_KEY);
					let parsedCache = null;

					if (cached) {
						try { parsedCache = JSON.parse(cached); } catch (e) {}
					}

					if (useCache && parsedCache && parsedCache.date === currentDay && parsedCache.location === locationTag) {
						sunData.sunrise = new Date(parsedCache.sunrise);
						sunData.sunset = new Date(parsedCache.sunset);
						updateTheme();
						return Promise.resolve();
					}

					return fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`)
						.then(res => {
							if (!res.ok) throw new Error("Erreur Réseau"); 
							return res.json();
						})
						.then(json => {
							if (json.status !== "OK") throw new Error("Erreur API");
							processSunResults(lat, lng, json.results);
						})
						.catch((err) => {
							console.warn("Échec de la récupération des données solaires, application du fallback:", err);
							applyFallback();
							return Promise.resolve(); 
						});
				};

				const fetchSunByIP = () => {
					fetch("https://ipinfo.io/json")
						.then(res => res.json())
						.then(data => {
							if (!data.loc) throw new Error("Coordonnées IP manquantes");
							const [lat, lng] = data.loc.split(",");
							return fetchSunByCoords(parseFloat(lat), parseFloat(lng));
						})
						.catch(() => {
							const cached = JSON.parse(safeGetItem(SUN_CACHE_KEY) || "{}");
							if (cached.location) {
								const [lat, lng] = cached.location.split(",");
								return fetchSunByCoords(lat, lng);
							}
							console.warn("Échec de la récupération des Coordonnées, application du fallback:", err);
							applyFallback();
						});
				};

				if (!navigator.geolocation || isRefusalValid) {
					fetchSunByIP();
					return;
				}

				navigator.geolocation.getCurrentPosition(
					(pos) => fetchSunByCoords(pos.coords.latitude, pos.coords.longitude),
					(err) => {
						if (err.code === err.PERMISSION_DENIED) {
							safeSetItem(STORAGE_KEY, Date.now());
						}
						fetchSunByIP();
					}
				);
			};

			fetchSunData(true);
		}
		
		function randomEffect() {
			let rndL = Math.random() < 0.5 ? 1 : -1;
			let rndR = Math.random() < 0.5 ? 1 : -1;
			let rndDelay = Math.random() * 3;
			let timer = null;
			if (!isHiding) {
				if(isonscreen || !document.documentElement.classList.contains('night')){
					eyesNormal.style.visibility = 'hidden';
					eyeBlink.style.visibility = 'visible';
				}
				whiskersL.style.transform = `rotate(${rndL}deg)`;
				whiskersR.style.transform = `rotate(${rndR}deg)`;
				catBody.classList.remove('anim-active');
				cat.style.setProperty('--value',`${rndDelay + 2}deg`);
				setTimeout(() => {
					if (!isHiding) {
						if(isonscreen || !document.documentElement.classList.contains('night')){
							eyesNormal.style.visibility = 'visible';
							eyeBlink.style.visibility = 'hidden';
						}
						whiskersL.style.transform = "rotate(0deg)";
						whiskersR.style.transform = "rotate(0deg)";
						catBody.style.animationDelay = rndDelay + "s";
						catBody.classList.add('anim-active');
					}
				}, 180);
			}
			setTimeout(randomEffect, Math.random() * 5000 + 2000);
		}
		
		randomEffect();
		
		const showCrossEyes = () => {
			isHiding = true;
			document.body.classList.add('is-hiding');
			eyesNormal.style.visibility = 'hidden';
			eyesCross.style.visibility = 'visible';
			cat.style.animationPlayState = 'paused';
		};

		const showNormalEyes = () => {
			isHiding = false;
			document.body.classList.remove('is-hiding');
			eyesNormal.style.visibility = 'visible';
			eyesCross.style.visibility = 'hidden';
			cat.style.animationPlayState = 'running';
		};

		const handleMove = (e) => {
			const clientX = e.touches ? e.touches[0].clientX : e.clientX;
			const clientY = e.touches ? e.touches[0].clientY : e.clientY;

			const sensitivity = 0.1;
			const centerX = window.innerWidth / 2;
			const centerY = window.innerHeight / 2;
			const maxX = 100;
			const maxY = 8;

			let moveX = Math.max(maxX * -1, Math.min(maxX, (clientX - centerX) * sensitivity));
			let moveY = Math.max(maxY * -1, Math.min(maxY, (clientY - centerY) * sensitivity));

			container.style.transform = `translateX(${moveX}px) translateY(${moveY}px)`;
			hitbox.style.transform = `translateX(${moveX}px) translateY(${moveY}px)`;

			const elementAtPoint = document.elementFromPoint(clientX, clientY);
			isOverHitbox = hitbox.contains(elementAtPoint);
			isonscreen = true;

			if (isOverHitbox) {
				if (!isHiding && !timeout) {
					timeout = setTimeout(showCrossEyes, 100);
				}
			} else {
				if (isHiding) {
					if (timeout) { clearTimeout(timeout); timeout = null; }
					showNormalEyes();
				}
			}

			if (!isHiding) {
				updatePupil(pupilL, 80, 105, clientX, clientY);
				updatePupil(pupilR, 140, 105, clientX, clientY);
				eyeBlink.style.visibility = 'hidden';
				eyesNormal.style.visibility = 'visible';
				container.style.transitionDuration = "0.1s";
				zzz.style.opacity = '0';
				zzz.style.transitionDelay = "0s";
			}
			cat.style.animationPlayState = 'paused';
			container.style.transitionDuration = "0.1s";

			if (e.cancelable) e.preventDefault();
		};

		const resetState = () => {
			if (timeout) { clearTimeout(timeout); timeout = null; };
			isonscreen = false;
			showNormalEyes();
			pupilL.setAttribute('cx', 80);
			pupilL.setAttribute('cy', 105);
			pupilR.setAttribute('cx', 140);
			pupilR.setAttribute('cy', 105);
			hitbox.style.transform = `translateX(0px) translateY(0px)`;
			container.style.transitionDuration = "3s";
			if (typeof styleNight === 'function') {
				htmlEl = document.documentElement;
				htmlEl.classList.contains('night') && !htmlEl.classList.contains('sunrise') && !htmlEl.classList.contains('sunset') ? styleNight() : styleDay();
			}
		};

		main.addEventListener('pointermove', handleMove, { passive: false });
		main.addEventListener('pointerleave', resetState);
		main.addEventListener('pointerup', () => {
			if(isOverHitbox) resetState();
		});

		main.addEventListener('touchmove', handleMove, { passive: false });
		main.addEventListener('touchend', resetState);
		main.addEventListener('touchcancel', resetState);
		
        function updatePupil(pupil, originX, originY, mouseX, mouseY) {
            const eyeX = containerRect.left + originX;
            const eyeY = containerRect.top + originY;
            
            const angle = Math.atan2(mouseY - eyeY, mouseX - eyeX);
            const dist = Math.sqrt(Math.pow(mouseX-eyeX, 2) + Math.pow(mouseY-eyeY, 2));
            
            const maxMove = 8;
            const move = Math.min(dist * 0.04, maxMove);

            pupil.setAttribute('cx', originX + Math.cos(angle) * move);
            pupil.setAttribute('cy', originY + Math.sin(angle) * move);
        }
		
		startThemeEngine();
		
		const randomTwinkle = () => {
				if (!document.documentElement.classList.contains('night')) {
					setTimeout(randomTwinkle, 2000);
					return;
				}

				const groupNum = Math.floor(Math.random() * 3) + 1;
				const group = document.getElementById(`stars${groupNum}`);

				if (group) {
					group.classList.add('blink');

					setTimeout(() => {
						group.classList.remove('blink');
					}, 500);
				}

				const nextTick = Math.random() * 3500 + 500;
				setTimeout(randomTwinkle, nextTick);
			};
			
			const createStars = (callback) => {
				const groups = [
					document.getElementById('stars1'),
					document.getElementById('stars2'),
					document.getElementById('stars3')
				];
				
				let shadows = ["", "", ""];
				const totalStars = 500;
				const w = window.innerWidth;
				const h = window.innerHeight / 1.5;

				for (let i = 0; i < totalStars; i++) {
					const x = Math.floor(Math.random() * w);
					const y = Math.floor(Math.random() * h);
					const opacity = Math.random() * 0.8;
					
					const groupIndex = i % 3;
					
					shadows[groupIndex] += `${x}px ${y}px rgba(255, 255, 255, ${opacity}), `;
				}

				groups.forEach((group, index) => {
					if (group) {
						group.style.boxShadow = shadows[index].slice(0, -2);
					}
				});
				
				if (callback) callback();
			};

			createStars(randomTwinkle);

			let resizeTimer;
			window.addEventListener('resize', () => {
				clearTimeout(resizeTimer);
				resizeTimer = setTimeout(() => {
					createStars();
				}, 250);
			});
});

function ready(callback) {
	if (document.readyState != 'loading') {
		requestAnimationFrame(() => {
			callback();
		});
	} else {
		document.addEventListener('DOMContentLoaded', callback);
	}
}
