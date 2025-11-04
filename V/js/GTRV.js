let app;

const backgroundImage = function (){
	document.getElementById('backgroundImage').className = `bg${Math.floor(Math.random() * (12 - 1 + 1)) + 1}`;
};

function cLog(writeKey, writeValue) {
	switch (arguments.length) {
	case 1:
		console.log(writeKey);
		break;
	default:
		console.log(writeKey + ": " + writeValue);
		break;
	}
}

let currentStation = 'Radio_Off';

const debug = function (message){
	let debugWindow = document.getElementById('debugWindow');
	if (!debugWindow) {
		debugWindow = document.createElement('div');
		debugWindow.setAttribute('id','debugWindow');
		
		app.prepend(debugWindow);
	}
	
	debugWindow.innerHTML = message;
	
}

const enableFullscreen = function (){
	if (iOS) {
		fullscreenIcon.style.visibility = 'hidden';
	} else if (!fullscreenIcon.classList.contains('active')) {
		if ((window.innerHeight < window.screen.height) || (window.innerWidth < window.screen.width)) {
			fullscreenIcon.style.visibility = 'visible';
		} else {
			fullscreenIcon.style.visibility = 'hidden';
		}
	}
};

let fullscreenIcon;

let interactionMenu;

let iOS;

const loadFavoriteStations = function (){
	if (localStorage.getItem('favoriteStations')) {
		const favoriteStations = localStorage.getItem('favoriteStations').split(',');
		stationList.forEach(station => {
			if ((station !== '') && (station !== 'Radio_Off') && (station !== 'Self_Radio')) {
				if (favoriteStations.includes(station)) {
					stationData[station].favorite = true;
				} else {
					stationData[station].favorite = false;
				}
			}
		});
	}
};

const loadYouTubeAPI = function (){
	const iframe_api_js = document.createElement('script');
	iframe_api_js.src = 'https://www.youtube.com/iframe_api';
	
	const GTRV_js = document.getElementById('GTRV_js');
	GTRV_js.parentNode.insertBefore(iframe_api_js, GTRV_js);
};

let menu;

const monitor = function (){
	switch (stationData[currentStation].id) {
		case 'Radio_Off': {
			stationData_name.innerHTML = stationData[currentStation].name;
			stationData_artist.innerHTML = nbsp;
			stationData_title.innerHTML = nbsp;
			//stationData_share.innerHTML = nbsp;
			break;
		}
		case 'Non_Stop_Pop_FM': {
			if (player.getCurrentTime) {
				stationData_artist.innerHTML = nbsp;
				stationData_title.innerHTML = nbsp;
				
				stationData_name.innerHTML = stationData[currentStation].name;
				
				if (player.getPlayerState() === 1) {
					let currentTime = player.getCurrentTime();
					
					if (currentTime > (stationData[currentStation].length + 1)) {
						//skip deleted/removed songs
						player.seekTo(0);
						currentTime = 0;
					} else if ((currentTime > 8751) && (currentTime < 8976)) {
						//skip Morcheeba - Tape Loop (Shortcheeba Mix)
						player.seekTo(8976);
						currentTime = 8976;
					} else {
						currentTime = Math.round(currentTime);
					}
					
					stationData[currentStation].currentTime = currentTime;
					
					stationData[currentStation].timestamps.forEach((timestamp) => {
						if ((timestamp.start <= currentTime) && (currentTime <= timestamp.end)) {
							stationData_artist.innerHTML = timestamp.artist;
							stationData_title.innerHTML = timestamp.song;
							//stationData_share.innerHTML = nbsp;
							return;
						}
					});
				}
			}
			break;
		}
		case 'West_Coast_Talk_Radio': {
			if (player.getCurrentTime) {
				stationData_artist.innerHTML = nbsp;
				stationData_title.innerHTML = nbsp;
				
				stationData_name.innerHTML = stationData[currentStation].name;
				
				if (player.getPlayerState() === 1) {
					let currentTime = player.getCurrentTime();
					
					if (currentTime > (stationData[currentStation].length + 1)) {
						//skip ending station intro
						player.seekTo(0);
						currentTime = 0;
					} else {
						currentTime = Math.round(currentTime);
					}
					
					stationData[currentStation].currentTime = currentTime;
					
					stationData[currentStation].timestamps.forEach((timestamp) => {
						if ((timestamp.start <= currentTime) && (currentTime <= timestamp.end)) {
							stationData_artist.innerHTML = timestamp.artist;
							stationData_title.innerHTML = timestamp.song;
							//stationData_share.innerHTML = nbsp;
							return;
						}
					});
				}
			}
			break;
		}
		default: {
			if (player.getCurrentTime) {
				stationData_artist.innerHTML = nbsp;
				stationData_title.innerHTML = nbsp;
				
				stationData_name.innerHTML = stationData[currentStation].name;
				
				if (player.getPlayerState() === 1) {
					const currentTime = Math.round(player.getCurrentTime());
					
					stationData[currentStation].currentTime = currentTime;
					
					stationData[currentStation].timestamps.forEach((timestamp) => {
						if ((timestamp.start <= currentTime) && (currentTime <= timestamp.end)) {
							stationData_artist.innerHTML = timestamp.artist;
							stationData_title.innerHTML = timestamp.song;
							//stationData_share.innerHTML = nbsp;
							return;
						}
					});
				}
			}
		}
	}
};

let monitorInterval;

const nbsp = '&nbsp;';

const play = function(station){
	if (!station.playing) {
		stationData_name.innerHTML = nbsp;
		stationData_artist.innerHTML = nbsp;
		stationData_title.innerHTML = nbsp;
	//	stationData_share.innerHTML = nbsp;
		
		if (station.id === 'Radio_Off') {
			if (player) {
				player.stopVideo();
				
				stationData_name.innerHTML = station.name
				
				clearInterval(monitorInterval);
			}
		} else {
			if (station.currentTime === null) {
				station.currentTime = Math.floor((Math.random() * station.length));
			}
			
			let elapsedTime = station.exitTime;
			if (elapsedTime > 0) {
				elapsedTime = Math.floor(((Date.now() - elapsedTime) / 1000));
			}
			
			station.currentTime += elapsedTime;
			
			while (station.currentTime > station.length) {
				station.currentTime -= station.length;
			}
			
			player.loadVideoById(station.videoId,station.currentTime);
			
			if (!window.matchMedia('screen and (max-width: 991px)').matches) {
				player.setVolume(volume);
			}
			
			monitorInterval = setInterval(monitor,50);
		}
		
		const previousStation = currentStation;
		if (previousStation !== 'Radio_Off') {
			stationData[previousStation].exitTime = Date.now();
		}
	}
	
	currentStation = station.id;
};

let player;

const preferencesMenu = function() {
	const menu = document.createElement('div');
	menu.className = 'menu menuItem';
	
	const Preferences = document.createElement('div');
	menu.append(Preferences);
	Preferences.className = 'preferences menuItem';
	Preferences.innerHTML = 'Preferences<div id="globe-meridian"><svg viewBox="0 0 100 100" height="100" width="100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="47" /><ellipse rx="20" ry="50" cx="50" cy="50" /><line x1="5" y1="35" x2="95" y2="35" /><line x1="5" y1="65" x2="95" y2="65" /></svg></div>';
	
	const radioStationFavorites = document.createElement('div');
	menu.append(radioStationFavorites);
	radioStationFavorites.className = 'radioStationFavorites menuItem';
	radioStationFavorites.innerText = 'RADIO STATION FAVORITES';
	
	const favorites = document.createElement('div');
	menu.append(favorites);
	favorites.className = 'favorites menuItem';
	
	stationList.forEach((station) => {
		if ((station !== '') && (station !== 'Radio_Off') && (station !== 'Self_Radio')) {
			const data = stationData[station];
			
			const favorite = document.createElement('div');
			favorites.append(favorite);
			favorite.className = 'favorite menuItem';
			favorite.setAttribute('data-favorite',data.id);
			favorite.addEventListener('click', (e) => {
				if (e.target.type !== 'checkbox') {
					const cb = document.querySelector(`.checkbox[data-favorite="${e.target.dataset.favorite}"]`);
					cb.checked = !cb.checked;
					cb.dispatchEvent(new Event('change'));
				}
			});
			
			const stationName = document.createElement('div');
			favorite.append(stationName);
			stationName.className = 'stationName menuItem';
			stationName.setAttribute('data-favorite',data.id);
			stationName.innerText = data.name;
			
			const favoriteCheckbox = document.createElement('div');
			favorite.append(favoriteCheckbox);
			favoriteCheckbox.className = 'favoriteCheckbox menuItem';
			favoriteCheckbox.setAttribute('data-favorite',data.id);
			
			const checkbox = document.createElement('input');
			favoriteCheckbox.append(checkbox);
			checkbox.setAttribute('type','checkbox');
			checkbox.setAttribute('name',data.id);
			checkbox.setAttribute('value',data.id);
			checkbox.className = 'checkbox menuItem';
			checkbox.setAttribute('data-favorite',data.id);
			if (data.favorite) {
				checkbox.setAttribute('checked','checked');
			}
			checkbox.addEventListener('change', (e) => {
				stationData[e.target.dataset.favorite].favorite = !stationData[e.target.dataset.favorite].favorite;
				
				saveFavoriteStations();
				
				const nextStation = document.getElementById(currentStation).nextElementSibling || radioWheel.firstChild;
				const startFrom = Number(nextStation.dataset.stationNumber);
				radioWheelBuild(startFrom);
				radioWheelConfig();
			});
		}
	});
	app.prepend(menu);
};

let radioWheel;

const radioWheelBuild = function (startFrom = 2){
	radioWheel.innerHTML = '';
	
	const stationCount = Object.keys(stationData).length;
	
	for (let stationNumber = startFrom; stationNumber < (stationCount + startFrom); stationNumber++) {
		const s = (stationNumber <= stationCount) ? stationNumber : (stationNumber - stationCount);
		const id = stationList[s];
		
		if (stationData[id].favorite) {
			const radioStation = document.createElement('div');
			radioStation.setAttribute('class',('radioStation' + (stationData[id].playing ? ' playing' : '')));
			radioStation.setAttribute('id',id);
			radioStation.setAttribute('data-station-number',s);
			radioWheel.append(radioStation);
			
			radioStation.addEventListener('click', (e) => {
				play(stationData[id]);
			});
			
			const logo = document.createElement('div');
			logo.setAttribute('class',`logo logo${stationData[id].logoNumber}`);
			radioStation.append(logo);
		}
	}
};

const radioWheelConfig = function (){
	const favoriteStationCount = (stationFavoriteList().length - 1);
	
	//RADIO WHEEL
	const h = window.innerHeight;
	const w = window.innerWidth;
	
	const radioWheelPaddingRatio = 0.45;
	const stationSizeRatio = 0.106;
	const favoriteStationCountMin = 20;
	const favoriteStationCountRatio = (Math.max(favoriteStationCount,(favoriteStationCountMin + 1)) / stationList.length);
	
	let radioWheelPadding = (Math.min(h,w) * radioWheelPaddingRatio);
	if (window.matchMedia('(min-width:768px) and (min-height:768px)').matches) {
		radioWheelPadding = (radioWheelPadding * favoriteStationCountRatio);
	}
	radioWheelPadding -= (((radioWheelPadding * 2) * stationSizeRatio) / 2);
	
	radioWheel.style.padding = `${String(radioWheelPadding)}px`;
	
	//STATION BUTTON
	const radioStation = document.querySelectorAll('.radioStation');
	const radioWheelCircumference = ((radioWheel.clientWidth + Math.max(favoriteStationCount,(favoriteStationCountMin + 1))) * Math.PI);
	
	stationSize = ((radioWheelPadding * 2) * stationSizeRatio / favoriteStationCountRatio)
	document.documentElement.style.setProperty('--station-size',`${stationSize}px`);
	
	const bottomAngle = (360 / radioStation.length * (stationFavoriteList().indexOf('Radio_Off') - 1 + (Math.max(favoriteStationCount, (favoriteStationCountMin + 1)) / 4)));
	
	radioStation.forEach((station,index) => {
		//SIZE
		station.style.height = ('var(--station-size)');
		station.style.width = ('var(--station-size)');
		
		//IMAGE
		const logo = station.querySelector('.logo');
		const logoPosition = stationData[station.id].logoPosition;
		
		switch (logo.className) {
			case 'logo logo1': {
				logo.style.backgroundSize = `${stationSize * 6}px ${(stationSize * 4) + (56 * (stationSize/128))}px`;
				logo.style.backgroundPosition = `${stationSize * logoPosition[0] * -1}px ${stationSize * logoPosition[1] * -1}px`;
				break;
			}
			case 'logo logo3': {
				logo.style.backgroundSize = `${stationSize + 28}px ${stationSize + 28}px`;
				logo.style.backgroundPosition = `${logoPosition[0] * -1}px ${logoPosition[1] * -1}px`;
				break;
			}
			case 'logo logo4': {
				logo.style.backgroundSize = `${stationSize + 6}px ${stationSize + 6}px`;
				logo.style.backgroundPosition = `${logoPosition[0] * -1}px ${logoPosition[1] * -1}px`;
				break;
			}
			default: {
				logo.style.backgroundSize = `${stationSize}px ${stationSize}px`;
			}
		}
		
		//POSITION
		const angleInDegrees = ((360 / radioStation.length * (stationFavoriteList().indexOf(station.id) - 1 + (Math.max(favoriteStationCount, (favoriteStationCountMin + 1)) / 4))) - (bottomAngle - 90));
		const angleInRadians = (angleInDegrees * (Math.PI / 180));
		
		station.style.left = `${(w / 2) + radioWheelPadding * Math.cos(angleInRadians) - (stationSize / 2) - ((w / 2) - radioWheelPadding)}px`;
		station.style.top = `${(h / 2) + radioWheelPadding * Math.sin(angleInRadians) - (stationSize / 2) - ((h / 2) - radioWheelPadding)}px`;
	});
};

const saveFavoriteStations = function() {
	localStorage.setItem('favoriteStations', String(stationFavoriteList()));
};

