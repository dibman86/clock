ready(function() {	
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
		const audio = document.getElementById('monAudio');
		let isHiding = false
		
		document.body.classList.add("ready");
		
		startThemeEngine();
		
		async function startThemeEngine() {
			const htmlEl = document.documentElement;
			const STORAGE_KEY = "geo_refusal_timestamp";
			const SUN_CACHE_KEY = "cached_sun_times";
			const FOUR_MONTHS_MS = 4 * 30 * 24 * 60 * 60 * 1000;
			let sunData = { sunrise: null, sunset: null };
			let currentDay = new Date().toISOString().split('T')[0];
			
			const safeGetItem = (key) => {return localStorage.getItem(key);};
			
			const safeSetItem = (key, value) => {localStorage.setItem(key, value);};
				
			const updateCelestialPosition = (d) => {
				const totalSecondsToday = (d.getHours() * 3600) + (d.getMinutes() * 60) + d.getSeconds();
				const progress = totalSecondsToday / 86400;
				const orbitAngle = (progress * 360) + 180;
				const orbitEl = document.getElementById("celestial-orbit");
				const moonEl = orbitEl.querySelector('.moon');
				orbitEl.style.transform = `rotate(${orbitAngle}deg)`;
				moonEl.style.transform = `translate(-50%,50%) rotate(${-orbitAngle}deg)`;
			};
			
			function clockNumHere(divHere, numHere){
			  let arrayClockOne = Array.from(document.querySelectorAll(".clockHere > "+divHere));
			  for(let i=0; i<arrayClockOne.length; i++){
				arrayClockOne[i].removeAttribute("class");
				arrayClockOne[i].classList.add("num"+numHere+"Here");
			  }
			}
			
			function updateClock(d) {
				  const hours = String(d.getHours()).padStart(2, '0');
				  const minutes = String(d.getMinutes()).padStart(2, '0');
				  const seconds = String(d.getSeconds()).padStart(2, '0');
				  
				  clockNumHere("div:first-child", hours[0]);
				  clockNumHere("div:nth-child(2)", hours[1]);
				  
				  clockNumHere("div:nth-child(4)", minutes[0]);
				  clockNumHere("div:nth-child(5)", minutes[1]);
				  
				  clockNumHere("div:nth-child(7)", seconds[0]);
				  clockNumHere("div:last-child", seconds[1]);
				  
				  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
				  document.getElementById('date-display').textContent = d.toLocaleDateString('fr-FR', options);
				  
				  if (minutes === "00") {
						catQueut.style.animation = 'none';
						catQueut.style.borderRadius = '50% 50% 0 0'
				  } else {
						catQueut.style.animation = 'remuer 2s ease-in-out infinite';
						catQueut.style.borderRadius = '20px 20px 0 0'
				  }
			}

			const updateTheme = () => {
				const now = new Date();
				let isDay;
				const verif = sunData.sunrise && sunData.sunset;
				if (verif) {
					isDay = now >= sunData.sunrise && now <= sunData.sunset;
				} else {
					const h = now.getHours();
					isDay = h >= 7 && h < 19;
				}
				
				const currentClass = isDay ? "day" : "night";
				const oldClass = isDay ? "night" : "day";

				if (!htmlEl.classList.contains(currentClass)) {
					htmlEl.classList.replace(oldClass, currentClass) || htmlEl.classList.add(currentClass);
				}
				if(!htmlEl.classList.contains("open-page")) htmlEl.classList.add("open-page");
				updateClock(now);
				updateCelestialPosition(now);
				let timer = null;
				if(timer) clearTimeout(timer)
				timer = setTimeout((now) => {
					updateTheme();
					const todayStr = new Date().toISOString().split('T')[0];
					if (todayStr !== currentDay && verif) {
						console.log("Minuit est passé. Actualisation des données...");
						currentDay = todayStr; 
						fetchSunData(false);
					}
				}, 1000);
			};

			const fetchSunData = (b) => {
				const lastRefusal = safeGetItem(STORAGE_KEY);
				const isRefusalValid = lastRefusal && (Date.now() - parseInt(lastRefusal) < FOUR_MONTHS_MS);
				if(b){
					const cached = safeGetItem(SUN_CACHE_KEY);
					if (cached) {
						try {
							const parsed = JSON.parse(cached);
							if (parsed.date === currentDay) {
								sunData.sunrise = new Date(parsed.sunrise);
								sunData.sunset = new Date(parsed.sunset);
								updateTheme();
								return;
							}
						} catch(e) { /* Erreur JSON parse, on continue */ }
					}
				}
				if (!navigator.geolocation || isRefusalValid) {
					updateTheme();
					return;
				}
				
				navigator.geolocation.getCurrentPosition(async (pos) => {
					try {
						const { latitude, longitude } = pos.coords;
						const resp = await fetch(`https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&formatted=0`);
						const json = await resp.json();
						
						sunData.sunrise = new Date(json.results.sunrise);
						sunData.sunset = new Date(json.results.sunset);
						
						safeSetItem(SUN_CACHE_KEY, JSON.stringify({
							date: currentDay,
							sunrise: sunData.sunrise,
							sunset: sunData.sunset
						}));
						safeSetItem(STORAGE_KEY, null);
						updateTheme();
					} catch (e) {
						updateTheme();
					}
				}, (err) => {
					if (err.code === err.PERMISSION_DENIED) {
						safeSetItem(STORAGE_KEY, Date.now());
					}
					updateTheme();
				});
			};

			fetchSunData(true);
		}

		function randomEffect() {
			let rndL = Math.random() < 0.5 ? 1 : -1;
			let rndR = Math.random() < 0.5 ? 1 : -1;
			let rndDelay = Math.random() * 3;
			let timer = null;
			if (!isHiding) {
				eyesNormal.style.visibility = 'hidden';
				eyeBlink.style.visibility = 'visible';
				whiskersL.style.transform = `rotate(${rndL}deg)`;
				whiskersR.style.transform = `rotate(${rndR}deg)`;
				catBody.classList.remove('anim-active');
				cat.style.setProperty('--value',`${rndDelay + 2}deg`);
				setTimeout(() => {
					if (!isHiding) {
						eyesNormal.style.visibility = 'visible';
						eyeBlink.style.visibility = 'hidden';
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
		
		let timeout= null;
        hitbox.addEventListener('pointerenter', () => {
			if(timeout) clearTimeout(timeout);
			timeout = setTimeout(() => {
				isHiding = true;
				document.body.classList.add('is-hiding');
				eyesNormal.style.visibility = 'hidden';
				eyesCross.style.visibility = 'visible';
				cat.style.animationPlayState = 'paused';
			}, 100);
        },false);

        hitbox.addEventListener('pointerleave', () => {
			if(timeout) clearTimeout(timeout);
            isHiding = false;
            document.body.classList.remove('is-hiding');
            eyesNormal.style.visibility = 'visible';
            eyesCross.style.visibility = 'hidden';
			cat.style.animationPlayState = 'running';
		},false);
		
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

		main.addEventListener('pointermove', (e) => {
			const mouseX = e.clientX;
			const mouseY = e.clientY;
			const sensitivity = 0.1;
			const centerX = window.innerWidth / 2;
			const centerY = window.innerHeight / 2;
			let moveX = Math.max(-100, Math.min(100, (mouseX - centerX) * sensitivity));
			let moveY = Math.max(-8, Math.min(8, (mouseY - centerY) * sensitivity));
			container.style.transform = `translateX(${-moveX}px) translateY(${-moveY}px)`;
			hitbox.style.transform = `translateX(${-moveX}px) translateY(${-moveY}px)`;
			const elementAtPoint = document.elementFromPoint(mouseX, mouseY);
			const isOverHitbox = hitbox.contains(elementAtPoint);

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
				updatePupil(pupilL, 80, 105, mouseX, mouseY);
				updatePupil(pupilR, 140, 105, mouseX, mouseY);
			}
				cat.style.animationPlayState = 'paused';
		}, false);

		const resetState = () => {
			if (timeout) { clearTimeout(timeout); timeout = null; }
			showNormalEyes();
			pupilL.setAttribute('cx', 80);
			pupilL.setAttribute('cy', 105);
			pupilR.setAttribute('cx', 140);
			pupilR.setAttribute('cy', 105);
			container.style.transform = `translateX(0px) translateY(0px)`;
			hitbox.style.transform = `translateX(0px) translateY(0px)`;
		};

		main.addEventListener('pointerup', resetState);
		main.addEventListener('pointerleave', resetState);
		
        function updatePupil(pupil, originX, originY, mouseX, mouseY) {
            const rect = container.getBoundingClientRect();
            const eyeX = rect.left + originX;
            const eyeY = rect.top + originY;
            
            const angle = Math.atan2(mouseY - eyeY, mouseX - eyeX);
            const dist = Math.sqrt(Math.pow(mouseX-eyeX, 2) + Math.pow(mouseY-eyeY, 2));
            
            const maxMove = 8;
            const move = Math.min(dist * 0.04, maxMove);

            pupil.setAttribute('cx', originX + Math.cos(angle) * move);
            pupil.setAttribute('cy', originY + Math.sin(angle) * move);
        }
});

function ready(callback){
	if (document.readyState!='loading') callback();
	else if (document.addEventListener) document.addEventListener('DOMContentLoaded', callback);
	else document.attachEvent('onreadystatechange', function(){
		if (document.readyState=='complete') callback();
	});
}