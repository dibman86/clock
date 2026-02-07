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
		const zzz = document.getElementById('zzz-container');
		
		let isHiding = false;
		let isonscreen = false;
		let isOverHitbox = null;
		let clockTimer = null;
		let timeout= null;
		
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
			let currentDay = new Date().toISOString().split('T')[0];
			let verif = false;
			const staticHoursSunrise = 8;
			const staticMinutesSunrise = 30;
			const staticHoursSunset = 19;
			const staticMinutesSunset = 0;
			
			const safeGetItem = (key) => {return localStorage.getItem(key);};
			const safeSetItem = (key, value) => {localStorage.setItem(key, value);};
				
			const updateCelestialPosition = (d) => {
				const orbitEl = document.getElementById("celestial-orbit");

				let sunrise, sunset;
				const now = d.getTime();

				if (verif) {
					sunrise = sunData.sunrise.getTime();
					sunset = sunData.sunset.getTime();
				} else {
					sunrise = new Date(d).setHours(staticHoursSunrise, 0, 0, 0);
					sunset = new Date(d).setHours(staticHoursSunset, 0, 0, 0);
				}

				let orbitAngle;

				if (now >= sunrise && now <= sunset) {
					const dayProgress = (now - sunrise) / (sunset - sunrise);
					orbitAngle = -90 + (dayProgress * 180);
				} else {
					const nextSunrise = sunrise + 86400000;
					const nightProgress = (now < sunrise) ? (now + 86400000 - sunset) / (nextSunrise - sunset) : (now - sunset) / (nextSunrise - sunset);
					orbitAngle = 90 + (nightProgress * 180);
				}

				orbitEl.style.transform = `rotate(${orbitAngle}deg)`;
				
				const moonEl = orbitEl.querySelector('.moon');
				if (moonEl) {
					moonEl.style.transform = `translate(-50%, -50%) rotate(${-orbitAngle}deg)`;
				}
			};
			
			function clockNumHere(divHere, numHere){
			  let arrayClockOne = Array.from(document.querySelectorAll(".clockHere > "+divHere));
			  for(let i=0; i<arrayClockOne.length; i++){
				arrayClockOne[i].removeAttribute("class");
				arrayClockOne[i].classList.add("num"+numHere+"Here");
			  }
			}
			
			function updateClock(d) {

				  clockNumHere("div:first-child", d.hours[0]);
				  clockNumHere("div:nth-child(2)", d.hours[1]);
				  
				  clockNumHere("div:nth-child(4)", d.minutes[0]);
				  clockNumHere("div:nth-child(5)", d.minutes[1]);
				  
				  clockNumHere("div:nth-child(7)", d.seconds[0]);
				  clockNumHere("div:last-child", d.seconds[1]);
				  
				  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
				  document.getElementById('date-display').textContent = d.date;
				  
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

				const htmlEl = document.documentElement;
				const now = new Date();
				const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
				const globalDataTime = {
					'hours' : String(now.getHours()).padStart(2, '0'),
					'minutes' : String(now.getMinutes()).padStart(2, '0'),
					'seconds' : String(now.getSeconds()).padStart(2, '0'),
					'date' : now.toLocaleDateString('fr-FR', options)
				}
				const time = `${globalDataTime.hours}  ${globalDataTime.minutes}`;
				let isDay;
				verif = sunData.sunrise && sunData.sunset ? true : false;
				if (verif) {
					isDay = now >= sunData.sunrise && now <= sunData.sunset;
				} else {
					isDay = time >= sunriseStr && time < sunsetStr;
				}
				
				const currentClass = isDay ? "day" : "night";
				const oldClass = isDay ? "night" : "day";

				if (!htmlEl.classList.contains(currentClass)) {
					htmlEl.classList.replace(oldClass, currentClass) || htmlEl.classList.add(currentClass);
					htmlEl.classList.contains('night') ? styleNight() : styleDay();
				}
				
				if(!htmlEl.classList.contains("open-page")){
					setTimeout(() => {htmlEl.classList.add("open-page");}, 1000);
				} 
				
				updateClock(globalDataTime);
				updateCelestialPosition(now);
				
				clockTimer = setTimeout(() => {
					updateTheme();
					const todayStr = new Date().toISOString().split('T')[0];
					if (todayStr !== currentDay && verif) {
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

		main.addEventListener('pointermove', (e) => {
			const mouseX = e.clientX;
			const mouseY = e.clientY;
			const sensitivity = 0.1;
			const centerX = window.innerWidth / 2;
			const centerY = window.innerHeight / 2;
			const maxX = 100;
			const maxY = 8;
			let moveX = Math.max(maxX * -1, Math.min(maxX, (mouseX - centerX) * sensitivity));
			let moveY = Math.max(maxY * -1, Math.min(maxY, (mouseY - centerY) * sensitivity));
			container.style.transform = `translateX(${moveX}px) translateY(${moveY}px)`;
			hitbox.style.transform = `translateX(${moveX}px) translateY(${moveY}px)`;
			const elementAtPoint = document.elementFromPoint(mouseX, mouseY);
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
				updatePupil(pupilL, 80, 105, mouseX, mouseY);
				updatePupil(pupilR, 140, 105, mouseX, mouseY);
				eyeBlink.style.visibility = 'hidden';
				eyesNormal.style.visibility = 'visible';
				container.style.transitionDuration = "0.1s";
				zzz.style.opacity = '0';
				zzz.style.transitionDelay = "0s";
			}
			cat.style.animationPlayState = 'paused';
		}, false);

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
			document.documentElement.classList.contains('night') ? styleNight() : styleDay();
		};

		main.addEventListener('pointerup',() => {
			if(isOverHitbox) resetState();
		});
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
		
		startThemeEngine();
});

function ready(callback){
	if (document.readyState!='loading') callback();
	else if (document.addEventListener) document.addEventListener('DOMContentLoaded', callback);
	else document.attachEvent('onreadystatechange', function(){
		if (document.readyState=='complete') callback();
	});
}