const stationData = {
	Radio_Off: {
		'currentTime': 0,
		'exitTime': 0,
		'favorite': true,
		'id': 'Radio_Off',
		'length': 0,
		'logoNumber': '1',
		'logoPosition': [3,3],
		'name': 'Radio Off',
		'playing': true,
		'stationNumber': '1',
		'timestamps': [
			{'start':0,	'end':0,	'artist':nbsp,	'song':nbsp}
		],
		'videoId': ''
	},
	Media_Player: {
		'currentTime': null,
		'exitTime': 0,
		'favorite': true,
		'id': 'Media_Player',
		'length': 24959,
		'logoNumber': '2',
		'logoPosition': [0,0],
		'name': 'Media Player',
		'playing': false,
		'stationNumber': '2',
		'timestamps': [
			{'start': 1,    'end': 232,  'artist': 'Seth Troxler', 'song': 'Lumartes'},
			{'start': 233,    'end': 622,  'artist': 'Sama\' Abdulhadi', 'song': 'Reverie'},
			{'start': 623,    'end': 1061,  'artist': 'Rampa', 'song': 'The Church'},
			{'start': 1062,    'end': 1373,  'artist': 'Deichkind', 'song': 'Autonom (Dixon Edit)'},
			{'start': 1374,    'end': 1760,  'artist': 'Kerri Chandler', 'song': 'You'},
			{'start': 1761,    'end': 2045,  'artist': 'tINI feat. Amiture', 'song': 'What If, Then What?'},
			{'start': 2046,    'end': 2482,  'artist': 'DJ Tennis', 'song': 'Atlanta'},
			{'start': 2483,    'end': 2796,  'artist': 'Moodymann feat. CD', 'song': 'Keep on Coming'},
			{'start': 2797,    'end': 3171,  'artist': 'Jamie Jones', 'song': 'Laser Lass'},
			{'start': 3172,    'end': 3603,  'artist': 'Mano Le Tough', 'song': 'As If to Say'},
			{'start': 3604,    'end': 3952,  'artist': 'Butch feat. Kemelion', 'song': 'Raindrops'},
			{'start': 3953,    'end': 4439,  'artist': 'CARL CRAIG', 'song': 'Forever Free'},
			{'start': 4440,    'end': 4859,  'artist': 'Margaret Dygas', 'song': 'Wishing Well'},
			{'start': 4860,    'end': 5224,  'artist': 'Red Axes', 'song': 'Calib'},
			{'start': 5225,    'end': 5920,  'artist': 'Luciano', 'song': 'Mantra For Lizzie'},
			{'start': 5921,    'end': 6416,  'artist': 'Lost Souls of Saturn &amp; TOKiMONSTA', 'song': 'Revision of the Past'},
			{'start': 6417,    'end': 6722,  'artist': 'Adam Beyer', 'song': 'Break It Up'},
			{'start': 6723,    'end': 7044,  'artist': 'Tale of Us', 'song': 'Nova Two'},
			{'start': 7045,    'end': 7454,  'artist': 'Bedouin', 'song': 'Up in Flames'},
			{'start': 7455,    'end': 7883,  'artist': 'Damian Lazarus feat. Robert Owens', 'song': 'The Future'},
			{'start': 7884,    'end': 8112,  'artist': 'CARL CRAIG', 'song': 'Forever Free (Edited)'},
			{'start': 8113,    'end': 8380,  'artist': 'Butch feat. Kemelion', 'song': 'Raindrops (Edited)'},
			{'start': 8381,    'end': 8492,  'artist': 'Rampa', 'song': 'The Church (Edited)'},
			{'start': 8493,    'end': 8667,  'artist': 'Kerri Chandler/Luciano', 'song': 'You/Mantra For Lizzie'},
			{'start': 8668,    'end': 9012,  'artist': 'Damian Lazarus/Moodymann', 'song': 'The Future/Keep On Coming'},
			{'start': 9013,    'end': 9120,  'artist': 'Tale Of Us/Margaret Dygas', 'song': 'Nova Two/Wishing Well'},
			{'start': 9121,    'end': 9394,  'artist': 'Mano Le Tough', 'song': 'As If to Say (Edited)'},
			{'start': 9395,    'end': 9535,  'artist': 'Adam Beyer', 'song': 'Break It Up (Edited)'},
			{'start': 9536,    'end': 9720,  'artist': 'Deichkind', 'song': 'Autonom (Dixon Edit)'},
			{'start': 9721,    'end': 9798,  'artist': 'tINI feat. Amiture', 'song': 'What If, Then What? (Edited)'},
			{'start': 9799,    'end': 10383,  'artist': 'Seth Troxler', 'song': 'Lumartes (Edited)'},
			{'start': 10384,    'end': 10545,  'artist': 'DJ Tennis', 'song': 'Atlanta (Edited)'},
			{'start': 10546,    'end': 10621,  'artist': 'Red Axes', 'song': 'Calib (Edited)'},
			{'start': 10622,    'end': 10718,  'artist': 'Sama\' Abdulhadi/Jamie Jones', 'song': 'Reverie/Laser Lass'},
			{'start': 10719,    'end': 11347,  'artist': 'Damian Lazarus feat. Robert Owens', 'song': 'The Future'},
			{'start': 11348,    'end': 11628,  'artist': 'Bedouin', 'song': 'Up in Flames'},
			{'start': 11629,    'end': 12154,  'artist': 'Lost Souls of Saturn &amp; TOKiMONSTA', 'song': 'Revision of the Past'},
			{'start': 12155,    'end': 12253,  'artist': 'Thundercat', 'song': 'Them Changes'},
			{'start': 12254,    'end': 12323,  'artist': 'Christion', 'song': 'Pimp This Love'},
			{'start': 12324,    'end': 12503,  'artist': 'Atlanta Rhytm Section', 'song': 'So Into You'},
			{'start': 12504,    'end': 12633,  'artist': 'Ro James', 'song': 'Ga$'},
			{'start': 12634,    'end': 12817,  'artist': 'Claudja Barry', 'song': 'Love For Sake of Love'},
			{'start': 12818,    'end': 12927,  'artist': 'Barbara NcNair', 'song': 'My World Is Empty Without You'},
			{'start': 12928,    'end': 13086,  'artist': 'MFSB', 'song': 'Plenty Good Lovin\''},
			{'start': 13087,    'end': 13274,  'artist': 'The Emotions', 'song': 'I Don\'t Wanna Lose Your Love'},
			{'start': 13275,    'end': 13620,  'artist': 'Bell &amp; James', 'song': 'Livin\' It Up (Friday Night)'},
			{'start': 13621,    'end': 13808,  'artist': 'Jesse Johnson/Moodymann', 'song': 'Where the Devil Plays'},
			{'start': 13809,    'end': 14013,  'artist': 'Stavroz', 'song': 'Gold Town'},
			{'start': 14014,    'end': 14264,  'artist': 'Larry Heard', 'song': 'Lamentation'},
			{'start': 14265,    'end': 14602,  'artist': 'Mobb Deep', 'song': 'Cradle to the Grave'},
			{'start': 14603,    'end': 14847,  'artist': 'Nipsey Hussle feat. Cobby Supreme &amp; Dom Kennedy', 'song': 'Checc Me Out'},
			{'start': 14848,    'end': 15155,  'artist': 'DāM-FunK ', 'song': 'Hood Pass Intact'},
			{'start': 15156,    'end': 15359,  'artist': 'Shade Sheist feat. Nate Dogg &amp; Kurupt', 'song': 'Where I Wanna Be'},
			{'start': 15360,    'end': 15672,  'artist': 'LJT Xperience feat. Anduze', 'song': 'Bad Side'},
			{'start': 15673,    'end': 15856,  'artist': 'Aurra', 'song': 'Make Up Your Mind'},
			{'start': 15857,    'end': 16018,  'artist': 'Black Rob &amp; Diddy feat. Puff Daddy', 'song': 'I Love You Baby'},
			{'start': 16019,    'end': 16370,  'artist': 'Teena Marie', 'song': 'Deja Vu'},
			{'start': 16371,    'end': 16609,  'artist': 'Rick James', 'song': 'Hollywood'},
			{'start': 16610,    'end': 16889,  'artist': 'Joey Purp', 'song': 'Elastic'},
			{'start': 16890,    'end': 17121,  'artist': 'Channel Tres', 'song': 'Skate Depot (Moodymann Remix)'},
			{'start': 17122,    'end': 17449,  'artist': 'Marvin Belton', 'song': 'The Letter'},
			{'start': 17450,    'end': 17626,  'artist': 'Moodymann', 'song': 'Basement Party'},
			{'start': 17627,    'end': 18046,  'artist': 'Moodymann', 'song': 'Pray 4 Love'},
			{'start': 18047,    'end': 18345,  'artist': 'Moodymann', 'song': 'Technologystolemyvinyle'},
			{'start': 18346,    'end': 18593,  'artist': 'AMP Fiddler feat. Moodymann', 'song': 'I Get Moody Sometimes'},
			{'start': 18594,    'end': 19108,  'artist': 'Sandy Barber', 'song': 'I Think I\'ll Do Some Steppin On My Own (Opolopo Rework)'},
			{'start': 19109,    'end': 19444,  'artist': 'Moodymann', 'song': '9 Nights 2 Nowhere'},
			{'start': 19445,    'end': 19620,  'artist': 'NEZ feat. Gangsta Boo &amp; Moodymann', 'song': 'Freaks'},
			{'start': 19621,    'end': 19819,  'artist': 'Obie Trice feat. Nate Dogg', 'song': 'The Setup'},
			{'start': 19820,    'end': 20134,  'artist': 'Jose James', 'song': 'Love Conversation'},
			{'start': 20135,    'end': 20416,  'artist': 'Moodymann', 'song': 'Misled'},
			{'start': 20417,    'end': 20979,  'artist': 'Teena Marie', 'song': 'I Need Your Lovin\''},
			{'start': 20980,    'end': 21149,  'artist': 'Dr. Dre', 'song': 'Black Privilege'},
			{'start': 21150,    'end': 21441,  'artist': 'Dr. Dre feat. Nipsey Hustle &amp; Ty Dolla Sign', 'song': 'Diamond Mind'},
			{'start': 21442,    'end': 21677,  'artist': 'Dr. Dre feat. Anderson .Paak, Snoop Dogg &amp; Busta Rhymes', 'song': 'ETA'},
			{'start': 21678,    'end': 21881,  'artist': 'Dr. Dre feat. THURZ &amp; Cocoa Sarai', 'song': 'Fallin Up'},
			{'start': 21882,    'end': 22086,  'artist': 'Dr. Dre feat. Eminem', 'song': 'Gospel'},
			{'start': 22087,    'end': 22265,  'artist': 'Dr. Dre feat. Rick Ross &amp; Anderson .Paak', 'song': 'The Scenic Route'},
			{'start': 22266,    'end': 22428,  'artist': 'NEZ feat. ScHoolboy Q', 'song': 'Let\'s Get It'},
			{'start': 22429,    'end': 22643,  'artist': 'NEZ', 'song': 'You Wanna?'},
			{'start': 22644,    'end': 22791,  'artist': 'DāM-FunK', 'song': 'The Contract (Space)'},
			{'start': 22792,    'end': 22908,  'artist': 'Soulwax', 'song': 'Los Santos Drug Wars'},
			{'start': 22909,    'end': 23099,  'artist': 'Nick Hook', 'song': 'The Diamond Casino Heist'},
			{'start': 23100,    'end': 23239,  'artist': 'Rampa', 'song': 'The Cayo Perico Heist II'},
			{'start': 23240,    'end': 23377,  'artist': 'Oh No', 'song': 'Lowriders'},
			{'start': 23378,    'end': 23482,  'artist': 'Holy Fuck', 'song': 'Bikers'},
			{'start': 23483,    'end': 23647,  'artist': 'HEALTH', 'song': 'Arena Wars'},
			{'start': 23648,    'end': 23847,  'artist': '&amp;ME', 'song': 'The Cayo Perico Heist I'},
			{'start': 23848,    'end': 23977,  'artist': 'DāM-FunK', 'song': 'The Contract (The Journey)'},
			{'start': 23978,    'end': 24149,  'artist': 'DāM-FunK', 'song': 'The Contract (Mass)'},
			{'start': 24150,    'end': 24252,  'artist': 'Show Me the Baby', 'song': 'Smuggler\'s Run'},
			{'start': 24253,    'end': 24383,  'artist': 'Take a Daytrip', 'song': 'Import/Export'},
			{'start': 24384,    'end': 24553,  'artist': 'James Curd aka Greenskeepers', 'song': 'Executives and Other Criminals'},
			{'start': 24554,    'end': 24793,  'artist': 'DāM-FunK', 'song': 'The Contract (House Call)'},
			{'start': 24794,    'end': 24959,  'artist': 'DāM-FunK', 'song': 'The Contract (Smooth Kill)' }
		],
		'videoId': 'dPkzYz-AYOs'
	},
	Blaine_County_Radio: {
		'currentTime': null,
		'exitTime': 0,
		'favorite': true,
		'id': 'Blaine_County_Radio',
		'length': 5079,
		'logoNumber': '1',
		'logoPosition': [2,1],
		'name': 'Blaine County Radio',
		'playing': false,
		'stationNumber': '3',
		'timestamps': [
			{'start':0,		'end':1059,	'artist':'BCR Community Hour',	'song':nbsp},
			{'start':1111,	'end':1981,	'artist':'Beyond Insemination',	'song':nbsp},
			{'start':2028,	'end':3782,	'artist':'Bless Your Heart',	'song':nbsp},
			{'start':3836,	'end':5030,	'artist':'BCR Community Hour',	'song':nbsp}
		],
		'videoId': 'aaXui87cF5Y'
	},
	MOTOMAMI_Los_Santos: {
		'currentTime': null,
		'exitTime': 0,
		'favorite': true,
		'id': 'MOTOMAMI_Los_Santos',
		'length': 6906,
		'logoNumber': '4',
		'logoPosition': [3,3],
		'name': 'MOTOMAMI Los Santos',
		'playing': false,
		'stationNumber': '4',
		'timestamps': [
			{'start':9,		'end':200,	'artist':'CAROLINE POLACHEK',						'song': 'Bunny Is A Rider'},
			{'start':240,	'end':400,	'artist':'ROSALÍA',									'song': 'DI MI NOMBRE (Cap.8: Éxtasis)'},
			{'start':410,	'end':578,	'artist':'ALBERTO STYLEE',							'song': 'Tumbando Fronte'},
			{'start':637,	'end':766,	'artist':'TOKISCHA & ROSALÍA',						'song': 'Linda'},
			{'start':767,	'end':954,	'artist':'TOKISCHA & HARACA KIKO & EL CHERRY SCOM',	'song': 'Tukuntaso'},
			{'start':964,	'end':1117,	'artist':'ROSALÍA FEAT. J BALVIN',					'song': 'Con Altura'},
			{'start':1148,	'end':1571,	'artist':'MR. FINGERS',								'song': 'Mystery of Love (2011) (Instrumental)'},
			{'start':1581,	'end':1752,	'artist':'BAD GYAL',								'song': 'A La Mía'},
			{'start':1775,	'end':1974,	'artist':'LIKKLE VYBZ & LIKKLE ADDI',				'song': 'Skinny Jeans'},
			{'start':1981,	'end':2144,	'artist':'LAS GUANABANAS',							'song': 'Vamos Pa la Disco'},
			{'start':2145,	'end':2338,	'artist':'PLAYBOI CARTI',							'song': 'Rockstar Made'},
			{'start':2354,	'end':2596,	'artist':'MONCHY & ALEJANDRA',						'song': 'Dos Locos'},
			{'start':2606,	'end':2804,	'artist':'CAMARÓN DE LA ISLA',						'song': 'Volando Voy'},
			{'start':2820,	'end':3060,	'artist':'ARMANDO',									'song': '100% of Disin\' You'},
			{'start':3070,	'end':3335,	'artist':'DADDY YANKEE',							'song': 'Salgo Pa\' La Calle'},
			{'start':3367,	'end':3567,	'artist':'SOULJA BOY TELL\'EM',						'song': 'Snap And Roll'},
			{'start':3574,	'end':3740,	'artist':'RAUW ALEJANDRO',							'song': 'Nubes'},
			{'start':3760,	'end':3986,	'artist':'AVENTURA',								'song': 'Mi Corazoncito'},
			{'start':3995,	'end':4216,	'artist':'ARCA FEAT. ROSALÍA',						'song': 'KLK'},
			{'start':4255,	'end':4426,	'artist':'KAYDY CAIN & LOS DEL CONTROL',			'song': 'Algo Como Tú'},
			{'start':4431,	'end':4616,	'artist':'ROSALÍA & THE WEEKEND',					'song': 'LA FAMA'},
			{'start':4617,	'end':4798,	'artist':'POPCAAN',									'song': 'Body So Good'},
			{'start':4809,	'end':4981,	'artist':'Q',										'song': 'Take Me Where Your Heart Is'},
			{'start':4998,	'end':5149,	'artist':'ARCA',									'song': 'Machote'},
			{'start':5161,	'end':5347,	'artist':'DJ SLUGO',								'song': '418 (Bounce Mix)'},
			{'start':5373,	'end':5672,	'artist':'JUSTICE',									'song': 'Stress'},
			{'start':5683,	'end':5818,	'artist':'LA GOONY CHONGA',							'song': 'Duro 2005'},
			{'start':5850,	'end':5988,	'artist':'CHUCKY73',								'song': 'Dominicana'},
			{'start':5995,	'end':6147,	'artist':'DJ SPINN',								'song': 'Bounce N Break Yo Back'},
			{'start':6148,	'end':6327,	'artist':'YOUNG CISTER FEAT. KAYDY CAIN',			'song': 'XULITA'},
			{'start':6335,	'end':6436,	'artist':'ROSALÍA',									'song': 'A Palé'},
			{'start':6453,	'end':6678,	'artist':'WILLIE COLÓN & HÉCTOR LAVOE',				'song': 'Calle Luna Calle Sol'},
			{'start':6689,	'end':6880,	'artist':'ÑEJO & DALMATA',							'song': 'Vacilar Contigo'}
		],
		'videoId': '56FFVnKkzIc'
	},
	The_Music_Locker: {
		'currentTime': null,
		'exitTime': 0,
		'favorite': true,
		'id': 'The_Music_Locker',
		'length': 24984,
		'logoNumber': '3',
		'logoPosition': [14,14],
		'name': 'The Music Locker',
		'playing': false,
		'stationNumber': '5',
		'timestamps': [
			{'start':1,		'end':329,		'artist':'ADAM PORT',									'song':'White Noise Romantica'},
			{'start':330,	'end':610,		'artist':'OSUNLADE, PASTABOYS',							'song':'Deep Musique (Rampa Remix)'},
			{'start':611,	'end':953,		'artist':'&ME',											'song':'After Dark'},
			{'start':954,	'end':1258,		'artist':'REZNIK & MIKESH',								'song':'It\'s Not You It\'s Me (Adam Port Remix)'},
			{'start':1259,	'end':1617,		'artist':'&ME',											'song':'Shadows'},
			{'start':1618,	'end':1874,		'artist':'SIMPLE SYMMETRY',								'song':'Enkidu (Adam Port\'s Talum By Night Edit)'},
			{'start':1875,	'end':2171,		'artist':'RAMPA',										'song':'2000'},
			{'start':2172,	'end':2358,		'artist':'&ME',											'song':'1995'},
			
			{'start':2359,	'end':2674,		'artist':'RAMPA',										'song':'Terrace'},
			{'start':2675,	'end':2991,		'artist':'&ME',											'song':'Woods'},
			{'start':2992,	'end':3275,		'artist':'TÉLÉPOPMUSIK FEAT. YOUNG & SICK',				'song':'Connection (Reznik & Mikesh Remix)'},
			{'start':3276,	'end':3626,		'artist':'BELL TOWERS',									'song':'Want You (Need You) (Adam Port Remix)'},
			{'start':3627,	'end':3908,		'artist':'KEINEMUSIK',									'song':'Civilist'},
			
			{'start':3909,	'end':4177,		'artist':'RAMPA',										'song':'Bimma'},
			{'start':4178,	'end':4531,		'artist':'ADAM PORT & STEREO MC\'S',					'song':'Place'},
			{'start':4532,	'end':4735,		'artist':'HONEY DIJON, JOHN MENDELSOHN, TIM K',			'song':'Thunda (Rampa Remix)'},
			{'start':4736,	'end':5078,		'artist':'&ME',											'song':'Solaris'},
			
			{'start':5079,	'end':5375,		'artist':'ADAM PORT',									'song':'Do You Still Think Of Me?'},
			{'start':5376,	'end':5619,		'artist':'&ME FEAT. SABOTA',							'song':'Trilogy'},
			{'start':5620,	'end':5874,		'artist':'RAMPA',										'song':'Purge'},
			{'start':5876,	'end':6215,		'artist':'SIMIAN MOBILE DISCO FEAT. DEEP THROAT CHOIR',	'song':'Caught In A Wave (&ME Remix)'},
			{'start':6216,	'end':6483,		'artist':'YEAH BUT NO',									'song':'Run Run Run (Adam Port Remix)'},
			{'start':6484,	'end':6866,		'artist':'RAMPA',										'song':'528Hz'},
			
			{'start':6867,	'end':7128,		'artist':'MOODYMANN',									'song':'I Can\'t Kick This Feeling When It Hits'},
			{'start':7129,	'end':7293,		'artist':'DOPPLEREFFEKT',								'song':'Pornoviewer'},
			{'start':7294,	'end':7482,		'artist':'THE DIRTBOMBS',								'song':'Sharivari'},
			{'start':7483,	'end':7824,		'artist':'ANDRES',										'song':'New For U (Live)'},
			{'start':7825,	'end':7972,		'artist':'KYLE HALL & KERO',							'song':'Zug Island'},
			{'start':7973,	'end':8262,		'artist':'NORM TALLEY',									'song':'Cosmic Wave (Delano Smith Remix)'},
			{'start':8263,	'end':8439,		'artist':'AUX 88',										'song':'My A.U.X Mind'},
			{'start':8440,	'end':8568,		'artist':'CYBONIX',										'song':'Cybonix Groove'},
			
			{'start':8569,	'end':8764,		'artist':'MOODYMANN',									'song':'I Think Of Saturday'},
			{'start':8765,	'end':9051,		'artist':'MOODYMANN',									'song':'I\'ll Provide'},
			{'start':9052,	'end':9281,		'artist':'PAPERCLIP PEOPLE',							'song':'Oscillator'},
			{'start':9282,	'end':9482,		'artist':'BLAKE BAXTER',								'song':'When We Used To Play'},
			{'start':9483,	'end':9607,		'artist':'MOODYMANN',									'song':'Jan'},
			{'start':9608,	'end':9767,		'artist':'NORMA JEAN BELL',								'song':'I\'m the Baddest Bitch'},
			{'start':9768,	'end':9973,		'artist':'ROBERTA SWEED',								'song':'Runaway'},
			{'start':9974,	'end':10212,	'artist':'GMI/UHM',										'song':'Formula For Passion'},
			
			{'start':10213,	'end':10492,	'artist':'WAAJEED',										'song':'Power In Numbers'},
			{'start':10493,	'end':10687,	'artist':'EDDIE FOWLKES',								'song':'Time To Express'},
			{'start':10688,	'end':10937,	'artist':'SHEEFY MCFLY',								'song':'Thinkin Bout You'},
			{'start':10938,	'end':11181,	'artist':'AMP FIDDLER',									'song':'Over U'},
			{'start':11182,	'end':11356,	'artist':'GIL SCOTT-HERON',								'song':'We Almost Lost Detroit'},
			{'start':11357,	'end':11448,	'artist':'APOLLO BROWN FEAT. PLANET ASIA',				'song':'Get Back'},
			{'start':11449,	'end':11517,	'artist':'EGB',											'song':'Shhhh'},
			{'start':11518,	'end':11651,	'artist':'EGB',											'song':'Clout'},
			{'start':11652,	'end':11805,	'artist':'MOODYMANN',									'song':'Sinner'},
			{'start':11806,	'end':12008,	'artist':'PIRAHNAHEAD & DIVINITI',						'song':'Love'},
			{'start':12009,	'end':12361,	'artist':'MOODYMANN',									'song':'Got Me Coming Back Rite Now'},
			{'start':12362,	'end':12490,	'artist':'THEO PARRISH',								'song':'Soul Control'},
			
			{'start':12491,	'end':12583,	'artist':'MARCELLUS PITTMAN',							'song':'Red Dogon Star'},
			{'start':12584,	'end':12791,	'artist':'MOODYMANN',									'song':'Rectify'},
			{'start':12792,	'end':12935,	'artist':'MOODYMANN FEAT. PITCH BLACK CITY',			'song':'Runaway'},
			{'start':12936,	'end':13166,	'artist':'MOODYMANN',									'song':'Let Me Show You Love'},
			{'start':13167,	'end':13414,	'artist':'AMP FIDDLER FEAT. MOODYMANN',					'song':'I Get Moody Sometimes'},
			{'start':13415,	'end':13605,	'artist':'MOODYMANN',									'song':'No'},
			{'start':13606,	'end':13731,	'artist':'MOODYMANN',									'song':'It\'s 2 Late 4 U & Me'},
			{'start':13732,	'end':13844,	'artist':'MOODYMANN',									'song':'Got 2 Make It 2 Heaven'},
			{'start':13845,	'end':14083,	'artist':'MOODYMANN',									'song':'Freeki Muthafucka'},
			{'start':14084,	'end':14278,	'artist':'MOODYMANN',									'song':'I Got Werk'},
			{'start':14279,	'end':14451,	'artist':'MOODYMANN',									'song':'1988'},
			
			{'start':14452,	'end':14720,	'artist':'RAMPA',										'song':'Newborn Soul'},
			{'start':14721,	'end':14991,	'artist':'&ME',											'song':'The Rapture Pt.II'},
			{'start':14992,	'end':15264,	'artist':'JAI PAUL',									'song':'Crush (Unfinished) (Adam Port Edit)'},
			{'start':15265,	'end':15522,	'artist':'RAMPA & WHOMADEWHO',							'song':'Tell Me Are We'},
			{'start':15523,	'end':15852,	'artist':'JORIS VOORN',									'song':'Homeland (&ME Remix + Jinadu Vocals)'},
			{'start':15853,	'end':16149,	'artist':'RÜFÜS DU SOL',								'song':'Underwater (Adam Port Remix)'},
			{'start':16150,	'end':16451,	'artist':'&ME',											'song':'Garden'},
			{'start':16452,	'end':16673,	'artist':'ADAM PORT',									'song':'Ganesha Song'},
			{'start':16674,	'end':16933,	'artist':'ÂME',											'song':'No War (Rampa Remix)'},
			
			{'start':16934,	'end':17218,	'artist':'WESTBAM FEAT. RICHARD BUTLER',				'song':'You Need The Drugs (&ME Remix)'},
			{'start':17219,	'end':17418,	'artist':'NOMI & RAMPA',								'song':'Inside'},
			{'start':17419,	'end':17649,	'artist':'CUBICOLOR',									'song':'No Dancers (Adam Port Remix)'},
			{'start':17650,	'end':17876,	'artist':'MANQO',										'song':'Won\'t Change (Rampa Retouch)'},
			{'start':17877,	'end':18174,	'artist':'&ME FEAT. ATELIER',							'song':'Starting Again'},
			{'start':18175,	'end':18434,	'artist':'XINOBI',										'song':'Far Away Place (Rampa Remix)'},
			
			{'start':18435,	'end':18798,	'artist':'&ME',											'song':'The Rapture'},
			{'start':18799,	'end':19115,	'artist':'KEINEMUSIK',									'song':'Muyè'},
			{'start':19116,	'end':19464,	'artist':'&ME',											'song':'In Your Eyes'},
			{'start':19465,	'end':19735,	'artist':'RAMPA',										'song':'Sunday'},
			
			{'start':19736,	'end':20159,	'artist':'NTEIBINT & STELLA',							'song':'A State Nearby (Adam Port Calypso Remix)'},
			{'start':20160,	'end':20338,	'artist':'&ME',											'song':'Fairchild'},
			{'start':20339,	'end':20580,	'artist':'RAMPA FEAT. CHIARA NORIKO',					'song':'For This'},
			{'start':20581,	'end':20715,	'artist':'PROFESSOR RHYTHM',							'song':'Professor 3'},
			
			{'start':20716,	'end':20990,	'artist':'PALMS TRAX',									'song':'Petu (Dub Mix)'},
			{'start':20991,	'end':21197,	'artist':'KLEIN & MBO',									'song':'The MBO Theme'},
			
			{'start':21198,	'end':21320,	'artist':'PLASTIC MODE',								'song':'Baja Imperial (Maxi Version)'},
			{'start':21321,	'end':21442,	'artist':'L\'AMOUR FEAT. KRYSTAL',						'song':'Let\'s Make Love Tonight'},
			{'start':21443,	'end':21632,	'artist':'SHIRLEY LITES',								'song':'Heat You Up (Melt You Down) (Instrumental)'},
			{'start':21633,	'end':21826,	'artist':'SHANNON',										'song':'Let The Music Play (Dub Version)'},
			{'start':21827,	'end':21989,	'artist':'NIGHT MOVES',									'song':'Transdance (New York Disco Mix)'},
			{'start':21990,	'end':22342,	'artist':'N.O.I.A.',									'song':'The Rule To Survive (Prins Thomas Remix)'},
			{'start':22343,	'end':22486,	'artist':'TOBIAS BERNSTRUP',							'song':'27'},
			{'start':22487,	'end':22608,	'artist':'BABY\'S GANG',								'song':'Happy Song (Remix)'},
			{'start':22609,	'end':22843,	'artist':'MASALO',										'song':'New Dance'},
			{'start':22844,	'end':23032,	'artist':'DIVA',										'song':'Get Up'},
			{'start':23033,	'end':23213,	'artist':'MARIO DIAZ',									'song':'Can You Feel It (Jackin Up The Dub 12" Mix)'},
			
			{'start':23214,	'end':23329,	'artist':'SCRAPPY',										'song':'Freeze (Limelight Mix)'},
			{'start':23330,	'end':23470,	'artist':'B BEAT GIRLS',								'song':'For The Same Man'},
			{'start':23471,	'end':23722,	'artist':'GREG LEE',									'song':'Got U On My Mind'},
			{'start':23723,	'end':23929,	'artist':'ROBERT OWENS',								'song':'Visions'},
			{'start':23930,	'end':24228,	'artist':'LISA LEE',									'song':'When Can I Call You (Tommy Musto & Frankie Bones British Telecom Mix)'},
			{'start':24229,	'end':24355,	'artist':'PIERRE\'S PFANTASY CLUB',						'song':'Dream Girl (Original Ralphi Rosario Club Mix)'},
			{'start':24356,	'end':24519,	'artist':'S.L.F.',										'song':'Show Me What You Got (Acid Mix - Part 1)'},
			{'start':24520,	'end':24692,	'artist':'PHORTUNE',									'song':'String Free (Club LeRay Mix)'},
			{'start':24693,	'end':24984,	'artist':'KAMAZU',										'song':'Indaba Kabni' }
		],
		'videoId': 'dBvMBYbUZFc'
	},
	Blue_Ark: {
		'currentTime': null,
		'exitTime': 0,
		'favorite': true,
		'id': 'Blue_Ark',
		'length': 4790,
		'logoNumber': '1',
		'logoPosition': [3,2],
		'name': 'The Blue Ark',
		'playing': false,
		'stationNumber': '6',
		'timestamps': [
			{'start':8,		'end':179,	'artist':'CHRONIXX',								'song':'Odd Ras'},
			{'start':215,	'end':421,	'artist':'DENNIS BROWN',							'song':'Money In My Pocket'},
			{'start':437,	'end':643,	'artist':'GREGORY ISSACS',							'song':'Night Nurse'},
			{'start':671,	'end':861,	'artist':'HALF PINT',								'song':'Crazy Girl'},
			{'start':881,	'end':1082,	'artist':'JOE GIBBS & THE PROFESSIONALS',			'song':'Chapter Three'},
			{'start':1105,	'end':1370,	'artist':'JUNIOR DELGADO',							'song':'Sons Of Slaves'},
			{'start':1387,	'end':1584,	'artist':'KONSHENS',								'song':'Gun Shot A Fire'},
			{'start':1600,	'end':1841,	'artist':'LEE SCRATCH PERRY',						'song':'I Am A Madman'},
			{'start':1861,	'end':2136,	'artist':'LEE SCRATCH PERRY & THE FULL EXPERIENCE',	'song':'Disco Devil'},
			{'start':2165,	'end':2367,	'artist':'THE UPSETTERS',							'song':'Grumblin\' Dub'},
			{'start':2383,	'end':2521,	'artist':'TOMMY LEE SPARTA',						'song':'Psycho'},
			{'start':2543,	'end':2709,	'artist':'VYBZ KARTEL FEAT. POPCAAN',				'song':'We Never Fear Dem'},
			{'start':2733,	'end':2934,	'artist':'YELLOWMAN',								'song':'Nobody Move Nobody Get Hurt'},
			{'start':2956,	'end':3171,	'artist':'PROTOJE',									'song':'Kingston Be Wise'},
			{'start':3199,	'end':3339,	'artist':'DEMARCO',									'song':'Loyals (Royals Remix)'},
			{'start':3365,	'end':3560,	'artist':'BUSY SIGNAL',								'song':'Kingston Town'},
			{'start':3606,	'end':3795,	'artist':'I-OCTANE',								'song':'Topic Of The Day'},
			{'start':3827,	'end':4008,	'artist':'VYBZ KARTEL',								'song':'Addi Truth'},
			{'start':4023,	'end':4285,	'artist':'LEE "SCRATCH" PERRY',						'song':'Money Come And Money Go'},
			{'start':4322,	'end':4540,	'artist':'LEE "SCRATCH" PERRY',						'song':'Roast Fish & Cornbread'},
			{'start':4581,	'end':4784,	'artist':'DANNY HANSWORTH',							'song':'Mr. Money Man' }
		],
		'videoId': 'osmrXqRuwJA'
	},
	Worldwide_FM: {
		'currentTime': null,
		'exitTime': 0,
		'favorite': true,
		'id': 'Worldwide_FM',
		'length': 7229,
		'logoNumber': '1',
		'logoPosition': [0,3],
		'name': 'Worldwide FM',
		'playing': false,
		'stationNumber': '7',
		'timestamps': [
			{'start':0,		'end':162,	'artist':'CASHMERE CAT',										'song':'Mirror Maru'},
			{'start':163,	'end':303,	'artist':'THE HICS',											'song':'Cold Air'},
			{'start':304,	'end':519,	'artist':'INC.',												'song':'The Place'},
			{'start':520,	'end':783,	'artist':'TRICKSKI',											'song':'Beginnings'},
			{'start':784,	'end':989,	'artist':'MALA',												'song':'Ghost'},
			{'start':990,	'end':1155,	'artist':'SWINDLE',												'song':'Forest Funk'},
			{'start':1156,	'end':1318,	'artist':'TOM BROWNE',											'song':'Throw Down'},
			{'start':1319,	'end':1559,	'artist':'DONALD BYRD',											'song':'You And The Music'},
			
			{'start':1600,	'end':1824,	'artist':'CANDIDO',												'song':'Thousand Finger Man'},
			{'start':1825,	'end':1929,	'artist':'TORO Y MOI',											'song':'Harm In Change'},
			{'start':1930,	'end':2156,	'artist':'KYODAI',												'song':'Breaking'},
			{'start':2157,	'end':2335,	'artist':'DJANGO DJANGO',										'song':'Waveforms'},
			{'start':2336,	'end':2566,	'artist':'THE GASLAMP KILLER',									'song':'Nissim'},
			{'start':2567,	'end':2738,	'artist':'OWINY SIGOMA BAND',									'song':'Harpoon Land'},
			{'start':2739,	'end':2921,	'artist':'GUTS',												'song':'Brand New Revolution'},
			{'start':2922,	'end':3083,	'artist':'YUNA',												'song':'Live Your Live (Melo-X Motherland God Mix)'},
			
			{'start':3084,	'end':3379,	'artist':'KIKO NAVARRO & TUCCILLO FEAT. AMOR',					'song':'Lovery (Slow Cuban Vibe Mix)'},
			{'start':3380,	'end':3601,	'artist':'RICHARD SPAVEN',										'song':'1759 (Outro)'},
			{'start':3602,	'end':3869,	'artist':'HACKMAN',												'song':'Forgotten Notes'},
			{'start':3870,	'end':4004,	'artist':'SINKANE',												'song':'Shark Week'},
			{'start':4005,	'end':4180,	'artist':'WILLIAM ONYEABOR',									'song':'Body & Soul'},
			{'start':4181,	'end':4366,	'artist':'FOUR TET',											'song':'Kool FM'},
			{'start':4367,	'end':4527,	'artist':'MOUNT KIMBIE',										'song':'Made to Stray'},
			{'start':4528,	'end':4705,	'artist':'ANUSHKA',												'song':'World In A Room'},
			{'start':4706,	'end':4915,	'artist':'SMOKEY ROBINSON',										'song':'Why You Wanna See My Bad Side?'},
			{'start':4916,	'end':5194,	'artist':'RANDY CRAWFORD',										'song':'Street Life'},
			{'start':5195,	'end':5412,	'artist':'FLUME',												'song':'What You Need'},
			
			{'start':5413,	'end':5686,	'artist':'EARL SWEATSHIRT FT. VINCE STAPLES & CASEY VEGGIES',	'song':'Hive'},
			{'start':5687,	'end':5865,	'artist':'PORTISHEAD',											'song':'Numb'},
			{'start':5866,	'end':5975,	'artist':'JON WAYNE',											'song':'Black Magic'},
			{'start':5976,	'end':6122,	'artist':'ROMAN GIANARTHUR',									'song':'I69'},
			{'start':6123,	'end':6218,	'artist':'LION BABE',											'song':'Treat Me Like Fire'},
			{'start':6219,	'end':6332,	'artist':'DAM-FUNK',											'song':'Kildat'},
			{'start':6333,	'end':6514,	'artist':'JAMIE LIDELL',										'song':'Run Away'},
			{'start':6515,	'end':6676,	'artist':'CHVRCHES',											'song':'Recover (CID RIM REMIX)'},
			{'start':6677,	'end':6864,	'artist':'JIMMY EDGAR',											'song':'Let Yrself Be'},
			{'start':6865,	'end':6994,	'artist':'CLAP! CLAP!',											'song':'Viarejo'},
			{'start':6995,	'end':7229,	'artist':'MAGA BO',												'song':'No Balanço Da Canoa'}
		],
		'videoId': 'ipAXcmxtAPk'
	},
	FlyLo_FM: {
		'currentTime': null,
		'exitTime': 0,
		'favorite': true,
		'id': 'FlyLo_FM',
		'length': 4296,
		'logoNumber': '1',
		'logoPosition': [1,3],
		'name': 'FlyLo FM',
		'playing': false,
		'stationNumber': '8',
		'timestamps': [
			{'start':0,		'end':142,	'artist':'FLYING LOTUS FEAT. NIKI RANDA',	'song':'Getting There'},
			{'start':142,	'end':219,	'artist':'CLAMS CASINO',					'song':'Crystals'},
			{'start':219,	'end':259,	'artist':'FLYING LOTUS',					'song':'Crosswerved'},
			{'start':259,	'end':358,	'artist':'FLYING LOTUS',					'song':'Be Spin'},
			{'start':358,	'end':407,	'artist':'FLYING LOTUS',					'song':'See Thru To U (ft Erykah Badu)'},
			{'start':407,	'end':476,	'artist':'FLYING LOTUS',					'song':'The Diddler'},
			{'start':476,	'end':566,	'artist':'FLYING LOTUS',					'song':'Computer Face RMX'},
			{'start':566,	'end':637,	'artist':'HUDSON MOHAWKE',					'song':'100hm'},
			{'start':637,	'end':835,	'artist':'FLYING LOTUS FEAT. NIKI RANDA',	'song':'The Kill'},
			{'start':835,	'end':1026,	'artist':'TYLER, THE CREATOR',				'song':'Garbage'},
			{'start':1026,	'end':1178,	'artist':'OUTKAST',							'song':'Elevators (Me & You)'},
			{'start':1178,	'end':1289,	'artist':'CAPTAIN MURPHY',					'song':'Evil Grin'},
			{'start':1289,	'end':1395,	'artist':'FLYING LOTUS',					'song':'Catapult Man'},
			{'start':1395,	'end':1472,	'artist':'DABRYE',							'song':'Encoded Flow'},
			{'start':1472,	'end':1608,	'artist':'MACHINEDRUM',						'song':'She Died There'},
			{'start':1608,	'end':1784,	'artist':'DJ RASHAD & HEAVEE',				'song':'It\'s Wack'},
			{'start':1784,	'end':1948,	'artist':'THUNDERCAT',						'song':'O Sheit It\'s X'},
			{'start':1948,	'end':2077,	'artist':'FLYING LOTUS',					'song':'Stonecutters'},
			{'start':2077,	'end':2245,	'artist':'SHADOW CHILD',					'song':'23'},
			{'start':2245,	'end':2339,	'artist':'KINGDOM',							'song':'Stalker Ha'},
			{'start':2339,	'end':2475,	'artist':'APHEX TWIN',						'song':'Windowlicker'},
			{'start':2475,	'end':2610,	'artist':'CURTIS MAYFIELD',					'song':'Eddie You Should Know Better'},
			
			{'start':2610,	'end':2875,	'artist':'DORIS',							'song':'You Never Come Closer'},
			{'start':2875,	'end':3014,	'artist':'FLYING LOTUS FT. KRAYZIE BONE',	'song':'Medication Medication'},
			{'start':3014,	'end':3180,	'artist':'XXYYXX',							'song':'What We Want'},
			{'start':3180,	'end':3269,	'artist':'LAPALUX',							'song':'Make Money'},
			{'start':3269,	'end':3362,	'artist':'GASLAMP KILLER',					'song':'Shred You To Bits'},
			{'start':3362,	'end':3449,	'artist':'MONO/POLY AND THUNDERCAT',		'song':'B Adams'},
			{'start':3449,	'end':3583,	'artist':'FLYING LOTUS',					'song':'Osaka Trade'},
			{'start':3583,	'end':3694,	'artist':'DOOM',							'song':'Masquatch'},
			{'start':3694,	'end':3811,	'artist':'FLYING LOTUS',					'song':'Early Mountain'},
			{'start':3811,	'end':3954,	'artist':'DIMLITE',							'song':'Into Vogon Skulls'},
			{'start':3954,	'end':4088,	'artist':'KNOWER',							'song':'F--- The Makeup, Skip The Shower'},
			{'start':4088,	'end':4296,	'artist':'KASKADE',							'song':'4AM/AraabMuzik Streetz Tonight Remix'}
		],
		'videoId': 'kEkNJRQJACI'
	},
	The_Low_Down_911: {
		'currentTime': null,
		'exitTime': 0,
		'favorite': true,
		'id': 'The_Low_Down_911',
		'length': 4372,
		'logoNumber': '1',
		'logoPosition': [2,3],
		'name': 'The Low Down 91.1',
		'playing': false,
		'stationNumber': '9',
		'timestamps': [
			{'start':35,	'end':242,	'artist':'AARON NEVILLE',			'song':'Hercules'},
			{'start':250,	'end':457,	'artist':'BT EXPRESS',				'song':'Do It (\'Til You\'re Satisfied)'},
			{'start':490,	'end':699,	'artist':'EL CHICANO',				'song':'Viva Tirado - Part 1'},
			{'start':707,	'end':863,	'artist':'GEORGE MACCRAE',			'song':'I Get Lifted'},
			{'start':900,	'end':1070,	'artist':'MARLENA SHAW',			'song':'California Soul'},
			{'start':1102,	'end':1338,	'artist':'SMOKEEY ROBINSON',		'song':'Crusin\''},
			{'start':1343,	'end':1456,	'artist':'THE DELFONICS',			'song':'Ready Or Not Here I Come (Can\'t Hide From Love)'},
			{'start':1490,	'end':1677,	'artist':'THE FIVE STAIRSTEPS',		'song':'O-O-H Child'},
			{'start':1718,	'end':1971,	'artist':'THE SOUL SEARCHERS',		'song':'Ashley\'s Roachclip'},
			{'start':1978,	'end':2232,	'artist':'THE TRAMMPS',				'song':'Rubber Band'},
			{'start':2256,	'end':2445,	'artist':'THE UNDISPUTED TRUTH',	'song':'Smiling Faces Sometimes'},
			{'start':2453,	'end':2645,	'artist':'WAR',						'song':'The Cisco Kid'},
			{'start':2667,	'end':2980,	'artist':'BRASS CONSTRUCTION',		'song':'Changin'},
			{'start':3003,	'end':3218,	'artist':'JOHNNY "GUITAR" WATSON',	'song':'Superman Lover'},
			{'start':3225,	'end':3462,	'artist':'OHIO PLAYERS',			'song':'Climax'},
			{'start':3480,	'end':3690,	'artist':'PLEASURE',				'song':'Bouncy Lady'},
			{'start':3722,	'end':3857,	'artist':'THE DELFONICS',			'song':'Funny Feeling'},
			{'start':3867,	'end':4004,	'artist':'THE CHAKACHAS',			'song':'Stories'},
			{'start':4029,	'end':4201,	'artist':'JACKSON SISTERS',			'song':'I Believe In Miracles'},
			{'start':4206,	'end':4372,	'artist':'WAR',						'song':'Magic Mountain'}
		],
		'videoId': 'oaNdiTLKlMA'
	},
	The_Lab: {
		'currentTime': null,
		'exitTime': 0,
		'favorite': true,
		'id': 'The_Lab',
		'length': 3456,
		'logoNumber': '1',
		'logoPosition': [5,1],
		'name': 'The Lab',
		'playing': false,
		'stationNumber': '10',
		'timestamps': [
			{'start':7,		'end':223,	'artist':'GANGRENE FEAT. SAMUEL T. HERRING & EARL SWEATSHIRT',	'song':'Play It Cool'},
			{'start':267,	'end':471,	'artist':'AB SOUL FEAT. ALOE BLACC',							'song':'Trouble'},
			{'start':511,	'end':758,	'artist':'TUNDE ADEBIMPE FEAT. SAL P & SINKANE',				'song':'Speedline Miracle Masterpiece'},
			{'start':786,	'end':1010,	'artist':'MC EIHT & FREDDIE GIBBS FEAT. KOKANE',				'song':'Welcome To Los Santos'},
			{'start':1043,	'end':1300,	'artist':'PHANTOGRAM',											'song':'K.Y.S.A.'},
			{'start':1385,	'end':1591,	'artist':'VYBZ KARTEL',											'song':'Fast Life'},
			{'start':1620,	'end':1878,	'artist':'KING AVRIEL FEAT. A$AP FERG',							'song':'20\'s 50\'s 100\'s'},
			{'start':1950,	'end':2158,	'artist':'MNDR FEAT. KILLER MIKE',								'song':'Lock & Load'},
			
			{'start':2205,	'end':2409,	'artist':'POPCAAN FEAT. FREDDIE GIBBS',							'song':'Born Bad'},
			{'start':2446,	'end':2671,	'artist':'E-40 FEAT. DAM FUNK & ARIEL PINK',					'song':'California'},
			{'start':2676,	'end':2858,	'artist':'WAVVES',												'song':'Leave'},
			{'start':2875,	'end':3129,	'artist':'CURREN$Y & FREDDIE GIBBS',							'song':'Fetti'},
			{'start':3180,	'end':3417,	'artist':'LITTLE DRAGON',										'song':'Wanderer'}
		],
		'videoId': 'Xy75nA56vcc'
	},
	Radio_Mirror_Park: {
		'currentTime': null,
		'exitTime': 0,
		'favorite': true,
		'id': 'Radio_Mirror_Park',
		'length': 10021,
		'logoNumber': '1',
		'logoPosition': [3,1],
		'name': 'Radio Mirror Park',
		'playing': false,
		'stationNumber': '11',
		'timestamps': [
			{'start':10,	'end':194,	'artist':'HEALTH',					'song':'High Pressure Dave'},
			{'start':195,	'end':398,	'artist':'YACHT',					'song':'Psychic City (Classixx Remix)'},
			{'start':450,	'end':689,	'artist':'TORO Y MOI',				'song':'New Beat'},
			{'start':712,	'end':913,	'artist':'BATTLE TAPES',			'song':'Feel The Same'},
			{'start':914,	'end':1120,	'artist':'DJ MEHDI',				'song':'Lucky Boy (Outlines Remix)'},
			{'start':1170,	'end':1384,	'artist':'SCENIC',					'song':'Mesmerised'},
			{'start':1452,	'end':1713,	'artist':'YEASAYER',				'song':'O.N.E.'},
			{'start':1744,	'end':1947,	'artist':'NITE JEWEL',				'song':'Nowhere To Go'},
			{'start':1991,	'end':2200,	'artist':'PANAMA',					'song':'Always'},
			{'start':2255,	'end':2467,	'artist':'SBTRKT',					'song':'Pharaohs feat Roses Gabor'},
			{'start':2518,	'end':2739,	'artist':'TWIN SHADOW',				'song':'Old Love, New Love'},
			{'start':2740,	'end':2956,	'artist':'AGE OF CONSENT',			'song':'Heartbreak'},
			{'start':3024,	'end':3255,	'artist':'LITTLE DRAGON',			'song':'Crystalfilm'},
			{'start':3266,	'end':3448,	'artist':'DOM',						'song':'Living In America'},
			{'start':3449,	'end':3622,	'artist':'LIVING DAYS',				'song':'Little White Lie'},
			{'start':3642,	'end':3845,	'artist':'THE RUBY SUNS',			'song':'In Real Life'},
			{'start':3846,	'end':4064,	'artist':'DAN CROLL',				'song':'From Nowhere (Baardson Remix)'},
			{'start':4099,	'end':4313,	'artist':'MIAMI HORROR',			'song':'Sometimes'},
			{'start':4382,	'end':4646,	'artist':'MITZI',					'song':'Truly Alive'},
			{'start':4668,	'end':4929,	'artist':'NEON INDIAN',				'song':'Polish Girl'},
			{'start':4970,	'end':5166,	'artist':'THE CHAIN GANG OF 1974',	'song':'Sleepwalking'},
			{'start':5167,	'end':5376,	'artist':'NIKI & THE DOVE',			'song':'The Drummer'},
			{'start':5441,	'end':5638,	'artist':'FEATHERS',				'song':'Dark Matter'},
			{'start':5657,	'end':5920,	'artist':'KAUF',					'song':'When You\'re Out'},
			{'start':5972,	'end':6188,	'artist':'POOLSIDE',				'song':'Do You Believe'},
			{'start':6214,	'end':6436,	'artist':'TONY CASTLES',			'song':'Heart In The Pipes (KAUF Remix)'},
			{'start':6437,	'end':6633,	'artist':'!!!',						'song':'One Girl/One Boy'},
			{'start':6716,	'end':6920,	'artist':'AGE OF CONSENT',			'song':'Colours'},
			{'start':6921,	'end':7140,	'artist':'BLACK STROBE',			'song':'Boogie In Zero Gravity'},
			{'start':7170,	'end':7389,	'artist':'TWIN SHADOW',				'song':'Forget'},
			{'start':7390,	'end':7575,	'artist':'TWIN SHADOW',				'song':'Shooting Holes'},
			{'start':7576,	'end':7828,	'artist':'CUT COPY',				'song':'Strangers In The Wind'},
			{'start':7891,	'end':8105,	'artist':'JAI PAUL',				'song':'Jasmine'},
			{'start':8106,	'end':8289,	'artist':'YEASAYER',				'song':'Don\'t Come Close'},
			{'start':8377,	'end':8724,	'artist':'HOLLY GHOST!',			'song':'Hold On'},
			{'start':8736,	'end':8960,	'artist':'TORO Y MOI',				'song':'So Many Details'},
			{'start':8961,	'end':9197,	'artist':'HOT CHIP',				'song':'Flutes'},
			{'start':9262,	'end':9445,	'artist':'NEON INDIAN',				'song':'Change Of Coast'},
			{'start':9476,	'end':9684,	'artist':'FAVORED NATIONS',			'song':'The Set Up'},
			{'start':9755,	'end':9983,	'artist':'THE C90S',				'song':'Shine A Light (Flight Facilities Remix)'}
		],
		'videoId': 'Sr3anxZlTm0'
	},
	Kult_FM: {
		'currentTime': null,
		'exitTime': 0,
		'favorite': true,
		'id': 'Kult_FM',
		'length': 8406,
		'logoNumber': '5',
		'logoPosition': [0,0],
		'name': 'Kult FM',
		'playing': false,
		'stationNumber': '12',
		'timestamps': [
			{'start':14,	'end':245,	'artist':'DAF',						'song':'Liebe Auf Den Ersten Blick'},
			{'start':246,	'end':524,	'artist':'THE THE',					'song':'This Is The Day'},
			{'start':525,	'end':658,	'artist':'AUTOMATIC',				'song':'Too Much Money'},
			{'start':659,	'end':795,	'artist':'A CERTAIN RATIO',			'song':'Faceless'},
			{'start':847,	'end':1144,	'artist':'CHARANJIT SINGH',			'song':'Raga Madhuvanti'},
			{'start':1145,	'end':1423,	'artist':'THE VELVET UNDERGROUND',	'song':'Rock And Roll'},
			{'start':1541,	'end':1760,	'artist':'THE SLITS',				'song':'Typical Girls'},
			{'start':1761,	'end':1988,	'artist':'JOY DIVISION',			'song':'She\'s Lost Control'},
			{'start':1989,	'end':2175,	'artist':'PROMISELAND',				'song':'Take Down The House'},
			{'start':2176,	'end':2424,	'artist':'LL COOL J',				'song':'Going Back To Cali'},
			{'start':2546,	'end':2690,	'artist':'MISFITS',					'song':'TV Casualty'},
			{'start':2691,	'end':2814,	'artist':'GLORIA JONES',			'song':'Tainted Love'},
			{'start':2815,	'end':3010,	'artist':'LEA PORCELAIN',			'song':'Pool Song'},
			{'start':3074,	'end':3301,	'artist':'DANZIG',					'song':'Deep'},
			{'start':3302,	'end':3430,	'artist':'THE CRAMPS',				'song':'Human Fly'},
			{'start':3485,	'end':3744,	'artist':'T LA ROCK',				'song':'It\'s Yours'},
			{'start':3745,	'end':4142,	'artist':'COLOURBOX',				'song':'Baby I Love You So'},
			{'start':4143,	'end':4450,	'artist':'THE STROKES',				'song':'The Adults Are Talking'},
			{'start':4516,	'end':4762,	'artist':'IGGY POP',				'song':'Nightclubbing'},
			{'start':4763,	'end':5021,	'artist':'GRAUZONE',				'song':'Eisbar'},
			{'start':5088,	'end':5363,	'artist':'VIAGRA BOYS',				'song':'Girls & Boys'},
			{'start':5364,	'end':5510,	'artist':'NICK LOWE',				'song':'So It Goes'},
			{'start':5511,	'end':5828,	'artist':'MC SHAN FEAT. TJ SWAN',	'song':'Left Me Lonely'},
			{'start':5953,	'end':6174,	'artist':'THE STOOGES',				'song':'Down On The Street'},
			{'start':6175,	'end':6398,	'artist':'THE STROKES',				'song':'Hard To Explain'},
			{'start':6449,	'end':6635,	'artist':'ICKY BLOSSOMS',			'song':'Cycle'},
			{'start':6636,	'end':6763,	'artist':'RAMONES',					'song':'Time Bomb'},
			{'start':6778,	'end':6998,	'artist':'THE VOIDZ',				'song':'Where No Eagles Fly'},
			{'start':6999,	'end':7310,	'artist':'NEW ORDER',				'song':'Age Of Consent'},
			{'start':7314,	'end':7572,	'artist':'THE VOIDZ',				'song':'Alien Crime Lord'},
			{'start':7573,	'end':7685,	'artist':'CONNIE FRANCIS',			'song':'Many Tears Ago'},
			{'start':7704,	'end':7919,	'artist':'MAC DEMARCO',				'song':'On The Level'},
			{'start':7920,	'end':8133,	'artist':'ARIEL PINK',				'song':'Four Shadows'},
			{'start':8134,	'end':8406,	'artist':'CRACK CLOUD',				'song':'Drab Measure'},
		],
		'videoId': 'FY9EiOllRhE'
	},
	Space_1032: {
		'currentTime': null,
		'exitTime': 0,
		'favorite': true,
		'id': 'Space_1032',
		'length': 5653,
		'logoNumber': '1',
		'logoPosition': [4,2],
		'name': 'Space 103.2',
		'playing': false,
		'stationNumber': '13',
		'timestamps': [
			{'start':44,	'end':265,	'artist':'BOOTSY COLLINS',			'song':'I\'d Rather Be With You'},
			{'start':275,	'end':529,	'artist':'D TRAIN',					'song':'You\'re The One For Me'},
			{'start':554,	'end':764,	'artist':'EDDIE MURPHY',			'song':'Party All The Time'},
			{'start':775,	'end':1025,	'artist':'EVELYN CHAMPAGNE KING',	'song':'I\'m In Love (12" Dance Mix)'},
			{'start':1056,	'end':1288,	'artist':'KANO',					'song':'Can\'t Hold Back (Your Lovin\')'},
			{'start':1330,	'end':1548,	'artist':'KLEEER',					'song':'Tonight'},
			{'start':1566,	'end':1791,	'artist':'BERNARD WRIGHT',			'song':'Haboglabotribin\''},
			{'start':1802,	'end':2001,	'artist':'ONE WAY',					'song':'Cutie Pie'},
			{'start':2019,	'end':2255,	'artist':'RICK JAMES',				'song':'Give It To Me Baby'},
			{'start':2267,	'end':2424,	'artist':'SHO-NUFF',				'song':'Funkasize You'},
			{'start':2460,	'end':2688,	'artist':'STEVIE WONDER',			'song':'Skeletons'},
			{'start':2703,	'end':2929,	'artist':'TAANA GARDNER',			'song':'Heartbeat'},
			{'start':2961,	'end':3202,	'artist':'ZAPP',					'song':'Heartbreaker, Pts. 1-2'},
			{'start':3217,	'end':3486,	'artist':'BILLY OCEAN',				'song':'Nights (Feel Like Getting Down)'},
			{'start':3510,	'end':3726,	'artist':'CAMEO',					'song':'Back And Forth'},
			{'start':3768,	'end':4014,	'artist':'CENTRAL LINE',			'song':'Walking Into Sunshine'},
			{'start':4043,	'end':4262,	'artist':'DAZZ BAND',				'song':'Joystick'},
			{'start':4271,	'end':4519,	'artist':'IMAGINATION',				'song':'Flashback'},
			{'start':4555,	'end':4806,	'artist':'PARLIAMENT',				'song':'Flashlight'},
			{'start':4815,	'end':5068,	'artist':'PARLIAMENT',				'song':'Mothership Connection'},
			{'start':5108,	'end':5346,	'artist':'FATBACK BAND',			'song':'Gotta Get My Hands On Some (Money)'},
			{'start':5352,	'end':5653,	'artist':'ZAPP & ROGER',			'song':'Do It Roger'}
		],
		'videoId': 'lCZc9y9KpY4'
	},
	Vinewood_Boulevard_Radio: {
		'currentTime': null,
		'exitTime': 0,
		'favorite': true,
		'id': 'Vinewood_Boulevard_Radio',
		'length': 3850,
		'logoNumber': '1',
		'logoPosition': [1,2],
		'name': 'Vinewood Boulevard Radio',
		'playing': false,
		'stationNumber': '14',
		'timestamps': [
			{'start':5,		'end':134,	'artist':'TY SEGALL BAND',			'song':'Diddy Wah Diddy'},
			{'start':145,	'end':322,	'artist':'MIND SPIDERS',			'song':'Fall In Line'},
			{'start':331,	'end':474,	'artist':'CEREMONY',				'song':'Hysteria'},
			{'start':475,	'end':709,	'artist':'THE MEN',					'song':'Turn It Around'},
			{'start':720,	'end':822,	'artist':'NOBUNNY',					'song':'Gone For Good'},
			{'start':836,	'end':1016,	'artist':'HOT SNAKES',				'song':'This mystic Decade'},
			{'start':1026,	'end':1238,	'artist':'THEE OH SEES',			'song':'The Dream'},
			{'start':1253,	'end':1481,	'artist':'SAM FLAX',				'song':'Fire Doesn\'t Burn Itself'},
			{'start':1491,	'end':1684,	'artist':'THE SOFT PACK',			'song':'Answer To Yourself'},
			{'start':1711,	'end':1870,	'artist':'SHARK?',					'song':'California Grrls'},
			{'start':1878,	'end':2026,	'artist':'BLEACHED',				'song':'Next Stop'},
			{'start':2050,	'end':2241,	'artist':'THE ORWELLS',				'song':'Who Needs You'},
			{'start':2242,	'end':2413,	'artist':'FIDLAR',					'song':'Cocaine'},
			{'start':2427,	'end':2571,	'artist':'COLISEUM',				'song':'Used Blood'},
			{'start':2594,	'end':2814,	'artist':'THE BLACK ANGELS',		'song':'Black Grease'},
			{'start':2822,	'end':2970,	'artist':'JEFF THE BROTHERHOOD',	'song':'Sixpack'},
			{'start':2988,	'end':3194,	'artist':'WAVVES',					'song':'Nine Is God'},
			{'start':3202,	'end':3407,	'artist':'BASS DRUM OF DEATH',		'song':'Crawling After You'},
			{'start':3418,	'end':3626,	'artist':'MOON DUO',				'song':'Sleepwalker'},
			{'start':3633,	'end':3832,	'artist':'METZ',					'song':'Wet Blanket'},	
		],
		'videoId': 'VBv5Q3ALz-Y'
	},
	Blonded_Los_Santos_978_FM: {
		'currentTime': null,
		'exitTime': 0,
		'favorite': true,
		'id': 'Blonded_Los_Santos_978_FM',
		'length': 6139,
		'logoNumber': '1',
		'logoPosition': [4,1],
		'name': 'Blonded Los Santos 97.8 FM',
		'playing': false,
		'stationNumber': '15',
		'timestamps': [
			{'start':26,	'end':202,	'artist':'TODD RUNDGREN',						'song':'International Feel'},
			{'start':203,	'end':413,	'artist':'PANDA BEAR',							'song':'Mr Noah'},
			{'start':414,	'end':652,	'artist':'FRANK OCEAN',							'song':'Provider'},
			{'start':653,	'end':977,	'artist':'SCHOOLBOY Q FEAT. LANCE SKIIIWALKER',	'song':'Kno Ya Wrong'},
			{'start':978,	'end':1223,	'artist':'SWV',									'song':'Rain'},
			{'start':1224,	'end':1314,	'artist':'JOY AGAIN',							'song':'On a Farm'},
			{'start':1315,	'end':1542,	'artist':'FRANK OCEAN',							'song':'Ivy'},
			{'start':1543,	'end':1863,	'artist':'CURTIS MAYFIELD',						'song':'So In Love'},
			
			{'start':1864,	'end':2240,	'artist':'MARVIN GAYE',							'song':'When Did You Stop Loving Me, When Did I Stop Loving You'},
			{'start':2241,	'end':2439,	'artist':'LES YA TOUPAS DU ZAIRE',				'song':'Je ne bois pas beaucoup'},
			{'start':2440,	'end':2603,	'artist':'DREXCIYA',							'song':'Andreaen Sand Dunes'},
			{'start':2604,	'end':2813,	'artist':'JAY-Z',								'song':'Dead Presidents II'},
			{'start':2814,	'end':3040,	'artist':'FRANK OCEAN',							'song':'Crack Rock'},
			{'start':3106,	'end':3315,	'artist':'M.C. MACK',							'song':'EZ Come, EZ Go'},
			{'start':3316,	'end':3480,	'artist':'APHEX TWIN',							'song':'IZ-US'},
			{'start':3481,	'end':3668,	'artist':'BURIAL',								'song':'Hiders'},
			{'start':3669,	'end':4006,	'artist':'FUTURE',								'song':'Codeine Crazy'},
			{'start':4007,	'end':4217,	'artist':'FRANK OCEAN',							'song':'Chanel'},
			
			{'start':4218,	'end':4387,	'artist':'LIL UZI VERT',						'song':'For Real'},
			{'start':4388,	'end':4586,	'artist':'MIGOS',								'song':'First 48'},
			{'start':4587,	'end':4768,	'artist':'SUSPECT',								'song':'FBG'},
			{'start':4769,	'end':5080,	'artist':'FRANK OCEAN',							'song':'Nights'},
			{'start':5135,	'end':5288,	'artist':'GUNNA FEAT. PLAYBOI CARTI',			'song':'YSL'},
			{'start':5289,	'end':5526,	'artist':'CHIEF KEEF FEAT. KING LOUIE',			'song':'Winnin'},
			{'start':5527,	'end':5666,	'artist':'LIL SKO',								'song':'Miss White Cocaine'},
			{'start':5667,	'end':5871,	'artist':'JME FEAT. GIGGS',						'song':'Man Don\'t Care'},
			{'start':5872,	'end':5987,	'artist':'(SANDY) ALEX G',						'song':'Master'},
			{'start':5988,	'end':6139,	'artist':'FRANK OCEAN',							'song':'Pretty Sweet'}

		],
		'videoId': '-tVumJBaTWY'
	},
	Los_Santos_Underground_Radio: {
		'currentTime': null,
		'exitTime': 0,
		'favorite': true,
		'id': 'Los_Santos_Underground_Radio',
		'length': 16734.201,
		'logoNumber': '1',
		'logoPosition': [5,0],
		'name': 'Los Santos Underground Radio',
		'playing': false,
		'stationNumber': '16',
		'timestamps': [
			{'start':0,		'end':273,		'artist':'AM$TRAD BILLIONAIRE',						'song':'The Plan'},
			{'start':274,	'end':618,		'artist':'ARA KOUFAX',								'song':'Natural States (Edit)'},
			{'start':619,	'end':977,		'artist':'SWAYZAK',									'song':'In The Car Crash (Headgear\'s Always Crashing In The Same Car Mix)'},
			{'start':978,	'end':1173,		'artist':'D. LYNNWOOD',								'song':'Bitcoins (Original Mix)'},
			{'start':1174,	'end':1518,		'artist':'BRYAN FERRY',								'song':'Don\'t Stop The Dance (Todd Terje Remix)'},
			{'start':1519,	'end':1830,		'artist':'DENIS HORVAT',							'song':'Madness Of Many'},
			
			{'start':1831,	'end':2175,		'artist':'JOHANNES BRECHT',							'song':'Incoherence'},
			{'start':2176,	'end':2454,		'artist':'SOLOMUN',									'song':'Ich Muss Los'},
			{'start':2456,	'end':2666,		'artist':'MATTHEW DEAR',							'song':'Monster'},
			{'start':2667,	'end':2903,		'artist':'TRUNCATE',								'song':'WRKTRX3'},
			{'start':2904,	'end':3193,		'artist':'FLOORPLAN',								'song':'Spin (Original Mix)'},
			{'start':3194,	'end':3483,		'artist':'CEVIN FISHER',							'song':'The Freaks Come Out (Original 2000 Freaks Mix)'},
			{'start':3484,	'end':3684,		'artist':'CHRIS LUM',								'song':'You\'re Mine (Clean Version)'},
			{'start':3685,	'end':3989,		'artist':'ALEX METRIC & TEN VEN',					'song':'The Q'},
			{'start':3990,	'end':4220,		'artist':'SOLOMUN',									'song':'Customer Is King'},
			
			{'start':4221,	'end':4466,		'artist':'ADAM PORT',								'song':'Planet 9'},
			{'start':4467,	'end':4889,		'artist':'DUBFIRE',									'song':'The End To My Beginning'},
			{'start':4890,	'end':5223,		'artist':'LEONARD COHEN',							'song':'You Want It Darker (Solomun Remix)'},
			
			{'start':5224,	'end':5285,		'artist':'TALE OF US',								'song':'Overture'},
			{'start':5286,	'end':5513,		'artist':'TALE OF US',								'song':'1911'},
			{'start':5514,	'end':5662,		'artist':'TALE OF US',								'song':'Trevor\'s Dream'},
			{'start':5663,	'end':5868,		'artist':'TALE OF US',								'song':'Vinewood Blues'},
			{'start':5869,	'end':6099,		'artist':'TALE OF US',								'song':'Anywhere'},
			{'start':6100,	'end':6269,		'artist':'TALE OF US',								'song':'Symphony of the Night'},
			
			{'start':6270,	'end':6470,		'artist':'TALE OF US',								'song':'Another World'},
			{'start':6471,	'end':6680,		'artist':'TALE OF US',								'song':'The Portal'},
			{'start':6681,	'end':6958,		'artist':'TALE OF US',								'song':'Solitude'},
			{'start':6959,	'end':7248,		'artist':'TALE OF US',								'song':'Morgan\'s Fate'},
			{'start':7249,	'end':7440,		'artist':'TALE OF US',								'song':'Fisherman\'s Horizon'},
			{'start':7441,	'end':7607,		'artist':'TALE OF US',								'song':'Myst'},
			
			{'start':7608,	'end':7786,		'artist':'TALE OF US',								'song':'Seeds'},
			{'start':7787,	'end':7975,		'artist':'TALE OF US',								'song':'Endless Journey'},
			{'start':7975,	'end':8141,		'artist':'TALE OF US',								'song':'Valkyr'},
			{'start':8142,	'end':8290,		'artist':'TALE OF US',								'song':'In Hyrule'},
			{'start':8291,	'end':8525,		'artist':'TALE OF US',								'song':'Disgracelands'},
			{'start':8526,	'end':8804,		'artist':'TALE OF US',								'song':'Heart of Darkness'},
			
			{'start':8805,	'end':9061,		'artist':'CARL FINLOW',								'song':'Convergence'},
			{'start':9062,	'end':9286,		'artist':'CARAVACA',								'song':'Yes I Do'},
			{'start':9287,	'end':9550,		'artist':'WARP FACTOR 9',							'song':'The Atmospherian (Tornado Wallace Remix)'},
			{'start':9551,	'end':9785,		'artist':'MASHROU\' LEILA',							'song':'Roman (Bas Ibellini Remix)'},
			{'start':9786,	'end':10010,	'artist':'FUTURE FOUR',								'song':'Connection (I-Cube Rework)'},
			
			{'start':10011,	'end':10213,	'artist':'RITE DE PASSAGE',							'song':'Quinquerime'},
			{'start':10214,	'end':10374,	'artist':'THE EGYPTIAN LOVER',						'song':'Electro Pharaoh (Instrumental)'},
			{'start':10375,	'end':10633,	'artist':'MARCUS L.',								'song':'Telstar'},
			{'start':10634,	'end':10915,	'artist':'ROMANTHONY',								'song':'Bring U Up (Deetron Edit)'},
			{'start':10916,	'end':11237,	'artist':'SOLAR',									'song':'5 Seconds'},
			{'start':11238,	'end':11559,	'artist':'SHARIF LAFFREY',							'song':'And Dance'},
			
			{'start':11560,	'end':11713,	'artist':'RON HARDY',								'song':'Sensation (Dub Version)'},
			{'start':11714,	'end':11962,	'artist':'AUX 88',									'song':'Sharivari (Digital Original Aux 88 Mix)'},
			{'start':11963,	'end':12279,	'artist':'ONI AYHUN',								'song':'OAR03-B'},
			{'start':12280,	'end':12630,	'artist':'TCK FT. JG',								'song':'Reach Out Your Hand (Erol Alkan Rework) - GTA Edit'},
			
			{'start':12631,	'end':12842,	'artist':'RON HARDY',								'song':'Sensation'},
			{'start':12843,	'end':13002,	'artist':'DERRICK CARTER',							'song':'Where Ya At'},
			{'start':13003,	'end':13312,	'artist':'TIGA',									'song':'Bugatti'},
			{'start':13313,	'end':13681,	'artist':'METRO AREA',								'song':'Miura'},
			
			{'start':13682,	'end':13840,	'artist':'THE BLACK MADONNA',						'song':'A Jealous Heart Never Rests'},
			{'start':13841,	'end':14118,	'artist':'ART OF NOISE',							'song':'Beat Box'},
			{'start':14119,	'end':14486,	'artist':'THE BLACK MADONNA FT. JAMIE PRINCIPLE',	'song':'We Still Believe'},
			{'start':14487,	'end':14804,	'artist':'NANCY MARTIN',							'song':'Can\'t Believe'},
			{'start':14805,	'end':14972,	'artist':'P-FUNK ALL STARS',						'song':'Hydraulic Pump Pt. 3'},
			{'start':14974,	'end':15129,	'artist':'STEVE POINDEXTER',						'song':'Computer Madness'},
			{'start':15130,	'end':15487,	'artist':'TEN CITY',								'song':'Devotion'},
			
			{'start':15488,	'end':15940,	'artist':'THE BLACK MADONNA',						'song':'We Can Never Be Apart'},
			{'start':15941,	'end':16187,	'artist':'JOE JACKSON',								'song':'Steppin\' Out'},
			{'start':16188,	'end':16734,	'artist':'THE BLACK MADONNA',						'song':'He Is The Voice I Hear'}
		],
		'videoId': 'I2Xjuz-mnN0'
	},
	iFruit_Radio: {
		'currentTime': null,
		'exitTime': 0,
		'favorite': true,
		'id': 'iFruit_Radio',
		'length': 5201,
		'logoNumber': '1',
		'logoPosition': [4,0],
		'name': 'iFruit Radio',
		'playing': false,
		'stationNumber': '17',
		'timestamps': [
			{'start':8,		'end':162,	'artist':'DANNY BROWN',															'song':'Dance in the Water'},
			{'start':163,	'end':258,	'artist':'POP SMOKE',															'song':'100K on the Coupe'},/*Skepta*/
			{'start':264,	'end':380,	'artist':'SLOWTHAI',															'song':'I Need'},/*Skepta*/
			{'start':396,	'end':502,	'artist':'SCHOOLBOY Q',															'song':'Numb Numb Juice'},
			{'start':518,	'end':659,	'artist':'SHORELINE MAFIA',														'song':'Wings'},
			{'start':660,	'end':851,	'artist':'MEGAN THEE STALLION FT. DABABY',										'song':'Cash Shit'},
			{'start':862,	'end':1101,	'artist':'EGYPTIAN LOVER',														'song':'Everything She Wants'},
			{'start':1108,	'end':1260,	'artist':'DENZEL CURRY FT. YBN CORDAE',											'song':'AL1ENZ'},
			{'start':1268,	'end':1431,	'artist':'FREDDIE GIBBS & MADLIB',												'song':'Crime Pays'},
			{'start':1459,	'end':1697,	'artist':'NAIRA MARLEY',														'song':'Opotoyi'},/*Skepta*/
			{'start':1702,	'end':1859,	'artist':'BAAUER AND CHANNEL TRES FT. DANNY BROWN',								'song':'Ready to Go'},
			{'start':1868,	'end':2025,	'artist':'DABABY',																'song':'BOP'},
			{'start':2036,	'end':2208,	'artist':'DABABY FT. KEVIN GATES',												'song':'POP STAR'},
			{'start':2217,	'end':2477,	'artist':'YOUNG THUG FT. GUNNA & TRAVIS SCOTT',									'song':'Hot (Remix)'},
			{'start':2482,	'end':2683,	'artist':'D DOUBLE E & WATCH THE RIDE FT. DJ DIE, DISMANTLE AND DJ RANDALL',	'song':'Original Format'},/*Skepta*/
			{'start':2684,	'end':2901,	'artist':'ALKALINE',															'song':'With the Thing'},
			{'start':2921,	'end':3109,	'artist':'SKEPTA & AJ TRACEY',													'song':'Kiss and Tell'},/*Skepta*/
			{'start':3120,	'end':3269,	'artist':'CITY GIRLS',															'song':'Act Up'},
			{'start':3296,	'end':3442,	'artist':'KRANIUM FT. AJ TRACEY',												'song':'Money in the Bank'},/*Skepta*/
			{'start':3443,	'end':3600,	'artist':'SKEPTA & NAFE SMALLS',												'song':'Greaze Mode'},/*Skepta*/
			{'start':3606,	'end':3782,	'artist':'TRAVIS SCOTT',														'song':'Highest in the Room'},
			{'start':3801,	'end':4008,	'artist':'HEADIE ONE FT. SKEPTA',												'song':'Back to Basics (Floating Points Remix)'},/*Skepta*/
			{'start':4009,	'end':4131,	'artist':'ESSIE GANG FT. SQ DIESEL',											'song':'Pattern Chanel'},/*Skepta*/
			{'start':4140,	'end':4368,	'artist':'KOFFEE FT. GUNNA',													'song':'W'},
			{'start':4377,	'end':4584,	'artist':'JME FT. GIGGS',														'song':'Knock Your Block Off'},/*Skepta*/
			{'start':4585,	'end':4757,	'artist':'D-BLOCK EUROPE',														'song':'Kitchen Kings'},/*Skepta*/
			{'start':4782,	'end':4987,	'artist':'J HUS',																'song':'Must Be'},/*Skepta*/
			{'start':4992,	'end':5201,	'artist':'BURNA BOY FT. ZLATAN',												'song':'Killin Dem' }/*Skepta*/
		],
		'videoId': 'fpvJaphZ2_g'
	},
	Self_Radio: {
		'currentTime': null,
		'exitTime': 0,
		'favorite': false,
		'id': 'Self_Radio',
		'length': 0,
		'logoNumber': '1',
		'logoPosition': [4,3],
		'name': 'Self Radio',
		'playing': false,
		'stationNumber': '18',
		'timestamps': [
			{'start':0,	'end':0,	'artist':nbsp,	'song':nbsp}
		],
		'videoId': ''
	},
	Still_Slipping_Los_Santos: {
		'currentTime': null,
		'exitTime': 0,
		'favorite': true,
		'id': 'Still_Slipping_Los_Santos',
		'length': 4364,
		'logoNumber': '6',
		'logoPosition': [0,0],
		'name': 'Still Slipping Los Santos',
		'playing': false,
		'stationNumber': '19',
		'timestamps': [
			{'start':0,		'end':127,	'artist':'DJ NIGGA FOX',					'song':'5 Violinos'},
			{'start':128,	'end':283,	'artist':'MR. MANKWA',						'song':'Feediback'},
			{'start':284,	'end':333,	'artist':'MR. MITCH',						'song':'Not Modular'},
			{'start':334,	'end':519,	'artist':'JOSI DEVIL',						'song':'The Devil\'s Dance'},
			{'start':520,	'end':744,	'artist':'KEMIKAL',							'song':'A Wah!'},
			{'start':745,	'end':837,	'artist':'JOY ORBISON',						'song':'COYP'},
			{'start':838,	'end':960,	'artist':'CRUEL SANTINO / ROBERT FLECK',	'song':'Sparky / Hi Press (Dub)'},
			{'start':961,	'end':1099,	'artist':'PA SALIEU',						'song':'No Warnin\''},
			{'start':1100,	'end':1254,	'artist':'L U C Y',							'song':'Almost Blue'},
			{'start':1255,	'end':1350,	'artist':'TIME COW & RTKAL',				'song':'Elephant Man'},
			{'start':1351,	'end':1388,	'artist':'FRANK OCEAN',						'song':'Cayendo (Sango Remix)'},
			{'start':1389,	'end':1402,	'artist':'Commercial',						'song':'Mirror Park Tavern'},
			{'start':1403,	'end':1547,	'artist':'DJ SCUD',							'song':'No Love'},
			{'start':1548,	'end':1733,	'artist':'FRANKEL & HARPER',				'song':'Trimmers (INSTINCT Remix)'},
			{'start':1734,	'end':1964,	'artist':'HORSEPOWER PRODUCTIONS',			'song':'Givin\' Up On Love'},
			{'start':1965,	'end':2088,	'artist':'BLANCO',							'song':'Shippuden'},
			{'start':2089,	'end':2202,	'artist':'PEARLY',							'song':'Polar'},
			{'start':2203,	'end':2339,	'artist':'BYANO DJ',						'song':'Digdim Patrol 2016'},
			{'start':2340,	'end':2454,	'artist':'INSTINCT',						'song':'Operation'},
			{'start':2455,	'end':2512,	'artist':'KO',								'song':'Whip (Acapella)'},
			{'start':2513,	'end':2744,	'artist':'OVERMONO',						'song':'Pieces Of 8'},
			{'start':2745,	'end':2923,	'artist':'JOY ORBISON & OVERMONO',			'song':'Bromley'},
			{'start':2924,	'end':3075,	'artist':'MEZ',								'song':'Babylon'},
			{'start':3076,	'end':3130,	'artist':'SPOOKY',							'song':'Joyride'},
			{'start':3131,	'end':3242,	'artist':'CELINE GILLAIN',					'song':'Wealthy Humans'},
			{'start':3243,	'end':3336,	'artist':'KWENGFACE',						'song':'Mad About Bars'},
			{'start':3337,	'end':3469,	'artist':'M1LLIONZ',						'song':'No Rap Cap'},
			{'start':3470,	'end':3628,	'artist':'BACKROAD GEE',					'song':'Party Popper'},
			{'start':3629,	'end':3730,	'artist':'WAIFER',							'song':'Shower Hour'},
			{'start':3731,	'end':3902,	'artist':'KO & JOY ORBISON',				'song':'Movements'},
			{'start':3903,	'end':4127,	'artist':'RAP',								'song':'Mad Friday'},
			{'start':4128,	'end':4241,	'artist':'THOMAS BUSH',						'song':'Presence: Martin'},
			{'start':4242,	'end':4364,	'artist':'POISON ANNA',						'song':'Submission' }
		],
		'videoId': 'P3qixldzDow'
	},
	Los_Santos_Rock_Radio: {
		'currentTime': null,
		'exitTime': 0,
		'favorite': true,
		'id': 'Los_Santos_Rock_Radio',
		'length': 9881,
		'logoNumber': '1',
		'logoPosition': [3,0],
		'name': 'Los Santos Rock Radio',
		'playing': false,
		'stationNumber': '20',
		'timestamps': [
			{'start':6,		'end':207,	'artist':'DON JOHNSON',						'song':'Heartbeat'},
			{'start':264,	'end':485,	'artist':'BOB SEGER',						'song':'Hollywood Nights'},
			{'start':486,	'end':633,	'artist':'MOUNTAIN',						'song':'Mississippi Queen'},
			{'start':704,	'end':832,	'artist':'CREEDENCE CLEARWATER REVIVAL',	'song':'Fortunate Son'},
			{'start':856,	'end':1045,	'artist':'THE ALAN PARSONS PROJECT',		'song':'I Wouldn\'t Want To Be Like You'},
			{'start':1087,	'end':1273,	'artist':'JULIAN LENNON',					'song':'Too Late For Goodbyes'},
			{'start':1301,	'end':1519,	'artist':'HARRY CHAPIN',					'song':'Cat\'s In The Cradle'},
			{'start':1520,	'end':1741,	'artist':'BELINDA CARLISLE',				'song':'Circle In The Sand'},
			{'start':1766,	'end':1984,	'artist':'BILLY SQUIER',					'song':'Lonely Is The Night'},
			{'start':1985,	'end':2206,	'artist':'THE CULT',						'song':'Rain'},
			{'start':2282,	'end':2421,	'artist':'SMALL FACES',						'song':'Ogden\'s Nut Gone Flake'},
			{'start':2477,	'end':2805,	'artist':'GERRY RAFFERTY',					'song':'Baker Street'},
			{'start':2806,	'end':3023,	'artist':'SURVIVOR',						'song':'Burning Heart'},
			{'start':3048,	'end':3314,	'artist':'ALANNAH MYLES',					'song':'Black Velvet'},
			{'start':3315,	'end':3580,	'artist':'BOSTON',							'song':'Peace Of Mind'},
			{'start':3647,	'end':3830,	'artist':'ZZ TOP',							'song':'Gimme All Your Lovin\''},
			{'start':3853,	'end':4151,	'artist':'PHIL COLLINS',					'song':'I Don\'t Care Anymore'},
			{'start':4152,	'end':4465,	'artist':'KANSAS',							'song':'Carry On Wayward Son'},
			{'start':4515,	'end':4764,	'artist':'BOB SEGER',						'song':'Night Moves'},
			{'start':4765,	'end':5016,	'artist':'STEVIE NICKS',					'song':'I Can\'t Wait'},
			{'start':5057,	'end':5267,	'artist':'ROBERT PLANT',					'song':'Big Log'},
			{'start':5292,	'end':5485,	'artist':'THE DOOBIE BROTHERS',				'song':'What A Fool Believes'},
			{'start':5486,	'end':5703,	'artist':'DEF LEPPARD',						'song':'Photograph'},
			{'start':5721,	'end':5970,	'artist':'SIMPLE MINDS',					'song':'All The Things She Said'},
			{'start':6023,	'end':6300,	'artist':'QUEEN',							'song':'Radio Ga Ga'},
			{'start':6363,	'end':6533,	'artist':'STEVE MILLER',					'song':'Rock\'n Me'},
			{'start':6596,	'end':6871,	'artist':'STARSHIP',						'song':'We Built This City'},
			{'start':6872,	'end':7075,	'artist':'KENNY LOGGINS',					'song':'Danger Zone'},
			{'start':7076,	'end':7229,	'artist':'GREG KIHN BAND',					'song':'The Breakup Song (They Don\'t Write \'Em)'},
			{'start':7318,	'end':7520,	'artist':'KENNY LOGGINS',					'song':'I\'m Free(Heaven Helps The Man)'},
			{'start':7521,	'end':7720,	'artist':'CHICAGO',							'song':'If You Leave Me Now'},
			{'start':7790,	'end':8058,	'artist':'STEVE WINWOOD',					'song':'Higher Love'},
			{'start':8175,	'end':8366,	'artist':'HUMBLE PIE',						'song':'Thirty Days In The Hole'},
			{'start':8395,	'end':8616,	'artist':'ELTON JOHN',						'song':'Saturday Night\'s Alright For Fighting'},
			{'start':8668,	'end':8877,	'artist':'BROKEN ENGLISH',					'song':'Coming On Strong'},
			{'start':8894,	'end':9398,	'artist':'YES',								'song':'Roundabout'},
			{'start':9436,	'end':9641,	'artist':'FOREIGNER',						'song':'Dirty White Boy'},
			{'start':9642,	'end':9853,	'artist':'PAT BENATAR',						'song':'Shadows Of The Night'}
		],
		'videoId': 'bcPYlgTzaBA'
	},
	Non_Stop_Pop_FM: {
		'currentTime': null,
		'exitTime': 0,
		'favorite': true,
		'id': 'Non_Stop_Pop_FM',
		'length': 9864,
		'logoNumber': '1',
		'logoPosition': [0,1],
		'name': 'Non-Stop-Pop FM',
		'playing': false,
		'stationNumber': '21',
		'timestamps': [
			{'start':6,		'end':232,	'artist':'FERGIE',							'song':'Glamorous'},
			{'start':245,	'end':473,	'artist':'REAL LIFE',						'song':'Send Me An Angel'},
			{'start':480,	'end':683,	'artist':'CORONA',							'song':'Rythm Of The Night'},
			{'start':703,	'end':889,	'artist':'KELLY ROWLAND',					'song':'Work (Freemasons Mix)'},
			{'start':895,	'end':1116,	'artist':'SIMPLY RED',						'song':'Something Got Me Started (Hurley\'s House Remix)'},
			{'start':1128,	'end':1312,	'artist':'BLOW MONKEYS FEAT. KYM MAZELLE',	'song':'Wait'},
			{'start':1325,	'end':1534,	'artist':'BACKSTREET BOYS',					'song':'I Want It That Way'},
			{'start':1547,	'end':1837,	'artist':'DIRTY VEGAS',						'song':'Days Go By'},
			{'start':1843,	'end':2055,	'artist':'MOLOKO',							'song':'The Time Is Now'},
			{'start':2071,	'end':2282,	'artist':'AMERIE',							'song':'1 Thing'},
			{'start':2291,	'end':2548,	'artist':'ROBBIE WILLIAMS & KYLIE MINOGUE',	'song':'Kids'},
			{'start':2561,	'end':2760,	'artist':'MAROON 5',						'song':'Moves Like Jagger (feat. Christina Aguilera)'},
			{'start':2772,	'end':2976,	'artist':'N-JOI',							'song':'Anthem'},
			{'start':2977,	'end':3197,	'artist':'WHAM!',							'song':'Everything She Wants'},
			{'start':3209,	'end':3437,	'artist':'MIS-TEEQ',						'song':'Scandalous'},
			{'start':3449,	'end':3658,	'artist':'MIKE POSNER',						'song':'Cooler Than Me'},
			{'start':3672,	'end':3879,	'artist':'LADY GAGA',						'song':'Applause'},
			{'start':3894,	'end':4123,	'artist':'ALL SAINTS',						'song':'Pure Shores'},
			{'start':4143,	'end':4361,	'artist':'JAMIROQUAI',						'song':'Alright'},
			{'start':4362,	'end':4565,	'artist':'MODJO',							'song':'Lady (Hear Me Tonight)'},
			{'start':4577,	'end':4773,	'artist':'LORDE',							'song':'Tennis Court'},
			{'start':4787,	'end':4991,	'artist':'TAYLOR DAYNE',					'song':'Tell It To My Heart'},
			{'start':4998,	'end':5215,	'artist':'SLY FOX',							'song':'Let\'s Go All The Way'},
			{'start':5233,	'end':5455,	'artist':'ROBYN',							'song':'With Every Heartbeat (With Kleerup)'},
			{'start':5462,	'end':5715,	'artist':'BOBBY BROWN',						'song':'On Our Own'},
			{'start':5731,	'end':5949,	'artist':'INXS',							'song':'New Sensation'},
			{'start':5958,	'end':6176,	'artist':'NAKED EYES',						'song':'Promises, Promises'},
			{'start':6189,	'end':6404,	'artist':'M.I.A.',							'song':'Bad Girls'},
			{'start':6420,	'end':6678,	'artist':'HALL & OATS',						'song':'Adult Education'},
			{'start':6697,	'end':6908,	'artist':'SNEAKER PIMPS',					'song':'6 Underground'},
			{'start':6920,	'end':7150,	'artist':'RIHANNA',							'song':'Only Girl (In The World)'},
			{'start':7163,	'end':7368,	'artist':'BRITNEY SPEARS',					'song':'Gimme More'},
			{'start':7369,	'end':7617,	'artist':'THE BLACK EYED PEAS',				'song':'Meet Me Halfway'},
			{'start':7629,	'end':7849,	'artist':'GORILLAZ',						'song':'Feel Good Inc.'},
			{'start':7864,	'end':8041,	'artist':'LIVING IN A BOX',					'song':'Living In A Box'},
			{'start':8049,	'end':8252,	'artist':'M83',								'song':'Midnight City'},
			{'start':8265,	'end':8524,	'artist':'BRONSKI BEAT',					'song':'Smalltown Boy'},
			{'start':8540,	'end':8750,	'artist':'MORCHEEBA',						'song':'Tape Loop'},
		//	{'start':8751,	'end':8975,	'artist':'Morcheeba',						'song':'Tape Loop (Shortcheeba Mix)'},
			{'start':8980,	'end':9187,	'artist':'PET SHOP BOYS',					'song':'West End Girls'},
			{'start':9208,	'end':9398,	'artist':'CASSIE',							'song':'Me & U'},
			{'start':9406,	'end':9606,	'artist':'JANE CHILD',						'song':'Don\'t Wanna Fall In Love'},
			{'start':9621,	'end':9854,	'artist':'STARDUST',						'song':'Music Sounds Better With You'},
		],
		'videoId': 'Fjp0wu3lEHk'
	},
	Radio_Los_Santos: {
		'currentTime': null,
		'exitTime': 0,
		'favorite': true,
		'id': 'Radio_Los_Santos',
		'length': 21384,
		'logoNumber': '1',
		'logoPosition': [2,2],
		'name': 'Radio Los Santos',
		'playing': false,
		'stationNumber': '22',
		'timestamps': [
			{'start': 10, 'end': 201, 'artist': 'G-Side feat. G-Mane', 'song': 'Relaxin\''},
			{'start': 202, 'end': 399, 'artist': 'Kendrick Lamar', 'song': 'A.D.H.D'},
			{'start': 400, 'end': 685, 'artist': 'Ace Hood feat. Future & Rick Ross', 'song': 'Bugatti'},
			{'start': 686, 'end': 850, 'artist': 'Tia Corine', 'song': 'Coochie'},
			{'start': 851, 'end': 1035, 'artist': 'Young Scooter feat. Trinidad James', 'song': 'I Can\'t Wait'},
			{'start': 1036, 'end': 1167, 'artist': 'Tyler, The Creator feat. 42 Dugg', 'song': 'LEMONHEAD'},
			{'start': 1168, 'end': 1346, 'artist': 'Young Stoner Life, Young Thug & Gunna', 'song': 'Ski'},
			{'start': 1347, 'end': 1624, 'artist': 'ScHoolboy Q feat. Kendrick Lamar', 'song': 'Collard Greens'},
			{'start': 1625, 'end': 1915, 'artist': 'Young Scooter feat. Gucci Mane', 'song': 'Work'},
			{'start': 1916, 'end': 2147, 'artist': 'Kodak Black feat. Travis Scott & Offset', 'song': 'ZEZE'},
			{'start': 2148, 'end': 2452, 'artist': 'Dr. Dre feat. Nipsey Hustle & Ty Dolla Sign', 'song': 'Diamond Mind'},
			{'start': 2453, 'end': 2640, 'artist': 'Ab-Soul feat. ScHoolboy Q', 'song': 'Hunnid Stax'},
			{'start': 2641, 'end': 2848, 'artist': 'Gangrene', 'song': 'Bassheads'},
			{'start': 2849, 'end': 3057, 'artist': 'BJ the Chicago Kid feat. Freddie Gibbs & Problem', 'song': 'Smokin\' and Ridin\''},
			{'start': 3058, 'end': 3217, 'artist': 'Saweetie', 'song': 'My Type'},
			{'start': 3218, 'end': 3398, 'artist': 'Big Sean & Hit-Boy', 'song': 'What a Life'},
			{'start': 3399, 'end': 3684, 'artist': 'Chuck Inglish feat. Ab-Soul & Mac Miller', 'song': 'Came Thru/Easily'},
			{'start': 3685, 'end': 3886, 'artist': 'Vince Staples feat. Juicy J', 'song': 'Big Fish'},
			{'start': 3887, 'end': 4073, 'artist': 'A$AP Ferg', 'song': 'Plain Jane'},
			{'start': 4074, 'end': 4285, 'artist': 'Marion Band$ feat. Nipsey Hussle', 'song': 'Hold Up'},
			{'start': 4286, 'end': 4583, 'artist': 'Fredo Santana feat. Chief Keef, Ball Out & Tadoe', 'song': 'Go Live'},
			{'start': 4584, 'end': 4808, 'artist': 'Clyde Carson feat. The Team', 'song': 'Slow Down'},
			{'start': 4809, 'end': 5088, 'artist': 'Ab-Soul feat. Kendrick Lamar', 'song': 'Illuminate'},
			{'start': 5089, 'end': 5259, 'artist': 'Travis Scott feat. 2 Chainz & T.I.', 'song': 'Upper Echelon'},
			{'start': 5260, 'end': 5482, 'artist': '2 Chainz feat. Ty Dolla $ign, Trey Songz & Jhené Aiko', 'song': 'It\'s a Vibe'},
			{'start': 5483, 'end': 5725, 'artist': 'Skeme', 'song': 'Millions'},
			{'start': 5726, 'end': 5842, 'artist': 'Mozzy feat. YG', 'song': 'Hoppin\' Out'},
			{'start': 5843, 'end': 6123, 'artist': 'The Game feat. 2 Chainz & Rick Ross', 'song': 'Ali Bomaye'},
			{'start': 6124, 'end': 6341, 'artist': 'Freddie Gibbs', 'song': 'Still Livin\''},
			{'start': 6342, 'end': 6485, 'artist': 'Danny Brown & Action Bronson', 'song': 'Bad News'},
			{'start': 6486, 'end': 6729, 'artist': 'DJ Esco feat. Future', 'song': 'How It Was'},
			{'start': 6730, 'end': 6916, 'artist': '100s', 'song': 'Life of a Mack'},
			{'start': 6917, 'end': 7143, 'artist': 'Migos', 'song': 'Stir Fry'},
			{'start': 7144, 'end': 7361, 'artist': 'Kendrick Lamar', 'song': 'Swimming Pools (Drank)'},
			{'start': 7362, 'end': 7594, 'artist': 'Dr. Dre feat. THURZ & Cocoa Sarai', 'song': 'Fallin Up'},
			{'start': 7595, 'end': 7750, 'artist': 'Mike Dean and Offset', 'song': 'So Fancy'},
			{'start': 7751, 'end': 7892, 'artist': 'A$AP Rocky feat. Aston Matthews & Joey Fatts', 'song': 'R-Cali'},
			{'start': 7893, 'end': 8088, 'artist': 'Mike Dean and Rich the Kid', 'song': 'Blue Cheese'},
			{'start': 8089, 'end': 8330, 'artist': 'Dr. Dre feat. Anderson .Paak, Snoop Dogg & Busta Rhymes', 'song': 'ETA'},
			{'start': 8331, 'end': 8577, 'artist': 'D-Block Europe & Offset', 'song': 'Chrome Hearts'},
			{'start': 8578, 'end': 8807, 'artist': 'French Montana feat. Kodak Black', 'song': 'Lockjaw'},
			{'start': 8808, 'end': 9062, 'artist': 'Danny Brown feat. A$AP Rocky & Zelooperz', 'song': 'Kush Coma'},
			{'start': 9063, 'end': 9332, 'artist': 'Hit-Boy feat. Dom Kennedy', 'song': 'XL'},
			{'start': 9333, 'end': 9505, 'artist': 'Polo G feat. Juice WRLD', 'song': 'Flex'},
			{'start': 9506, 'end': 9693, 'artist': 'A$AP Ferg', 'song': 'Work'},
			{'start': 9694, 'end': 9893, 'artist': 'Dr. Dre feat. Rick Ross & Anderson .Paak', 'song': 'The Scenic Route'},
			{'start': 9894, 'end': 10148, 'artist': 'Freddie Gibbs & Mike Dean', 'song': 'Sellin\' Dope'},
			{'start': 10149, 'end': 10324, 'artist': 'NEZ feat. ScHoolboy Q', 'song': 'Let\'s Get It'},
			{'start': 10325, 'end': 10497, 'artist': 'Problem feat. Glasses Malone', 'song': 'Say That Then'},
			{'start': 10498, 'end': 10679, 'artist': 'YG', 'song': 'I\'m a Real 1'},
			{'start': 10680, 'end': 11001, 'artist': 'Future feat. The Weeknd', 'song': 'Low Life'},
			{'start': 11002, 'end': 11229, 'artist': 'Gucci Mane feat. Ciara', 'song': 'Too Hood'},
			{'start': 11230, 'end': 11438, 'artist': 'Problem & IamSu feat. Bad Lucc & Sage The Gemini', 'song': 'Do It Big'},
			{'start': 11439, 'end': 11616, 'artist': 'Future', 'song': 'Feed Me Dope'},
			{'start': 11617, 'end': 11851, 'artist': 'Freddie Gibbs feat. Pusha T & Kevin Cossom', 'song': 'Miami Vice'},
			{'start': 11852, 'end': 12020, 'artist': 'Dr. Dre', 'song': 'Black Privilege'},
			{'start': 12021, 'end': 12201, 'artist': 'Gucci Mane feat. Trouble', 'song': 'Everyday'},
			{'start': 12202, 'end': 12474, 'artist': 'Jay Rock feat. Kendrick Lamar', 'song': 'Hood Gone Love It'},
			{'start': 12475, 'end': 12678, 'artist': 'Roddy Ricch', 'song': 'The Box'},
			{'start': 12679, 'end': 12949, 'artist': 'Mount Westmore', 'song': 'Big Subwoofer'},
			{'start': 12950, 'end': 13123, 'artist': 'Jay Rock feat. Kendrick Lamar', 'song': 'Wow Freestyle'},
			{'start': 13124, 'end': 13336, 'artist': 'Dr. Dre feat. Eminem', 'song': 'Gospel'},
			{'start': 13337, 'end': 13567, 'artist': 'Freddie Gibbs feat. Juicy J', 'song': 'Pick the Phone Up'},
			{'start': 13568, 'end': 13776, 'artist': 'Cordae', 'song': 'Kung Fu'},
			{'start': 13777, 'end': 13987, 'artist': 'Miguel', 'song': 'Adorn'},
			{'start': 13988, 'end': 14300, 'artist': 'E-40 feat. Slim Thug & Bun B', 'song': 'That Candy Paint'},
			{'start': 14301, 'end': 14498, 'artist': 'Young Jeezy feat. Freddie Gibbs', 'song': 'Rough'},
			{'start': 14499, 'end': 14763, 'artist': 'Young Jeezy feat. Freddie Gibbs', 'song': 'Do It for You'},
			{'start': 14764, 'end': 15111, 'artist': 'Kanye West feat. Big Sean, Pusha T & 2 Chainz', 'song': 'Mercy'},
			{'start': 15112, 'end': 15375, 'artist': 'Glasses Malone feat. Jay Rock', 'song': 'No Sympathy'},
			{'start': 15376, 'end': 15601, 'artist': 'Wiz Khalifa', 'song': 'Work Hard, Play Hard'},
			{'start': 15602, 'end': 15861, 'artist': '2 Chainz feat. Drake', 'song': 'No Lie'},
			{'start': 15862, 'end': 16099, 'artist': 'WC feat. Young Maylay & Ice Cube', 'song': 'You Know Me'},
			{'start': 16100, 'end': 16359, 'artist': 'A$AP Rocky feat. Drake, 2 Chainz & Kendrick Lamar', 'song': 'Fuckin\' Problems'},
			{'start': 16360, 'end': 16638, 'artist': 'Juicy J feat. Lil Wayne & 2 Chainz', 'song': 'Bandz a Make Her Dance'},
			{'start': 16639, 'end': 16824, 'artist': 'Tyga', 'song': 'Rack City'},
			{'start': 16825, 'end': 17072, 'artist': 'Wiz Khalifa feat. Lola Monroe', 'song': 'Initiation'},
			{'start': 17073, 'end': 17269, 'artist': 'Jay Rock', 'song': 'Boomerang'},
			{'start': 17270, 'end': 17580, 'artist': 'French Montana feat. Rick Ross, Drake & Lil Wayne', 'song': 'Pop That'},
			{'start': 17581, 'end': 17779, 'artist': 'Clams Casino', 'song': 'Cold War'},
			{'start': 17780, 'end': 18015, 'artist': 'Meek Mill feat. Rick Ross', 'song': 'Believe It'},
			{'start': 18016, 'end': 18217, 'artist': '100s', 'song': 'Brick $ell Phone'},
			{'start': 18218, 'end': 18403, 'artist': 'Waka Flocka Flame', 'song': 'Rooster in My Rari'},
			{'start': 18404, 'end': 18618, 'artist': '2 Chainz', 'song': 'I\'m Different'},
			{'start': 18619, 'end': 18803, 'artist': 'Buddy', 'song': 'Awesome Awesome'},
			{'start': 18804, 'end': 19001, 'artist': 'Mac Miller', 'song': 'Loud'},
			{'start': 19002, 'end': 19230, 'artist': 'Machine Gun Kelly feat. Waka Flocka Flame', 'song': 'Wild Boy'},
			{'start': 19231, 'end': 19422, 'artist': 'T.I. feat. Trae tha Truth', 'song': 'What It Do'},
			{'start': 19423, 'end': 19617, 'artist': 'Chief Keef', 'song': 'Love Sosa'},
			{'start': 19618, 'end': 19834, 'artist': 'Stevie Stones feat. Yelawolf', 'song': 'Dollar General'},
			{'start': 19835, 'end': 20101, 'artist': 'The Game feat. Common', 'song': 'Angel'},
			{'start': 20102, 'end': 20369, 'artist': 'Big K.R.I.T feat. Big Sant & Bun B', 'song': 'Pull Up'},
			{'start': 20370, 'end': 20522, 'artist': 'Fenix Flexin feat. D-Block Europe', 'song': 'From the Block'},
			{'start': 20523, 'end': 20711, 'artist': 'Chief Keef feat. A Boogie wit da Hoodie', 'song': 'Glory Bridge'},
			{'start': 20712, 'end': 20833, 'artist': 'Freddie Gibbs feat. Big Sean & Hit-Boy', 'song': '4 Thangs'},
			{'start': 20834, 'end': 20996, 'artist': 'Pacman Da Gunman feat. Richard Fisher', 'song': 'Spin Again'},
			{'start': 20997, 'end': 21190, 'artist': 'Flipp Dinero', 'song': 'Leave Me Alone'},
			{'start': 21191, 'end': 21384, 'artist': 'Chief Keef', 'song': 'It Ain\'t My Fault' }
		],
		'videoId': 'C3_FSXZtRe8'
	},
	Channel_X: {
		'currentTime': null,
		'exitTime': 0,
		'favorite': true,
		'id': 'Channel_X',
		'length': 2741,
		'logoNumber': '1',
		'logoPosition': [2,0],
		'name': 'Channel X',
		'playing': false,
		'stationNumber': '23',
		'timestamps': [
			{'start':4,		'end':124,	'artist':'REDD KROSS',			'song':'Linda Blair'},
			{'start':145,	'end':327,	'artist':'SUICIDAL TENDENCIES',	'song':'Subliminal'},
			{'start':332,	'end':499,	'artist':'D.O.A.',				'song':'The Enemy'},
			{'start':528,	'end':646,	'artist':'T.S.O.L.',			'song':'Abolish Government/Silent Majority'},
			{'start':651,	'end':815,	'artist':'YOUTH BRIGADE',		'song':'Blown Away'},
			{'start':834,	'end':1057,	'artist':'BLACK FLAG',			'song':'My War'},
			{'start':1058,	'end':1162,	'artist':'THE DESCENDENTS',		'song':'Pervert'},
			{'start':1169,	'end':1349,	'artist':'THE ADOLESCENTS',		'song':'Amoeba'},
			{'start':1386,	'end':1504,	'artist':'MDC',					'song':'John Wayne Was A Nazi'},
			{'start':1508,	'end':1646,	'artist':'X',					'song':'Los Angeles'},
			{'start':1670,	'end':1792,	'artist':'THE GERMS',			'song':'Lexicon Devil'},
			{'start':1798,	'end':1942,	'artist':'CIRCLE JERKS',		'song':'Rock House'},
			{'start':1953,	'end':2078,	'artist':'FEAR',				'song':'The Mouth Don\'t Stop (The Trouble With Women Is)'},
			{'start':2085,	'end':2186,	'artist':'AGENT ORANGE',		'song':'Bored Of You'},
			{'start':2223,	'end':2353,	'artist':'THE WEIRDOS',			'song':'Life Of Crime'},
			{'start':2354,	'end':2494,	'artist':'THE ZEROS',			'song':'Don\'t Push Me Around'},
			{'start':2500,	'end':2625,	'artist':'OFF!',				'song':'What\'s Next?'},
			{'start':2648,	'end':2735,	'artist':'D.R.I.',				'song':'I Don\'t Need Society'}
		],
		'videoId': '0VXCoilCODM'
	},
	West_Coast_Talk_Radio: {
		'currentTime': null,
		'exitTime': 0,
		'favorite': true,
		'id': 'West_Coast_Talk_Radio',
		'length': 5806,
		'logoNumber': '1',
		'logoPosition': [5,1.99],
		'name': 'West Coast Talk Radio',
		'playing': false,
		'stationNumber': '24',
		'timestamps': [
			{'start':5,		'end':1073,	'artist':'The Fernando Show',	'song':nbsp},
			{'start':1180,	'end':2996,	'artist':'CHAKRA ATTACK',		'song':nbsp},
			{'start':3069,	'end':4398,	'artist':'CHATTERSPHERE',		'song':nbsp},
			{'start':4482,	'end':5806,	'artist':'CHAKRA ATTACK',		'song':nbsp }
		],
		'videoId': 'IhCFJnaYvnI'
	},
	Rebel_Radio: {
		'currentTime': null,
		'exitTime': 0,
		'favorite': true,
		'id': 'Rebel_Radio',
		'length': 3457,
		'logoNumber': '1',
		'logoPosition': [0,0],
		'name': 'Rebel Radio',
		'playing': false,
		'stationNumber': '25',
		'timestamps': [
			{'start': 35,   'end': 220,   'artist': 'Charles Feathers',                                'song': 'Can\'t Hardly Stand It'},
			{'start': 221,  'end': 400,   'artist': 'Hank Thompson',                                    'song': 'It Don\'t Hurt Anymore'},
			{'start': 401,  'end': 639,   'artist': 'Hasil Adkins',                                    'song': 'Get Out Of My Car'},
			{'start': 640,  'end': 799,   'artist': 'Jerry Reed',                                      'song': 'You Took All The Ramblin Out Of Me'},
			{'start': 800,  'end': 974,   'artist': 'Johnny Cash',                                     'song': 'General Lee'},
			{'start': 975,  'end': 1154,  'artist': 'Johnny Paycheck',                                 'song': 'It Won\'t Be Long (And I\'ll Be Hating You)'},
			{'start': 1155, 'end': 1427,  'artist': 'Ozark Mountain Daredevils',                      'song': 'If You Wanna Get To Heaven'},
			{'start': 1428, 'end': 1626,  'artist': 'Waylon Jennings',                                'song': 'Are You Sure Hank Done It This Way?'},
			{'start': 1627, 'end': 1875,  'artist': 'Waylon Jennings',                                'song': 'I Ain\'t Living Long Like This?'},
			{'start': 1876, 'end': 2125,  'artist': 'Willie Nelson',                                   'song': 'Whiskey River'},
			{'start': 2126, 'end': 2356,  'artist': 'C.W. McCall',                                     'song': 'Convoy'},
			{'start': 2357, 'end': 2494,  'artist': 'Charlie Feathers',                                'song': 'Get With It'},
			{'start': 2495, 'end': 2649,  'artist': 'Homer and Jethro',                                'song': 'She Made Toothpicks Off the Timber Of My Heart'},
			{'start': 2650, 'end': 2856,  'artist': 'Marvin Jackson',                                  'song': 'Dippin\' Stuff'},
			{'start': 2857, 'end': 3026,  'artist': 'Ray Price',                                       'song': 'Crazy Arms'},
			{'start': 3027, 'end': 3217,  'artist': 'Tammy Wynette',                                  'song': 'D.I.V.O.R.C.E'},
			{'start': 3218, 'end': 3457,  'artist': 'The Highwaymen',                                 'song': 'Highwayman' }
		],
		'videoId': 'N12WWl_f3QM'
	},
	Soulwax_FM: {
		'currentTime': null,
		'exitTime': 0,
		'favorite': true,
		'id': 'Soulwax_FM',
		'length': 2566,
		'logoNumber': '1',
		'logoPosition': [1,1],
		'name': 'Soulwax FM',
		'playing': false,
		'stationNumber': '26',
		'timestamps': [
			{'start': 0,    'end': 158,   'artist': 'Palmbomen',                                   'song': 'Stock (Soulwax Remix) (High Pitch)'},
			{'start': 159,  'end': 290,   'artist': 'Fatal Error',                                 'song': 'Fatal Error'},
			{'start': 291,  'end': 369,   'artist': 'Supersempfft',                                'song': 'Let\'s Beam Him Up (High Pitch)'},
			{'start': 370,  'end': 508,   'artist': 'Mim Suleiman',                                'song': 'Mingi'},
			{'start': 509,  'end': 638,   'artist': 'FKCLUB',                                       'song': 'The Strange Art (In Flagranti Remix)'},
			{'start': 639,  'end': 869,   'artist': 'Matias Aguayo',                               'song': 'El Sucu Tucu (Remix)'},
			{'start': 870,  'end': 966,   'artist': 'Daniel Avery',                                 'song': 'Naive Response (High Pitch)'},
			{'start': 967,  'end': 1149,  'artist': 'Joe Goddard feat. Valentina',                 'song': 'Gabriel (Soulwax Remix) (Low Pitch)'},
			{'start': 1150, 'end': 1262,  'artist': 'Daniel Maloso',                                'song': 'Body Music (Original Mix)'},
			{'start': 1263, 'end': 1394,  'artist': 'Green Velvet & Harvard Bass',                  'song': 'Lazer Beams'},
			{'start': 1395, 'end': 1490,  'artist': 'Zombie Nation',                                'song': 'Tryouts (Low Pitch)'},
			{'start': 1491, 'end': 1643,  'artist': 'Tom Rowlands',                                 'song': 'Nothing But Pleasure (High Pitch to Normal Pitch)'},
			{'start': 1644, 'end': 1825,  'artist': 'Jackson and his Computerband',                 'song': 'Arp #1 (Low Pitch)'},
			{'start': 1826, 'end': 1975,  'artist': 'Goose',                                         'song': 'Synrise (Soulwax Remix) (Low Pitch)'},
			{'start': 1976, 'end': 2097,  'artist': 'Transistorcake',                               'song': 'Mr. Croissant Taker (Low Pitch)'},
			{'start': 2098, 'end': 2232,  'artist': 'Tiga',                                          'song': 'Plush (Jacques Lu Cont Remix)'},
			{'start': 2233, 'end': 2323,  'artist': 'The Hacker',                                   'song': 'Shockwave (Gesaffelstein Remix)'},
			{'start': 2324, 'end': 2566,  'artist': 'Pulp',                                          'song': 'After You (Soulwax Remix)' }
		],
		'videoId': 'sFwcLC5HC9I'
	},
	East_Los_FM: {
		'currentTime': null,
		'exitTime': 0,
		'favorite': true,
		'id': 'East_Los_FM',
		'length': 2702,
		'logoNumber': '1',
		'logoPosition': [1,0],
		'name': 'East Los FM',
		'playing': false,
		'stationNumber': '27',
		'timestamps': [
			{'start': 7,    'end': 154,  'artist': 'Los Buitres de Culiacan Sinaloa',  'song': 'El Kocaino'},
			{'start': 155,  'end': 255,  'artist': 'Mexican Institute of Sound',          'song': 'Es-Toy'},
			{'start': 256,  'end': 349,  'artist': 'Niña Dioz',                           'song': 'Criminal Sound (El Hijo De La Cumbia Remix)'},
			{'start': 350,  'end': 503,  'artist': 'La Vida Bohème',                      'song': 'Radio Capital'},
			{'start': 504,  'end': 636,  'artist': 'Fandango',                            'song': 'Autos, Moda Y Rock N Roll'},
			{'start': 637,  'end': 838,  'artist': 'Don Cheto',                          'song': 'El Tatuado'},
			{'start': 839,  'end': 987,  'artist': 'La Sonora Dinamita',                 'song': 'Se Me Perdió La Cadenita'},
			{'start': 988,  'end': 1218, 'artist': 'She\'s A Tease',                      'song': 'Fiebre De Jack'},
			{'start': 1219, 'end': 1394, 'artist': 'Maldita Vecindad',                  'song': 'Pachuco'},
			{'start': 1395, 'end': 1574, 'artist': 'Hechizeros Band',                    'song': 'El Sonidito'},
			{'start': 1575, 'end': 1778, 'artist': 'Milkman',                            'song': 'Fresco'},
			{'start': 1779, 'end': 1950, 'artist': 'Jessy Bulbo',                        'song': 'Maldito'},
			{'start': 1951, 'end': 2121, 'artist': 'La Liga feat. Alika',               'song': 'Tengo El Don'},
			{'start': 2122, 'end': 2344, 'artist': 'Los Tigres Del Norte',               'song': 'La Granja'},
			{'start': 2345, 'end': 2465, 'artist': 'Los Ángeles Negros',                 'song': 'El Rey Y Yo' },
			{'start': 2466, 'end': 2702, 'artist': 'Toy Selectah',                 		'song': 'El Sabanero Raver' }
		],
		'videoId': 'xTpsoTmhdNc'
	},
	West_Coast_Classics: {
		'currentTime': null,
		'exitTime': 0,
		'favorite': true,
		'id': 'West_Coast_Classics',
		'length': 7292,
		'logoNumber': '1',
		'logoPosition': [0,2],
		'name': 'West Coast Classics',
		'playing': false,
		'stationNumber': '28',
		'timestamps': [
			{'start': 19,    'end': 277,   'artist': 'CPO Ft MC Ren',                     'song': 'Ballad Of Menace'},
			{'start': 278,   'end': 577,   'artist': 'Dr. Dre Ft Snoop Dogg',             'song': 'Still DRE'},
			{'start': 578,   'end': 853,   'artist': 'The Lady Of Rage Ft Snoop Dogg',    'song': 'Afro Puffs'},
			{'start': 854,   'end': 1072,  'artist': 'Ice Cube',                          'song': 'You Know How We Do It'},
			{'start': 1073,  'end': 1328,  'artist': 'Snoop Dogg',                        'song': 'Gin & Juice'},
			{'start': 1329,  'end': 1580,  'artist': 'South Central Cartel',              'song': 'Servin\' Em Heat'},
			{'start': 1581,  'end': 1802,  'artist': 'Mack 10',                           'song': 'Nothin But The Cavi Hit'},
			{'start': 1803,  'end': 1994,  'artist': 'NWA',                               'song': 'Appetite For Destruction'},
			{'start': 1995,  'end': 2174,  'artist': 'Jayo Felony',                       'song': 'Sherm Stick'},
			{'start': 2175,  'end': 2393,  'artist': 'Warren G',                          'song': 'This Dj'},
			{'start': 2394,  'end': 2685,  'artist': 'Geto Boys',                         'song': 'Mind Playing Tricks On Me'},
			{'start': 2686,  'end': 2891,  'artist': 'Westside Connection',               'song': 'Bow Down'},
			{'start': 2892,  'end': 3174,  'artist': 'King Tee',                          'song': 'Played Like A Piano'},
			{'start': 3175,  'end': 3431,  'artist': 'Dr. Dre Ft Snoop Dogg & Nate Dogg', 'song': 'The Next Episode'},
			{'start': 3432,  'end': 3689,  'artist': 'Tha Dogg Pound',                    'song': 'What Would You Do'},
			{'start': 3690,  'end': 3913,  'artist': 'MC Eiht',                           'song': 'Streight Up Menace'},
			{'start': 3914,  'end': 4147,  'artist': 'Dj Quik',                           'song': 'Dollaz & Sense'},
			{'start': 4148,  'end': 4438,  'artist': 'Kurupt',                            'song': 'C-Walk'},
			{'start': 4439,  'end': 4679,  'artist': 'Kausion Ft Ice Cube',               'song': 'What You Wanna Do'},
			{'start': 4680,  'end': 4869,  'artist': 'Too $hort',                         'song': 'Wanna Be A Ganster'},
			{'start': 4870,  'end': 5122,  'artist': 'E-40 Ft The Captain',               'song': 'Save A Hoe'},
			{'start': 5123,  'end': 5349,  'artist': 'NWA',                               'song': 'Gansta Gansta'},
			{'start': 5350,  'end': 5639,  'artist': '2Pac Shakur',                       'song': 'Ambitionz Az A Ridah'},
			{'start': 5640,  'end': 5946,  'artist': 'Luniz',                             'song': 'I Got 5 On It'},
			{'start': 5947,  'end': 6172,  'artist': 'Spice 1',                           'song': 'The Murda Show'},
			{'start': 6173,  'end': 6407,  'artist': 'The Conscious Daughters',           'song': 'We Roll'},
			{'start': 6408,  'end': 6697,  'artist': 'Eazy E',                            'song': 'No More Questions'},
			{'start': 6698,  'end': 6942,  'artist': 'Compton Most Wanted',               'song': 'Late Nite Hype'},
			{'start': 6943,  'end': 7292,  'artist': 'Bone Thugs-N-Harmony',              'song': '1st Of Tha Month' }
		],
		'videoId': 'wnmg6CfHQ18'
	}
};

