const puppeteer = require('puppeteer');
const Menu = require('./menu');
const clc = require('cli-color');
const CLI = require('clui');

module.exports = new class Navigator {

	constructor() {
		this.spinner = new CLI.Spinner(clc.red('💣 Fetching movies...  '), ['◜','◠','◝','◞','◡','◟']); //['⣾','⣽','⣻','⢿','⡿','⣟','⣯','⣷']);
	}

	async fetchMovies() {
		this.spinner.start();
		const browser = await puppeteer.launch({
			headless: true
		});

		const page = await browser.newPage();
		await page.setJavaScriptEnabled(false);
		await page.setRequestInterception(true);

		page.on('request', (request) => {
			if(['image', 'stylesheet', 'font', 'script'].indexOf(request.resourceType()) !== -1) {
				request.abort();
			} else {
				request.continue();
			}
		});

		await page.goto('https://www.pelispedia.tv/movies/all/');
		let movies = await page.$$eval('.bpM12.bpS16', elements => {
			return elements.map(el => {
				let name = el.querySelector('h2').innerText.split('\n')[0];
				return {
					title: name,
					value: {
						id: el.dataset.referenceid,
						name: name,
						poster: el.querySelector('img').src,
						url: el.querySelector('a').href
					}
				}
			});
		});

		this.spinner.stop();
		await browser.close();

		console.log(movies);
		return movies;	
	}

	async fetchMovieMirrors(movie) {
		this.spinner.message('☠️  Fetching movie: '+clc.yellow(movie.id)+' -- '+clc.magenta(movie.name));
		this.spinner.start();

		const browser = await puppeteer.launch({
			headless: true,
			slowMo: 250
		});

		const page = await browser.newPage();
		await page.goto(movie.url, {
				waituntil: "networkidle0"
		});
		let frame = await page.frames().find(f => {
			return f.url() === 'https://www.pelispedia.tv/api/iframes.php?id='+movie.id+'?nocache'
		});

		await frame.click('#botones a:nth-child(2)');

		let mirrors = await frame.$$eval('.menuPlayer li:not(.bar)', elements => {
			return elements.map((el,index) => {
				let title = el.dataset.playerid.match(/active=([0-9]{3,4})/);
				title = title ? title[1] : el.title;

				let srt = el.dataset.playerid.match(/&sub=(.*)&/);
				srt = srt ? 'https://pelispedia.video/sub/'+srt[1]+'.vtt' : '';

				return {
					title: title,
					value: {
						index: index+2,
						srt: srt
					}
				}
			})
		});

		this.spinner.stop()
		let mirrorIndex = await Menu.chooseMirror(mirrors);

		this.spinner.message('⚓️ Getting link...');
		this.spinner.start();
		await frame.click('.menuPlayer li.option:nth-child('+mirrorIndex.mirror.index+')');
	
		let mirrorUrl = await new Promise(resolve => {
			page.on('request', request => {
				let tempURL = request.url()
				if(/amazonaws|googleusercontent|mp4|mkv/.test(tempURL)) {
					//console.log(clc.black.bgGreen(tempURL));
					this.spinner.stop();
					resolve(tempURL);
					browser.close();
				}
			});

			frame.$eval('.butPlayFilm', el => el.click());
		});

		return {
			url: mirrorUrl,
			srt: mirrorIndex.mirror.srt
		}
	}
}
