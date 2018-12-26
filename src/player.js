module.exports = new class Player {

	constructor() {
		//this.launchPlayer('https://video-downloads.googleusercontent.com/AHSG-TiE_G7D9lmZD30J6nyuV7hURCMWeazSb0GT8tLfK-IQ0UVwFUhXTZbYUqyZa1QQM5Pd6wL2tRKb-fZmJrW0RoSGLpcxG9HqP2Nil7CK5pqa0IlpjMT95dAuahdYSFlQ16CNYbWf_HgwXDwBw_--_D4Nc7OnWOxdW9kUviIxpLTblYVtg9QLnhwjD-GPGBQMjFY5YLce','https://pelispedia.video/sub/Sabrina.2018-vtt.vtt');
		//this.startMicroServer()
	}

	async launchPlayer(url, srt) {
		await this.startMicroServer(url, srt);

		const puppeteer = require('puppeteer');
		await puppeteer.launch({
			headless: false,
			executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
			args: ['--autoplay-policy=no-user-gesture-required'],
			slowMo: 250

		}).then(async browser => {
			const page = await browser.newPage();
			await page.goto('http://localhost:3000/');
		})
	}

	startMicroServer(url, srt) {
		return new Promise(resolve => {
			const express = require('express');
			const http = require('https');
			const fs = require('fs');
			//var serveStatic = require('serve-static')

			http.get(srt, res => {
				let data = '';
				res.on('data', (chunk) => { data += chunk; });
				res.on('end', () => {
					fs.writeFileSync('public/sub.vtt', data, 'utf-8');
				});
			});


			let app = express()
			app.get('/', (req, res) => {
				let html = fs.readFileSync('public/index.html','utf-8');
				html = html.replace('{{URL}}', url);
				//html = html.replace('{{SRT}}', srt);
				res.end(html);
			});
			app.get('/sub.vtt', (req, res) => {
				res.end(fs.readFileSync('public/sub.vtt','utf-8'))
			});

			//app.use('/public', express.static('public'));
			//app.use(serveStatic('public', {'index': ['index.html']}))

			app.listen(3000, () => {
				console.log('Server started...');
				console.log('http://localhost:3000');
				resolve();
			});
		});
		
	}

}