let stationData_name;
let stationData_artist;
let stationData_title;
let stationData_share;

let stationList = Object.keys(stationData);
stationList.unshift('');

const stationFavoriteList = function (){
	const sfl = stationList.filter((station) => {
		if (station === '') {
			return true
		} else {
			return stationData[station].favorite;
		}
	});
	return sfl;
};

let stationSize = getComputedStyle(document.documentElement).getPropertyValue('--station-size').replace('px','');

const toggleFullscreen = function (){
	const enabled = (window.matchMedia('(display-mode: fullscreen)').matches || fullscreenIcon.classList.contains('active'));
	let toggle;
	if (!enabled) {
		if (app.requestFullscreen) {
			app.requestFullscreen();
			toggle = true;
		} else if (app.webkitRequestFullscreen) {
			app.webkitRequestFullscreen();
			toggle = true;
		} else if (app.msRequestFullscreen) {
			app.msRequestFullscreen();
			toggle = true;
		}
		if (toggle) {
			fullscreenIcon.classList.add('active');
		}
	} else {
		if (document.exitFullscreen) {
			document.exitFullscreen();
			toggle = true;
		} else if (document.webkitExitFullscreen) {
			document.webkitExitFullscreen();
			toggle = true;
		} else if (document.msExitFullscreen) {
			document.msExitFullscreen();
			toggle = true;
		}
		if (toggle) {
			fullscreenIcon.classList.remove('active');
		}
	}
};

let volume = 50;
let volumeSlider;

window.onYouTubeIframeAPIReady = function() {
	player = new window.YT.Player("player", {
		height: "200",
		width: "356",
		//videoId: station.videoId,
		playerVars: {
			autoplay: 1,
			controls: 0,
			disablekb: 1,
			enablejsapi: 1,
			fs: 0,
			iv_load_policy: 3,
			loop: 1,
			origin: window.location.href,
			playsinline: 1
		},
		events: {
			'onReady': (event) => {
				//debug('Ready');
			},
			'onStateChange': (event) => {
				if (event.data === 0) {
					event.target.seekTo(0, true);
					event.target.playVideo();
				}
			},
			'onError': (event) => {
				debug(event.data);
			},
			'onAutoplayBlocked': (event) => {
				debug('Autoplay Blocked');
			}
		}
	});
};

window.addEventListener('load', () => {
	loadYouTubeAPI();
	
	app = document.getElementById('app');
	
	iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
	
	if (iOS) {
		document.documentElement.style.setProperty('--font-size',`${String(16 * 1.1)}px`);
	}
	
	radioWheel = document.getElementById('radioWheel');
	
	stationData_name = document.querySelector('.stationData#name');
	stationData_artist = document.querySelector('.stationData#artist');
	stationData_title = document.querySelector('.stationData#title');
	stationData_share = document.querySelector('.stationData#share');
	
	radioWheel.addEventListener('click', (e) => {
		const radioStation = e.target.parentElement;
		if (radioStation.classList.contains('radioStation')) {
			for (let [station, data] of Object.entries(stationData)) {
				data.playing = false;
			};
			stationData[radioStation.id].playing = true;
			
			const nextStation = radioStation.nextElementSibling || radioWheel.firstChild;
			const startFrom = Number(nextStation.dataset.stationNumber);
			
			radioWheelBuild(startFrom);
			radioWheelConfig();
		}
	});
	
	loadFavoriteStations();
	
	radioWheelBuild();
	
	for (let i = 0; i <= 3; i++) {
		radioWheelConfig();
	}
	
	backgroundImage();
	
	preferencesMenu();
	
	menu = document.querySelector('.menu');
	
	interactionMenu = document.getElementById('interactionMenu');
	interactionMenu.addEventListener('click', (e) => {
		interactionMenu.classList.add('active');
		
		if (currentStation !== 'Radio_Off' && currentStation !== 'Self_Radio') {
			document.querySelector(`.favorite.menuItem[data-favorite="${currentStation}"]`).classList.add('playingFavorite');
		}
		
		menu.classList.add('active');
		e.stopPropagation();
	});
	
	app.addEventListener('click', (e) => {
		if (!e.target.classList.contains('menuItem')) {
			interactionMenu.classList.remove('active');
			
			if (document.querySelector('.playingFavorite')) {
				document.querySelector('.playingFavorite').classList.remove('playingFavorite');
			}
			menu.classList.remove('active');
		}
	});
	
	fullscreenIcon = document.getElementById('fullscreenIcon');
	enableFullscreen();
	fullscreenIcon.addEventListener('click', toggleFullscreen);
	
	volumeSlider = document.getElementById('volumeSlider');
	volumeSlider.style.background = `linear-gradient(to right, #e8e8e8 ${volume}%, #000000 ${volume}%)`;
	volumeSlider.addEventListener('input', (slider) => {
		volume = slider.currentTarget.value;
		volumeSlider.style.background = `linear-gradient(to right, #e8e8e8 ${volume}%, #000000 ${volume}%)`;
		if (player){
			player.setVolume(volume);
		}
	});
	
	radioWheel.style.visibility = 'visible';
	document.getElementById('stationData').style.visibility = 'visible';
});

window.addEventListener('resize', () => {
	radioWheelConfig();
	enableFullscreen();
});
